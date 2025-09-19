import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Profile from "../models/Profile.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    return res.json({ success: true, user: req.user.toSafeJSON(), profile });
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = String(email).toLowerCase();
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    // Prepare profile updates
    const profileFields = [
      "phone",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "postalCode",
      "country",
      "avatarUrl",
      "bio",
    ];
    const profileUpdate = {};
    for (const key of profileFields) {
      if (req.body[key] !== undefined) profileUpdate[key] = req.body[key];
    }

    await user.save();

    let profile = await Profile.findOne({ user: user._id });
    if (!profile) {
      profile = await Profile.create({ user: user._id, ...profileUpdate });
    } else if (Object.keys(profileUpdate).length > 0) {
      Object.assign(profile, profileUpdate);
      await profile.save();
    }

    return res.json({ success: true, user: user.toSafeJSON(), profile });
  } catch (err) {
    // Handle duplicate email conflict
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use" });
    }
    next(err);
  }
};
