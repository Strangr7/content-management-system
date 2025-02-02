import { Router } from "express";
import { authenticatedMiddleware } from "../middlewares/auth.middlewares.js";
import { addReview, getReviews } from "../controllers/review.controller.js";
const router = Router();

router.post("/product/:productId/review", authenticatedMiddleware, addReview);
router.get("/product/:productId/reviews", getReviews);

export default router;
