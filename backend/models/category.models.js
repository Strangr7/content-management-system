import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      index: true,
      trim: true, // Remove leading/trailing whitespace
    },
  },
  { timestamps: true }
);

// Add case-insensitive unique index
categorySchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

// Log index creation
categorySchema.on("index", (error) => {
  if (error) {
    console.error("Failed to create indexes for Category schema:", error);
  } else {
    console.log("Indexes created successfully for Category schema");
  }
});

const Category = mongoose.model("Category", categorySchema);
export default Category;