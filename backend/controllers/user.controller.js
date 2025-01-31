import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.models.js";
import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/APIError.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";

// generating access and refresh token

const generateAccessToken = (userId, role) => {
  return jwt.sign({ _id: userId, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};
const generaterefreshToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};
//user registration

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // validation

  if (!email || !username || !password) {
    throw new APIError(400, "All fields are required");
  }
  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new APIError(400, "Invalid email format");
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new APIError(
      400,
      "Password must be at least 8 characters long and include at least one letter and one number"
    );
  }

  // checking if user exists

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new APIError(409, "User with the same username already exists");
  }

  //   create new user

  try {
    // create new user
    const newUser = new User({ email, username, password });
    const savedUser = await newUser.save();

    // generate tokens
    const accessToken = generateAccessToken(savedUser._id, savedUser.role);
    const refreshToken = generaterefreshToken(savedUser._id);

    // save the tokens in user
    savedUser.refreshToken = refreshToken;
    await savedUser.save();

    // set refreshtoken in httponly cookie

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.info("user creatred successfully", { username: savedUser.username });
    return res
      .status(201)
      .json(new APIResponse(201, savedUser, "user regristered succesfully"));
  } catch (error) {
    logger.error("user Creation Failed", error);
    throw new APIError(500, "user registration failed");
  }
});

// user log in

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
  const refreshToken = generaterefreshToken(user._id);

  // save refreshtoken in the database

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
    .json(new APIResponse(200, { accessToken }, "user loggded in succesfully"));

  // user log out
});

//user log out

const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: "",
    },
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
    .json(new APIResponse(200, {}, "user logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
