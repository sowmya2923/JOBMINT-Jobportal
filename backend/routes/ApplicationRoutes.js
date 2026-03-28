const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Job = require("../models/Job");
const Notification = require("../models/Notification");
const JobSeeker = require("../models/Jobseeker");
const authMiddleware = require("../middleware/AuthMiddleware");
const { sendEmail } = require("../utils/emailService");

// ================= JOBSEEKER: APPLY TO JOB =================
router.post("/apply/:jobId", authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const jobseekerId = req.user.id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if already applied
    const existingApp = await Application.findOne({ job: jobId, jobseeker: jobseekerId });
    if (existingApp) {
      return res.status(400).json({ message: "You have already applied to this job" });
    }

    // Create Application
    const newApplication = new Application({
      job: jobId,
      jobseeker: jobseekerId,
      recruiter: job.recruiter,
      status: "Pending",
    });

    await newApplication.save();

    // Increment applicants counter on the Job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicants: 1 } });

    // ─── [NOTIFY RECRUITER] ───
    await Notification.create({
      recipient: job.recruiter,
      recipientModel: 'Recruit',
      title: "New Application",
      message: `A jobseeker just applied for your posting: ${job.title}`,
      type: "application",
    });

    res.status(201).json({ message: "Application submitted successfully", application: newApplication });
  } catch (error) {
    console.error("Apply Error:", error);
    res.status(500).json({ message: "Server error during application" });
  }
});

// ================= JOBSEEKER: GET MY APPLICATIONS =================
router.get("/seeker/my-applications", authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({ jobseeker: req.user.id })
      .populate("job", "title company location salary jobType")
      .populate("recruiter", "profilePhoto companyName")
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    console.error("Fetch Applications Error:", error);
    res.status(500).json({ message: "Server error fetching applications" });
  }
});
// ================= RECRUITER: GET ALL APPLICANTS FOR ALL JOBS =================
router.get("/recruiter/all-applicants", authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({ recruiter: req.user.id })
      .populate("job", "title company location salary jobType")
      .populate("jobseeker", "name email mobile location skills experience education resume profilePhoto linkedin github portfolio")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Fetch All Applicants Error:", error);
    res.status(500).json({ message: "Server error fetching all applicants" });
  }
});

// ================= RECRUITER: GET APPLICANTS FOR A JOB =================
router.get("/recruiter/job/:jobId", authMiddleware, async (req, res) => {
  try {
    // Verify the recruiter owns the job
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view these applicants" });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("jobseeker", "name email mobile location skills experience education resume profilePhoto linkedin github portfolio")
      .sort({ createdAt: -1 });

    res.json({ jobTitle: job.title, applications });
  } catch (error) {
    console.error("Fetch Applicants Error:", error);
    res.status(500).json({ message: "Server error fetching applicants" });
  }
});

