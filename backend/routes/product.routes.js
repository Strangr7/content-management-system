import { Router } from "express";
import {
  createProduct,
  getProducts,
  deleteProduct,
  getProductbyCategory,
  getProductbyId,
  updateProduct,
} from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();
router.post(
  "/",
  upload.fields([{ name: "ProductImage", maxCount: 5 }]),
  createProduct
);
router.get("/", getProducts);
router.get("/:id", getProductbyId);
router.get("/category/:categoryId", getProductbyCategory);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
