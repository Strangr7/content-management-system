import { Router } from "express";
import { authenticatedMiddleware } from "../middlewares/auth.middlewares.js";
import { addReview, getReviews, deleteReview } from "../controllers/review.controller.js";

const router = Router();

router.post("/product/:productId", authenticatedMiddleware, addReview);
router.get("/product/:productId", getReviews);
router.delete("/product/:productId", authenticatedMiddleware, deleteReview);

export default router;