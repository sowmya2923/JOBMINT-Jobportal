import React, { useEffect, useState } from "react";
import API from "../../api/ApiCheck";

const iconForType = (type) => {
  switch (type) {
    case "application": return { icon: "👤", bg: "bg-blue-50", color: "text-blue-500" };
    case "status_update": return { icon: "✅", bg: "bg-teal-50", color: "text-teal-600" };
    case "interview":   return { icon: "📅", bg: "bg-yellow-50", color: "text-yellow-600" };
    default:            return { icon: "🔔", bg: "bg-slate-50", color: "text-slate-500" };
  }
};

export default function RecruiterNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications", err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read", err);
    }
  };

  const markRead = async (id, isRead) => {
    if (isRead) return; 
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking as read", err);
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation(); // prevent markRead trigger
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error("Error deleting notification", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-xl w-full font-[Outfit]">

      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between mb-6 gap-4">

        <div>
           <h2 className="flex items-center gap-2 text-[18px] font-extrabold text-[#0d1b2a] tracking-[-0.3px]">
             Notifications
             {unreadCount > 0 && (
               <span className="text-[11px] font-bold bg-[#0d1b2a] text-[#0d9488] px-[10px] py-[3px] rounded-full">
                 {unreadCount} new
               </span>
             )}
           </h2>
          <p className="text-[13px] text-slate-400 mt-1">
            Stay on top of your hiring activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[13px] font-semibold px-4 py-2 rounded-[9px]
            border border-[#e8ecf0] bg-white text-slate-600
            hover:border-[#0d1b2a] hover:text-[#0d1b2a]
            transition whitespace-nowrap"
          >
            ✓ Mark all read
          </button>
        )}

      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400 text-sm">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-[#e8ecf0] rounded-2xl py-[60px] px-6 text-center">
          <div className="text-[44px] opacity-25 mb-3.5">🔕</div>
          <h3 className="text-[16px] font-bold text-[#0d1b2a] mb-1.5">
            All caught up!
          </h3>
          <p className="text-[14px] text-slate-400">
            You have no notifications right now.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map(notif => {
            const { icon, bg, color } = iconForType(notif.type);

            return (
              <div
                key={notif._id}
                onClick={() => markRead(notif._id, notif.isRead)}
                className={`flex items-start gap-4 bg-white rounded-xl px-4 py-[14px]
                border hover:shadow-md transition cursor-pointer
                ${!notif.isRead ? "border-l-4 border-l-[#0d9488] border-y-[#e8ecf0] border-r-[#e8ecf0]" : "border-[#e8ecf0]"}`}
              >
                {/* ICON */}
                <div className={`w-[42px] h-[42px] rounded-[11px] flex items-center justify-center text-[18px] shrink-0 ${bg} ${color}`}>
                  {icon}
                </div>

                {/* TEXT */}
                <div className="flex-1 min-w-0">
                  <div className={`text-[14px] text-[#0d1b2a] ${!notif.isRead ? "font-bold" : "font-medium"}`}>
                    {notif.title}
                  </div>
                  <div className="text-[13px] text-slate-500 mt-0.5 line-clamp-2">
                    {notif.message}
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-400">
                    🕐 {new Date(notif.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* UNREAD DOT */}
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-[#0d9488] shrink-0 mt-3" />
                )}

                {/* DELETE BUTTON */}
                <button
                  onClick={(e) => deleteNotification(e, notif._id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                  title="Delete Notification"
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}