// const mongoose = require("mongoose");

// const jobSeekerSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String,
//   mobile: String,
//   location: String,

//   linkedin: String,
//   github: String,
//   portfolio: String,

//   summary: String,
//   skills: [String],

//   education: {
//     degree: String,
//     college: String,
//     year: String,
//     cgpa: String
//   },

//   experience: {
//     company: String,
//     role: String,
//     duration: String,
//     description: String
//   },

//   resume: String  // store resume file path
// });

// module.exports = mongoose.model("JobSeeker", jobSeekerSchema);
const mongoose = require("mongoose");

const jobSeekerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  mobile: String,
  location: String,

  linkedin: String,
  github: String,
  portfolio: String,

  summary: String,
  skills: [String],

  education: {
    degree: String,
    college: String,
    year: String,
    cgpa: String
  },

  experience: {
    company: String,
    role: String,
    duration: String,
    description: String
  },

  resume: String,
  profilePhoto: { type: String, default: "" },

  // ✅ ADD THESE (OTP RESET SUPPORT)
  resetOtp: Number,
  resetOtpExpires: Date
});

module.exports = mongoose.model("JobSeeker", jobSeekerSchema);