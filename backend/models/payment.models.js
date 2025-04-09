import mongoose, { Schema } from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Card", "PayPal"],
      required: true,
    },
    paymentDetails: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// Index for faster lookups by order
paymentSchema.index({ order: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;