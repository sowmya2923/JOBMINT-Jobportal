const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const Recruit = require("../models/Recruiter");
const JobSeeker = require("../models/Jobseeker");
const authMiddleware = require("../middleware/AuthMiddleware");
const { sendEmail } = require("../utils/emailService");

// ================= CREATE JOB =================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const recruiter = await Recruit.findOne({ email: req.user.email });
    if (!recruiter)
      return res.status(404).json({ message: "Recruiter not found" });

    const {
      title,
      company,
      location,
      jobType,
      experience,
      salary,
      skills,
      description,
      requirements,
    } = req.body;

    const job = new Job({
      recruiter: recruiter._id,
      title,
      company: company || recruiter.company_name,
      location,
      jobType,
      experience,
      salary,
      skills: Array.isArray(skills) ? skills : [],
      description,
      requirements,
    });

    await job.save();

    // ─── [NOTIFY JOBSEEKERS WITH MATCHING SKILLS] ───
    if (job.skills && job.skills.length > 0) {
      // Improve skill matching: check each seeker's skills case-insensitively
      // For large databases, this should be done with a more optimized query or search engine
      const allSeekers = await JobSeeker.find({}, 'email name skills');
      
      const jobSkillsLower = job.skills.map(s => s.toLowerCase());

      for (const seeker of allSeekers) {
        if (!seeker.email || !seeker.skills || seeker.skills.length === 0) continue;

        const hasMatch = seeker.skills.some(s => jobSkillsLower.includes(s.toLowerCase()));

        if (hasMatch) {
          const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
              <div style="background-color: #0d1b2a; padding: 30px; text-align: center;">
                <h1 style="color: #14b8a6; margin: 0; font-size: 28px; letter-spacing: -0.5px;">JobMint Match!</h1>
              </div>
              <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
                <p style="font-size: 16px;">Hi <strong>${seeker.name}</strong>,</p>
                <p style="font-size: 16px;">Exciting news! A new job has been posted that perfectly aligns with your skills.</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 30px 0;">
                  <h2 style="margin: 0 0 10px 0; color: #0d1b2a; font-size: 20px;">${job.title}</h2>
                  <p style="margin: 0 0 15px 0; color: #64748b; font-weight: 600;">${job.company} &bull; ${job.location || 'Remote'}</p>
                  
                  <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 15px;">
                    <span style="background-color: #14b8a615; color: #0d9488; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; border: 1px solid #14b8a630;">
                      ${job.jobType}
                    </span>
                  </div>

                  <p style="margin-top: 15px; font-size: 14px; color: #475569;">
                    <strong>Matching Skills:</strong> ${job.skills.join(", ")}
                  </p>
                </div>

                <div style="text-align: center; margin-top: 35px;">
                  <a href="http://localhost:5173/login" style="background-color: #0d1b2a; color: #ffffff; padding: 14px 35px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; transition: background-color 0.3s ease;">
                    View Job & Apply
                  </a>
                </div>
              </div>
              <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
                <p style="margin: 0;">&copy; 2026 JobMint Portal. All rights reserved.</p>
                <p style="margin: 5px 0 0 0;">You're receiving this because your profile matches recent job postings.</p>
              </div>
            </div>
          `;
          await sendEmail(seeker.email, `Job Match found: ${job.title} at ${job.company}`, emailHtml);
        }
      }
    }

    res.status(201).json({ message: "Job posted successfully", job });
  } catch (err) {
    console.log("CREATE JOB ERROR:", err);
    res.status(500).json({ message: "Failed to create job" });
  }
});

// ================= GET MY JOBS =================
router.get("/my-jobs", authMiddleware, async (req, res) => {
  try {
    const recruiter = await Recruit.findOne({ email: req.user.email });
    if (!recruiter)
      return res.status(404).json({ message: "Recruiter not found" });

    const jobs = await Job.find({ recruiter: recruiter._id }).sort({
      createdAt: -1,
    });

    // ─── [SYNC APPLICANT COUNTS] ───
    // This ensures that even if the counter got de-synced (or for old data),
    // the recruiter sees the correct number.
    const Application = require("../models/Application");
    const updatedJobs = await Promise.all(jobs.map(async (job) => {
      const actualCount = await Application.countDocuments({ job: job._id });
      if (job.applicants !== actualCount) {
        job.applicants = actualCount;
        await job.save();
      }
      return job;
    }));

    res.json(updatedJobs);
  } catch (err) {
    console.log("GET MY JOBS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// ================= GET ALL ACTIVE JOBS (FOR SEEKERS) =================
router.get("/all-jobs", async (req, res) => {
  try {
    const jobs = await Job.find({ status: "Active" })
      .populate("recruiter", "name company_name email profilePhoto")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.log("GET ALL JOBS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// ================= GET SINGLE JOB =================
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch job" });
  }
});

// ================= UPDATE JOB =================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const recruiter = await Recruit.findOne({ email: req.user.email });
    if (!recruiter)
      return res.status(404).json({ message: "Recruiter not found" });

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Ensure the job belongs to this recruiter
    if (job.recruiter.toString() !== recruiter._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ message: "Job updated successfully", job: updated });
  } catch (err) {
    console.log("UPDATE JOB ERROR:", err);
    res.status(500).json({ message: "Failed to update job" });
  }
});

// ================= DELETE JOB =================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const recruiter = await Recruit.findOne({ email: req.user.email });
    if (!recruiter)
      return res.status(404).json({ message: "Recruiter not found" });

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.recruiter.toString() !== recruiter._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.log("DELETE JOB ERROR:", err);
    res.status(500).json({ message: "Failed to delete job" });
  }
});

module.exports = router;
