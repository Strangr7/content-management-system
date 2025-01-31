import { Router } from "express";
import { createCategories } from "../controllers/category.controller.js";

const router = Router();

router.post("/", createCategories);
export default router;
