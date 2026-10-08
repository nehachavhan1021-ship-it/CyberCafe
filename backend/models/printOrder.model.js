const mongoose = require("mongoose");

const printOrderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    

    cafe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cafe",
      required: true,
    },

    files: [
      {
        originalName: {
          type: String,
          required: true,
        },

        fileName: {
          type: String,
          required: true,
        },

        pages: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    totalPages: {
      type: Number,
      required: true,
      min: 1,
    },

    copies: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    printType: {
      type: String,
      enum: ["bw", "color"],
      required: true,
      default: "bw",
    },

    paperSize: {
      type: String,
      enum: ["A4", "A3"],
      required: true,
      default: "A4",
    },

    printSides: {
      type: String,
      enum: ["single", "double"],
      required: true,
      default: "single",
    },

    totalSheets: {
      type: Number,
      required: true,
      min: 1,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "printing", "ready", "completed"],
      default: "pending",
    },

    // -----------------------------
    // Payment
    // -----------------------------

    

   

    completedAt: {
      type: Date,
      default: null,
    },

    filesDeletedAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("PrintOrder", printOrderSchema);