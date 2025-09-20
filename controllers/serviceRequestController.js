import ServiceRequest from "../models/ServiceRequest.js";

export const createServiceRequest = async (req, res) => {
  try {
    const {
      service,
      description,
      preferredDate,
      preferredTime,
      name,
      phone,
      email,
      address,
      city,
      state,
      zip,
      assignedEmployee,
    } = req.body || {};

    if (!service || !name || !phone || !address || !city || !state || !zip) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    let attachment;
    if (req.file) {
      attachment = {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
    }

    const doc = await ServiceRequest.create({
      service,
      description,
      preferredDate,
      preferredTime,
      name,
      phone,
      email,
      address,
      city,
      state,
      zip,
      attachment,
      assignedEmployee: assignedEmployee || null,
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("createServiceRequest error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create request" });
  }
};

export const listServiceRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;
    const docs = await ServiceRequest.find(query)
      .populate("assignedEmployee", "name email")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await ServiceRequest.countDocuments(query);

    // Calculate status counts for paginated response
    const countsByStatus = await ServiceRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {};
    countsByStatus.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    return res.json({
      success: true,
      data: docs,
      total,
      page: Number(page),
      limit: Number(limit),
      countsByStatus: statusCounts,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("listServiceRequests error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to list requests" });
  }
};

export const getServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await ServiceRequest.findById(id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }
};

export const updateServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (req.file) {
      updates.attachment = {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
    }
    const doc = await ServiceRequest.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }
};

export const deleteServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await ServiceRequest.findByIdAndDelete(id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }
};

export const getServiceRequestsSummary = async (req, res) => {
  try {
    const total = await ServiceRequest.countDocuments();

    const countsByStatus = await ServiceRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {};
    countsByStatus.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    return res.json({
      success: true,
      total,
      countsByStatus: statusCounts,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("getServiceRequestsSummary error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get summary" });
  }
};

// Employee job management endpoints
export const getEmployeeJobs = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status } = req.query;

    const query = { assignedEmployee: employeeId };
    if (status) query.status = status;

    const jobs = await ServiceRequest.find(query)
      .populate("assignedEmployee", "fullName email phone")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: jobs });
  } catch (error) {
    console.error("getEmployeeJobs error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch employee jobs" });
  }
};

export const acceptJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    const job = await ServiceRequest.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.assignedEmployee.toString() !== employeeId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to accept this job" });
    }

    if (job.employeeAccepted) {
      return res
        .status(400)
        .json({ success: false, message: "Job already accepted" });
    }

    job.employeeAccepted = true;
    job.employeeAcceptedAt = new Date();
    job.status = "in-progress";

    await job.save();

    return res.json({ success: true, data: job });
  } catch (error) {
    console.error("acceptJob error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to accept job" });
  }
};

export const completeJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, completionNotes } = req.body;

    const job = await ServiceRequest.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.assignedEmployee.toString() !== employeeId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to complete this job",
        });
    }

    if (!job.employeeAccepted) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Job must be accepted before completion",
        });
    }

    job.status = "completed";
    job.completedAt = new Date();
    if (completionNotes) {
      job.completionNotes = completionNotes;
    }

    await job.save();

    return res.json({ success: true, data: job });
  } catch (error) {
    console.error("completeJob error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to complete job" });
  }
};

export const addJobRemarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, remarks } = req.body;

    const job = await ServiceRequest.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.assignedEmployee.toString() !== employeeId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to add remarks to this job",
        });
    }

    job.employeeRemarks = remarks;
    await job.save();

    return res.json({ success: true, data: job });
  } catch (error) {
    console.error("addJobRemarks error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to add remarks" });
  }
};

// Utility function to assign jobs to employees (for testing/admin use)
export const assignJobToEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    const job = await ServiceRequest.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    job.assignedEmployee = employeeId;
    job.status = "pending"; // Reset to pending for employee acceptance
    await job.save();

    return res.json({ success: true, data: job });
  } catch (error) {
    console.error("assignJobToEmployee error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to assign job" });
  }
};

// Update assigned employee for a service request
export const updateAssignedEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedEmployee } = req.body;

    const job = await ServiceRequest.findById(id);
    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Service request not found" });
    }

    job.assignedEmployee = assignedEmployee || null;
    await job.save();

    return res.json({ success: true, data: job });
  } catch (error) {
    console.error("updateAssignedEmployee error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update assigned employee" });
  }
};
