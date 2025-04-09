import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: {
      type: String,
      required: [true, "Review text is required"],
      trim: true,
      minlength: [10, "Review must be at least 10 characters long"],
      maxlength: [500, "Review cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

// Post-save hook to update the product's reviews and average rating
reviewSchema.post("save", async function (doc) {
  const Product = mongoose.model("Product");
  const product = await Product.findById(doc.product);
  if (product) {
    if (!product.reviews.includes(doc._id)) {
      product.reviews.push(doc._id);
      await product.save();
    }
    await product.updateAverageRating();
  }
});

// Post-delete hook to update the product's reviews and average rating
reviewSchema.post("deleteOne", { document: true, query: false }, async function (doc) {
  const Product = mongoose.model("Product");
  const product = await Product.findById(doc.product);
  if (product) {
    product.reviews = product.reviews.filter((reviewId) => reviewId.toString() !== doc._id.toString());
    await product.save();
    await product.updateAverageRating();
  }
});

// Indexes for faster queries and uniqueness
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;