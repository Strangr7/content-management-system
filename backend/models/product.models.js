import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    // Name of the product
    product_name: {
      type: String,
      required: [true, "Product name is required"],
      index: true,
      trim: true,
    },

    // Category of the product (references the 'Category' model)
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    // Date when the product was manufactured
    date_of_manufacture: {
      type: Date,
      required: [true, "Manufacturing date is required"],
      validate: {
        validator: function (value) {
          // Ensure the date is not in the future
          return value <= new Date();
        },
        message: "Manufacturing date cannot be in the future",
      },
    },

    // Color of the product
    color: {
      type: String,
      required: true,
    },

    // Size of the product
    size: {
      type: String,
      required: true,
    },

    // Price of the product
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Status of the product (e.g., active, out of stock, discontinued)
    status: {
      type: String,
      enum: ["active", "out_of_stock", "discontinued"], // Allowed values
      default: "active",
    },

    // Description of the product
    description: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 1000,
    },

    // URL of the product's main image
    image: {
      type: String,
      required: true,
    },

    
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },

    // Discount percentage applied to the product (ranges from 0 to 100)
    discount: {
      type: Number,
      min: [0, "Discount cannot be less than 0%"],
      max: [100, "Discount cannot exceed 100%"],
      default: 0,
    },

    // Total number of units available in stock
    total_number: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