// ================= RECRUITER: UPDATE APPLICATION STATUS =================
router.put("/recruiter/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Reviewed", "Shortlisted", "Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Verify ownership
    if (application.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this application" });
    }

    application.status = status;
    await application.save();

    // ─── [NOTIFY JOBSEEKER] ───
    await application.populate({ path: 'job', select: 'title' });
    await Notification.create({
      recipient: application.jobseeker,
      recipientModel: 'JobSeeker',
      title: "Application Update",
      message: `Your application for ${application.job.title} is now: ${status}`,
      type: "status_update",
    });

    // ─── [SEND EMAIL NOTIFICATION] ───
    const seeker = await JobSeeker.findById(application.jobseeker);
    if (seeker && seeker.email) {
      let statusColor = "#14b8a6"; // Default teal
      let statusMsg = `Your application for <strong>${application.job.title}</strong> has been updated to <strong>${status}</strong>.`;
      let extraInfo = "The recruiter will contact you soon for the next steps.";

      if (status === "Rejected") {
        statusColor = "#ef4444"; // Red
        statusMsg = `Thank you for your interest in the <strong>${application.job.title}</strong> position at <strong>${application.job.company || 'our company'}</strong>.`;
        extraInfo = "After careful consideration, the recruitment team has decided not to move forward with your application at this time. We appreciate the time you invested in applying and wish you the best in your job search.";
      } else if (status === "Accepted") {
        statusColor = "#10b981"; // Emerald
        statusMsg = `Congratulations! You have been <strong>Accepted</strong> for the <strong>${application.job.title}</strong> position!`;
        extraInfo = "We are thrilled to have you on board. Our team will reach out to you shortly with the offer details and onboarding instructions.";
      } else if (status === "Shortlisted") {
        statusMsg = `Great news! You have been <strong>Shortlisted</strong> for the <strong>${application.job.title}</strong> position.`;
      } else if (status === "Reviewed") {
        statusMsg = `Your application for <strong>${application.job.title}</strong> has been <strong>Reviewed</strong> by the recruitment team.`;
        extraInfo = "We are currently evaluating all candidates and will update you on the next steps soon.";
      }

      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #0d1b2a; padding: 30px; text-align: center;">
            <h1 style="color: ${statusColor}; margin: 0; font-size: 26px; letter-spacing: -0.5px;">Application Update</h1>
          </div>
          <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
            <p style="font-size: 16px;">Hi <strong>${seeker.name}</strong>,</p>
            <p style="font-size: 16px;">${statusMsg}</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 25px 0;">
              <p style="margin: 0; font-size: 15px; color: #475569;">${extraInfo}</p>
            </div>

            <p style="font-size: 14px; color: #64748b;">You can track your application status anytime in your dashboard.</p>

            <div style="text-align: center; margin-top: 35px;">
              <a href="http://localhost:5173/jobseeker/applications" style="background-color: #0d1b2a; color: #ffffff; padding: 12px 30px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
          </div>
          <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p style="margin: 0;">&copy; 2026 JobMint Portal. Professional Hiring Simplified.</p>
          </div>
        </div>
      `;
      await sendEmail(seeker.email, `Application Status Update: ${application.job.title}`, emailHtml);
    }

    res.json({ message: `Status updated to ${status}`, application });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Server error updating status" });
  }
});

// ================= RECRUITER: SCHEDULE INTERVIEW =================
router.post("/recruiter/:id/schedule-interview", authMiddleware, async (req, res) => {
  try {
    const { round, date, time, location, message } = req.body;
    const application = await Application.findById(req.params.id)
      .populate("job", "title")
      .populate("jobseeker", "name email");

    if (!application) return res.status(404).json({ message: "Application not found" });

    // Verify ownership
    if (application.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const newInterview = {
      round,
      date,
      time,
      location,
      message,
      status: "Scheduled"
    };

    application.interviews.push(newInterview);
    await application.save();

    // Notify Seeker (In-portal)
    await Notification.create({
      recipient: application.jobseeker._id,
      recipientModel: 'JobSeeker',
      title: "Interview Scheduled",
      message: `An interview for ${application.job.title} (${round}) has been scheduled for ${new Date(date).toLocaleDateString()} at ${time}.`,
      type: "interview",
    });

    // Notify Seeker (Email)
    if (application.jobseeker.email) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0d1b2a;">Interview Scheduled</h2>
          <p>Hi <strong>${application.jobseeker.name}</strong>,</p>
          <p>An interview has been scheduled for your application for <strong>${application.job.title}</strong>.</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Round:</strong> ${round}</p>
            <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Location/Link:</strong> ${location || "To be shared"}</p>
          </div>
          <p>${message || ""}</p>
          <p>Please log in to the portal for more details.</p>
          <br/>
          <p>Best regards,<br/>The Job Portal Team</p>
        </div>
      `;
      await sendEmail(application.jobseeker.email, `Interview Scheduled: ${application.job.title}`, emailHtml);
    }

    res.json({ message: "Interview scheduled successfully", application });
  } catch (error) {
    console.error("Schedule Interview Error:", error);
    res.status(500).json({ message: "Server error scheduling interview" });
  }
});

// ================= RECRUITER: UPDATE INTERVIEW STATUS =================
router.put("/recruiter/:id/interview/:interviewId", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body; // Scheduled, Completed, Cancelled
    const application = await Application.findById(req.params.id)
      .populate("job", "title")
      .populate("jobseeker", "name email");

    if (!application) return res.status(404).json({ message: "Application not found" });

    // Verify ownership
    if (application.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const interview = application.interviews.id(req.params.interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.status = status;
    await application.save();

    // Notify Seeker
    await Notification.create({
      recipient: application.jobseeker._id,
      recipientModel: 'JobSeeker',
      title: "Interview Update",
      message: `Your interview (${interview.round}) for ${application.job.title} is now: ${status}`,
      type: "interview",
    });

    // Notify Email
    if (application.jobseeker.email) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0d1b2a;">Interview Update</h2>
          <p>Hi <strong>${application.jobseeker.name}</strong>,</p>
          <p>The status of your interview for <strong>${application.job.title}</strong> (${interview.round}) has been updated to: <strong>${status}</strong>.</p>
          <p>Please log in to the portal for more details.</p>
          <br/>
          <p>Best regards,<br/>The Job Portal Team</p>
        </div>
      `;
      await sendEmail(application.jobseeker.email, `Interview Update: ${application.job.title}`, emailHtml);
    }

    res.json({ message: `Interview status updated to ${status}`, application });
  } catch (error) {
    console.error("Update Interview Error:", error);
    res.status(500).json({ message: "Server error updating interview" });
  }
});

module.exports = router;
