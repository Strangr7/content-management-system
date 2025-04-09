import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.models.js";
import Cart from "../models/cart.models.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";

// Generate access and refresh tokens
const generateAccessToken = (userId, role) => {
  return jwt.sign({ _id: userId, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m", // Short-lived access token
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d", // Longer-lived refresh token
  });
};

// User registration
const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Validation
  if (!email || !username || !password) {
    throw new APIError(400, "Email, username, and password are required");
  }

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new APIError(400, "Invalid email format");
  }

  // Validate password strength
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
      existingUser.email === email
        ? "Email already in use"
        : "Username already taken"
    );
  }

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

  // Save refresh token in the database
  savedUser.refreshToken = refreshToken;
  await savedUser.save({ validateBeforeSave: false }); // Skip validation for efficiency

  // Set refreshToken in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // Prevents client-side JS access
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict", // Prevents CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  logger.info("User registered successfully", { username: savedUser.username });
  return res.status(201).json(
    new APIResponse(
      201,
      {
        user: {
          _id: savedUser._id,
          username: savedUser.username,
          email: savedUser.email,
          role: savedUser.role,
        },
        accessToken,
      },
      "User registered successfully"
    )
  );
});

// User login
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validation
  if (!username || !password) {
    throw new APIError(400, "Username and password are required");
  }

  // Find user and explicitly select password
  const user = await User.findOne({ username }).select("+password");
  if (!user) {
    throw new APIError(404, "User not found");
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new APIError(401, "Invalid credentials"); // Avoid revealing which field failed
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token in the database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set refreshToken in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  logger.info("User logged in successfully", { username });
  return res.status(200).json(
    new APIResponse(
      200,
      {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        accessToken,
      },
      "User logged in successfully"
    )
  );
});

// User logout
const logoutUser = asyncHandler(async (req, res) => {
  // Ensure user is authenticated (req.user set by middleware)
  const userId = req.user?._id;
  if (!userId) {
    throw new APIError(401, "Unauthorized: No user found in request");
  }

  // Remove refresh token from database
  const user = await User.findByIdAndUpdate(
    userId,
    { $unset: { refreshToken: "" } },
    { new: true }
  );

  if (!user) {
    throw new APIError(404, "User not found");
  }

  // Clear refreshToken cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  logger.info("User logged out successfully", { userId });
  return res
    .status(200)
    .json(new APIResponse(200, {}, "User logged out successfully"));
});

// Refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new APIError(401, "No refresh token provided");
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new APIError(401, "Invalid or expired refresh token");
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id, user.role);

    logger.info("Access token refreshed", { userId: user._id });
    return res
      .status(200)
      .json(new APIResponse(200, { accessToken }, "Access token refreshed"));
  } catch (error) {
    logger.error("Refresh token verification failed", { error: error.message });
    throw new APIError(401, "Invalid refresh token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };