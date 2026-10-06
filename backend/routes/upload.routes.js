const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");

const Cafe = require("../models/cafe.model");
const PrintOrder = require("../models/printOrder.model");

const router = express.Router();

// ------------------------------------
// Upload directory
// ------------------------------------

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ------------------------------------
// Multer storage
// ------------------------------------

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

// ------------------------------------
// File filter
// ------------------------------------

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  const allowedExtensions = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(extension)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG and PNG files are allowed"));
  }
};

// ------------------------------------
// Multer upload
// ------------------------------------

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 20,
  },
});

// ------------------------------------
// Create print order
// ------------------------------------

router.post(
  "/",
  upload.array("files", 20),
  async (req, res) => {
    try {
      const {
        qrCodeId,
        customerName,
        customerPhone,
        copies,
        printType,
        paperSize,
        printSides,
        paymentMethod,
      } = req.body;

      // ------------------------------------
      // Validate files
      // ------------------------------------

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: "Please upload at least one file",
        });
      }

      // ------------------------------------
      // Validate customer name
      // ------------------------------------

      if (!customerName || !customerName.trim()) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          message: "Customer name is required",
        });
      }

      // ------------------------------------
      // Validate QR code
      // ------------------------------------

      if (!qrCodeId) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          message: "QR code ID is required",
        });
      }

      // ------------------------------------
      // Print options
      // ------------------------------------

      const selectedPrintType = printType || "bw";
      const selectedPaperSize = paperSize || "A4";
      const selectedPrintSides = printSides || "single";

      if (!["bw", "color"].includes(selectedPrintType)) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          message: "Invalid print type",
        });
      }

      if (!["A4", "A3"].includes(selectedPaperSize)) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          message: "Invalid paper size",
        });
      }

      if (!["single", "double"].includes(selectedPrintSides)) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          message: "Invalid print side option",
        });
      }

      // ------------------------------------
      // Payment method
      // ------------------------------------

      const selectedPaymentMethod = paymentMethod || "cash";

      if (!["cash", "upi"].includes(selectedPaymentMethod)) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          message: "Invalid payment method",
        });
      }

      // ------------------------------------
      // Copies
      // ------------------------------------

      const numberOfCopies = Number(copies) || 1;

      if (
        !Number.isInteger(numberOfCopies) ||
        numberOfCopies < 1
      ) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          message: "Copies must be at least 1",
        });
      }

      // ------------------------------------
      // Find cybercafe
      // ------------------------------------

      const cafe = await Cafe.findOne({
        qrCodeId,
      });

      if (!cafe) {
        deleteUploadedFiles(req.files);

        return res.status(404).json({
          message: "Cybercafé not found",
        });
      }

      // ------------------------------------
      // Detect pages for every file
      // ------------------------------------

      const orderFiles = [];

      let totalPages = 0;

      for (const file of req.files) {
        let pages = 1;

        // PDF page count
        if (file.mimetype === "application/pdf") {
          const pdfBytes = fs.readFileSync(file.path);

          const pdfDoc = await PDFDocument.load(pdfBytes);

          pages = pdfDoc.getPageCount();

          if (pages < 1) {
            throw new Error(
              `Unable to detect pages in ${file.originalname}`,
            );
          }
        }

        // Images count as one page
        orderFiles.push({
          originalName: file.originalname,
          fileName: file.filename,
          pages,
        });

        totalPages += pages;
      }

      // ------------------------------------
      // Calculate sheets
      // ------------------------------------

      const totalSheets =
        selectedPrintSides === "double"
          ? Math.ceil(totalPages / 2)
          : totalPages;

      // ------------------------------------
      // Get price per sheet
      // ------------------------------------

      let pricePerSheet = 0;

      if (selectedPaperSize === "A4") {
        if (selectedPrintType === "bw") {
          pricePerSheet = cafe.pricing?.a4Bw;
        } else {
          pricePerSheet = cafe.pricing?.a4Color;
        }
      }

      if (selectedPaperSize === "A3") {
        if (selectedPrintType === "bw") {
          pricePerSheet = cafe.pricing?.a3Bw;
        } else {
          pricePerSheet = cafe.pricing?.a3Color;
        }
      }

      // ------------------------------------
      // Validate price
      // ------------------------------------

      if (
        typeof pricePerSheet !== "number" ||
        !Number.isFinite(pricePerSheet) ||
        pricePerSheet < 0
      ) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          message:
            "Unable to calculate price. Please check your pricing settings.",
        });
      }

      // ------------------------------------
      // Final price
      // ------------------------------------

      const totalPrice =
        pricePerSheet *
        totalSheets *
        numberOfCopies;

      // ------------------------------------
      // Payment status
      // ------------------------------------

      const selectedPaymentStatus =
        selectedPaymentMethod === "upi"
          ? "to_verify"
          : "pending";

      // ------------------------------------
      // Create ONE order
      // ------------------------------------

      const printOrder = await PrintOrder.create({
        customerName: customerName.trim(),

        customerPhone:
          customerPhone?.trim() || "",

        cafe: cafe._id,

        files: orderFiles,

        totalPages,

        copies: numberOfCopies,

        printType: selectedPrintType,

        paperSize: selectedPaperSize,

        printSides: selectedPrintSides,

        totalSheets,

        totalPrice,

        status: "pending",

        paymentMethod: selectedPaymentMethod,

        paymentStatus: selectedPaymentStatus,
      });

      // ------------------------------------
      // Response
      // ------------------------------------

      res.status(201).json({
        message: "Print order created successfully",

        order: {
          id: printOrder._id,

          customerName: printOrder.customerName,

          customerPhone: printOrder.customerPhone,

          files: printOrder.files,

          totalPages: printOrder.totalPages,

          copies: printOrder.copies,

          printType: printOrder.printType,

          paperSize: printOrder.paperSize,

          printSides: printOrder.printSides,

          totalSheets: printOrder.totalSheets,

          totalPrice: printOrder.totalPrice,

          status: printOrder.status,

          paymentMethod: printOrder.paymentMethod,

          paymentStatus: printOrder.paymentStatus,

          createdAt: printOrder.createdAt,
        },
      });
    } catch (error) {
      console.error(
        "Print order creation error:",
        error,
      );

      if (req.files) {
        deleteUploadedFiles(req.files);
      }

      res.status(500).json({
        message: "Failed to create print order",
        error: error.message,
      });
    }
  },
);

// ------------------------------------
// Delete uploaded files
// ------------------------------------

function deleteUploadedFiles(files) {
  for (const file of files || []) {
    try {
      if (
        file.path &&
        fs.existsSync(file.path)
      ) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error(
        "Failed to delete file:",
        file.path,
        error,
      );
    }
  }
}

module.exports = router;