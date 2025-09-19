import express from "express";
import {
  login,
  register,
  me,
  requestPasswordOtp,
  resetPasswordWithOtp,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Public
router.post("/register", register); // employees self-register
router.post("/login", login);
router.post("/password-otp", requestPasswordOtp);
router.post("/reset-with-otp", resetPasswordWithOtp);

// Private
router.get("/me", requireAuth, me);

export default router;
