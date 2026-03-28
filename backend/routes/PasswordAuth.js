// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcrypt");

// const Admin = require("../models/Admin");
// const Recruiter = require("../models/Recruiter");
// const JobSeeker = require("../models/Jobseeker");

// const transporter = require("../utils/mail");


// // ================= FIND USER FUNCTION =================
// const findUserByEmail = async (email) => {

//   let user = await Admin.findOne({ email });
//   if (user) return user;

//   user = await Recruiter.findOne({ email });
//   if (user) return user;

//   user = await JobSeeker.findOne({ email });
//   if (user) return user;

//   return null;
// };



// // ================= SEND OTP =================
// router.post("/forgot-password", async (req, res) => {

//   try {

//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: "Email required" });
//     }

//     const user = await findUserByEmail(email);

//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     user.resetOtp = otp;
//     user.resetOtpExpires = Date.now() + 5 * 60 * 1000;

//     await user.save();

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Password Reset OTP",
//       html: `
//         <h3>Password Reset OTP</h3>
//         <h2>${otp}</h2>
//         <p>This OTP expires in 5 minutes.</p>
//       `
//     });

//     res.json({ message: "OTP sent successfully" });

//   } catch (err) {

//     console.log("OTP Error:", err);
//     res.status(500).json({ message: "Server error" });

//   }

// });



// // ================= VERIFY OTP =================
// router.post("/verify-otp", async (req, res) => {

//   try {

//     const { email, otp } = req.body;

//     if (!email || !otp) {
//       return res.status(400).json({ message: "Email and OTP required" });
//     }

//     const user = await findUserByEmail(email);

//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     const enteredOtp = String(otp).trim();
//     const storedOtp = String(user.resetOtp || "").trim();

//     if (enteredOtp !== storedOtp) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     if (user.resetOtpExpires < Date.now()) {
//       return res.status(400).json({ message: "OTP expired" });
//     }

//     res.json({ message: "OTP verified successfully" });

//   } catch (err) {

//     console.log("Verify OTP Error:", err);
//     res.status(500).json({ message: "Server error" });

//   }

// });



// // ================= RESET PASSWORD =================
// router.post("/reset-password", async (req, res) => {

//   try {

//     const { email, otp, newPassword } = req.body;

//     if (!email || !otp || !newPassword) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     const user = await findUserByEmail(email);

//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     const enteredOtp = String(otp).trim();
//     const storedOtp = String(user.resetOtp || "").trim();

//     if (enteredOtp !== storedOtp) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     if (user.resetOtpExpires < Date.now()) {
//       return res.status(400).json({ message: "OTP expired" });
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     user.password = hashedPassword;
//     user.resetOtp = null;
//     user.resetOtpExpires = null;

//     await user.save();

//     res.json({ message: "Password reset successful" });

//   } catch (err) {

//     console.log("Reset Error:", err);
//     res.status(500).json({ message: "Server error" });

//   }

// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const Admin = require("../models/Admin");
const Recruiter = require("../models/Recruiter");
const JobSeeker = require("../models/Jobseeker");

const transporter = require("../utils/mail");


// ================= FIND USER FUNCTION =================
const findUserByEmail = async (email) => {

  let user = await Admin.findOne({ email });
  if (user) return user;

  user = await Recruiter.findOne({ email });
  if (user) return user;

  user = await JobSeeker.findOne({ email });
  if (user) return user;

  return null;
};



// ================= SEND OTP =================
router.post("/forgot-password", async (req, res) => {

  try {

    const { email } = req.body;

    console.log("Forgot Password Request:", email);

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    console.log("Generated OTP:", otp);

    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 5 * 60 * 1000;

    await user.save();

    console.log("OTP saved in DB:", user.resetOtp);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <h3>Password Reset OTP</h3>
        <h2>${otp}</h2>
        <p>This OTP expires in 5 minutes.</p>
      `
    });

    res.json({ message: "OTP sent successfully" });

  } catch (err) {

    console.log("OTP Error:", err);
    res.status(500).json({ message: "Server error" });

  }

});



// ================= VERIFY OTP =================
// router.post("/verify-otp", async (req, res) => {

//   try {

//     console.log("Verify OTP Request Body:", req.body);

//     const { email, otp } = req.body;

//     if (!email || !otp) {
//       return res.status(400).json({ message: "Email and OTP required" });
//     }

//     const user = await findUserByEmail(email);

//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     console.log("Stored OTP in DB:", user.resetOtp);
//     console.log("Entered OTP:", otp);

//     const enteredOtp = String(otp).trim();
//     const storedOtp = String(user.resetOtp || "").trim();

//     if (enteredOtp !== storedOtp) {

//       console.log("OTP mismatch");

//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     if (!user.resetOtpExpires || user.resetOtpExpires < Date.now()) {

//       console.log("OTP expired");

//       return res.status(400).json({ message: "OTP expired" });
//     }

//     console.log("OTP verified successfully");

//     res.json({ message: "OTP verified successfully" });

//   } catch (err) {

//     console.log("Verify OTP Error:", err);
//     res.status(500).json({ message: "Server error" });

//   }

// });

router.post("/verify-otp", async (req, res) => {

  try {

    console.log("===== VERIFY OTP API CALLED =====");
    console.log("Request Body:", req.body);

    const { email, otp } = req.body;

    console.log("Email:", email);
    console.log("OTP:", otp);

    if (!email || !otp) {
      console.log("Missing email or otp");
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "User not found" });
    }

    console.log("Stored OTP in DB:", user.resetOtp);
    console.log("OTP Expiry:", user.resetOtpExpires);
    console.log("Current Time:", Date.now());

    const enteredOtp = String(otp).trim();
    const storedOtp = String(user.resetOtp || "").trim();

    if (enteredOtp !== storedOtp) {
      console.log("OTP mismatch");
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetOtpExpires < Date.now()) {
      console.log("OTP expired");
      return res.status(400).json({ message: "OTP expired" });
    }

    console.log("OTP VERIFIED SUCCESSFULLY");

    res.json({ message: "OTP verified successfully" });

  } catch (err) {

    console.log("Verify OTP Error:", err);
    res.status(500).json({ message: "Server error" });

  }

});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {

  try {

    console.log("Reset Password Request Body:", req.body);

    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const enteredOtp = String(otp).trim();
    const storedOtp = String(user.resetOtp || "").trim();

    console.log("Stored OTP:", storedOtp);
    console.log("Entered OTP:", enteredOtp);

    if (enteredOtp !== storedOtp) {

      console.log("OTP mismatch during reset");

      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.resetOtpExpires || user.resetOtpExpires < Date.now()) {

      console.log("OTP expired during reset");

      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpires = null;

    await user.save();

    console.log("Password reset successful");

    res.json({ message: "Password reset successful" });

  } catch (err) {

    console.log("Reset Error:", err);
    res.status(500).json({ message: "Server error" });

  }

});

module.exports = router;