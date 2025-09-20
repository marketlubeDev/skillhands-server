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
  addCustomerRating,
  updateAdminNotes,
  getServiceRequestAnalytics,
  searchServiceRequests,
  bulkUpdateServiceRequests,
} from "../controllers/serviceRequestController.js";

const router = express.Router();

// Basic CRUD routes
router.get("/", listServiceRequests);
router.get("/summary", getServiceRequestsSummary);
router.get("/analytics", getServiceRequestAnalytics);
router.post("/", upload.single("attachment"), createServiceRequest);
router.post("/search", searchServiceRequests);
router.post("/bulk-update", bulkUpdateServiceRequests);
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

// Additional feature routes
router.post("/:id/rating", addCustomerRating);
router.patch("/:id/admin-notes", updateAdminNotes);

export default router;
