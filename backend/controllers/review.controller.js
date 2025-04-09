import Product from "../models/product.models.js";
import Review from "../models/review.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";

// Add or update a review for a product
const addReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, review } = req.body;
  const userId = req.user._id;

  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    throw new APIError(400, "Rating must be between 1 and 5");
  }

  // Validate review text
  if (!review || review.trim().length === 0) {
    throw new APIError(400, "Review text is required");
  }

  // Check if the product exists, is not discontinued, and is not soft-deleted
  const product = await Product.findOne({
    _id: productId,
    status: { $in: ["active", "out_of_stock"] }, // Allow reviews for active or out-of-stock products
    deletedAt: null,
  });
  if (!product) {
    throw new APIError(404, "Product not found or unavailable for reviews");
  }

  // Check if the user has already reviewed this product
  const existingReview = await Review.findOne({
    product: productId,
    user: userId,
  });

  let updatedReview;
  if (existingReview) {
    // Update existing review
    existingReview.rating = rating;
    existingReview.review = review;
    updatedReview = await existingReview.save();
    return res
      .status(200)
      .json(new APIResponse(200, updatedReview, "Review updated successfully"));
  } else {
    // Create new review
    const newReview = new Review({
      product: productId,
      user: userId,
      rating,
      review,
    });
    updatedReview = await newReview.save();
    return res
      .status(201)
      .json(new APIResponse(201, updatedReview, "Review added successfully"));
  }
});

// Fetch all reviews for a product with pagination
const getReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Check if the product exists, is not discontinued, and is not soft-deleted
  const product = await Product.findOne({
    _id: productId,
    status: { $in: ["active", "out_of_stock"] },
    deletedAt: null,
  });
  if (!product) {
    throw new APIError(404, "Product not found or unavailable");
  }

  // Fetch reviews with pagination
  const reviews = await Review.find({ product: productId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("user", "email firstName lastName");

  const totalReviews = await Review.countDocuments({ product: productId });

  return res.status(200).json(
    new APIResponse(
      200,
      {
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          limit,
        },
      },
      "Reviews fetched successfully"
    )
  );
});

// Delete a review (for authenticated users)
const deleteReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  // Check if the product exists, is not discontinued, and is not soft-deleted
  const product = await Product.findOne({
    _id: productId,
    status: { $in: ["active", "out_of_stock"] },
    deletedAt: null,
  });
  if (!product) {
    throw new APIError(404, "Product not found or unavailable");
  }

  // Find the review
  const review = await Review.findOne({ product: productId, user: userId });
  if (!review) {
    throw new APIError(404, "Review not found");
  }

  // Delete the review
  await review.deleteOne();

  return res.status(200).json(new APIResponse(200, null, "Review deleted successfully"));
});

export { addReview, getReviews, deleteReview };