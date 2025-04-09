import { Router } from "express";
import {
  createCategories,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { authenticatedMiddleware } from "../middlewares/auth.middlewares.js"; 
import{adminMiddleware} from "../middlewares/admin.middlewares.js";
import { apiRateLimiter } from "../middlewares/rate-limiter.middlewares.js"; 

const router = Router();

// Apply rate limiting to all category routes
router.use(apiRateLimiter);

// Public route: Fetch categories (no authentication required)
router.get("/", getCategories);

// Admin routes: Require authentication and admin privileges
router.post("/", authenticatedMiddleware, adminMiddleware, createCategories);
router.put("/:categoryId", authenticatedMiddleware, adminMiddleware, updateCategory);
router.delete("/:categoryId", authenticatedMiddleware, adminMiddleware, deleteCategory);

export default router;