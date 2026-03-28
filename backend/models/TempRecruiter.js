const mongoose = require("mongoose");

const tempRecruiterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: Number,
  otpExpires: Date
});

module.exports = mongoose.model("TempRecruiter", tempRecruiterSchema);
