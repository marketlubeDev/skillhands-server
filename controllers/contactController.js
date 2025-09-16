import { sendEmail } from "../services/emailService.js";

export const submitContact = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request body" });
    }

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

    if (!service || !name || !phone || !address || !city || !zip) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const uploadedFile = req.file;
    let fileData = null;
    if (uploadedFile) {
      fileData = {
        buffer: uploadedFile.buffer,
        originalname: uploadedFile.originalname,
        mimetype: uploadedFile.mimetype,
      };
    }

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

    return res.json({
      success: true,
      message: "Service request submitted successfully!",
      data: emailResult,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error submitting contact form:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit service request. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
