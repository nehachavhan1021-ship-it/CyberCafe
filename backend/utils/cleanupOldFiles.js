const PrintJob = require("../models/printJob.model");
const { deleteFile } = require("./fileCleanup");

const cleanupOldFiles = async () => {
    try {
        const twentyFourHoursAgo = new Date(
            Date.now() - 24 * 60 * 60 * 1000
        );

        const oldJobs = await PrintJob.find({
            status: "completed",
            completedAt: {
                $lte: twentyFourHoursAgo
            },
            fileName: {
                $ne: null
            }
        });

        console.log(
            `Found ${oldJobs.length} completed files to clean up.`
        );

        for (const job of oldJobs) {
            try {
                await deleteFile(job.fileName);

                // Prevent the same file from being
                // deleted again on the next cleanup
                job.fileName = null;

                await job.save();

                console.log(
                    `Deleted file for job: ${job._id}`
                );

            } catch (fileError) {
                console.error(
                    `Failed to delete file for job ${job._id}:`,
                    fileError
                );
            }
        }

    } catch (error) {
        console.error("Cleanup error:", error);
    }
};

module.exports = cleanupOldFiles;