import mongoose from "mongoose";
import { APIError } from "../utils/APIError.js";
import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log the error using Winston
  logger.error({
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
  });

  // Check if it's not an instance of the custom APIError
  if (!(error instanceof APIError)) {
    // Determine the status code based on the error type
    const statusCode =
      error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
    const message = error.message || "Something went wrong";
    error = new APIError(statusCode, message, error?.errors || [], err.stack);
  }

  // Sanitize error message in production
  const sanitizedMessage =
    process.env.NODE_ENV === "production"
      ? "Something went wrong"
      : error.message;

  const response = {
    ...error,
    message: sanitizedMessage,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
};

export { errorHandler };
