// refreshAccessTokenMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { APIResponse } from "../utils/apiResponse.js";

const refreshAccessTokenMiddleware = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json(new APIResponse(401, null, "Refresh token is required"));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json(new APIResponse(401, null, "Invalid refresh token"));
    }

    // Directly generating the new access token here
    const newAccessToken = jwt.sign({ _id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    req.newAccessToken = newAccessToken; // Attach the new access token to the request object
    next(); // Move on to the next middleware or route handler
  } catch (error) {
    console.error("Error verifying refresh token:", error);
    return res.status(403).json(new APIResponse(403, null, "Invalid refresh token"));
  }
};

export { refreshAccessTokenMiddleware };
