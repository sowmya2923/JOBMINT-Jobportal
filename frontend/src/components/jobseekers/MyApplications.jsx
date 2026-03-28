import React, { useEffect, useState } from "react";
import API from "../../api/ApiCheck";
import { useNavigate } from "react-router-dom";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingApp, setTrackingApp] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const res = await API.get("/applications/seeker/my-applications");
      setApplications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    Pending: "bg-slate-100 text-slate-600 border-slate-200",
    Reviewed: "bg-blue-50 text-blue-600 border-blue-200",
    Accepted: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Rejected: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 font-[Outfit] pb-10">
      
      {/* HEADER SECTION */}
      <div className="bg-[#0d1b2a] rounded-2xl p-8 shadow-lg shadow-slate-200 border border-slate-800">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">My Applications</h1>
        <p className="text-slate-400 text-[15px]">
          Track the status of the {applications.length} jobs you've applied for.
        </p>
      </div>

      {/* JOBS GRID */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin text-teal-600 text-4xl">⚙️</div>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="font-bold text-[#0d1b2a] text-lg">No Applications Yet</h3>
          <p className="text-slate-500 text-sm mt-1">You haven't applied to any jobs. Go to Find Jobs to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-teal-200 transition-all flex flex-col relative group"
            >
              
              {/* STATUS BADGE REMOVED IN FAVOR OF TRACKER */}

              {/* COMPANY INFO / LOGO */}
              <div 
                className="flex items-center gap-4 mb-5 mt-2 cursor-pointer"
                onClick={() => navigate(`/jobseeker/job/${app.job?._id}`)}
              >
                {app.recruiter?.profilePhoto ? (
                  <img
                    src={
                      app.recruiter.profilePhoto.startsWith("data:image")
                        ? app.recruiter.profilePhoto
                        : `http://localhost:5000/uploads/${app.recruiter.profilePhoto}`
                    }
                    alt={app.job?.company}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.classList.remove('hidden');
                      e.target.nextSibling.classList.add('flex');
                    }}
                  />
                ) : null}
                {!app.recruiter?.profilePhoto && (
                  <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-bold text-2xl border border-teal-100 shadow-sm">
                    {app.job?.company?.charAt(0).toUpperCase() || "C"}
                  </div>
                )}
                {app.recruiter?.profilePhoto && (
                  <div className="hidden w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl items-center justify-center font-bold text-2xl border border-teal-100 shadow-sm">
                    {app.job?.company?.charAt(0).toUpperCase() || "C"}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-extrabold text-[#0d1b2a] text-[17px] leading-tight group-hover:text-teal-600 transition pr-4">
                    {app.job?.title || "Job Unavailable"}
                  </h3>
                  <p className="text-slate-500 text-[14px] font-medium mt-0.5">{app.job?.company || "Company Unavailable"}</p>
                </div>
              </div>

              {/* DETAILS */}
              <div className="flex flex-col gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-slate-500 font-medium">Location</span>
                  <span className="text-[13px] font-semibold text-[#0d1b2a]">{app.job?.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-slate-500 font-medium">Type</span>
                  <span className="text-[13px] font-semibold text-[#0d1b2a]">{app.job?.jobType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-slate-500 font-medium">Salary</span>
                  <span className="text-[13px] font-semibold text-[#0d1b2a]">{app.job?.salary}</span>
                </div>
              </div>

              {/* FOOTER & TRACKER BUTTON */}
              <div className="mt-auto pt-4 flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Status</span>
                    <span className={`text-[13px] font-extrabold ${app.status === 'Rejected' ? 'text-red-500' : 'text-teal-600'}`}>
                      {app.status}
                    </span>
                  </div>
                  <button 
                    onClick={() => setTrackingApp(app)}
                    className="bg-[#0d1b2a] text-white px-5 py-2 rounded-xl text-[12px] font-bold hover:bg-teal-600 transition shadow-md shadow-slate-200"
                  >
                    Track Status
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* TRACKING MODAL */}
      {trackingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0d1b2a]/80 backdrop-blur-sm" onClick={() => setTrackingApp(null)}></div>
          
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-extrabold text-[#0d1b2a] tracking-tight">Application Tracker</h2>
                  <p className="text-slate-500 font-medium mt-1">Ref ID: {trackingApp._id.slice(-8).toUpperCase()}</p>
                </div>
                <button onClick={() => setTrackingApp(null)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition text-2xl">×</button>
              </div>

              <div className="flex flex-col md:flex-row gap-8 mb-12">
                <div className="w-20 h-20 bg-teal-50 rounded-[2rem] flex items-center justify-center text-3xl shadow-inner border border-teal-100">
                  {trackingApp.job?.company?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#0d1b2a] mb-1">{trackingApp.job?.title}</h3>
                  <p className="text-teal-600 font-bold">{trackingApp.job?.company}</p>
                  <p className="text-slate-400 text-sm mt-2 flex items-center gap-1.5">
                    📅 Applied on {new Date(trackingApp.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* IMPACTFUL STEPPER */}
              <div className="relative pl-8 border-l-2 border-slate-100 space-y-12 pb-4 ml-4">
                {[
                  { label: "Application Submitted", date: new Date(trackingApp.appliedAt).toLocaleDateString(), desc: "Your application has been successfully sent to the employer.", active: true },
                  { label: "Under Review", date: trackingApp.status !== "Pending" ? "Recently" : "Pending", desc: "The recruitment team is reviewing your profile and qualifications.", active: trackingApp.status !== "Pending" },
                  { 
                    label: trackingApp.status === "Rejected" ? "Application Rejected" : "Interview / Selection", 
                    date: trackingApp.status === "Accepted" || trackingApp.status === "Rejected" ? "Completed" : "Awaiting", 
                    desc: trackingApp.status === "Rejected" ? "We regret to inform you that the company is not moving forward." : "Congratulations! You have been shortlisted for the next round.",
                    active: trackingApp.status === "Accepted" || trackingApp.status === "Rejected",
                    error: trackingApp.status === "Rejected" 
                  }
                ].map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-11 top-0 w-6 h-6 rounded-full border-4 bg-white z-10 ${step.active ? (step.error ? 'border-red-500' : 'border-teal-500') : 'border-slate-200'}`}></div>
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-extrabold uppercase tracking-widest ${step.active ? (step.error ? 'text-red-500' : 'text-[#0d1b2a]') : 'text-slate-300'}`}>{step.label}</span>
                        <span className="text-[11px] font-bold text-slate-400">{step.date}</span>
                      </div>
                      <p className={`text-[14px] leading-relaxed ${step.active ? 'text-slate-500' : 'text-slate-300'}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
