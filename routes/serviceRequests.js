import express from "express";
import { upload } from "../middleware/uploads.js";
import {
  createServiceRequest,
  listServiceRequests,
  getServiceRequest,
  updateServiceRequest,
  deleteServiceRequest,
} from "../controllers/serviceRequestController.js";

const router = express.Router();

router.get("/", listServiceRequests);
router.post("/", upload.single("attachment"), createServiceRequest);
router.get("/:id", getServiceRequest);
router.put("/:id", upload.single("attachment"), updateServiceRequest);
router.delete("/:id", deleteServiceRequest);

export default router;
