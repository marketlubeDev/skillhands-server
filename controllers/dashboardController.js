import ServiceRequest from "../models/ServiceRequest.js";
import Profile from "../models/Profile.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Get total service requests
    const totalServiceRequests = await ServiceRequest.countDocuments();

    // Get service requests by status
    const statusCounts = await ServiceRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCountsObj = {};
    statusCounts.forEach((item) => {
      statusCountsObj[item._id] = item.count;
    });

    // Get urgent requests (high priority)
    const urgentRequests = await ServiceRequest.countDocuments({
      priority: { $in: ["high", "urgent"] },
      status: { $in: ["pending", "in-progress"] },
    });

    // Get completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const completedToday = await ServiceRequest.countDocuments({
      status: "completed",
      updatedAt: { $gte: today, $lt: tomorrow },
    });

    // Get pending requests
    const pendingRequests = statusCountsObj.pending || 0;

    // Get employee applications (fallback to verificationStatus if status doesn't exist)
    const employeeApplications = await Profile.countDocuments({
      $or: [
        { status: "pending" },
        { verificationStatus: "pending" }
      ]
    });

    // Get active employees (fallback to verificationStatus if status doesn't exist)
    const activeEmployees = await Profile.countDocuments({
      $or: [
        { status: "approved" },
        { verificationStatus: "approved" }
      ]
    });

    const stats = {
      totalServiceRequests,
      urgentRequests,
      completedToday,
      pendingRequests,
      employeeApplications,
      activeEmployees,
    };

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get dashboard stats" });
  }
};

export const getRecentServiceRequests = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    
    const recentRequests = await ServiceRequest.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select(
        "_id name email phone address service description estimatedCost status priority createdAt scheduledDate"
      );

    return res.json({
      success: true,
      data: recentRequests,
    });
  } catch (error) {
    console.error("getRecentServiceRequests error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get recent requests" });
  }
};

export const getRecentEmployeeApplications = async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    
    const recentApplications = await Profile.find()
      .populate("user", "name email role isActive createdAt")
      .sort({ appliedDate: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select(
        "_id fullName phone email skills level rating totalJobs certifications expectedSalary status appliedDate city user"
      );

    return res.json({
      success: true,
      data: recentApplications,
    });
  } catch (error) {
    console.error("getRecentEmployeeApplications error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get recent applications" });
  }
};

export const getDashboardOverview = async (req, res) => {
  try {
    // Get all stats in parallel
    const [
      statsResult,
      recentRequestsResult,
      recentApplicationsResult,
    ] = await Promise.all([
      getDashboardStats(req, { json: () => ({}) }), // Mock response object
      getRecentServiceRequests(req, { json: () => ({}) }),
      getRecentEmployeeApplications(req, { json: () => ({}) }),
    ]);

    // Since we can't easily extract data from the mock responses,
    // let's implement the logic directly here
    const totalServiceRequests = await ServiceRequest.countDocuments();

    const statusCounts = await ServiceRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCountsObj = {};
    statusCounts.forEach((item) => {
      statusCountsObj[item._id] = item.count;
    });

    const urgentRequests = await ServiceRequest.countDocuments({
      priority: "high",
      status: { $in: ["pending", "in-progress"] },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const completedToday = await ServiceRequest.countDocuments({
      status: "completed",
      updatedAt: { $gte: today, $lt: tomorrow },
    });

    const pendingRequests = statusCountsObj.pending || 0;
    const employeeApplications = await Profile.countDocuments({
      $or: [
        { status: "pending" },
        { verificationStatus: "pending" }
      ]
    });
    const activeEmployees = await Profile.countDocuments({
      $or: [
        { status: "approved" },
        { verificationStatus: "approved" }
      ]
    });

    const recentRequests = await ServiceRequest.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .select(
        "_id name email phone address service description estimatedCost status priority createdAt scheduledDate"
      );

    const recentApplications = await Profile.find()
      .populate("user", "name email role isActive createdAt")
      .sort({ appliedDate: -1, createdAt: -1 })
      .limit(3)
      .select(
        "_id fullName phone email skills level rating totalJobs certifications expectedSalary status appliedDate city user"
      );

    return res.json({
      success: true,
      data: {
        stats: {
          totalServiceRequests,
          urgentRequests,
          completedToday,
          pendingRequests,
          employeeApplications,
          activeEmployees,
        },
        recentRequests,
        recentApplications,
      },
    });
  } catch (error) {
    console.error("getDashboardOverview error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get dashboard overview" });
  }
};

// Get employee dashboard stats
export const getEmployeeDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get profile completion
    const profile = await Profile.findOne({ user: userId });
    let profileCompletion = 0;
    let missingFields = [];
    
    if (profile) {
      const requiredFields = [
        "fullName",
        "email", 
        "phone",
        "city",
        "level",
        "skills",
      ];
      
      missingFields = requiredFields.filter((field) => !profile[field]);
      profileCompletion = Math.round(
        ((requiredFields.length - missingFields.length) / requiredFields.length) * 100
      );
    }

    // Get active jobs (service requests assigned to this employee)
    const activeJobs = await ServiceRequest.countDocuments({
      assignedEmployee: userId,
      status: { $in: ["pending", "in-progress", "scheduled"] }
    });

    // Get completed jobs for success rate calculation
    const completedJobs = await ServiceRequest.countDocuments({
      assignedEmployee: userId,
      status: "completed"
    });

    const totalJobs = activeJobs + completedJobs;
    const successRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

    // Get total jobs completed
    const totalCompletedJobs = await ServiceRequest.countDocuments({
      assignedEmployee: userId,
      status: "completed"
    });

    const stats = {
      profileCompletion,
      activeJobs,
      successRate,
      totalCompletedJobs,
      missingFields
    };

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("getEmployeeDashboardStats error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get employee dashboard stats" });
  }
};