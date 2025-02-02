import Product from "../models/product.models.js";
import Category from "../models/category.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";

// Helper function to build product filter
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

// Create product
const createProduct = asyncHandler(async (req, res) => {
  const { category, price, discount, total_number } = req.body;

  // Validate request data
  if (!category || !price || !total_number) {
    throw new APIError(400, "Category, price, and total number are required");
  }
  if (
    typeof price !== "number" ||
    typeof total_number !== "number" ||
    (discount && typeof discount !== "number")
  ) {
    throw new APIError(
      400,
      "Price, discount, and total number must be valid numbers"
    );
  }
  if (price < 0 || (discount && discount < 0) || total_number < 0) {
    throw new APIError(
      400,
      "Price, discount, and total number cannot be negative"
    );
  }
  if (discount && discount > price) {
    throw new APIError(400, "Discount cannot be greater than price");
  }

  // Check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new APIError(400, "Invalid Category");
  }

  // Create and save product
  const product = new Product(req.body);
  await product.save();
  logger.info("Product created successfully");

  res
    .status(201)
    .json(new APIResponse(201, product, "Product created successfully"));
});

// Get all products
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

  // Validate pagination inputs
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 9;

  // Build filter
  const filter = buildProductFilter(category, status, minPrice, maxPrice);

  // Fetch products with pagination, filtering, and sorting
  const products = await Product.find(filter)
    .populate("category", "name")
    .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
    .limit(limitNumber)
    .skip((pageNumber - 1) * limitNumber);

  const totalProducts = await Product.countDocuments(filter);

  res
    .status(200)
    .json(
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

// Get all products for a specific category
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

  // Validate category ID
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new APIError(400, "Invalid category ID");
  }

  // Check if the category exists
  const categoryExists = await Category.findById(categoryId);
  if (!categoryExists) {
    throw new APIError(404, "Category not found");
  }

  // Build filter
  const filter = buildProductFilter(categoryId, status, minPrice, maxPrice);

  // Fetch products with pagination, filtering, and sorting
  const products = await Product.find(filter)
    .populate("category", "name")
    .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
    .limit(parseInt(limit))
    .skip((page - 1) * limit);

  const totalProducts = await Product.countDocuments(filter);

  res
    .status(200)
    .json(
      new APIResponse(
        200,
        {
          products,
          totalProducts,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProducts / limit),
        },
        "Products fetched successfully"
      )
    );
});

// Get a specific product by ID
const getProductbyId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new APIError(400, "Invalid product ID");
  }

  const product = await Product.findById(id).populate("category", "name");
  if (!product) {
    throw new APIError(404, "Product not found");
  }

  res
    .status(200)
    .json(new APIResponse(200, product, "Product fetched successfully"));
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { category, price, discount } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new APIError(400, "Invalid product ID");
  }

  if (discount && discount > price) {
    throw new APIError(400, "Discount cannot be greater than price");
  }

  // Check if the referenced category exists
  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new APIError(400, "Invalid category");
    }
  }

  // Find and update the product
  const product = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate("category", "name");

  if (!product) {
    throw new APIError(404, "Product not found");
  }

  logger.info(`Product with ID ${id} updated successfully`);
  res
    .status(200)
    .json(new APIResponse(200, product, "Product updated successfully"));
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new APIError(400, "Invalid product ID");
  }

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new APIError(404, "Product not found");
  }

  logger.info(`Product with ID ${id} deleted successfully`);
  res
    .status(200)
    .json(new APIResponse(200, null, "Product deleted successfully"));
});

export {
  createProduct,
  getProducts,
  getProductbyId,
  updateProduct,
  deleteProduct,
  getProductbyCategory,
};
