import express from "express";
import { upload } from "../middleware/uploads.js";
import {
  createServiceRequest,
  listServiceRequests,
  getServiceRequest,
  updateServiceRequest,
  deleteServiceRequest,
  getServiceRequestsSummary,
  getEmployeeJobs,
  acceptJob,
  completeJob,
  addJobRemarks,
  assignJobToEmployee,
  updateAssignedEmployee,
} from "../controllers/serviceRequestController.js";

const router = express.Router();

router.get("/", listServiceRequests);
router.get("/summary", getServiceRequestsSummary);
router.post("/", upload.single("attachment"), createServiceRequest);
router.get("/:id", getServiceRequest);
router.put("/:id", upload.single("attachment"), updateServiceRequest);
router.delete("/:id", deleteServiceRequest);

// Employee job management routes
router.get("/employee/:employeeId", getEmployeeJobs);
router.post("/:id/accept", acceptJob);
router.post("/:id/complete", completeJob);
router.post("/:id/remarks", addJobRemarks);
router.post("/:id/assign", assignJobToEmployee);
router.patch("/:id/assigned-employee", updateAssignedEmployee);

export default router;
