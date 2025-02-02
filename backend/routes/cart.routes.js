import { Router } from "express";
import { authenticatedMiddleware } from "../middlewares/auth.middlewares.js";
import {
  addToCart,
  clearCart,
  getCart,
  updateCart,
} from "../controllers/cart.controller.js";

const router = Router();

router.get("/", authenticatedMiddleware, getCart);
router.post("/", authenticatedMiddleware, addToCart);
router.put("/", authenticatedMiddleware, updateCart);
router.delete("/", authenticatedMiddleware, clearCart);

export default router;
