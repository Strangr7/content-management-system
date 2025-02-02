import {Router} from 'express';
import { createPayment, executePayment } from '../controllers/payment.controller.js';
import { authenticatedMiddleware } from '../middlewares/auth.middlewares.js';

const router = Router();

router.post("/",authenticatedMiddleware, createPayment);
router.get("/",executePayment)
export default router;