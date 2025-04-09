/**
 * @file Product Model Schema
 * @description Defines the Mongoose schema for e-commerce products with validation, middleware, and methods
 */

import mongoose from "mongoose";

/**
 * Product Schema
 * @typedef {Object} ProductSchema
 * @property {String} product_name - Name of the product with validation for min/max length
 * @property {ObjectId} category - Reference to the Category model
 * @property {Number} price - Product price (non-negative)
 * @property {Number} discount - Optional discount percentage (0-100%)
 * @property {Number} total_number - Inventory quantity available
 * @property {String} description - Detailed product description
 * @property {String} brand - Product manufacturer or brand name
 * @property {String} color - Product color (letters, spaces, hyphens only)
 * @property {String} size - Product size (alphanumeric, spaces, hyphens)
 * @property {Date} date_of_manufacture - Date when product was manufactured
 * @property {String[]} images - Array of image URLs (max 10)
 * @property {String} status - Product availability status (active, out_of_stock, discontinued)
 * @property {String} slug - URL-friendly unique identifier
 * @property {Number} stockThreshold - Minimum quantity before low stock alert
 * @property {String} sku - Stock Keeping Unit identifier
 * @property {Number} averageRating - Average product rating from reviews (0-5)
 * @property {ObjectId[]} reviews - References to Review model
 * @property {Date} deletedAt - Soft deletion timestamp
 * @property {ObjectId} createdBy - Reference to User who created the product
 * @property {ObjectId} updatedBy - Reference to User who last updated the product
 */
const productSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a non-negative number"],
    },
    discount: {
      type: Number,
      min: [0, "Discount must be a non-negative number"],
      max: [100, "Discount cannot exceed 100%"],
      default: 0,
    },
    total_number: {
      type: Number,
      required: [true, "Total number is required"],
      min: [0, "Total number must be a non-negative integer"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      minlength: [2, "Brand must be at least 2 characters"],
      maxlength: [50, "Brand cannot exceed 50 characters"],
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      trim: true,
      match: [/^[a-zA-Z\s-]+$/, "Color must contain only letters, spaces, or hyphens"],
    },
    size: {
      type: String,
      required: [true, "Size is required"],
      trim: true,
      match: [/^[a-zA-Z0-9\s-]+$/, "Size must contain only letters, numbers, spaces, or hyphens"],
    },
    date_of_manufacture: {
      type: Date,
      required: [true, "Manufacturing date is required"],
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: "Manufacturing date cannot be in the future",
      },
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 10;
        },
        message: "A product can have a maximum of 10 images",
      },
    },
    status: {
      type: String,
      enum: ["active", "out_of_stock", "discontinued"],
      default: "active",
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    stockThreshold: {
      type: Number,
      min: [0, "Stock threshold must be a non-negative integer"],
      default: 10,
    },
    sku: {
      type: String,
      trim: true,
      match: [/^[A-Z0-9-]+$/, "SKU must contain only uppercase letters, numbers, or hyphens"],
      sparse: true,
    },
    averageRating: {
      type: Number,
      min: [0, "Average rating must be a non-negative number"],
      max: [5, "Average rating cannot exceed 5"],
      default: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // Automatically create createdAt and updatedAt fields
    toJSON: { virtuals: true }, // Include virtual properties when converted to JSON
    toObject: { virtuals: true }, // Include virtual properties when converted to Object
    collation: { locale: "en", strength: 2 }, // Case-insensitive comparison for text fields
  }
);

/**
 * Compound index for unique product identification
 * Ensures products with same name, brand, color and size cannot be duplicated
 * Uses case-insensitive collation for more flexible matching
 */
