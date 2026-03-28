const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const JobSeeker = require("../models/Jobseeker");
const TempJobSeeker = require("../models/TempJobSeeker");
const transporter = require("../utils/mail");
const mongoose = require("mongoose");
const { Readable } = require("stream");
const authMiddleware = require("../middleware/AuthMiddleware.js");
const gridfsUpload = require("../utils/gridfsUpload.js");

// HELPER: Upload Buffer to GridFS safely
function uploadBufferToGridFS(buffer, originalname) {
  return new Promise((resolve, reject) => {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
    const filename = `${Date.now()}-${originalname.replace(/\s+/g, '-')}`;
    
    const writeStream = bucket.openUploadStream(filename);
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null); // End of stream

    readable.pipe(writeStream)
      .on('error', reject)
      .on('finish', () => resolve(filename));
  });
}


// SEND OTP - JOBSEEKER
router.post("/send-otp/jobseeker", async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Check if email is provided
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 2️⃣ Check if already registered
    const existingUser = await JobSeeker.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "JobSeeker already exists" });
    }

    // 3️⃣ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4️⃣ Save OTP in Temp Collection (expires in 10 mins)
    await TempJobSeeker.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        otpExpires: new Date(Date.now() + 10 * 60 * 1000)
      },
      { upsert: true, new: true }
    );

    // 5️⃣ Send Mail
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Verification Code",
      html: `
        <div style="font-family: Arial; text-align:center;">
          <h2>JobMint OTP Verification</h2>
          <p>Your OTP is:</p>
          <h1 style="color:blue;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
        </div>
      `
    });

    return res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res.status(500).json({ message: "Server error while sending OTP" });
  }
});

module.exports = router;

// ======================
// VERIFY OTP
// ======================
router.post("/verify-otp/jobseeker", async (req, res) => {
  const { email, otp } = req.body;

  const temp = await TempJobSeeker.findOne({ email });

  if (!temp) {
    return res.status(400).json({ message: "No OTP request found" });
  }

  // 🔥 Convert both to string before comparing
  if (temp.otp.toString() !== otp.toString()) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (temp.otpExpires < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  return res.status(200).json({ message: "OTP verified" });
});


// ======================
// REGISTER
// ======================
router.post("/register/jobseeker", async (req, res) => {

  const { name, email, password, phone, experience, designation } = req.body;

  const temp = await TempJobSeeker.findOne({ email });
  if (!temp) {
    return res.status(400).json({ message: "Please verify OTP first" });
  }

  const existing = await JobSeeker.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "JobSeeker already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new JobSeeker({
    name,
    email,
    password: hashedPassword,
    phone,
    experience,
    designation
  });

  await newUser.save();

  await TempJobSeeker.deleteOne({ email });

  res.status(200).json({ message: "JobSeeker registered successfully" });
});


// ================= GET PROFILE =================
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await JobSeeker.findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ================= UPDATE PROFILE =================
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const updatedUser = await JobSeeker.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Update Failed" });
  }
});

// ================= UPLOAD RESUME =================
router.post(
  "/upload-resume",
  authMiddleware,
  (req, res, next) => {
    gridfsUpload.single("resume")(req, res, function (err) {
      if (err) return res.status(500).json({ message: "Multer Error", error: err.stack || err.message });
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const filename = await uploadBufferToGridFS(req.file.buffer, req.file.originalname);

      const updatedUser = await JobSeeker.findByIdAndUpdate(
        req.user.id,
        { resume: filename },
        { new: true }
      );

      res.json({
        message: "Resume uploaded successfully to GridFS",
        resume: updatedUser.resume,
      });
    } catch (err) {
      console.log("Resume Upload Error:", err);
      res.status(500).json({ message: "Resume upload failed", error: err.stack || err.toString() });
    }
  }
);

// ================= UPLOAD PHOTO =================
router.post(
  "/upload-photo",
  authMiddleware,
  (req, res, next) => {
    gridfsUpload.single("photo")(req, res, function (err) {
      if (err) return res.status(500).json({ message: "Multer Error", error: err.stack || err.message });
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No photo uploaded" });

      const filename = await uploadBufferToGridFS(req.file.buffer, req.file.originalname);

      const updatedUser = await JobSeeker.findByIdAndUpdate(
        req.user.id,
        { profilePhoto: filename },
        { new: true }
      );

      res.json({
        message: "Profile photo uploaded successfully to GridFS",
        profilePhoto: updatedUser.profilePhoto,
      });
    } catch (err) {
      console.log("Photo Upload Error:", err);
      res.status(500).json({ message: "Photo upload failed", error: err.stack || err.toString() });
    }
  }
);

// ================= UPLOAD PHOTO BASE64 (BYPASS MULTER) =================
router.post(
  "/upload-photo-base64",
  authMiddleware,
  async (req, res) => {
    try {
      const { photo } = req.body;
      if (!photo) return res.status(400).json({ message: "No photo uploaded" });

      const base64Data = photo.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      
      const filename = await uploadBufferToGridFS(buffer, "profile_crop.png");

      const updatedUser = await JobSeeker.findByIdAndUpdate(
        req.user.id,
        { profilePhoto: filename },
        { new: true }
      );

      res.json({
        message: "Profile photo uploaded successfully via Base64",
        profilePhoto: updatedUser.profilePhoto,
      });
    } catch (err) {
      console.error("Base64 Photo Upload Error:", err);
      res.status(500).json({ message: "Photo upload failed", error: err.stack || err.toString() });
    }
  }
);

module.exports = router;
