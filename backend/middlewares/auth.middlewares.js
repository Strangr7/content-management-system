// middleware/auth.middlewares.js
import jwt from "jsonwebtoken";
import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/APIError.js";

const authenticatedMiddleware = (req, res, next) => {
  const accessToken = req.headers.authorization?.split(" ")[1]; // Extract token from the Authorization header

  if (!accessToken) {
    return res.status(401).json(new APIResponse(401, null, "Access token is required"));
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // Attach user info to the request object (like _id and role)
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(403).json(new APIResponse(403, null, "Invalid or expired access token"));
  }
};

export { authenticatedMiddleware };
