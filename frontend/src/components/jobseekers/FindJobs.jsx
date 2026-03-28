import React, { useEffect, useState } from "react";
import API from "../../api/ApiCheck";
import { useNavigate } from "react-router-dom";

export default function FindJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [filterJobType, setFilterJobType] = useState("All");
  const [applying, setApplying] = useState(null); // stores jobId being applied to
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const res = await API.get("/applications/seeker/my-applications");
      const appJobIds = new Set(res.data.map((app) => app.job?._id || app.job));
      setAppliedJobs(appJobIds);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs/all-jobs");
      setJobs(res.data || []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e, jobId) => {
    e.stopPropagation();
    if (appliedJobs.has(jobId)) {
      alert("You have already applied to this job.");
      return;
    }
    setApplying(jobId);
    try {
      const res = await API.post(`/applications/apply/${jobId}`);
      alert(res.data.message || "Application submitted successfully!");
      setAppliedJobs((prev) => new Set([...prev, jobId]));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setApplying(null);
    }
  };

  const filteredJobs = jobs.filter(
    (job) => {
      const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.skills.some((skill) => skill.toLowerCase().includes(search.toLowerCase()));
      
      const matchesLocation = job.location.toLowerCase().includes(searchLocation.toLowerCase());
      const matchesType = filterJobType === "All" || job.jobType === filterJobType;
      
      return matchesSearch && matchesLocation && matchesType;
    }
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 font-[Outfit] pb-10">
      
      {/* HEADER SECTION */}
      <div className="bg-[#0d1b2a] rounded-2xl p-6 md:p-8 shadow-lg shadow-slate-200 border border-slate-800 flex flex-col items-center justify-between gap-6">
        <div className="text-white text-center md:text-left w-full">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Find Your Dream Job</h1>
          <p className="text-slate-400 text-[14px] md:text-[15px]">
            Explore {jobs.length} active opportunities from top companies.
          </p>
        </div>
        
        <div className="w-full flex flex-col md:flex-row gap-3">
          <div className="relative flex-[1.5]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              🔍
            </span>
            <input
              type="text"
              placeholder="Title, Company, Skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-teal-400 transition text-sm"
            />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              📍
            </span>
            <input
              type="text"
              placeholder="Location..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-teal-400 transition text-sm"
            />
          </div>
          <select 
            className="bg-[#0d1b2a] border border-white/20 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-teal-400 transition cursor-pointer text-sm font-semibold h-full md:w-auto"
            value={filterJobType}
            onChange={(e) => setFilterJobType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
      </div>

      {/* JOBS GRID */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin text-teal-600 text-4xl">⚙️</div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-bold text-[#0d1b2a] text-lg">No jobs found</h3>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              onClick={() => navigate(`/jobseeker/job/${job._id}`)}
              className="cursor-pointer bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-teal-200 transition-all group flex flex-col"
            >
              {/* COMPANY INFO / LOGO */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {job.recruiter?.profilePhoto ? (
                    <img
                      src={
                        job.recruiter.profilePhoto.startsWith("data:image")
                          ? job.recruiter.profilePhoto
                          : `http://localhost:5000/uploads/${job.recruiter.profilePhoto}`
                      }
                      alt={job.company}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.classList.remove('hidden');
                        e.target.nextSibling.classList.add('flex');
                      }}
                    />
                  ) : null}
                  {!job.recruiter?.profilePhoto && (
                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-bold text-xl border border-teal-100">
                      {job.company?.charAt(0).toUpperCase() || "C"}
                    </div>
                  )}
                  {job.recruiter?.profilePhoto && (
                    <div className="hidden w-12 h-12 bg-teal-50 text-teal-600 rounded-xl items-center justify-center font-bold text-xl border border-teal-100">
                      {job.company?.charAt(0).toUpperCase() || "C"}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-[#0d1b2a] text-[16px] leading-tight group-hover:text-teal-600 transition">
                      {job.title}
                    </h3>
                    <p className="text-slate-500 text-[13px]">{job.company}</p>
                  </div>
                </div>
              </div>

              {/* PILLS */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5">
                  📍 {job.location}
                </span>
                <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5">
                  💼 {job.jobType}
                </span>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5">
                  💵 {job.salary}
                </span>
              </div>

              {/* SKILLS */}
              <div className="mb-4 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills?.slice(0, 4).map((skill, i) => (
                    <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium">
                      {skill}
                    </span>
                  ))}
                  {job.skills?.length > 4 && (
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[11px] font-medium">
                      +{job.skills.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* FOOTER & APPLY BTN */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <span className="text-[12px] text-slate-400 font-medium">
                  {job.experience} exp
                </span>
                <button 
                  className={`px-5 py-2 rounded-lg text-[13px] font-bold transition shadow-sm ${
                    appliedJobs.has(job._id)
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-[#0d1b2a] text-white hover:bg-teal-600 disabled:opacity-50"
                  }`}
                  onClick={(e) => handleApply(e, job._id)}
                  disabled={appliedJobs.has(job._id) || applying === job._id}
                >
                  {appliedJobs.has(job._id) ? "Applied" : applying === job._id ? "Applying..." : "Apply Now"}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
