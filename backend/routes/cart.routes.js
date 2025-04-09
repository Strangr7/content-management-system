import { Router } from "express";
import { authenticatedMiddleware } from "../middlewares/auth.middlewares.js";
import { apiRateLimiter } from "../middlewares/rate-limiter.middlewares.js";
import {
  addToCart,
  clearCart,
  getCart,
  updateCart,
  removeItemFromCart,
  applyCoupon,
} from "../controllers/cart.controller.js";

const router = Router();

router.use(apiRateLimiter);

router.get("/", authenticatedMiddleware, getCart);
router.post("/", authenticatedMiddleware, addToCart);
router.put("/", authenticatedMiddleware, updateCart);
router.delete("/", authenticatedMiddleware, clearCart);
router.delete("/item", authenticatedMiddleware, removeItemFromCart);
router.post("/coupon", authenticatedMiddleware, applyCoupon);

export default router;