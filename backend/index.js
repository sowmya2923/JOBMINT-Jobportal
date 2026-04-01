const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const loginAuth = require("./routes/LoginAuth");
const passwordRoutes = require("./routes/PasswordAuth");
const recruiterAuth = require("./routes/RecruiterAuth");
const seekerAuth = require("./routes/SeekerAuth");
const jobRoutes = require("./routes/JobRoutes");
const applicationRoutes = require("./routes/ApplicationRoutes");
const notificationRoutes = require("./routes/NotificationRoutes");
const adminAuth = require("./routes/AdminAuth");

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({
  origin: function (origin, callback) {
    const allowed = ["http://localhost:5173", 
      "http://localhost:5174",
    "https://jobmint-frontend.onrender.com"];
    if (process.env.FRONTEND_URL) {
      allowed.push(process.env.FRONTEND_URL.replace(/\/$/, "")); // Strip trailing slash if present
    }
    if (!origin || allowed.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Health Check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ROUTES
app.use("/api/auth", loginAuth);
app.use("/api/auth", passwordRoutes);
app.use("/api/recruiter", recruiterAuth);
app.use("/api/seeker", seekerAuth);
app.use("/api/admin", adminAuth);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/uploads", express.static("uploads"));

// Server
const PORT = process.env.PORT || 5000;
let gfsBucket;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("MongoDB Connected");
    // Initialize GridFS bucket
    const db = mongoose.connection.db;
    gfsBucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "uploads",
    });
    console.log("GridFsBucket created")
  })
  .catch((err) => console.log("DB Error:", err));

// ================= GRIDFS FILE STREAMING =================
app.get("/api/file/:filename", async (req, res) => {
  try {
    if (!gfsBucket) return res.status(500).json({ message: "GridFS not initialized yet" });

    const file = await gfsBucket.find({ filename: req.params.filename }).toArray();
    if (!file || file.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    gfsBucket.openDownloadStreamByName(req.params.filename).pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Error fetching file" });
  }
});

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});