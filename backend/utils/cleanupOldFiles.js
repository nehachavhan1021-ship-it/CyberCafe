const fs = require("fs");
const path = require("path");

const PrintJob = require("../models/printJob.model");

const uploadsDir = path.join(__dirname, "..", "uploads");

const cleanupOldFiles = async () => {
    try {
        const expiryTime = Date.now() - (
            24 * 60 * 60 * 1000
        );

        const oldJobs = await PrintJob.find({
            createdAt: {
                $lt: new Date(expiryTime)
            }
        });

        for (const job of oldJobs) {
            if (!job.fileName) {
                continue;
            }

            const filePath = path.join(
                uploadsDir,
                job.fileName
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);

                console.log(
                    `Deleted old file: ${job.fileName}`
                );
            }
        }

    } catch (error) {
        console.error(
            "Cleanup error:",
            error.message
        );
    }
};

module.exports = cleanupOldFiles;