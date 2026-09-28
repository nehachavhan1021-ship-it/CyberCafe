const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./db/db");

const authRoutes = require("./routes/auth.routes");
const cafeRoutes = require("./routes/cafe.routes");
const uploadRoutes = require("./routes/upload.routes");
const jobRoutes = require("./routes/job.routes");
const pricingRoutes = require("./routes/pricing.routes");

const cleanupOldFiles = require("./utils/cleanupOldFiles");

dotenv.config();

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL
    })
);

app.use(express.json());

connectDB();

app.get("/", (req, res) => {
    res.json({
        message: "PrintCafe backend is running"
    });
});

// Automatic file cleanup
cleanupOldFiles();

setInterval(() => {
    cleanupOldFiles();
}, 60 * 60 * 1000);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/cafes", cafeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/pricing", pricingRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});