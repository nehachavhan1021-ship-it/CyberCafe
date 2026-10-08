const express = require("express");
const path = require("path");
const fs = require("fs");

const PrintOrder = require("../models/printOrder.model");
const Cafe = require("../models/cafe.model");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// =====================================================
// GET ALL ORDERS
// GET /api/jobs
// =====================================================

router.get("/", authMiddleware, async (req, res) => {
  try {
    // Find the cafe owned by the logged-in user
    const cafe = await Cafe.findOne({
      owner: req.user.userId,
    });

    if (!cafe) {
      return res.status(404).json({
        message: "Cybercafé not found",
      });
    }

    // Find all orders belonging to this cafe
    const orders = await PrintOrder.find({
      cafe: cafe._id,
    }).sort({
      createdAt: -1,
    });

    res.json({
      cafe: {
        id: cafe._id,
        name: cafe.name,
      },

      // Keep "jobs" here so your existing Dashboard.jsx
      // does not need to be changed yet.
      jobs: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      message: "Failed to fetch print orders",
    });
  }
});

// =====================================================
// DOWNLOAD FILE
// GET /api/jobs/:orderId/file/:fileName
// =====================================================

router.get("/:orderId/file/:fileName", authMiddleware, async (req, res) => {
  try {
    // Find the cafe owned by the logged-in user
    const cafe = await Cafe.findOne({
      owner: req.user.userId,
    });

    if (!cafe) {
      return res.status(404).json({
        message: "Cybercafé not found",
      });
    }

    // Find the order
    const order = await PrintOrder.findOne({
      _id: req.params.orderId,
      cafe: cafe._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Print order not found",
      });
    }

    // Find the requested file inside this order
    const file = order.files.find(
      (item) => item.fileName === req.params.fileName,
    );

    if (!file) {
      return res.status(404).json({
        message: "File not found in this order",
      });
    }

    // Build physical file path
    const filePath = path.join(__dirname, "..", "uploads", file.fileName);

    // Check if physical file still exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "File has been deleted or is no longer available",
      });
    }

    // Download using original filename
    res.download(filePath, file.originalName);
  } catch (error) {
    console.error("Download error:", error);

    res.status(500).json({
      message: "Failed to download file",
    });
  }
});

// =====================================================
// UPDATE ORDER STATUS
// PATCH /api/jobs/:jobId/status
// =====================================================

router.patch("/:jobId/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["pending", "printing", "ready", "completed"];

    // Validate status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    // Find cafe owned by logged-in user
    const cafe = await Cafe.findOne({
      owner: req.user.userId,
    });

    if (!cafe) {
      return res.status(404).json({
        message: "Cybercafé not found",
      });
    }

    // Find order belonging to this cafe
    const order = await PrintOrder.findOne({
      _id: req.params.jobId,
      cafe: cafe._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Print order not found",
      });
    }

    // Save previous status
    const previousStatus = order.status;

    // Update status
    order.status = status;

    // Start 24-hour timer when order
    // becomes completed
    if (status === "completed" && previousStatus !== "completed") {
      order.completedAt = new Date();
    }

    // If order is moved back from completed,
    // remove completion time
    if (status !== "completed") {
      order.completedAt = null;
    }

    await order.save();

    console.log("Status updated:", {
      orderId: order._id,
      oldStatus: previousStatus,
      newStatus: order.status,
      completedAt: order.completedAt,
    });

    // Return "job" because your current
    // Dashboard.jsx expects response.data.job
    res.json({
      message: "Status updated successfully",
      job: order,
    });
  } catch (error) {
    console.error("Status update error:", error);

    res.status(500).json({
      message: "Failed to update status",
    });
  }
});

module.exports = router;
