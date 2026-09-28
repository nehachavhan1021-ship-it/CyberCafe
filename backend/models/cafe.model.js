const mongoose = require("mongoose");

const cafeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        qrCodeId: {
            type: String,
            required: true,
            unique: true
        },

        pricing: {
            a4Bw: {
                type: Number,
                default: 2
            },

            a4Color: {
                type: Number,
                default: 5
            },

            a3Bw: {
                type: Number,
                default: 5
            },

            a3Color: {
                type: Number,
                default: 10
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Cafe", cafeSchema);