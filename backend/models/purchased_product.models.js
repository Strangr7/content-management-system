import mongoose, { Schema } from "mongoose";

const productpurchasedSchema = new Schema({
  user: [{ type: Schema.Types.ObjectId, ref: "User" }],
  product: [
    {
      type: Schema.Types.ObjectId,
      ref: "Produt",
    },
  ],
  date_of_purchase: {},
  quantity: {},
});

const Productpurchased = mongoose.model(
  "ProductPurchased",
  productpurchasedSchema
);

export default productpurchasedSchema;
