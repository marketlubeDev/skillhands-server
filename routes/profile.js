import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  uploadCertificates,
  getProfileCompletion,
  getAllEmployeeProfiles,
  updateEmployeeStatus,
} from "../controllers/profileController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/uploads.js";

const router = express.Router();

router.use(requireAuth);

// Basic profile operations
router.get("/", getMyProfile);
router.patch("/", updateMyProfile);
router.get("/completion", getProfileCompletion);

// File upload operations
router.post("/upload-image", upload.single("profileImage"), uploadProfileImage);
router.post(
  "/upload-certificates",
  upload.array("certificates", 10),
  uploadCertificates
);

// Admin-only routes for employee management
router.get("/all", requireRole("admin"), getAllEmployeeProfiles);
router.patch("/:profileId/status", requireRole("admin"), updateEmployeeStatus);

export default router;
