const express = require("express");
const QRCode = require("qrcode");

const Cafe = require("../models/cafe.model");

const router = express.Router();

router.get("/:qrCodeId", async (req, res) => {
    try {
        const { qrCodeId } = req.params;

        const cafe = await Cafe.findOne({ qrCodeId });

        if (!cafe) {
            return res.status(404).json({
                message: "Cybercafé not found"
            });
        }

        const uploadUrl = `${process.env.FRONTEND_URL}/upload/${cafe.qrCodeId}`;

        const qrCode = await QRCode.toDataURL(uploadUrl);

        res.json({
    cafe: {
        id: cafe._id,
        name: cafe.name,
        pricing: cafe.pricing
    },
    qrCodeId: cafe.qrCodeId,
    uploadUrl,
    qrCode
});

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;