import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/ApiCheck";
import { AuthContext } from "./context/AuthContext";

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    fetchJob();
    if (user?.role === "jobseeker") {
      checkIfApplied();
    }
  }, [jobId, user]);

  const fetchJob = async () => {
    try {
      const res = await API.get(`/jobs/${jobId}`);
      setJob(res.data);
    } catch (err) {
      console.error("Failed to fetch job", err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const res = await API.get("/applications/seeker/my-applications");
      const appJobIds = res.data.map((app) => (app.job?._id || app.job));
      if (appJobIds.includes(jobId)) {
        setApplied(true);
      }
    } catch (err) {
      console.error("Failed to check application status", err);
    }
  };

  const handleApply = async () => {
    if (applied) return;
    setApplying(true);
    try {
      const res = await API.post(`/applications/apply/${jobId}`);
      alert(res.data.message || "Application submitted successfully!");
      setApplied(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="animate-spin text-teal-600 text-4xl">⚙️</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20 text-slate-500 font-[Outfit]">
        Job not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto font-[Outfit] pb-10 px-4 mt-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-600 transition mb-6"
      >
        ← Back
      </button>

      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#0d1b2a] p-8 md:p-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="flex items-center gap-5 relative z-10 w-full mb-2">
            <div className="w-16 h-16 bg-teal-500 text-white rounded-2xl flex items-center justify-center font-bold text-3xl shadow-lg border border-teal-400">
              {job.company?.charAt(0).toUpperCase() || "C"}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {job.title}
              </h1>
              <p className="text-slate-400 mt-1 text-lg">
                {job.company} • {job.location}
              </p>
            </div>
          </div>

          {user?.role === "jobseeker" && (
            <button
              onClick={handleApply}
              disabled={applying || applied}
              className={`relative z-10 w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-[15px] transition shadow-xl whitespace-nowrap ${
                applied 
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none" 
                  : "bg-teal-500 text-white hover:bg-teal-400 shadow-teal-500/20"
              }`}
            >
              {applied ? "Applied" : applying ? "Applying..." : "Apply Now"}
            </button>
          )}
        </div>

        {/* DETAILS GRID */}
        <div className="p-8 md:p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 pb-10 border-b border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Job Type</p>
              <p className="font-semibold text-[#0d1b2a]">{job.jobType}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Experience</p>
              <p className="font-semibold text-[#0d1b2a]">{job.experience || "Not specified"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Salary</p>
              <p className="font-semibold text-[#0d1b2a]">{job.salary || "Not specified"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Posted</p>
              <p className="font-semibold text-[#0d1b2a]">{new Date(job.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-bold text-[#0d1b2a] mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills?.length > 0 ? (
                  job.skills.map((s, i) => (
                    <span key={i} className="bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-sm font-semibold border border-teal-100">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-sm">No specific skills listed.</span>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0d1b2a] mb-4">Job Description</h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                {job.description || "No description provided."}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0d1b2a] mb-4">Requirements</h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                {job.requirements || "No requirements provided."}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
