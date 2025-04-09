import mongoose, { Schema } from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["COD", "Card", "PayPal"],
      required: true,
    },
    shippingAddress: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "Pending Payment",
        "Awaiting Payment",
        "Paid",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending Payment",
    },
  },
  { timestamps: true }
);

// Generate a unique order number before saving
orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}`;
  }
  next();
});

// Update product stock when order is paid
orderSchema.post("save", async function (doc) {
  if (doc.status === "Paid") {
    const Product = mongoose.model("Product");
    for (const item of doc.items) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.total_number < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.product_name}`);
        }
        product.total_number -= item.quantity;
        await product.save();
      }
    }
  }
});

// Restore product stock if order is cancelled
orderSchema.post("findOneAndUpdate", async function (doc) {
  if (doc.status === "Cancelled") {
    const Product = mongoose.model("Product");
    for (const item of doc.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.total_number += item.quantity;
        await product.save();
      }
    }
  }
});

const Order = mongoose.model("Order", orderSchema);
export default Order;