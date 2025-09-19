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
      enum: ["new", "pending", "in-process", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      trim: true,
    },
    scheduledDate: { type: String, trim: true, default: null },
    scheduledTime: { type: String, trim: true, default: null },
    estimatedCost: { type: Number, default: 0 },
    customerName: { type: String, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    customerPhone: { type: String, trim: true },
    serviceType: { type: String, trim: true },
    // Employee assignment fields
    assignedEmployee: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Profile',
      default: null 
    },
    employeeAccepted: { type: Boolean, default: false },
    employeeAcceptedAt: { type: Date, default: null },
    employeeRemarks: { type: String, trim: true, default: "" },
    completedAt: { type: Date, default: null },
    completionNotes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.ServiceRequest ||
  mongoose.model("ServiceRequest", ServiceRequestSchema);
