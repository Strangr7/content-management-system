import mongoose from "mongoose";
import { APIError } from "../utils/APIError.js";
import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error details using Winston
  logger.error({
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
  });

  // Handle Mongoose-specific errors
  if (err instanceof mongoose.Error.ValidationError) {
    error = new APIError(400, "Validation failed", err.errors);
  } else if (err instanceof mongoose.Error.CastError) {
    error = new APIError(400, `Invalid value for ${err.path}`);
  } else if (err.code === 11000) {
    error = new APIError(409, "Duplicate key error");
  } else if (!(error instanceof APIError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong";
    error = new APIError(statusCode, message, [], err.stack);
  }

  // Sanitize response message
  const response = {
    statusCode: error.statusCode,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
};

// Async wrapper for controllers
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export { errorHandler, asyncHandler };
