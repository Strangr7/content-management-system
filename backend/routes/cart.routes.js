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
router.put("/:cartId", authenticatedMiddleware, updateCart);
router.delete("/:cartId", authenticatedMiddleware, clearCart);

export default router;
