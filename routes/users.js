import express from "express";
import { listUsers, updateUserRole, getEmployees } from "../controllers/usersController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Public endpoint for getting employees (no auth required)
router.get("/employees", getEmployees);

// Admin-only routes
router.use(requireAuth, requireRole("admin"));

router.get("/", listUsers);
router.patch("/:userId/role", updateUserRole);

export default router;
