import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { authenticatedMiddleware } from "../middlewares/auth.middlewares.js";
import { refreshAccessTokenMiddleware } from "../middlewares/refreshToken.middlewares.js";

const router = Router();

// unprotected routes
router.post("/register", registerUser);
router.post("/login", loginUser);

//proptected routes
router.post("/logout", authenticatedMiddleware, logoutUser);
router.get("/refresh-token", refreshAccessTokenMiddleware, (req, res) => {
  return res.status(200).json({
    accessToken: req.newAccessToken,
  });
});

export default router;
