import { Router } from "express";
import {
  addDescriptin,
  getDescription,
} from "../controllers/about.controller.js";

const router = Router();

router.post("/", addDescriptin);
router.get("/", getDescription);

export default router;
