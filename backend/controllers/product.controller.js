/**
 * @file Product Controller
 * @description Controller functions for handling product-related operations
 * Implements CRUD operations, filtering, searching, and special product management functions
 * Each function is wrapped with asyncHandler for consistent error handling
 */

import Product from "../models/product.models.js";
import Category from "../models/category.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/clodinary.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";

/**
 * Build product filter object for database queries
 * Supports filtering by category, status, and price range
 * 
 * @param {string} categoryId - MongoDB ObjectId of category to filter by
 * @param {string} status - Product status (active, out_of_stock, discontinued)
 * @param {number} minPrice - Minimum price filter
 * @param {number} maxPrice - Maximum price filter
 * @returns {Object} MongoDB filter object for use in queries
 */
const buildProductFilter = (categoryId, status, minPrice, maxPrice) => {
  const filter = categoryId ? { category: categoryId } : {};
  if (status) filter.status = status;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }
  return filter;
};

/**
 * Create a new product
 * - Validates category existence
 * - Handles image uploads to Cloudinary
 * - Creates product with uploaded image URLs
 * - Returns populated product with category and review data
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing product data
 * @param {string} req.body.category - Category ID
 * @param {number} req.body.price - Product price
 * @param {number} req.body.discount - Discount percentage (optional)
 * @param {number} req.body.total_number - Inventory quantity
 * @param {string} req.body.description - Product description
 * @param {string} req.body.brand - Product brand
 * @param {string} req.body.color - Product color
 * @param {string} req.body.size - Product size
 * @param {string} req.body.product_name - Product name
 * @param {string} req.body.date_of_manufacture - Manufacturing date (ISO format)
 * @param {number} req.body.stockThreshold - Low stock threshold (optional)
 * @param {string} req.body.sku - Stock Keeping Unit (optional)
 * @param {Array} req.files - Uploaded image files
 * @param {Object} req.user - Authenticated user data
 * @param {Object} res - Express response object
 * @throws {APIError} If category not found or image upload fails
 * @returns {APIResponse} Created product with 201 status
 */
const createProduct = asyncHandler(async (req, res) => {
  logger.debug("Request body:", req.body);
  logger.debug("Request files:", req.files);

  const {
    category,
    product_name,
  } = req.body;

  // Validate category
  const categoryExists = await Category.findById(category).lean();
  if (!categoryExists) {
    throw new APIError(404, "Category not found");
  }

  // Handle image uploads
  const images = [];
  if (!req.files || req.files.length === 0) {
    throw new APIError(400, "At least one product image is required");
  }

  try {
    for (const file of req.files) {
      logger.debug(`File details for ${file.originalname}:`, {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      });
      if (!file.buffer) {
        logger.error(`Buffer is undefined for file: ${file.originalname}`);
        throw new APIError(500, `Buffer is undefined for file: ${file.originalname}`);
      }
      const cloudinaryResponse = await uploadOnCloudinary(file.buffer);
      if (!cloudinaryResponse) {
        throw new APIError(500, `Failed to upload image to Cloudinary: ${file.originalname}`);
      }
      images.push(cloudinaryResponse.secure_url);
    }
  } catch (error) {
    // Clean up any uploaded images if an error occurs
    for (const imageUrl of images) {
      const publicId = imageUrl.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId);
    }
    throw new APIError(500, `Image upload failed: ${error.message}`);
  }

  // Create product
  const product = new Product({
    ...req.body,
    images,
    createdBy: req.user?._id || null,
  });

  await product.save();
  logger.info(`Product created successfully: ${product._id}`, { product_name });

  const populatedProduct = await Product.findById(product._id)
    .populate("category", "name")
    .populate("reviews", "rating review user");

  res.status(201).json(new APIResponse(201, populatedProduct, "Product created successfully"));
});

