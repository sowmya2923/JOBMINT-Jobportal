import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../api/ApiCheck";
import Swal from "sweetalert2";

export default function RecruiterApplicants() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      const res = await API.get(`/applications/recruiter/job/${jobId}`);
      setJobTitle(res.data.jobTitle);
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error("Failed to fetch applicants:", err);
      setJobTitle("Error loading job");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, newStatus) => {
    try {
      const res = await API.put(`/applications/recruiter/${appId}/status`, { status: newStatus });
      Swal.fire({
        title: 'Status Updated',
        text: res.data.message,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      // Update local state
      setApplications(prev => prev.map(app => app._id === appId ? { ...app, status: newStatus } : app));
    } catch (err) {
      console.error("Update status failed", err);
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-slate-100 text-slate-700 border-slate-300";
      case "Reviewed": return "bg-blue-50 text-blue-700 border-blue-300";
      case "Shortlisted": return "bg-purple-50 text-purple-700 border-purple-300";
      case "Accepted": return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "Rejected": return "bg-red-50 text-red-700 border-red-300";
      default: return "bg-slate-100";
    }
  };

  const scheduleInterview = async (appId) => {
    const { value: formValues } = await Swal.fire({
      title: 'Schedule Interview',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Round (e.g. Round 1: Technical)">' +
        '<input id="swal-input2" type="date" class="swal2-input">' +
        '<input id="swal-input3" type="time" class="swal2-input" title="Select Time">' +
        '<input id="swal-input4" class="swal2-input" placeholder="Location/Link">',
      focusConfirm: false,
      preConfirm: () => {
        return {
          round: document.getElementById('swal-input1').value,
          date: document.getElementById('swal-input2').value,
          time: document.getElementById('swal-input3').value,
          location: document.getElementById('swal-input4').value,
        }
      }
    });

    if (formValues) {
      if (!formValues.round || !formValues.date || !formValues.time) {
        return Swal.fire("Error", "Please fill in Round, Date and Time", "error");
      }
      try {
        await API.post(`/applications/recruiter/${appId}/schedule-interview`, formValues);
        Swal.fire("Scheduled!", "Interview has been scheduled and seeker notified.", "success");
        fetchApplicants(); // Refresh data
      } catch (err) {
        console.error("Schedule interview failed", err);
        Swal.fire("Error", "Failed to schedule interview", "error");
      }
    }
  };

  const updateInterviewStatus = async (appId, interviewId, newStatus) => {
    try {
      await API.put(`/applications/recruiter/${appId}/interview/${interviewId}`, { status: newStatus });
      Swal.fire("Updated!", `Interview marked as ${newStatus}`, "success");
      fetchApplicants();
    } catch (err) {
      console.error("Update interview failed", err);
      Swal.fire("Error", "Failed to update interview", "error");
    }
  };

  return (
    <div className="font-[Outfit] pb-10 max-w-6xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="bg-[#0d1b2a] rounded-2xl p-6 shadow-lg shadow-slate-200 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
        <div className="text-white">
          <Link to="/recruiter/jobs" className="text-teal-400 text-[13px] font-bold hover:underline mb-2 inline-block">
            ← Back to My Jobs
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">
            Applicants for <span className="text-teal-400">{jobTitle}</span>
          </h1>
          <p className="text-slate-400 text-[14px]">
            {applications.length} total applications received.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin text-teal-600 text-4xl">⚙️</div>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-bold text-[#0d1b2a] text-lg">No Applicants Yet</h3>
          <p className="text-slate-500 text-sm mt-1">Check back later once candidates apply.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {applications.map((app) => {
            const seeker = app.jobseeker;
            if (!seeker) return null; // Fallback if data is missing

            return (
              <div key={app._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col relative">
                
                {/* STATUS BADGE & DROPDOWN */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app._id, e.target.value)}
                    className={`text-[12px] font-bold rounded-lg px-2 py-1.5 border outline-none cursor-pointer ${getStatusColor(app.status)}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="flex items-start gap-4 mb-4 mt-2">
                  {/* AVATAR */}
                  {seeker.profilePhoto ? (
                    <img
                      src={
                        seeker.profilePhoto.startsWith("data:image")
                          ? seeker.profilePhoto
                          : `http://localhost:5000/api/file/${seeker.profilePhoto}`
                      }
                      alt={seeker.name}
                      className="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.classList.remove('hidden');
                        e.target.nextSibling.classList.add('flex');
                      }}
                    />
                  ) : null}
                  {!seeker.profilePhoto && (
                    <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold text-xl border border-teal-100 shadow-sm">
                      {seeker.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                  )}
                  {seeker.profilePhoto && (
                    <div className="hidden w-14 h-14 bg-teal-50 text-teal-600 rounded-full items-center justify-center font-bold text-xl border border-teal-100 shadow-sm">
                      {seeker.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                  )}

                  {/* INFO */}
                  <div className="flex-1 min-w-0 pr-24">
                    <h3 className="font-bold text-[#0d1b2a] text-lg leading-tight truncate">
                      {seeker.name}
                    </h3>
                    <p className="text-slate-500 text-[13px]">{seeker.email}</p>
                    <p className="text-slate-500 text-[12px] mt-0.5">
                      {seeker.experience?.role || "No role specified"} • {seeker.location || "Location unknown"}
                    </p>
                  </div>
                </div>

                {/* SKILLS */}
                {seeker.skills && seeker.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {seeker.skills.slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium">
                          {skill}
                        </span>
                      ))}
                      {seeker.skills.length > 5 && (
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[11px] font-medium">
                          +{seeker.skills.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* INTERVIEWS SECTION */}
                {app.interviews && app.interviews.length > 0 && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Interviews</h4>
                    <div className="space-y-2">
                      {app.interviews.map((int, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[12px]">
                          <div>
                            <span className="font-bold text-slate-700">{int.round}</span>
                            <span className="text-slate-500 mx-1">•</span>
                            <span className="text-slate-500">{new Date(int.date).toLocaleDateString()} at {int.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              int.status === 'Scheduled' ? 'bg-blue-100 text-blue-600' : 
                              int.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {int.status}
                            </span>
                            {int.status === 'Scheduled' && (
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => updateInterviewStatus(app._id, int._id, 'Completed')}
                                  title="Mark as Completed"
                                  className="w-5 h-5 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-600 hover:text-white transition"
                                >
                                  ✓
                                </button>
                                <button 
                                  onClick={() => updateInterviewStatus(app._id, int._id, 'Cancelled')}
                                  title="Cancel Interview"
                                  className="w-5 h-5 flex items-center justify-center bg-red-50 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LINKS & RESUME CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div className="flex gap-2">
                    <button
                      onClick={() => scheduleInterview(app._id)}
                      className="bg-teal-50 text-teal-600 px-3 py-2 rounded-lg text-[12px] font-bold hover:bg-teal-600 hover:text-white transition"
                    >
                      Schedule Interview
                    </button>
                    {seeker.resume && (
                      <a
                        href={`http://localhost:5000/api/file/${seeker.resume}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#0d1b2a] text-white px-3 py-2 rounded-lg text-[12px] font-bold hover:bg-teal-600 transition shadow-sm"
                      >
                        Resume
                      </a>
                    )}
                  </div>
                  
                  <div className="flex gap-3 text-sm">
                    {seeker.linkedin && (
                      <a href={seeker.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition">
                        in
                      </a>
                    )}
                    {seeker.github && (
                      <a href={seeker.github} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 transition">
                        git
                      </a>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
