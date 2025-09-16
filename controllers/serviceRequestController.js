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
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await ServiceRequest.countDocuments(query);
    return res.json({ success: true, data: docs, total });
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
