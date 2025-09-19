import express from "express";
import { listUsers, updateUserRole } from "../controllers/usersController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

router.get("/", listUsers);
router.patch("/:userId/role", updateUserRole);

export default router;
