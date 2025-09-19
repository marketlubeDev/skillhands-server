import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
      index: true,
    },
    isActive: { type: Boolean, default: true },
    // Password reset via OTP
    resetOtpCode: { type: String, index: true },
    resetOtpExpires: { type: Date, index: true },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
