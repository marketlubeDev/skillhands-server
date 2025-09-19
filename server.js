import express from "express";
import dotenv from "dotenv";
import { applySecurity } from "./middleware/security.js";
import { applyCors } from "./middleware/cors.js";
import { multerErrorHandler } from "./middleware/uploads.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import apiRoutes from "./routes/index.js";
import { connectDatabase } from "./config/db.js";
import { seedAdminUser } from "./utils/seedAdmin.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
applySecurity(app);

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: "Too many requests from this IP, please try again later.",
// });
// app.use("/api/", limiter);

// CORS
applyCors(app);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Database connection
connectDatabase().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to connect to MongoDB:", err);
  // Do not exit in serverless; continue so health routes still respond
});

// Seed admin user (best-effort)
connectDatabase()
  .then(() => seedAdminUser())
  .catch(() => {});

// Routes
app.get("/", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});
app.use("/api", apiRoutes);

// Multer error handling and general errors
app.use(multerErrorHandler);
app.use(errorHandler);

// 404 handler
app.use("*", notFound);

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

// Export for Vercel serverless deployment
export default app;
