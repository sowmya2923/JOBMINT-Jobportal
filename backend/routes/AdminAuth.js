const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");
const Recruiter = require("../models/Recruiter");
const JobSeeker = require("../models/Jobseeker");
const Job = require("../models/Job");
const Application = require("../models/Application");
const authMiddleware = require("../middleware/AuthMiddleware");

// ======================
// REGISTER ADMIN
// ======================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!password.startsWith("AD")) {
      return res.status(400).json({ message: "Admin password must start with AD" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully!" });
  } catch (err) {
    console.error("ADMIN REGISTRATION ERROR:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ======================
// ADMIN STATS (Dynamic)
// ======================
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const [recruiterCount, seekerCount, jobCount, applicationCount, activeJobCount] = await Promise.all([
      Recruiter.countDocuments(),
      JobSeeker.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      Job.countDocuments({ status: "Active" })
    ]);

    // Recent activity
    const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5).select("title company createdAt status");
    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("jobseeker", "name email")
      .populate("job", "title company");

    // All Users for management
    const allRecruiters = await Recruiter.find().select("name email company_name createdAt");
    const allSeekers = await JobSeeker.find().select("name email createdAt");

    res.json({
      recruiters: recruiterCount,
      seekers: seekerCount,
      totalJobs: jobCount,
      activeJobs: activeJobCount,
      totalApplications: applicationCount,
      recentJobs,
      recentApplications,
      allRecruiters,
      allSeekers
    });
  } catch (err) {
    console.error("ADMIN STATS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});

// DELETE RECRUITER
router.delete("/recruiter/:id", authMiddleware, async (req, res) => {
  try {
    // Only admin can delete (req.user logic depends on how Admin model is handled)
    // If Admin uses same authMiddleware, we should verify it's an admin
    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(403).json({ message: "Only admins can perform this action" });

    await Recruiter.findByIdAndDelete(req.params.id);
    // Optionally delete their jobs too
    await Job.deleteMany({ recruiter: req.params.id });

    res.json({ message: "Recruiter and their jobs deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete recruiter" });
  }
});

// DELETE SEEKER
router.delete("/seeker/:id", authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(403).json({ message: "Only admins can perform this action" });

    await JobSeeker.findByIdAndDelete(req.params.id);
    // Optionally delete their applications
    await Application.deleteMany({ jobseeker: req.params.id });

    res.json({ message: "Job seeker and their applications deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete seekers" });
  }
});

module.exports = router;
