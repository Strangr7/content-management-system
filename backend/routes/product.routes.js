/**
 * @file Product Router
 * @description Express router for handling product-related API endpoints
 * Provides CRUD operations, filtering, pagination, and special operations like
 * product restoration and low stock reporting with proper validation and authentication
 */

import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductbyId,
  updateProduct,
  deleteProduct,
  getProductbyCategory,
  restoreProduct,
  getLowStockProducts,
} from "../controllers/product.controller.js";
import { uploadProductImages, handleMulterErrors } from "../middlewares/multer.middlewares.js";
import { authenticatedMiddleware } from "../middlewares/auth.middlewares.js";
import { adminMiddleware } from "../middlewares/admin.middlewares.js";
import { logRequestPerformance } from "../middlewares/logger.middlewares.js";
import { apiRateLimiter } from "../middlewares/rate-limiter.middlewares.js";
import { restrictTestRouteInProduction } from "../middlewares/environment.middlewares.js";
import { body, param, query, validationResult } from "express-validator";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

/**
 * Express router instance for product routes
 * @type {import('express').Router}
 */
const router = Router();

/**
 * Apply global middlewares to all product routes
 * - Rate limiting to prevent abuse
 * - Request performance logging for monitoring
 */
router.use(apiRateLimiter);
router.use(logRequestPerformance);

/**
 * Product validation middleware
 * Validates request body for product creation and update operations
 * Ensures all required fields are present and properly formatted
 * 
 * Validates:
 * - Basic product information (name, category, price)
 * - Inventory details (quantity, threshold)
 * - Product attributes (brand, color, size)
 * - Dates and identifiers
 * 
 * @throws {APIError} 400 - If validation fails with concatenated error messages
 */
const validateProductBody = [
  body("product_name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Product name must be between 3 and 100 characters"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category ID format"),
  body("price")
    .trim()
    .notEmpty()
    .withMessage("Price is required")
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number"),
  body("discount")
    .optional()
    .trim()
    .toFloat()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be a number between 0 and 100"),
  body("total_number")
    .trim()
    .notEmpty()
    .withMessage("Total number is required")
    .toInt()
    .isInt({ min: 0 })
    .withMessage("Total number must be a non-negative integer"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters")
    .escape(),
  body("brand")
    .trim()
    .notEmpty()
    .withMessage("Brand is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Brand must be between 2 and 50 characters"),
  body("color")
    .trim()
    .notEmpty()
    .withMessage("Color is required")
    .matches(/^[a-zA-Z\s-]+$/i)
    .withMessage("Color must contain only letters, spaces, or hyphens"),
  body("size")
    .trim()
    .notEmpty()
    .withMessage("Size is required")
    .matches(/^[a-zA-Z0-9\s-]+$/i)
    .withMessage("Size must contain only letters, numbers, spaces, or hyphens"),
  body("date_of_manufacture")
    .trim()
    .notEmpty()
    .withMessage("Manufacturing date is required")
    .isISO8601()
    .withMessage("Invalid date format for manufacturing date (use YYYY-MM-DD)")
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        throw new Error("Manufacturing date cannot be in the future");
      }
      return true;
    }),
  body("stockThreshold")
    .optional()
    .trim()
    .toInt()
    .isInt({ min: 0 })
    .withMessage("Stock threshold must be a non-negative integer"),
  body("sku")
    .optional()
    .trim()
    .matches(/^[A-Z0-9-]+$/i)
    .withMessage("SKU must contain only uppercase letters, numbers, or hyphens"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new APIError(400, errors.array().map((err) => err.msg).join(", "));
    }
    next();
  },
];

/**
 * Pagination and filtering validation middleware
 * Validates query parameters for listing products with filters
 * Supports:
 * - Pagination (page, limit)
 * - Sorting (sortBy, sortOrder)
 * - Filtering by status, category, price range
 * 
 * @throws {APIError} 400 - If validation fails with concatenated error messages
 */
