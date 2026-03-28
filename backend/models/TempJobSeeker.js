const mongoose = require("mongoose");

const TempJobSeekerSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true,
      required: true,
    },

    password: String,

    phone: String,

    experience: String,

    designation: String,

    otp: String,

    otpExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("TempJobSeeker", TempJobSeekerSchema);
