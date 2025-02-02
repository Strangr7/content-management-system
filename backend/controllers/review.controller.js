import Product from "../models/product.models.js";
import Review from "../models/review.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/APIResponse.js";

//add review to a product
const addReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, review } = req.body;
  const { userId } = req.user._id;

  if (rating < 1 || rating > 5) {
    throw new APIError(400, "Rating must be between 1 and 5");
  }

  const existingReview = await Review.findOne({
    product: productId,
    user: userId,
  });
  if (existingReview) {
    existingReview.rating = rating;
    existingReview.review = review;
    await existingReview.save();

    const product = await Product.findById(productId);
    const totalRatings = product.reviews.length;
    const averageRating = product.reviews.reduce((acc, reviewId) => {
      const review = Review.findById(reviewId); // await for review fetching might be needed here
      return acc + review.rating;
    }, 0);

    product.averageRating = averageRating;
    await product.save();
    res
      .status(201)
      .json(
        new APIResponse(201, existingReview, "Review updated successfully")
      );
  }
});

//fetch all the reviews

const getReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const reviews = await Review.find({ product: productId }).populate(
    "user",
    "username"
  );
  res
    .status(200)
    .json(new APIResponse(200, reviews, "Reviews fetched successfully"));
});

export { addReview, getReviews };