const validatePaginationAndFilter = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page number must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("sortBy")
    .optional()
    .isIn(["createdAt", "price", "product_name", "averageRating"])
    .withMessage("SortBy must be one of: createdAt, price, product_name, averageRating"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("SortOrder must be either 'asc' or 'desc'"),
  query("status")
    .optional()
    .isIn(["active", "out_of_stock", "discontinued"])
    .withMessage("Status must be one of: active, out_of_stock, discontinued"),
  query("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format"),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a non-negative number"),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a non-negative number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new APIError(400, errors.array().map((err) => err.msg).join(", "));
    }
    next();
  },
];

/**
 * ID parameter validation middleware
 * Validates product ID parameter which can be either:
 * - A valid MongoDB ObjectId
 * - A non-empty string (for slug-based lookups)
 * 
 * @throws {APIError} 400 - If validation fails
 */
const validateIdParam = [
  param("id").custom((value) => {
    if (mongoose.Types.ObjectId.isValid(value)) {
      return true;
    }
    if (typeof value === "string" && value.length > 0) {
      return true;
    }
    throw new Error("Invalid product ID or slug");
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new APIError(400, errors.array().map((err) => err.msg).join(", "));
    }
    next();
  },
];

/**
 * Category ID parameter validation middleware
 * Validates that the category ID is a valid MongoDB ObjectId
 * 
 * @throws {APIError} 400 - If validation fails
 */
const validateCategoryIdParam = [
  param("categoryId").isMongoId().withMessage("Invalid category ID"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new APIError(400, errors.array().map((err) => err.msg).join(", "));
    }
    next();
  },
];

/**
 * Product Routes
 */

/**
 * Create a new product
 * POST /api/products
 * @requires Authentication
 * @requires Admin privileges
 * @requires Validated product data
 * @returns {APIResponse} Created product
 */
router.post(
  "/",
  authenticatedMiddleware,
  adminMiddleware,
  handleMulterErrors,
  validateProductBody,
  createProduct
);

/**
 * Get all products with pagination and filtering
 * GET /api/products
 * @public
 * @returns {APIResponse} Paginated list of products
 */
router.get("/", validatePaginationAndFilter, getProducts);

/**
 * Get products by category
 * GET /api/products/category/:categoryId
 * @public
 * @returns {APIResponse} Paginated list of products in the specified category
 */
router.get("/category/:categoryId", validateCategoryIdParam, validatePaginationAndFilter, getProductbyCategory);

/**
 * Get a single product by ID or slug
 * GET /api/products/:id
 * @public
 * @returns {APIResponse} Product details
 */
router.get("/:id", validateIdParam, getProductbyId);

/**
 * Update a product
 * PUT /api/products/:id
 * @requires Authentication
 * @requires Admin privileges
 * @requires Validated product data
 * @returns {APIResponse} Updated product
 */
router.put(
  "/:id",
  authenticatedMiddleware,
  adminMiddleware,
  validateIdParam,
  handleMulterErrors,
  validateProductBody,
  updateProduct
);

/**
 * Delete a product (soft delete)
 * DELETE /api/products/:id
 * @requires Authentication
 * @requires Admin privileges
 * @returns {APIResponse} Deletion confirmation
 */
router.delete(
  "/:id",
  authenticatedMiddleware,
  adminMiddleware,
  validateIdParam,
  deleteProduct
);

/**
 * Restore a soft-deleted product
 * POST /api/products/restore/:id
 * @requires Authentication
 * @requires Admin privileges
 * @returns {APIResponse} Restored product
 */
router.post(
  "/restore/:id",
  authenticatedMiddleware,
  adminMiddleware,
  validateIdParam,
  restoreProduct
);

/**
 * Get products with low stock (below threshold)
 * GET /api/products/low-stock
 * @requires Authentication
 * @requires Admin privileges
 * @returns {APIResponse} List of products with low stock
 */
router.get("/low-stock", authenticatedMiddleware, adminMiddleware, getLowStockProducts);

/**
 * Test route for file uploads
 * POST /api/products/test-upload
 * @note Only available in non-production environments
 * @returns {APIResponse} Uploaded files and request body
 */
router.post("/test-upload", restrictTestRouteInProduction, handleMulterErrors, (req, res) => {
  res.status(200).json(
    new APIResponse(200, { files: req.files, body: req.body }, "Files received")
  );
});

export default router;