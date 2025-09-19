import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Profile from "../models/Profile.js";

export const seedAdminUser = async () => {
  const adminEmail = (
    process.env.ADMIN_EMAIL || "admin@example.com"
  ).toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const adminName = process.env.ADMIN_NAME || "Administrator";

  const existing = await User.findOne({ email: adminEmail });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await User.create({
    name: adminName,
    email: adminEmail,
    passwordHash,
    role: "admin",
  });
  await Profile.create({ user: admin._id });
  return admin;
};
