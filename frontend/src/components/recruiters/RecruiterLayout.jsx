import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import API from "../../api/ApiCheck";

const navItems = [
  { path: "/recruiter/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/recruiter/post-job", label: "Post Job", icon: "➕" },
  { path: "/recruiter/jobs", label: "My Jobs", icon: "📋" },
  { path: "/recruiter/applicants", label: "Applicants", icon: "👥" },
  { path: "/recruiter/profile", label: "Profile", icon: "👤" },
  { path: "/recruiter/notifications", label: "Notifications", icon: "🔔", badge: true },
];

const PAGE_TITLES = {
  "/recruiter/dashboard": "Dashboard",
  "/recruiter/post-job": "Post Job",
  "/recruiter/jobs": "My Jobs",
  "/recruiter/applicants": "Applicants",
  "/recruiter/profile": "Profile",
  "/recruiter/notifications": "Notifications",
};

export default function RecruiterLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [recruiter, setRecruiter] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await API.get("/recruiter/profile");
        setRecruiter(profileRes.data);
      } catch (err) {
        console.log("Recruiter profile fetch error:", err);
      }
    };

    const fetchNotifications = async () => {
      try {
        const notifRes = await API.get("/notifications");
        const unread = notifRes.data.filter((n) => !n.isRead).length || 0;
        setUnreadCount(unread);
      } catch (err) {
        console.log("Recruiter notifications fetch error:", err);
      }
    };

    fetchProfile();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const initial = recruiter?.name?.charAt(0)?.toUpperCase() || "R";
  const pageTitle = PAGE_TITLES[location.pathname] || "Dashboard";

  return (
    <div className="flex h-screen bg-[#f0f2f5] font-[Outfit] overflow-hidden">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-[rgba(13,27,42,0.55)]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static z-50 flex flex-col w-[260px] min-h-screen bg-[#0d1b2a] transition-transform duration-300 flex-shrink-0 shadow-2xl border-r border-white/5
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >

        {/* LOGO */}
        <div className="p-8 pb-10">
          <Link
            to="/recruiter/dashboard"
            className="flex items-center gap-3 no-underline group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-500/20 group-hover:rotate-6 transition-transform">
              J
            </div>
            <span className="font-black text-2xl text-white tracking-tighter uppercase">
              Job<span className="text-teal-500">mint</span>
            </span>
          </Link>
        </div>

        {/* NAV LINKS */}
        <nav className="flex-1 px-4 space-y-1.5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4 opacity-60">
            Navigation
          </p>

          {navItems.map(item => {
            const active =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm transition-all duration-300 no-underline group relative
                ${active
                    ? "bg-teal-500 text-white font-bold shadow-lg shadow-teal-500/20"
                    : "text-slate-400 font-bold hover:bg-white/5 hover:text-white"
                  }`}
              >
                <span className={`text-lg transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-slate-500'}`}>{item.icon}</span>
                <span className="tracking-tight">{item.label}</span>

                {item.badge && unreadCount > 0 && (
                  <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-white text-teal-600' : 'bg-red-500 text-white shadow-lg shadow-red-500/30'}`}>
                    {unreadCount}
                  </span>
                )}
                
                {active && (
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-sm"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* USER PREVIEW & LOGOUT */}
        <div className="p-4 mt-auto">
          <div className="bg-white/5 rounded-[2rem] p-4 border border-white/5 mb-4">
             <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500 font-black">
                   {initial}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="text-xs font-black text-white truncate uppercase tracking-wider">{recruiter?.name || "Recruiter"}</div>
                   <div className="text-[10px] text-slate-500 font-bold truncate">Verified Partner</div>
                </div>
             </div>
             <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black
              bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
            >
              LOGOUT 🚪
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TOPBAR */}
        <header className="flex items-center justify-between px-4 sm:px-6 h-[60px] bg-white border-b border-[#e8ecf0] flex-shrink-0">

          <div className="flex items-center gap-3">

            <button
              className="lg:hidden text-xl text-[#0d1b2a]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>

            <h1 className="text-[16px] font-bold text-[#0d1b2a]">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">

            {/* NOTIFICATION BELL */}
            <Link
              to="/recruiter/notifications"
              className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[#f0f2f5] text-[16px] no-underline"
            >
              🔔

              {unreadCount > 0 && (
                <span className="absolute -top-[3px] -right-[3px] w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* PROFILE CHIP */}
            <Link
              to="/recruiter/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f0f2f5] no-underline"
            >
              <div className="w-7 h-7 rounded-full bg-[#0d1b2a] text-[#0d9488] flex items-center justify-center text-[12px] font-extrabold">
                {initial}
              </div>

              <span className="hidden sm:inline text-[13px] font-semibold text-[#0d1b2a]">
                {recruiter?.name || "Recruiter"}
              </span>
            </Link>

          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}