import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/ApiCheck";

const LETTER_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899"];

export default function RecruiterDashboard() {
  const [recruiter, setRecruiter] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [totalApps, setTotalApps] = useState(0);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    API.get("/recruiter/profile")
      .then((r) => setRecruiter(r.data))
      .catch(() => {});
    API.get("/jobs/my-jobs")
      .then((r) => setJobs(r.data || []))
      .catch(() => {});
    API.get("/applications/recruiter/all-applicants")
      .then((r) => setTotalApps((r.data || []).length))
      .catch(() => {});
  }, []);

  const name       = recruiter?.name?.split(" ")[0] || "Recruiter";
  const activeJobs = jobs.filter((j) => j.status === "Active").length;
  const recentJobs = jobs.slice(0, 4);

  return (
    <div className="font-[Outfit] pb-20">

      {/* WELCOME */}
      <div className="mb-6">
        <h2 className="text-[clamp(1.25rem,3vw,1.65rem)] font-extrabold text-[#0d1b2a] tracking-[-0.3px]">
          Good morning, <span className="text-teal-600">{name}</span> 👋
        </h2>
        <p className="text-[13px] text-gray-400 mt-1">{today}</p>
      </div>

      {/* PERFORMANCE & STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {/* HIRING PERFORMANCE CARD */}
        <div className="lg:col-span-1 bg-[#0d1b2a] text-white rounded-[20px] p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl group-hover:bg-teal-500/30 transition-all duration-700"></div>
          <div className="relative z-10">
            <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest block mb-2">Hiring Performance</span>
            <div className="text-5xl font-black tracking-tight mb-2">94%</div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold">
               <span>↑ 12%</span>
               <span className="text-slate-400 font-medium">vs last month</span>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-400 uppercase">Efficiency</span>
                <span>High</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full w-[94%] shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { num: activeJobs, label: "Active Roles", icon: "💎", color: "bg-blue-50 text-blue-600", trend: "Recruiting" },
            { num: totalApps, label: "Total Candidates", icon: "🔥", color: "bg-emerald-50 text-emerald-600", trend: "+24 today" },
            { num: "4.2d", label: "Avg. Time to Hire", icon: "⚡", color: "bg-amber-50 text-amber-600", trend: "Speedy" },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-[#e8ecf0] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all group">
               <div className={`w-12 h-12 ${s.color} rounded-[14px] flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition duration-300`}>
                 {s.icon}
               </div>
               <div className="text-3xl font-black text-[#0d1b2a] tracking-tight">{s.num}</div>
               <div className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mt-1">{s.label}</div>
               <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[11px] font-black text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">{s.trend}</span>
                </div>
            </div>
          ))}
        </div>
      </div>

      {/* PANELS */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-5">

        {/* RECENT JOBS */}
        <div className="bg-white border border-[#e8ecf0] rounded-[14px] p-[22px_24px]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[15px] font-bold text-[#0d1b2a]">Recent Job Postings</h3>
            <Link to="/recruiter/jobs" className="text-[13px] font-semibold text-teal-600 no-underline">
              View All
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <div className="text-3xl mb-2">📋</div>
              No jobs yet.{" "}
              <Link to="/recruiter/post-job" className="text-teal-600 font-semibold no-underline">
                Post one
              </Link>
            </div>
          ) : recentJobs.map((j, i) => (
            <div key={j._id}
              className={`flex items-center gap-4 py-3.5 ${i < recentJobs.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div className="w-10 h-10 rounded-[10px] text-white flex items-center justify-center font-bold text-base shrink-0"
                style={{ background: LETTER_COLORS[j.title.charCodeAt(0) % LETTER_COLORS.length] }}>
                {j.title[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#0d1b2a] truncate">{j.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{j.jobType}</div>
              </div>
              <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full shrink-0">
                {j.applicants > 0 ? `${j.applicants} applicants` : "No applicants yet"}
              </span>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white border border-[#e8ecf0] rounded-[14px] p-[22px_24px]">
          <h3 className="text-[15px] font-bold text-[#0d1b2a] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "📝", label: "Post New Job", to: "/recruiter/post-job" },
              { icon: "📋", label: "My Jobs",       to: "/recruiter/jobs" },
              { icon: "🔔", label: "Notifications", to: "/recruiter/notifications" },
              { icon: "⚙️", label: "Edit Profile",  to: "/recruiter/profile" },
            ].map((a, i) => (
              <Link key={i} to={a.to}
                className="flex flex-col items-center justify-center gap-2 rounded-xl p-[18px_10px] bg-gray-100 border border-[#e8ecf0] text-[#0d1b2a] hover:bg-[#0d1b2a] hover:text-white hover:border-[#0d1b2a] transition-all no-underline">
                <span className="text-[22px]">{a.icon}</span>
                <span className="text-[12px] font-semibold text-center">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
