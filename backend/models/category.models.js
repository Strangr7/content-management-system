import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      index:true,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema); // Corrected model name

export default Category;
