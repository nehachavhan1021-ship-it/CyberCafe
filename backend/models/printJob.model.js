
const mongoose = require("mongoose");

const printJobSchema = new mongoose.Schema(
    {
        cafe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cafe",
            required: true
        },

        originalName: {
            type: String,
            required: true
        },

        fileName: {
            type: String,
            required: true
        },

        copies: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },

        printType: {
            type: String,
            enum: ["bw", "color"],
            required: true,
            default: "bw"
        },

        paperSize: {
            type: String,
            enum: ["A4", "A3"],
            required: true,
            default: "A4"
        },
       price: {
    type: Number,
    required: true,
    min: 0
}, 

        status: {
            type: String,
            enum: ["pending", "printing", "ready", "completed"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("PrintJob", printJobSchema);