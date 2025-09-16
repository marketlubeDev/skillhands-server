import express from "express";
import { upload } from "../middleware/uploads.js";
import { submitContact } from "../controllers/contactController.js";
import serviceRequestsRouter from "./serviceRequests.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

router.post("/contact", upload.single("image"), submitContact);

router.use("/service-requests", serviceRequestsRouter);

export default router;
