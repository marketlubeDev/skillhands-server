import express from "express";
import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/profileController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getMyProfile);
router.patch("/", updateMyProfile);

export default router;
