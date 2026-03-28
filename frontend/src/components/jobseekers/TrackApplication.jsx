import React, { useEffect, useState } from "react";
import API from "../../api/ApiCheck";

export default function TrackApplication() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const res = await API.get("/applications/seeker/my-applications");
      setApplications(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedApp(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin text-teal-600 text-4xl">⚙️</div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
        <div className="text-6xl mb-6">📦</div>
        <h3 className="text-2xl font-black text-[#0d1b2a]">No Shipments... yet!</h3>
        <p className="text-slate-500 mt-2">Apply for jobs to start tracking your professional journey.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 font-[Outfit] pb-10">
      
      {/* LEFT SIDE: LIST OF APPLICATIONS */}
      <div className="lg:w-[350px] flex flex-col gap-4">
        <h2 className="text-xl font-black text-[#0d1b2a] mb-2 px-1">Your Applications</h2>
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <button
              key={app._id}
              onClick={() => setSelectedApp(app)}
              className={`p-5 rounded-2xl flex flex-col gap-1 text-left transition-all border ${
                selectedApp?._id === app._id 
                  ? "bg-[#0d1b2a] text-white border-[#0d1b2a] shadow-lg scale-[1.02]" 
                  : "bg-white text-slate-700 border-slate-200 hover:border-teal-400"
              }`}
            >
              <div className="font-bold truncate text-[15px]">{app.job?.title}</div>
              <div className={`text-[12px] ${selectedApp?._id === app._id ? "text-teal-400" : "text-slate-500"}`}>
                {app.job?.company}
              </div>
              <div className={`mt-2 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block w-fit ${
                selectedApp?._id === app._id ? "bg-white/10 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {app.status}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE: DELIVERY STYLE TRACKER */}
      <div className="flex-1 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
        {selectedApp ? (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-8 border-b border-slate-50">
               <div>
                  <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1 block">Application ID: {selectedApp._id.slice(-8).toUpperCase()}</span>
                  <h3 className="text-3xl font-black text-[#0d1b2a] tracking-tight">{selectedApp.job?.title}</h3>
                  <p className="text-slate-500 font-medium">at <span className="text-[#0d1b2a] font-bold">{selectedApp.job?.company}</span></p>
               </div>
               <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-slate-50">
                    {selectedApp.job?.company?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Expected Update</div>
                    <div className="text-sm font-bold text-[#0d1b2a]">Within 3-5 Days</div>
                  </div>
               </div>
            </div>

            {/* TRACKING PROGRESS */}
            <div className="relative pl-12 border-l-4 border-slate-100 space-y-16 ml-4">
              {[
                { 
                  title: "Application Received", 
                  status: "Your application has been logged in our system and is ready for initial screening.",
                  date: new Date(selectedApp.appliedAt).toLocaleString(),
                  active: true 
                },
                { 
                  title: "Recruiter Review", 
                  status: "A hiring manager is currently reviewing your profile, portfolio, and resume.",
                  date: selectedApp.status !== "Pending" ? "Recently Updated" : "Ongoing",
                  active: selectedApp.status !== "Pending"
                },
                { 
                  title: selectedApp.status === "Rejected" ? "Outcome Decided" : "Final Decision", 
                  status: selectedApp.status === "Accepted" 
                    ? "Congratulations! You've successfully cleared the screening. The recruiter will contact you for next steps." 
                    : selectedApp.status === "Rejected" 
                      ? "Thank you for your interest. Unfortunately, the company is not moving forward at this time."
                      : "The final decision is pending after complete evaluation of all candidates.",
                  date: selectedApp.status === "Accepted" || selectedApp.status === "Rejected" ? "Completed" : "Awaiting",
                  active: selectedApp.status === "Accepted" || selectedApp.status === "Rejected",
                  error: selectedApp.status === "Rejected"
                }
              ].map((step, i) => (
                <div key={i} className="relative">
                  {/* ICON INDICATOR */}
                  <div className={`absolute -left-[60px] top-0 w-10 h-10 rounded-full border-4 bg-white z-10 flex items-center justify-center transition-all ${
                    step.active ? (step.error ? "border-red-500 bg-red-50 text-red-500 scale-110" : "border-[#0d9488] bg-teal-50 text-[#0d9488] scale-110 shadow-lg shadow-teal-100") : "border-slate-200 text-slate-300"
                  }`}>
                    {i === 0 ? "📝" : i === 1 ? "🔍" : i === 2 ? (step.error ? "❌" : "🏆") : "•"}
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
                      <h4 className={`text-lg font-black tracking-tight ${step.active ? 'text-[#0d1b2a]' : 'text-slate-300'}`}>
                        {step.title}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 h-fit">
                        {step.date}
                      </span>
                    </div>
                    <p className={`text-[15px] leading-relaxed max-w-lg ${step.active ? 'text-slate-500' : 'text-slate-300 opacity-60'}`}>
                      {step.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 p-6 bg-teal-50 border border-teal-100 rounded-2xl flex items-center gap-4">
              <span className="text-2xl">💡</span>
              <p className="text-[13px] text-teal-800 font-medium">
                <strong>Pro Tip:</strong> Keep your profile updated. Recruiters check recent activity and profile completeness when moving candidates to the next round.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            Select an application to see details
          </div>
        )}
      </div>

    </div>
  );
}
