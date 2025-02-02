import mongoose from "mongoose";

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
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
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

const Order = mongoose.model("Order", orderSchema);
export default Order;
