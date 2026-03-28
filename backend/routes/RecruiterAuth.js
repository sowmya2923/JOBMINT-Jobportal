const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Recruit = require("../models/Recruiter");
const TempRecruiter = require("../models/TempRecruiter");
const transporter = require("../utils/mail");
const authMiddleware = require("../middleware/AuthMiddleware");
const upload=require("../utils/upload.js")
const path = require("path");
const multer = require("multer");

// ================= SEND OTP =================
router.post("/send-otp/recruiter", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    // Check if already registered
    const existingRecruiter = await Recruit.findOne({ email });
    if (existingRecruiter)
      return res.status(400).json({ message: "Email already registered" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save or Update OTP in TempRecruiter
    await TempRecruiter.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        otpExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      },
      { upsert: true, new: true }
    );

    // Send Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Recruiter Registration OTP",
      html: `
        <h2>Your OTP is: ${otp}</h2>
        <p>This OTP is valid for 10 minutes.</p>
      `
    });

    res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    console.log("Send OTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});


// ================= VERIFY OTP =================
router.post("/verify-otp/recruiter", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const tempRecruiter = await TempRecruiter.findOne({ email });

    if (!tempRecruiter)
      return res.status(400).json({ message: "Please request OTP first" });

    if (tempRecruiter.otp !== Number(otp))
      return res.status(400).json({ message: "Incorrect OTP" });

    if (tempRecruiter.otpExpires < new Date())
      return res.status(400).json({ message: "OTP expired" });

    res.status(200).json({ message: "OTP verified successfully" });

  } catch (err) {
    console.log("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});


// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, mobile, company_name } = req.body;

    const temp = await TempRecruiter.findOne({ email });

    if (!temp)
      return res.status(400).json({ message: "Verify OTP first" });

    if (temp.otpExpires < new Date())
      return res.status(400).json({ message: "OTP expired" });

    const existing = await Recruit.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Recruiter already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const recruiter = new Recruit({
      name,
      email,
      password: hashedPassword,
      mobile,
      company_name
    });

    await recruiter.save();
    // Delete temp OTP data
    await TempRecruiter.deleteOne({ email });

    res.status(200).json({ message: "Recruiter registered successfully" });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// ================= GET PROFILE =================

router.get("/profile", authMiddleware, async (req, res) => {

  console.log(req.user)
  try {

    const recruiter = await Recruit.findOne({ email: req.user.email }).select("-password");

    if (!recruiter)
      return res.status(404).json({ message: "Recruiter not found" });

    res.json(recruiter);

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error" });
  }
});


// ================= UPDATE PROFILE =================

router.put("/profile", authMiddleware, async (req, res) => {
  try {

    const recruiter = await Recruit.findOneAndUpdate(
      { email: req.user.email },
      req.body,
      { new: true }
    );

    res.json(recruiter);

  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});

/// ================= UPLOAD PROFILE PHOTO =================

router.post(
  "/profile-photo",
  authMiddleware,
  upload.single("photo"),
  async (req, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const recruiter = await Recruit.findOne({ email: req.user.email });

      if (!recruiter) {
        return res.status(404).json({ message: "Recruiter not found" });
      }

      recruiter.profilePhoto = req.file.filename;

      await recruiter.save();

      res.json({
        message: "Profile photo uploaded successfully",
        photo: req.file.filename
      });

    } catch (error) {
      console.log("PROFILE PHOTO ERROR:", error);
      res.status(500).json({ message: "Photo upload failed" });
    }
  }
);

// ================= UPLOAD PROFILE PHOTO BASE64 =================
router.post(
  "/profile-photo-base64",
  authMiddleware,
  async (req, res) => {
    try {
      const { photo } = req.body;
      if (!photo) return res.status(400).json({ message: "No photo uploaded" });

      const fs = require("fs");
      const path = require("path");

      const base64Data = photo.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      
      const filename = `${Date.now()}-profile_crop.png`;
      const filepath = path.join(__dirname, "../../uploads", filename);
      
      // Keep using the uploads dir since Recruiter explicitly writes to disk instead of GridFS
      if (!fs.existsSync(path.join(__dirname, "../../uploads"))) {
        fs.mkdirSync(path.join(__dirname, "../../uploads"), { recursive: true });
      }
      fs.writeFileSync(filepath, buffer);

      const recruiter = await Recruit.findOne({ email: req.user.email });
      if (!recruiter) {
        return res.status(404).json({ message: "Recruiter not found" });
      }

      recruiter.profilePhoto = filename;
      await recruiter.save();

      res.json({
        message: "Profile photo uploaded successfully via Base64",
        photo: filename
      });
    } catch (error) {
      console.log("PROFILE PHOTO BASE64 ERROR:", error);
      res.status(500).json({ message: "Photo upload failed" });
    }
  }
);

module.exports = router;