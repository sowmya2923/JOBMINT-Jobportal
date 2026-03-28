import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/ApiCheck";
import { AuthContext } from "../context/AuthContext";

export default function JobSeekerDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalApps: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    unreadNotifs: 0
  });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appRes, notifRes] = await Promise.all([
          API.get("/applications/seeker/my-applications"),
          API.get("/notifications")
        ]);

        const apps = appRes.data || [];
        const notifs = notifRes.data || [];

        setStats({
          totalApps: apps.length,
          pending: apps.filter(a => a.status === "Pending").length,
          accepted: apps.filter(a => a.status === "Accepted").length,
          rejected: apps.filter(a => a.status === "Rejected").length,
          unreadNotifs: notifs.filter(n => !n.isRead).length
        });

        setRecentApps(apps.slice(0, 3));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const name = user?.name?.split(" ")[0] || "Seeker";

  return (
    <div className="font-[Outfit] pb-20">
      {/* WELCOME */}
      <div className="mb-8">
        <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-extrabold text-[#0d1b2a] tracking-tight">
          Welcome back, <span className="text-teal-600">{name}!</span> ✨
        </h2>
        <p className="text-slate-500 mt-1">Here is what's happening with your job search today.</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Total Applications", value: stats.totalApps, icon: "📁", color: "bg-blue-50 text-blue-600" },
          { label: "Pending Review", value: stats.pending, icon: "⏳", color: "bg-amber-50 text-amber-600" },
          { label: "Interviews/Accepted", value: stats.accepted, icon: "🎉", color: "bg-emerald-50 text-emerald-600" },
          { label: "Unread Alerts", value: stats.unreadNotifs, icon: "🔔", color: "bg-purple-50 text-purple-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition group">
            <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition duration-300`}>
              {s.icon}
            </div>
            <div className="text-3xl font-extrabold text-[#0d1b2a]">{s.value}</div>
            <div className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* RECENT APPLICATIONS */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-[#0d1b2a] text-lg">Recent Applications</h3>
            <Link to="/jobseeker/applications" className="text-teal-600 text-sm font-bold hover:underline">View All</Link>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl"></div>)}
            </div>
          ) : recentApps.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-400 mb-4">No applications yet. Start your journey!</p>
              <button 
                onClick={() => navigate("/jobseeker/jobs")}
                className="bg-[#0d1b2a] text-white px-6 py-2.5 rounded-xl font-bold"
              >
                Find Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApps.map((app) => (
                <div key={app._id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition cursor-pointer" onClick={() => navigate(`/jobseeker/job/${app.job?._id}`)}>
                   <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-bold text-xl border border-teal-100">
                    {app.job?.company?.charAt(0) || "C"}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#0d1b2a] leading-tight">{app.job?.title}</h4>
                    <p className="text-slate-500 text-xs mt-1">{app.job?.company}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                    app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 
                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {app.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="space-y-6">
          <div className="bg-[#0d1b2a] text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
             <div className="absolute -right-6 -top-6 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl"></div>
             <h3 className="font-bold text-lg mb-2 relative z-10">Complete Your Profile</h3>
             <p className="text-slate-400 text-sm mb-5 relative z-10">Companies are 2x more likely to contact candidates with 100% profile completion.</p>
             <button onClick={() => navigate("/jobseeker/profile")} className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 rounded-xl transition relative z-10">
                Update Profile
             </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-[#0d1b2a] mb-4">Job Search Tip</h3>
            <div className="flex gap-4">
              <div className="text-2xl">💡</div>
              <p className="text-slate-500 text-[13px] leading-relaxed">
                Add <strong>Keywords</strong> from the job description into your skills section to improve your match score with recruiters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
