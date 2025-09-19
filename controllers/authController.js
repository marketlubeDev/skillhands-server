import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Profile from "../models/Profile.js";

const jwtSecret = process.env.JWT_SECRET || "dev_secret_change_me";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

const signToken = (user) => {
  return jwt.sign(
    { sub: user._id, role: user.role, email: user.email },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn,
    }
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role: requestedRole } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use" });
    }
    // Only allow self-signup as employee; ignore/override any other role
    const normalizedRequestedRole = (requestedRole || "employee")
      .toString()
      .toLowerCase();
    const role =
      normalizedRequestedRole === "employee" ? "employee" : "employee";
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
    });
    await Profile.create({ user: user._id });
    const token = signToken(user);
    return res
      .status(201)
      .json({ success: true, token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }
    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = signToken(user);
    return res.json({ success: true, token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res) => {
  return res.json({ success: true, user: req.user.toSafeJSON() });
};
