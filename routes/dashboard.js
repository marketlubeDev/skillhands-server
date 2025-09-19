import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getDashboardStats,
  getRecentServiceRequests,
  getRecentEmployeeApplications,
  getDashboardOverview,
  getEmployeeDashboardStats,
} from "../controllers/dashboardController.js";

const router = express.Router();

// All dashboard routes require authentication
router.use(requireAuth);

// Get dashboard statistics
router.get("/stats", getDashboardStats);

// Get recent service requests
router.get("/recent-requests", getRecentServiceRequests);

// Get recent employee applications
router.get("/recent-applications", getRecentEmployeeApplications);

// Get complete dashboard overview (all data in one request)
router.get("/overview", getDashboardOverview);

// Get employee dashboard stats
router.get("/employee-stats", getEmployeeDashboardStats);

export default router;
