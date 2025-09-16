import mongoose from "mongoose";

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set in environment variables");
  }
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(mongoUri);
};
