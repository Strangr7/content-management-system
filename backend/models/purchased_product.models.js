import mongoose, { Schema } from "mongoose";

const productPurchasedSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  date_of_purchase: { type: Date, default: Date.now, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

// Update product stock when a purchase is recorded
productPurchasedSchema.post("save", async function (doc) {
  const Product = mongoose.model("Product");
  const product = await Product.findById(doc.product);
  if (product) {
    if (product.total_number < doc.quantity) {
      throw new Error(`Insufficient stock for product ${product.product_name}`);
    }
    product.total_number -= doc.quantity;
    await product.save();
  }
});

const ProductPurchased = mongoose.model("ProductPurchased", productPurchasedSchema);

export { ProductPurchased };