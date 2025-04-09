import { Router } from "express";
import {
  checkout,
  fetchAllOrders,
  fetchOrderByNumber,
  updateOrderStatus,
  fetchAllOrdersAdmin,
  fetchOrderByNumberAdmin,
  updateOrderStatusAdmin,
} from "../controllers/order.controller.js";
import { authenticatedMiddleware } from "../middlewares/auth.middlewares.js";
import { adminMiddleware } from "../middlewares/admin.middlewares.js";
import { apiRateLimiter } from "../middlewares/rate-limiter.middlewares.js";

const router = Router();

router.use(apiRateLimiter);

// User routes
router.post("/checkout", authenticatedMiddleware, checkout);
router.get("/", authenticatedMiddleware, fetchAllOrders);
router.get("/:orderNumber", authenticatedMiddleware, fetchOrderByNumber);
router.put("/:orderNumber/status", authenticatedMiddleware, updateOrderStatus);

// Admin routes
router.get("/admin", authenticatedMiddleware, adminMiddleware, fetchAllOrdersAdmin);
router.get("/admin/:orderNumber", authenticatedMiddleware, adminMiddleware, fetchOrderByNumberAdmin);
router.put("/admin/:orderNumber/status", authenticatedMiddleware, adminMiddleware, updateOrderStatusAdmin);

export default router;