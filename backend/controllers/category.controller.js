import Category from "../models/category.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

// Create categories
const createCategories = asyncHandler(async (req, res) => {
  const { names } = req.body;

  // Validate input
  if (
    !Array.isArray(names) ||
    names.length === 0 ||
    !names.every((name) => typeof name === "string" && name.trim() !== "")
  ) {
    throw new APIError(
      400,
      "Please provide a non-empty array of valid category names"
    );
  }

  // Check for existing categories
  const existingCategories = await Category.find({ name: { $in: names } });
  if (existingCategories.length > 0) {
    const existingNames = existingCategories.map((cat) => cat.name).join(", ");
    logger.error(`Duplicate categories found: ${existingNames}`);
    throw new APIError(
      400,
      `The following categories already exist: ${existingNames}`
    );
  }

  // Create categories
  const categories = names.map((name) => ({ name }));
  const createdCategories = await Category.insertMany(categories);

  res
    .status(201)
    .json(
      new APIResponse(201, createdCategories, "Categories created successfully")
    );
});

// Fetch categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  if (!categories.length) {
    return res
      .status(200)
      .json(new APIResponse(200, [], "No categories found"));
  }

  res
    .status(200)
    .json(new APIResponse(200, categories, "Categories fetched successfully"));
});

// Update category (to be implemented)
const updateCategory = asyncHandler(async (req, res) => {
  throw new APIError(
    501,
    "Update category functionality is not implemented yet"
  );
});

// Delete category (to be implemented)
const deleteCategory = asyncHandler(async (req, res) => {
  throw new APIError(
    501,
    "Delete category functionality is not implemented yet"
  );
});

export { createCategories, getCategories, updateCategory, deleteCategory };
