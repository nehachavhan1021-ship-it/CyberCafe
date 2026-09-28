const express = require("express");
const path = require("path");
const fs = require("fs");

const PrintJob = require("../models/printJob.model");
const Cafe = require("../models/cafe.model");
const authMiddleware = require("../middleware/auth.middleware");
const { deleteFile } = require("../utils/fileCleanup");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        // Find the cafe owned by the logged-in user
        const cafe = await Cafe.findOne({
            owner: req.user.userId
        });

        if (!cafe) {
            return res.status(404).json({
                message: "Cybercafé not found"
            });
        }

        // Find jobs belonging to this cafe
        const jobs = await PrintJob.find({
            cafe: cafe._id
        }).sort({
            createdAt: -1
        });

        res.json({
            cafe: {
                id: cafe._id,
                name: cafe.name
            },
            jobs
        });

    } catch (error) {
        console.error("Get jobs error:", error);

        res.status(500).json({
            message: "Failed to fetch print jobs"
        });
    }
});
router.get("/:jobId/file", authMiddleware, async (req, res) => {
    try {
        const cafe = await Cafe.findOne({
            owner: req.user.userId
        });

        if (!cafe) {
            return res.status(404).json({
                message: "Cybercafé not found"
            });
        }

        const job = await PrintJob.findOne({
            _id: req.params.jobId,
            cafe: cafe._id
        });

        if (!job) {
            return res.status(404).json({
                message: "Print job not found"
            });
        }

        const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            job.fileName
        );

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        res.download(filePath, job.originalName);

    } catch (error) {
        console.error("Download error:", error);

        res.status(500).json({
            message: "Failed to download file"
        });
    }
});
router.patch("/:jobId/status", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "printing",
            "ready",
            "completed"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const cafe = await Cafe.findOne({
            owner: req.user.userId
        });

        if (!cafe) {
            return res.status(404).json({
                message: "Cybercafé not found"
            });
        }

        const job = await PrintJob.findOne({
            _id: req.params.jobId,
            cafe: cafe._id
        });

        if (!job) {
            return res.status(404).json({
                message: "Print job not found"
            });
        }

       job.status = status;

await job.save();

if (status === "completed") {
    deleteFile(job.fileName);
}

        res.json({
            message: "Status updated successfully",
            job
        });

    } catch (error) {
        console.error("Status update error:", error);

        res.status(500).json({
            message: "Failed to update status"
        });
    }
});

module.exports = router;