const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Cafe = require("../models/cafe.model");
const PrintJob = require("../models/printJob.model");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {

    const allowedMimeTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png"
    ];

    const allowedExtensions = [
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png"
    ];

    const extension = path.extname(
        file.originalname
    ).toLowerCase();

    if (
        allowedMimeTypes.includes(file.mimetype) &&
        allowedExtensions.includes(extension)
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only PDF, JPG and PNG files are allowed"
            )
        );
    }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { qrCodeId, copies, printType, paperSize } = req.body;

    // Check required fields
    if (!qrCodeId) {
      return res.status(400).json({
        message: "QR code ID is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // Find the cybercafé
    const cafe = await Cafe.findOne({ qrCodeId });

    if (!cafe) {
      // Delete uploaded file if cafe doesn't exist
      fs.unlinkSync(req.file.path);

      return res.status(404).json({
        message: "Cybercafé not found",
      });
    }
    const numberOfCopies = Number(copies) || 1;

    let pricePerCopy;

    if (paperSize === "A4" && printType === "bw") {
      pricePerCopy = cafe.pricing.a4Bw;
    } else if (paperSize === "A4" && printType === "color") {
      pricePerCopy = cafe.pricing.a4Color;
    } else if (paperSize === "A3" && printType === "bw") {
      pricePerCopy = cafe.pricing.a3Bw;
    } else if (paperSize === "A3" && printType === "color") {
      pricePerCopy = cafe.pricing.a3Color;
    } else {
      return res.status(400).json({
        message: "Invalid print options",
      });
    }

    const totalPrice = pricePerCopy * numberOfCopies;
    // Create print job
    const printJob = await PrintJob.create({
    cafe: cafe._id,
    originalName: req.file.originalname,
    fileName: req.file.filename,
    copies: numberOfCopies,
    printType: printType || "bw",
    paperSize: paperSize || "A4",
    price: totalPrice
});

    res.status(201).json({
      message: "Print job created successfully",
      job: {
        id: printJob._id,
        originalName: printJob.originalName,
        copies: printJob.copies,
        printType: printJob.printType,
         price: printJob.price,
        paperSize: printJob.paperSize,
        status: printJob.status,
        createdAt: printJob.createdAt,
      },
    });
  } catch (error) {
    console.error("Print job creation error:", error);

    // Delete uploaded file if database operation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Failed to create print job",
    });
  }
});

module.exports = router;
