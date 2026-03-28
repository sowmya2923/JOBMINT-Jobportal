const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    jobseeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobSeeker",
      required: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruit",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Shortlisted", "Accepted", "Rejected"],
      default: "Pending",
    },
    interviews: [
      {
        round: String, // e.g., "Round 1: Technical"
        date: Date,
        time: String,
        location: String, // or meeting link
        message: String,
        status: {
          type: String,
          enum: ["Scheduled", "Completed", "Cancelled"],
          default: "Scheduled",
        },
        scheduledAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", ApplicationSchema);
