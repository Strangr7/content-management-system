import Category from "../models/category.models.js";
import Product from "../models/product.models.js"; // Import Product for deleteCategory
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";

// Create categories
const createCategories = asyncHandler(async (req, res) => {
  const { names } = req.body;

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

  const normalizedNames = names.map((name) => name.trim().toLowerCase());
  const existingCategories = await Category.find({
    name: { $in: normalizedNames },
    collation: { locale: "en", strength: 2 },
  });

  if (existingCategories.length > 0) {
    const existingNames = existingCategories.map((cat) => cat.name).join(", ");
    logger.error(`Duplicate categories found: ${existingNames}`);
    throw new APIError(
      400,
      `The following categories already exist: ${existingNames}`
    );
  }

  const categories = names.map((name) => ({ name }));
  try {
    const createdCategories = await Category.insertMany(categories);
    res.status(201).json(
      new APIResponse(201, createdCategories, "Categories created successfully")
    );
  } catch (error) {
    if (error.code === 11000) {
      throw new APIError(409, "One or more category names already exist");
    }
    throw new APIError(500, "Failed to create categories", error);
  }
});

// Fetch categories
const getCategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (isNaN(pageNumber) || pageNumber < 1) {
    throw new APIError(400, "Page number must be a positive integer");
  }
  if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
    throw new APIError(400, "Limit must be between 1 and 100");
  }

  const categories = await Category.find()
    .limit(limitNumber)
    .skip((pageNumber - 1) * limitNumber)
    .lean();

  const totalCategories = await Category.countDocuments();

  if (!categories.length) {
    return res.status(200).json(new APIResponse(200, [], "No categories found"));
  }

  res.status(200).json(
    new APIResponse(
      200,
      {
        categories,
        totalCategories,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCategories / limitNumber),
      },
      "Categories fetched successfully"
    )
  );
});

// Update category
const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name } = req.body;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new APIError(400, "Invalid category ID");
  }

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new APIError(400, "Category name is required and must be a non-empty string");
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new APIError(404, "Category not found");
  }

  const normalizedName = name.trim().toLowerCase();
  const existingCategory = await Category.findOne({
    name: normalizedName,
    _id: { $ne: categoryId },
    collation: { locale: "en", strength: 2 },
  });

  if (existingCategory) {
    throw new APIError(409, `Category with name "${name}" already exists`);
  }

  category.name = name.trim();
  try {
    await category.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new APIError(409, `Category with name "${name}" already exists`);
    }
    throw new APIError(500, "Failed to update category", error);
  }

  logger.info(`Category updated: ${categoryId}`, { name });
  res.status(200).json(new APIResponse(200, category, "Category updated successfully"));
});

// Delete category
const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new APIError(400, "Invalid category ID");
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new APIError(404, "Category not found");
  }

  const productsInCategory = await Product.find({ category: categoryId });
  if (productsInCategory.length > 0) {
    throw new APIError(
      400,
      "Cannot delete category because it is associated with one or more products"
    );
  }

  await Category.findByIdAndDelete(categoryId);

  logger.info(`Category deleted: ${categoryId}`, { name: category.name });
  res.status(200).json(new APIResponse(200, null, "Category deleted successfully"));
});

export { createCategories, getCategories, updateCategory, deleteCategory };