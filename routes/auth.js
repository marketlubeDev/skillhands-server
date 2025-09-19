import express from "express";
import { login, register, me } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Public
router.post("/register", register); // employees self-register
router.post("/login", login);

// Private
router.get("/me", requireAuth, me);

export default router;
