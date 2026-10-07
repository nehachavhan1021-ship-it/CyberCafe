require("dotenv").config();

const express = require("express");
const cors = require("cors");

const dns = require("dns"); //
// Set custom DNS servers (Google and Cloudflare)
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const connectDB = require("./db/db");

const authRoutes = require("./routes/auth.routes");
const cafeRoutes = require("./routes/cafe.routes");
const uploadRoutes = require("./routes/upload.routes");
const jobRoutes = require("./routes/job.routes");
const pricingRoutes = require("./routes/pricing.routes");
const cleanupOldFiles = require("./utils/cleanupOldFiles");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://cyber-cafe-bay.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("CORS Origin:", origin);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.json({
    message: "PrintCafe backend is running",
  });
});

// Automatic file cleanup
cleanupOldFiles();

setInterval(
  () => {
    cleanupOldFiles();
  },
  60 * 60 * 1000,
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/cafes", cafeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/pricing", pricingRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
