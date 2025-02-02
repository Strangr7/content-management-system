import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.models.js";
import Cart from "../models/cart.models.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";

// Generating access and refresh tokens
const generateAccessToken = (userId, role) => {
  return jwt.sign({ _id: userId, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

// User registration
const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Validation
  if (!email || !username || !password) {
    throw new APIError(400, "All fields are required");
  }

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new APIError(400, "Invalid email format");
  }

  // Validate password format
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new APIError(
      400,
      "Password must be at least 8 characters long and include at least one letter and one number"
    );
  }

  // Check if user exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new APIError(
      409,
      "User with the same username or email already exists"
    );
  }

  try {
    // Create new user
    const newUser = new User({ email, username, password });
    const savedUser = await newUser.save();

    // Create a cart for the user
    const newCart = new Cart({
      user: savedUser._id,
      items: [],
      totalPrice: 0,
    });

    await newCart.save();
    logger.info("Cart created successfully", { user_id: savedUser._id });

    // Generate tokens
    const accessToken = generateAccessToken(savedUser._id, savedUser.role);
    const refreshToken = generateRefreshToken(savedUser._id);

    // Save the refresh token in the user document
    savedUser.refreshToken = refreshToken;
    await savedUser.save();

    // Set refreshToken in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info("User created successfully", { username: savedUser.username });
    return res
      .status(201)
      .json(new APIResponse(201, savedUser, "User registered successfully"));
  } catch (error) {
    logger.error("User Creation Failed", {
      error: error.message,
      stack: error.stack,
    });
    throw new APIError(500, "User registration failed");
  }
});

// User login
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new APIError(400, "Username and password are required");
  }

  const user = await User.findOne({ username });
  if (!user) {
    throw new APIError(404, "User not found");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new APIError(401, "Invalid password");
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token in the database
  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res
    .status(200)
    .json(new APIResponse(200, { accessToken }, "User logged in successfully"));
});

// User logout
const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: "" },
  });

  if (!user) {
    throw new APIError(404, "User not found");
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res
    .status(200)
    .json(new APIResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
