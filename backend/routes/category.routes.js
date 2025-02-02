import { Router } from "express";
import {
  createCategories,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = Router();

router.post("/", createCategories);
router.get("/", getCategories);
router.put("/:categoryId", updateCategory);
router.delete("/:categoryId", deleteCategory);
export default router;