productSchema.index(
  { product_name: 1, brand: 1, color: 1, size: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

/**
 * Pre-save middleware
 * Performs the following operations before saving a new product:
 * 1. Normalizes text fields to lowercase
 * 2. Generates a URL-friendly slug
 * 3. Sets status based on inventory level
 * 
 * @param {Function} next - Middleware callback
 */
productSchema.pre("save", async function (next) {
  this.product_name = this.product_name.toLowerCase();
  this.brand = this.brand.toLowerCase();
  this.color = this.color.toLowerCase();
  this.size = this.size.toLowerCase();
  this.slug = `${this.product_name}-${this.brand}-${this.color}-${this.size}`.replace(/\s+/g, "-");
  this.status = this.total_number > 0 ? "active" : "out_of_stock";
  next();
});

/**
 * Pre-update middleware
 * Performs the following operations before updating a product:
 * 1. Normalizes updated text fields to lowercase
 * 2. Regenerates slug if relevant fields are modified
 * 3. Updates status based on new inventory level if changed
 * 
 * @param {Function} next - Middleware callback
 */
productSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  
  // Normalize text fields to lowercase
  if (update.product_name) update.product_name = update.product_name.toLowerCase();
  if (update.brand) update.brand = update.brand.toLowerCase();
  if (update.color) update.color = update.color.toLowerCase();
  if (update.size) update.size = update.size.toLowerCase();
  
  // Regenerate slug if any of its components changed
  if (update.product_name || update.brand || update.color || update.size) {
    const doc = await this.model.findOne(this.getQuery());
    update.slug = `${update.product_name || doc.product_name}-${update.brand || doc.brand}-${update.color || doc.color}-${update.size || doc.size}`.replace(/\s+/g, "-");
  }
  
  // Update status based on inventory level
  if (update.total_number !== undefined) {
    update.status = update.total_number > 0 ? "active" : "out_of_stock";
  }
  
  next();
});

/**
 * Pre-find middleware
 * Automatically excludes soft-deleted products from query results
 * unless explicitly requested with the includeDeleted option
 * 
 * @param {Function} next - Middleware callback
 */
productSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.find({ deletedAt: null });
  }
  next();
});

/**
 * Soft delete a product
 * Sets deletedAt timestamp instead of removing from database
 * 
 * @param {ObjectId} userId - ID of user performing the delete action
 * @returns {Promise<void>}
 */
productSchema.methods.softDelete = async function (userId) {
  this.deletedAt = new Date();
  this.updatedBy = userId;
  await this.save();
};

/**
 * Restore a soft-deleted product
 * Clears deletedAt timestamp to make product visible again
 * 
 * @param {ObjectId} userId - ID of user performing the restore action
 * @returns {Promise<void>}
 */
productSchema.methods.restore = async function (userId) {
  this.deletedAt = null;
  this.updatedBy = userId;
  await this.save();
};

/**
 * Find product by its slug
 * Returns populated product with category and review data
 * 
 * @param {String} slug - The product slug to search for
 * @returns {Promise<Product>} The found product with populated references
 */
productSchema.statics.findBySlug = async function (slug) {
  return await this.findOne({ slug, deletedAt: null })
    .populate("category", "name")
    .populate("reviews", "rating review user");
};

/**
 * Find products with inventory below threshold
 * Used for low stock alerts and inventory management
 * 
 * @returns {Promise<Array>} List of products with low inventory
 */
productSchema.statics.findLowStockProducts = async function () {
  return await this.aggregate([
    {
      $match: {
        deletedAt: null,
        $expr: { $lte: ["$total_number", "$stockThreshold"] },
      },
    },
    {
      $project: {
        product_name: 1,
        total_number: 1,
        stockThreshold: 1,
      },
    },
  ]);
};

/**
 * Update product's average rating
 * Recalculates based on all associated reviews
 * 
 * @returns {Promise<void>}
 */
productSchema.methods.updateAverageRating = async function () {
  const reviews = await mongoose.model("Review").find({ product: this._id });
  if (reviews.length === 0) {
    this.averageRating = 0;
  } else {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / reviews.length;
  }
  await this.save();
};

/**
 * Product model
 * @type {mongoose.Model}
 */
const Product = mongoose.model("Product", productSchema);

export default Product;