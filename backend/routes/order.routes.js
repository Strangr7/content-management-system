import { Router } from "express";
import { checkout, fetchAllOrders } from "../controllers/order.controller.js";
import { authenticatedMiddleware } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/checkout", authenticatedMiddleware, checkout);
router.get("/", authenticatedMiddleware, fetchAllOrders);
export default router;
