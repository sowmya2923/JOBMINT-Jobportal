const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruit",
      required: true,
    },

    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: "" },

    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Remote", "Hybrid", "On-site", "Contract", "Internship"],
      default: "Full-time",
    },

    experience: { type: String, default: "" },      // e.g. "2-4 years"
    salary: { type: String, default: "" },           // e.g. "₹6-10 LPA"

    skills: [{ type: String }],                     // e.g. ["React", "Node.js"]

    description: { type: String, default: "" },
    requirements: { type: String, default: "" },

    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },

    applicants: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
