import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
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
    }
    await product.updateAverageRating();
  }
});

// Post-remove hook to update the product's reviews and average rating
reviewSchema.post("remove", async function (doc) {
  const Product = mongoose.model("Product");
  const product = await Product.findById(doc.product);
  if (product) {
    product.reviews = product.reviews.filter((reviewId) => reviewId.toString() !== doc._id.toString());
    await product.updateAverageRating();
  }
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;