const express = require("express");

const Cafe = require("../models/cafe.model");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        const cafe = await Cafe.findOne({
            owner: req.user.userId
        });

        if (!cafe) {
            return res.status(404).json({
                message: "Cybercafé not found"
            });
        }

        res.json({
            pricing: cafe.pricing
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch pricing"
        });
    }
});


router.patch("/", authMiddleware, async (req, res) => {
    try {
        const {
            a4Bw,
            a4Color,
            a3Bw,
            a3Color
        } = req.body;

        const prices = {
            a4Bw,
            a4Color,
            a3Bw,
            a3Color
        };

        for (const price of Object.values(prices)) {
            if (
                typeof price !== "number" ||
                price < 0
            ) {
                return res.status(400).json({
                    message: "Prices must be valid numbers"
                });
            }
        }

        const cafe = await Cafe.findOne({
            owner: req.user.userId
        });

        if (!cafe) {
            return res.status(404).json({
                message: "Cybercafé not found"
            });
        }

        cafe.pricing = prices;

        await cafe.save();

        res.json({
            message: "Pricing updated successfully",
            pricing: cafe.pricing
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update pricing"
        });
    }
});

module.exports = router;