import mongoose from "mongoose";

const ServiceRequestSchema = new mongoose.Schema(
  {
    service: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    preferredDate: { type: String, trim: true },
    preferredTime: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zip: { type: String, required: true, trim: true },
    attachment: {
      filename: { type: String },
      mimetype: { type: String },
      size: { type: Number },
    },
    status: {
      type: String,
      enum: ["new", "in_progress", "completed", "cancelled"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.models.ServiceRequest ||
  mongoose.model("ServiceRequest", ServiceRequestSchema);
