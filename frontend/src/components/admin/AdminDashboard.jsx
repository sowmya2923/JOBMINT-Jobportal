import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../../api/ApiCheck";

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Admin stats fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const adminName = user?.name || "Admin";

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-[Outfit]">

      {/* HEADER */}
      <header className="bg-[#0d1b2a] text-white px-6 md:px-10 py-5 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-teal-500/20">
            A
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">
            Admin<span className="text-teal-400">Workspace</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-slate-400 font-semibold">
            Welcome, {adminName}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl font-bold text-sm transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 p-6 md:p-10 lg:px-20">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-[#0d1b2a] tracking-tight">
            Platform Overview
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Real-time stats from your JobMint platform
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin text-teal-600 text-4xl">⚙️</div>
          </div>
        ) : !stats ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <p className="text-slate-500">Failed to load stats. Please ensure you are logged in as admin.</p>
          </div>
        ) : (
          <>
            {/* STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { label: "Recruiters", value: stats.recruiters, icon: "🏢", color: "bg-slate-50 text-[#0d1b2a]" },
                { label: "Job Seekers", value: stats.seekers, icon: "👨‍💻", color: "bg-teal-50 text-teal-600" },
                { label: "Total Jobs", value: stats.totalJobs, icon: "💼", sub: `${stats.activeJobs} active`, color: "bg-amber-50 text-amber-600" },
                { label: "Applications", value: stats.totalApplications, icon: "📄", color: "bg-emerald-50 text-emerald-600" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white p-7 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition duration-300 group"
                >
                  <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                  <h4 className="text-3xl font-black text-[#0d1b2a]">{stat.value.toLocaleString()}</h4>
                  {stat.sub && (
                    <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                      {stat.sub}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* CONTENT PANELS */}
            <div className="grid lg:grid-cols-2 gap-6">

              {/* RECENT JOBS */}
              <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm">
                <h3 className="text-[15px] font-extrabold text-[#0d1b2a] mb-5 uppercase tracking-wider">
                  Recent Job Postings
                </h3>
                {stats.recentJobs && stats.recentJobs.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentJobs.map((job, i) => (
                      <div
                        key={job._id || i}
                        className={`flex items-center justify-between py-3 ${i < stats.recentJobs.length - 1 ? "border-b border-slate-50" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-black text-sm">
                            {job.title?.charAt(0).toUpperCase() || "J"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0d1b2a] leading-tight">{job.title}</p>
                            <p className="text-xs text-slate-400">{job.company}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          job.status === "Active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-8">No jobs posted yet.</p>
                )}
              </div>

              {/* RECENT APPLICATIONS */}
              <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm">
                <h3 className="text-[15px] font-extrabold text-[#0d1b2a] mb-5 uppercase tracking-wider">
                  Recent Applications
                </h3>
                {stats.recentApplications && stats.recentApplications.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentApplications.map((app, i) => (
                      <div
                        key={app._id || i}
                        className={`flex items-center justify-between py-3 ${i < stats.recentApplications.length - 1 ? "border-b border-slate-50" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-black text-sm">
                            {app.jobseeker?.name?.charAt(0).toUpperCase() || "S"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0d1b2a] leading-tight">
                              {app.jobseeker?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-slate-400">
                              Applied for {app.job?.title || "a job"}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-500">
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-8">No applications yet.</p>
                )}
              </div>
            </div>

            {/* USER MANAGEMENT */}
            <div className="grid lg:grid-cols-2 gap-6 mt-10">
              
              {/* MANAGE RECRUITERS */}
              <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm">
                <h3 className="text-[15px] font-extrabold text-[#0d1b2a] mb-5 uppercase tracking-wider">
                  Manage Recruiters
                </h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                  {stats.allRecruiters?.map((rec) => (
                    <div key={rec._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-[#0d1b2a]">{rec.name}</p>
                        <p className="text-xs text-slate-500">{rec.company_name} • {rec.email}</p>
                      </div>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Delete recruiter ${rec.name} and all their jobs?`)) {
                            try {
                              await API.delete(`/admin/recruiter/${rec._id}`);
                              setStats(prev => ({
                                ...prev,
                                allRecruiters: prev.allRecruiters.filter(r => r._id !== rec._id),
                                recruiters: prev.recruiters - 1
                              }));
                            } catch (err) { alert("Failed to delete"); }
                          }
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        title="Delete Recruiter"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  {(!stats.allRecruiters || stats.allRecruiters.length === 0) && (
                    <p className="text-slate-400 text-sm text-center py-4">No recruiters found.</p>
                  )}
                </div>
              </div>

              {/* MANAGE SEEKERS */}
              <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm">
                <h3 className="text-[15px] font-extrabold text-[#0d1b2a] mb-5 uppercase tracking-wider">
                  Manage Job Seekers
                </h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                  {stats.allSeekers?.map((seeker) => (
                    <div key={seeker._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-[#0d1b2a]">{seeker.name}</p>
                        <p className="text-xs text-slate-500">{seeker.email}</p>
                      </div>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Delete job seeker ${seeker.name}?`)) {
                            try {
                              await API.delete(`/admin/seeker/${seeker._id}`);
                              setStats(prev => ({
                                ...prev,
                                allSeekers: prev.allSeekers.filter(s => s._id !== seeker._id),
                                seekers: prev.seekers - 1
                              }));
                            } catch (err) { alert("Failed to delete"); }
                          }
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        title="Delete Seeker"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  {(!stats.allSeekers || stats.allSeekers.length === 0) && (
                    <p className="text-slate-400 text-sm text-center py-4">No job seekers found.</p>
                  )}
                </div>
              </div>

            </div>

            {/* SYSTEM STATUS */}
            <div className="mt-8 bg-[#0d1b2a] text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl shadow-teal-500/30">
                  ⚡
                </div>
                <div>
                  <h3 className="text-lg font-extrabold">System Status: Operational</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    All services running. {stats.totalJobs} jobs &amp; {stats.totalApplications} applications tracked.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-teal-500/10 text-teal-400 font-bold px-5 py-3 rounded-xl text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
                Platform Active
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
