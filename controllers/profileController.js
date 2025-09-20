import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Profile from "../models/Profile.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate(
      "user",
      "name email role isActive createdAt"
    );
    return res.json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, email, password, fullName } = req.body;
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Update user model fields
    if (name !== undefined) user.name = name;
    if (fullName !== undefined) user.name = fullName; // Map fullName to user.name
    if (email !== undefined) user.email = String(email).toLowerCase();
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    // Prepare profile updates - all fields from the updated schema
    const profileFields = [
      // Personal Information
      "fullName",
      "email",
      "phone",
      "city",
      "addressLine1",
      "addressLine2",
      "state",
      "postalCode",
      "country",
      "avatarUrl",
      "bio",

      // Professional Information
      "designation",
      "level",
      "expectedSalary",

      // Skills & Certifications
      "skills",
      "certifications",
      "workExperience",

      // Verification Status
      "verified",
      "verificationStatus",
      "verificationNotes",

      // Additional fields
      "profileComplete",
    ];

    const profileUpdate = {};
    for (const key of profileFields) {
      if (req.body[key] !== undefined) {
        profileUpdate[key] = req.body[key];
      }
    }

    // Update lastUpdated timestamp
    profileUpdate.lastUpdated = new Date();

    await user.save();

    let profile = await Profile.findOne({ user: user._id }).populate(
      "user",
      "name email role isActive createdAt"
    );
    if (!profile) {
      profile = await Profile.create({ user: user._id, ...profileUpdate });
      profile = await Profile.findOne({ user: user._id }).populate(
        "user",
        "name email role isActive createdAt"
      );
    } else if (Object.keys(profileUpdate).length > 0) {
      Object.assign(profile, profileUpdate);
      await profile.save();
      profile = await Profile.findOne({ user: user._id }).populate(
        "user",
        "name email role isActive createdAt"
      );
    }

    return res.json({ success: true, data: profile });
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

// Upload profile image
export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Update avatar URL (assuming file is uploaded to a service like AWS S3, Cloudinary, etc.)
    profile.avatarUrl = req.file.path || req.file.filename;
    profile.lastUpdated = new Date();
    await profile.save();

    return res.json({
      success: true,
      message: "Profile image uploaded successfully",
      avatarUrl: profile.avatarUrl,
    });
  } catch (err) {
    next(err);
  }
};

// Upload certificates
export const uploadCertificates = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Process uploaded files
    const newCertifications = req.files.map((file) => ({
      name: file.originalname,
      fileUrl: file.path || file.filename,
      uploadedAt: new Date(),
    }));

    // Add new certifications to existing ones
    profile.certifications = [
      ...(profile.certifications || []),
      ...newCertifications,
    ];
    profile.lastUpdated = new Date();
    await profile.save();

    return res.json({
      success: true,
      message: "Certificates uploaded successfully",
      data: { certifications: profile.certifications },
    });
  } catch (err) {
    next(err);
  }
};

// Get profile completion status
export const getProfileCompletion = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.json({
        success: true,
        data: {
          completion: 0,
          missingFields: [],
          profileComplete: false,
        },
      });
    }

    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "city",
      "level",
      "skills",
    ];

    const missingFields = requiredFields.filter((field) => !profile[field]);
    const completion = Math.round(
      ((requiredFields.length - missingFields.length) / requiredFields.length) *
        100
    );

    return res.json({
      success: true,
      data: {
        completion,
        missingFields,
        profileComplete: completion >= 80,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get all employee profiles (admin only)
export const getAllEmployeeProfiles = async (req, res, next) => {
  try {
    const profiles = await Profile.find({})
      .populate("user", "name email role isActive createdAt")
      .sort({ createdAt: -1 });

    // Transform profiles to match EmployeeApplication interface
    const employeeApplications = profiles.map((profile) => ({
      id: profile._id.toString(),
      name: profile.fullName || profile.user?.name || "Unknown",
      email: profile.email || profile.user?.email || "",
      phone: profile.phone || "",
      skills: profile.skills || [],
      experienceLevel: profile.level || "Beginner",
      rating: profile.rating || 0,
      previousJobCount: profile.totalJobs || 0,
      certifications: (profile.certifications || []).map(
        (cert) => cert.name || cert
      ),
      expectedSalary: profile.expectedSalary || 0,
      status: profile.verificationStatus || "pending",
      appliedDate: profile.createdAt || new Date(),
      location: profile.city || "Unknown",
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      verified: profile.verified || false,
      verificationNotes: profile.verificationNotes,
      user: profile.user,
    }));

    return res.json({
      success: true,
      data: employeeApplications,
    });
  } catch (err) {
    next(err);
  }
};

// Get employee profile by user ID (admin only)
export const getEmployeeProfileById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const profile = await Profile.findOne({ user: userId }).populate(
      "user",
      "name email role isActive createdAt"
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    return res.json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

// Update employee application status (admin only)
export const updateEmployeeStatus = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { status, verificationNotes } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be pending, approved, or rejected",
      });
    }

    const profile = await Profile.findById(profileId).populate(
      "user",
      "name email role isActive createdAt"
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    profile.verificationStatus = status;
    if (verificationNotes) {
      profile.verificationNotes = verificationNotes;
    }
    profile.verified = status === "approved";
    profile.lastUpdated = new Date();

    await profile.save();

    return res.json({
      success: true,
      message: `Employee application ${status} successfully`,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};