/**
 * Get all products with pagination, sorting, and filtering
 * - Supports filtering by category, status, price range
 * - Supports sorting by createdAt, price, product_name, averageRating
 * - Returns paginated products with total count and page information
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {number} [req.query.limit=9] - Items per page
 * @param {string} [req.query.sortBy="createdAt"] - Field to sort by
 * @param {string} [req.query.sortOrder="desc"] - Sort direction (asc/desc)
 * @param {string} [req.query.status] - Filter by product status
 * @param {string} [req.query.category] - Filter by category ID
 * @param {number} [req.query.minPrice] - Filter by minimum price
 * @param {number} [req.query.maxPrice] - Filter by maximum price
 * @param {Object} res - Express response object
 * @returns {APIResponse} Paginated products with metadata
 */
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 9,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
    category,
    minPrice,
    maxPrice,
  } = req.query;

  // Validation is handled by validatePaginationAndFilter middleware

  // Build filter
  const filter = buildProductFilter(category, status, minPrice, maxPrice);

  // Fetch products with pagination, filtering, and sorting
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const products = await Product.find(filter)
    .populate("category", "name")
    .populate("reviews", "rating review user")
    .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
    .limit(limitNumber)
    .skip((pageNumber - 1) * limitNumber)
    .lean();

  const totalProducts = await Product.countDocuments(filter);

  res.status(200).json(
    new APIResponse(
      200,
      {
        products,
        totalProducts,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProducts / limitNumber),
      },
      "Products fetched successfully"
    )
  );
});

/**
 * Get products by category with pagination, sorting, and filtering
 * - Verifies category exists before proceeding
 * - Similar filtering and pagination options as getProducts
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.categoryId - Category ID to filter by
 * @param {Object} req.query - Query parameters (same as getProducts)
 * @param {Object} res - Express response object
 * @throws {APIError} If category not found
 * @returns {APIResponse} Paginated products with metadata
 */
const getProductbyCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
    minPrice,
    maxPrice,
  } = req.query;

  // Validation is handled by validateCategoryIdParam and validatePaginationAndFilter middleware

  // Check if the category exists
  const categoryExists = await Category.findById(categoryId).lean();
  if (!categoryExists) {
    throw new APIError(404, "Category not found");
  }

  // Build filter
  const filter = buildProductFilter(categoryId, status, minPrice, maxPrice);

  // Fetch products with pagination, filtering, and sorting
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const products = await Product.find(filter)
    .populate("category", "name")
    .populate("reviews", "rating review user")
    .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
    .limit(limitNumber)
    .skip((pageNumber - 1) * limitNumber)
    .lean();

  const totalProducts = await Product.countDocuments(filter);

  res.status(200).json(
    new APIResponse(
      200,
      {
        products,
        totalProducts,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProducts / limitNumber),
      },
      "Products fetched successfully"
    )
  );
});

/**
 * Get a specific product by ID or slug
 * - Supports looking up by MongoDB ObjectId or product slug
 * - Returns populated product with category and review data
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Product ID or slug
 * @param {Object} res - Express response object
 * @throws {APIError} If product not found
 * @returns {APIResponse} Product details
 */
const getProductbyId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let product;
  if (mongoose.Types.ObjectId.isValid(id)) {
    product = await Product.findById(id)
      .populate("category", "name")
      .populate("reviews", "rating review user")
      .lean();
  } else {
    product = await Product.findBySlug(id);
  }

  if (!product) {
    throw new APIError(404, "Product not found");
  }

  res.status(200).json(new APIResponse(200, product, "Product fetched successfully"));
});

