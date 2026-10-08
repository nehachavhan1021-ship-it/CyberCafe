const express = require("express");
const QRCode = require("qrcode");
const Cafe = require("../models/cafe.model");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Get the logged-in owner's QR code

router.get("/my-qr", authMiddleware, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({
      owner: req.user.userId,
    });

    if (!cafe) {
      return res.status(404).json({
        message: "Cybercafé not found",
      });
    }

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      return res.status(500).json({
        message: "Frontend URL is not configured",
      });
    }

    const uploadUrl = `${frontendUrl}/upload/${cafe.qrCodeId}`;

    const qrCode = await QRCode.toDataURL(uploadUrl);

    res.json({
      cafe: {
        id: cafe._id,
        name: cafe.name,
      },
      qrCodeId: cafe.qrCodeId,
      uploadUrl,
      qrCode,
    });
  } catch (error) {
    console.error("QR generation error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      message: "Failed to generate QR code",
      error: error.message,
    });
  }
});

router.get("/:qrCodeId", async (req, res) => {
  try {
    const { qrCodeId } = req.params;

    const cafe = await Cafe.findOne({ qrCodeId });

    if (!cafe) {
      return res.status(404).json({
        message: "Cybercafé not found",
      });
    }

    const uploadUrl = `${process.env.FRONTEND_URL}/upload/${cafe.qrCodeId}`;

    const qrCode = await QRCode.toDataURL(uploadUrl);

    res.json({
      cafe: {
        id: cafe._id,
        name: cafe.name,
        pricing: cafe.pricing,
      },
      qrCodeId: cafe.qrCodeId,
      uploadUrl,
      qrCode,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;
