import React, { useContext, useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../../api/ApiCheck";

export default function JobSeekerLayout() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await API.get("/notifications");
        setUnreadCount(res.data.filter(n => !n.isRead).length);
      } catch (err) {
        console.error("Failed to fetch notifications");
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/jobseeker/dashboard", icon: "📊" },
    { name: "Find Jobs", path: "/jobseeker/jobs", icon: "🔍" },
    { name: "My Applications", path: "/jobseeker/applications", icon: "📝" },
    { name: "Track Status", path: "/jobseeker/track", icon: "🚚" },
    { name: "Notifications", path: "/jobseeker/notifications", icon: "🔔", badge: unreadCount },
    { name: "Profile", path: "/jobseeker/profile", icon: "👤" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-[Outfit] overflow-hidden">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:static inset-y-0 left-0 bg-[#0d1b2a] w-[260px] text-white flex flex-col transition-transform duration-300 z-30 shadow-2xl border-r border-white/5
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-8 pb-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-500/20">
               J
             </div>
             <span className="font-black text-2xl text-white tracking-tighter uppercase">
               Job<span className="text-teal-500">mint</span>
             </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1.5 no-scrollbar">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4 opacity-60">
            Main Menu
          </h3>
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm transition-all duration-300 no-underline group relative
                  ${
                    isActive
                      ? "bg-teal-500 text-white font-bold shadow-lg shadow-teal-500/20"
                      : "text-slate-400 font-bold hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <div className="flex items-center gap-3.5 flex-1 transition-transform group-hover:translate-x-1">
                  <span className={`text-lg ${item.badge > 0 ? 'animate-pulse' : ''}`}>{item.icon}</span>
                  <span className="tracking-tight">{item.name}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-red-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* USER PREVIEW & LOGOUT */}
        <div className="p-4 border-t border-white/5">
           <div className="bg-white/5 rounded-[2rem] p-4 border border-white/5">
              <div className="flex items-center gap-3 mb-4 px-2">
                 <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500 font-black">
                    {user?.name?.charAt(0).toUpperCase() || "J"}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-white truncate uppercase tracking-wider">{user?.name || "Job Seeker"}</div>
                    <div className="text-[10px] text-slate-500 font-bold truncate">Premium Member</div>
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f4f7fa]">
        {/* MOBILE HEADER */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-600 p-1"
            >
              ☰
            </button>
            <span className="font-extrabold text-[18px] text-[#0d1b2a]">
              JOBMINT
            </span>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
