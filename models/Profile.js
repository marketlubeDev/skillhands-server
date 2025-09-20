import mongoose from "mongoose";

// Work Experience Schema
const workExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String, trim: true },
  location: { type: String, trim: true },
});

// Certification Schema
const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  fileUrl: { type: String, trim: true },
  uploadedAt: { type: Date, default: Date.now },
});

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Personal Information
    fullName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    city: { type: String, trim: true },
    addressLine1: { type: String, trim: true },
    addressLine2: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    bio: { type: String, trim: true },

    // Professional Information
    designation: { type: String, trim: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Expert"],
      trim: true,
    },
    expectedSalary: { type: Number, min: 0 },

    // Skills & Certifications
    skills: [{ type: String, trim: true }],
    certifications: [certificationSchema],
    workExperience: [workExperienceSchema],

    // Verification Status
    verified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verificationNotes: { type: String, trim: true },

    // Additional fields
    profileComplete: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now },

    // Dashboard fields
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    totalJobs: { type: Number, min: 0, default: 0 },
    appliedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Profile =
  mongoose.models.Profile || mongoose.model("Profile", profileSchema);
export default Profile;
