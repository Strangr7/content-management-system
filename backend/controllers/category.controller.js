import Category from "../models/category.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/APIError.js";

//creating categories
const createCategories = asyncHandler(async (req, res) => {
  const { names } = req.body;

  if (!Array.isArray(names) || names.length === 0) {
    throw new APIError(400, "Please provide an array of category names");
  }
  const existingCategories = await Category.find({ name: { $in: names } });
  if (existingCategories.length > 0) {
    throw new APIError(400, "Some categories already exists");
  }
  const categories = names.map((name) => ({ name }));
  const createdCategories = await Category.insertMany(categories);

  res
    .status(201)
    .json(
      new APIResponse(201, createdCategories, "Categories created successfully")
    );
});

//Fetching categories
//updating categoris
//deleteing categories

export { createCategories };
