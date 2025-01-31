import { Router } from "express";
import {
  createProduct,
  getProducts,
  deleteProduct,
  getProductbyCategory,
  getProductbyId,
  updateProduct,
} from "../controllers/product.controller.js";

const router = Router();
router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductbyId);
router.get("/category/:categoryId", getProductbyCategory);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
