import User from "../models/User.js";
import Profile from "../models/Profile.js";

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, users: users.map((u) => u.toSafeJSON()) });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body; // "admin" | "employee"
    if (!role || !["admin", "employee"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const target = await User.findById(userId);
    if (!target)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Prevent deactivating the only admin or reducing last admin
    if (target.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ success: false, message: "At least one admin is required" });
      }
    }

    // Ensure we never end up with more than one admin if business rule requires only one admin
    if (role === "admin" && target.role !== "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: "Only one admin account is allowed",
        });
      }
    }

    target.role = role;
    await target.save();
    res.json({ success: true, user: target.toSafeJSON() });
  } catch (err) {
    next(err);
  }
};

export const getEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({
      role: "employee",
      isActive: true,
    })
      .select("_id name email")
      .sort({ name: 1 });

    res.json({ success: true, data: employees });
  } catch (err) {
    next(err);
  }
};
