const mongoose = require("mongoose");

const recruiterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    mobile: { type: String, default: "" },
    designation: { type: String, default: "" },

    company_name: { type: String, default: "" },
    industry: { type: String, default: "" },
    company_size: { type: String, default: "" },
    website: { type: String, default: "" },
    description: { type: String, default: "" },

    location: {
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    profilePhoto: {
      type: String,
      default: ""
    },

    linkedin: { type: String, default: "" },

    profile_picture: { type: String, default: "" },
    company_logo: { type: String, default: "" },

    notifications: [
      {
        message: String,
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ✅ ADD THESE (OTP RESET SUPPORT)
    resetOtp: Number,
    resetOtpExpires: Date
  },
  { timestamps: true }


);

module.exports = mongoose.model("Recruit", recruiterSchema);