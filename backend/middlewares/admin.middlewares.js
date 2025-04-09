import { APIError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    throw new APIError(403, "Forbidden: Admin access required");
  }
  next();
});