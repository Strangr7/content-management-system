import { APIError } from "../utils/apiError.js";

export const restrictTestRouteInProduction = (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    throw new APIError(403, "Test route is disabled in production");
  }
  next();
};