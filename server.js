import express from "express";
import cors from "cors";
import helmet from "helmet";
// import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import multer from "multer";
import { sendEmail } from "./services/emailService.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: "Too many requests from this IP, please try again later.",
// });
// app.use("/api/", limiter);

// CORS configuration - Allow all origins
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Configure multer for file uploads (memory storage - no file saved to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images and videos
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed!"), false);
    }
  },
});

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.use("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

// Contact form submission endpoint with file upload
app.post("/api/contact", upload.single("image"), async (req, res) => {
  try {
    const {
      service,
      description,
      preferredDate,
      preferredTime,
      name,
      phone,
      email,
      address,
      city,
      zip,
    } = req.body;

    // Validate required fields
    if (!service || !name || !phone || !address || !city || !zip) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Get uploaded file info (stored in memory)
    const uploadedFile = req.file;
    let fileData = null;

    if (uploadedFile) {
      fileData = {
        buffer: uploadedFile.buffer,
        originalname: uploadedFile.originalname,
        mimetype: uploadedFile.mimetype,
      };
    }

    // Send email
    const emailResult = await sendEmail({
      service,
      description,
      preferredDate,
      preferredTime,
      name,
      phone,
      email,
      address,
      city,
      zip,
      fileData,
    });

    res.json({
      success: true,
      message: "Service request submitted successfully!",
      data: emailResult,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit service request. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
