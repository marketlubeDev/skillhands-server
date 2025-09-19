// Simple test script to verify dashboard endpoints
import mongoose from "mongoose";
import ServiceRequest from "./models/ServiceRequest.js";
import Profile from "./models/Profile.js";
import User from "./models/User.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/skillhand";

async function testDashboard() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Test dashboard stats
    console.log("\n=== Testing Dashboard Stats ===");
    
    const totalServiceRequests = await ServiceRequest.countDocuments();
    console.log("Total Service Requests:", totalServiceRequests);

    const statusCounts = await ServiceRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    console.log("Status Counts:", statusCounts);

    const urgentRequests = await ServiceRequest.countDocuments({
      priority: { $in: ["high", "urgent"] },
      status: { $in: ["pending", "in-progress"] },
    });
    console.log("Urgent Requests:", urgentRequests);

    const employeeApplications = await Profile.countDocuments({
      $or: [
        { status: "pending" },
        { verificationStatus: "pending" }
      ]
    });
    console.log("Employee Applications:", employeeApplications);

    const activeEmployees = await Profile.countDocuments({
      $or: [
        { status: "approved" },
        { verificationStatus: "approved" }
      ]
    });
    console.log("Active Employees:", activeEmployees);

    // Test recent requests
    console.log("\n=== Testing Recent Requests ===");
    const recentRequests = await ServiceRequest.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .select("_id name email phone address service description estimatedCost status priority createdAt scheduledDate");
    console.log("Recent Requests Count:", recentRequests.length);
    console.log("Sample Request:", recentRequests[0] || "No requests found");

    // Test recent applications
    console.log("\n=== Testing Recent Applications ===");
    const recentApplications = await Profile.find()
      .populate("user", "name email role isActive createdAt")
      .sort({ appliedDate: -1, createdAt: -1 })
      .limit(3)
      .select("_id fullName phone email skills level rating totalJobs certifications expectedSalary status appliedDate city user");
    console.log("Recent Applications Count:", recentApplications.length);
    console.log("Sample Application:", recentApplications[0] || "No applications found");

    console.log("\n✅ Dashboard test completed successfully!");
    
  } catch (error) {
    console.error("❌ Dashboard test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

testDashboard();
