const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const Recruiter = require("../models/Recruiter");
const JobSeeker = require("../models/Jobseeker");
const authMiddleware = require("../middleware/AuthMiddleware");


// ================= LOGIN =================
router.post("/login", async (req, res) => {

  try {

    let { email, password, role } = req.body;

    // Trim email to avoid spaces
    email = email?.trim().toLowerCase();

    // Basic validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (role === "admin" && !password.startsWith("AD")) {
      return res.status(400).json({ message: "Admin password must start with AD" });
    }

    let user;

    // Select user model based on role
    switch (role) {

      case "admin":
        user = await Admin.findOne({ email: new RegExp("^" + email + "$", "i") });
        break;

      case "recruiter":
        user = await Recruiter.findOne({ email: new RegExp("^" + email + "$", "i") });
        break;

      case "jobseeker":
        user = await JobSeeker.findOne({ email: new RegExp("^" + email + "$", "i") });
        break;

      default:
        return res.status(400).json({ message: "Invalid role selected" });

    }

    // Check if user exists
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set HTTP-Only Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Required for HTTPS on Render
      sameSite: "none", // Required for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Send response (removed token from body)
    res.status(200).json({
      message: "Login successful",
      role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role
      }
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ================= LOGOUT =================
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

// ================= ME / SESSION CHECK =================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    let user;
    switch (req.user.role) {
      case "admin": user = await Admin.findById(req.user.id); break;
      case "recruiter": user = await Recruiter.findById(req.user.id); break;
      case "jobseeker": user = await JobSeeker.findById(req.user.id); break;
      default: return res.status(400).json({ message: "Invalid role" });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: req.user.role
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;