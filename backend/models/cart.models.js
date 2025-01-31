import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema({
  user: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  Product: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  quatity: [],
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
