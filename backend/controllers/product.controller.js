import Product from "../models/product.models.js";
import Category from "../models/category.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/APIError.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";




// Create product
const createProduct = asyncHandler(async (req, res) => {
  const { category, price, discount, total_number } = req.body;

  // Validate request data
  if (!category || !price || !total_number) {
    throw new APIError(400, "Category, price, and total number are required");
  }
  if (price < 0 || discount < 0 || total_number < 0) {
    throw new APIError(400, "Price, discount, and total number cannot be negative");
  }

  // Check discount
  if (discount > price) {
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

  res.status(201).json(new APIResponse(201, "Product created successfully", product));
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

  // Filteration
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Fetch products with pagination, filtering, and sorting
  const products = await Product.find(filter)
    .populate("category", "name")
    .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
    .limit(parseInt(limit))
    .skip((page - 1) * limit);

  const totalProducts = await Product.countDocuments(filter); // Fixed typo

  res.status(200).json({
    message: "Products fetched successfully",
    totalProducts,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalProducts / limit),
    products,
  });
});

// Get all products for a specific category
const getProductbyCategory = asyncHandler(async (req, res) => { // Added req and res
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

  // Build the filter object
  const filter = { category: categoryId };
  if (status) filter.status = status;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Fetch products with pagination, filtering, and sorting
  const products = await Product.find(filter)
    .populate("category", "name")
    .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
    .limit(parseInt(limit))
    .skip((page - 1) * limit);

  // Count total number of products in this category
  const totalProducts = await Product.countDocuments(filter);

  res.status(200).json({
    message: "Products fetched successfully",
    totalProducts,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalProducts / limit),
    products,
  });
});

// Get a specific product by ID
const getProductbyId = asyncHandler(async (req, res) => {
  const { id } = req.params; // Use consistent naming

  const product = await Product.findById(id).populate("category", "name");
  if (!product) {
    throw new APIError(404, "Product not found");
  }

  res.status(200).json(new APIResponse(200, product, "Product fetched successfully"));
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params; // Use consistent naming
  const { category, price, discount } = req.body;

  if (discount > price) {
    throw new APIError(400, "Discount cannot be greater than price"); // Use APIError
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

  logger.info(`Product with ID ${id} updated successfully`); // Add logging
  res.status(200).json(new APIResponse(200, product, "Product updated successfully"));
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params; // Use consistent naming

  const product = await Product.findByIdAndDelete(id); // Fixed typo
  if (!product) {
    throw new APIError(404, "Product not found");
  }

  logger.info(`Product with ID ${id} deleted successfully`); // Add logging
  res.status(200).json(new APIResponse(200, "Product deleted successfully"));
});

export {
  createProduct,
  getProducts,
  getProductbyId,
  updateProduct,
  deleteProduct,
  getProductbyCategory,
};