/**
 * Update an existing product
 * - Validates category existence if category is being updated
 * - Handles image updates with cleanup of old images
 * - Records user who performed the update
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Product ID
 * @param {Object} req.body - Product data to update
 * @param {Array} req.files - New image files (optional)
 * @param {Object} req.user - Authenticated user data
 * @param {Object} res - Express response object
 * @throws {APIError} If product not found, category not found, or image upload fails
 * @returns {APIResponse} Updated product
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // Find the product
  const product = await Product.findById(id);
  if (!product) {
    throw new APIError(404, "Product not found");
  }

  // Validate category if provided
  if (updateData.category) {
    const categoryExists = await Category.findById(updateData.category).lean();
    if (!categoryExists) {
      throw new APIError(404, "Category not found");
    }
  }

  // Handle image updates
  if (req.files && req.files.length > 0) {
    // Delete old images from Cloudinary
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map(async (imageUrl) => {
          const publicId = imageUrl.split("/").pop().split(".")[0];
          await deleteFromCloudinary(publicId);
          logger.info(`Deleted old image from Cloudinary: ${imageUrl}`);
        })
      );
    }

    // Upload new images to Cloudinary
    const imageUrls = [];
    try {
      for (const file of req.files) {
        const cloudinaryResponse = await uploadOnCloudinary(file.buffer);
        if (!cloudinaryResponse) {
          throw new APIError(500, `Failed to upload image to Cloudinary: ${file.originalname}`);
        }
        imageUrls.push(cloudinaryResponse.secure_url);
      }
    } catch (error) {
      // Clean up any uploaded images if an error occurs
      for (const imageUrl of imageUrls) {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        await deleteFromCloudinary(publicId);
      }
      throw new APIError(500, `Image upload failed: ${error.message}`);
    }

    updateData.images = imageUrls;
  }

  // Add updatedBy field
  updateData.updatedBy = req.user?._id || null;

  // Update the product
  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("category", "name")
    .populate("reviews", "rating review user");

  logger.info(`Product updated successfully: ${id}`, { product_name: updatedProduct.product_name });
  res.status(200).json(new APIResponse(200, updatedProduct, "Product updated successfully"));
});

/**
 * Soft delete a product
 * - Uses the softDelete method from product model
 * - Records user who performed the deletion
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Product ID
 * @param {Object} req.user - Authenticated user data
 * @param {Object} res - Express response object
 * @throws {APIError} If product not found
 * @returns {APIResponse} Success confirmation with null data
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new APIError(404, "Product not found");
  }

  await product.softDelete(req.user?._id || null);
  logger.info(`Product soft-deleted successfully: ${id}`, { product_name: product.product_name });

  res.status(200).json(new APIResponse(200, null, "Product soft-deleted successfully"));
});

/* Commented code removed - Duplicate of deleteProduct function */

/**
 * Restore a soft-deleted product
 * - Uses the restore method from product model
 * - Records user who performed the restoration
 * - Returns populated product with category and review data
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Product ID
 * @param {Object} req.user - Authenticated user data
 * @param {Object} res - Express response object
 * @throws {APIError} If soft-deleted product not found
 * @returns {APIResponse} Restored product
 */
const restoreProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find product that has been soft-deleted (has deletedAt timestamp)
  const product = await Product.findOne({ _id: id, deletedAt: { $ne: null } }).setOptions({
    includeDeleted: true,
  });
  if (!product) {
    throw new APIError(404, "Soft-deleted product not found");
  }

  await product.restore(req.user?._id || null);
  logger.info(`Product restored successfully: ${id}`, { product_name: product.product_name });

  const restoredProduct = await Product.findById(id)
    .populate("category", "name")
    .populate("reviews", "rating review user");

  res.status(200).json(new APIResponse(200, restoredProduct, "Product restored successfully"));
});

/**
 * Get products with inventory below their stock threshold
 * - Uses the findLowStockProducts static method from product model
 * - Used for inventory management and alerts
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {APIResponse} List of low-stock products
 */
const getLowStockProducts = asyncHandler(async (req, res) => {
  const lowStockProducts = await Product.findLowStockProducts();

  res.status(200).json(
    new APIResponse(200, lowStockProducts, "Low-stock products fetched successfully")
  );
});

export {
  createProduct,
  getProducts,
  getProductbyCategory,
  getProductbyId,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getLowStockProducts,
};