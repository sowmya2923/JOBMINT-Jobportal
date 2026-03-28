import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/ApiCheck";

const JOB_TYPES = ["Full-time", "Part-time", "Remote", "Contract", "Internship"];

// ─── colour palette for job type badges ───
const TYPE_COLORS = {
  "Full-time":  { bg: "#dcfce7", text: "#15803d" },
  "Part-time":  { bg: "#fef9c3", text: "#92400e" },
  "Remote":     { bg: "#e0f2fe", text: "#0369a1" },
  "Contract":   { bg: "#fce7f3", text: "#9d174d" },
  "Internship": { bg: "#ede9fe", text: "#5b21b6" },
};

const EMPTY_EDIT = {
  title: "", company: "", location: "", jobType: "Full-time",
  experience: "", salary: "", description: "", requirements: "",
  skills: [], skillInput: "", status: "Active",
};

export default function MyJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editJob, setEditJob]   = useState(null);          // job being edited
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState(null);          // confirm dialog
  const [toast, setToast]       = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── fetch jobs ───
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await API.get("/jobs/my-jobs");
      setJobs(res.data);
    } catch {
      showToast("error", "Could not load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  // ─── open edit modal ───
  const openEdit = (e, job) => {
    e.stopPropagation();
    setEditJob(job);
    setEditForm({
      title:        job.title,
      company:      job.company,
      location:     job.location,
      jobType:      job.jobType,
      experience:   job.experience,
      salary:       job.salary,
      description:  job.description,
      requirements: job.requirements,
      skills:       job.skills || [],
      skillInput:   "",
      status:       job.status,
    });
  };

  const handleEditChange = (e) =>
    setEditForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addEditSkill = () => {
    const s = editForm.skillInput.trim();
    if (!s || editForm.skills.includes(s)) return;
    setEditForm((p) => ({ ...p, skills: [...p.skills, s], skillInput: "" }));
  };

  const removeEditSkill = (s) =>
    setEditForm((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));

  // ─── save edit ───
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { skillInput, ...payload } = editForm;
      await API.put(`/jobs/${editJob._id}`, payload);
      showToast("success", "Job updated! ✅");
      setEditJob(null);
      fetchJobs();
    } catch {
      showToast("error", "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  // ─── delete ───
  const confirmDelete = async () => {
    try {
      await API.delete(`/jobs/${deleteId}`);
      showToast("success", "Job deleted.");
      setDeleteId(null);
      setJobs((p) => p.filter((j) => j._id !== deleteId));
    } catch {
      showToast("error", "Delete failed.");
    }
  };

  // ─── derived stats ───
  const activeCount  = jobs.filter((j) => j.status === "Active").length;
  const closedCount  = jobs.filter((j) => j.status === "Closed").length;
  const totalApps    = jobs.reduce((a, j) => a + (j.applicants || 0), 0);

  return (
    <div className="font-[Outfit]">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold
          ${toast.type === "success" ? "bg-teal-600 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-[1.55rem] font-extrabold text-[#0d1b2a] tracking-tight">My Jobs</h2>
          <p className="text-[13px] text-gray-400 mt-0.5">All job postings you have created</p>
        </div>
        <Link
          to="/recruiter/post-job"
          className="flex items-center gap-2 px-5 py-[10px] bg-[#0d1b2a] text-white rounded-xl text-sm font-bold no-underline hover:bg-teal-700 transition"
        >
          ➕ Post New Job
        </Link>
      </div>

      {/* STAT PILLS */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: "Total Jobs",      val: jobs.length,    bg: "#f0f2f5",  text: "#0d1b2a" },
          { label: "Active",          val: activeCount,    bg: "#dcfce7",  text: "#15803d" },
          { label: "Closed",          val: closedCount,    bg: "#fee2e2",  text: "#b91c1c" },
          { label: "Total Applicants",val: totalApps,      bg: "#e0f2fe",  text: "#0369a1" },
        ].map((s) => (
          <div key={s.label}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ background: s.bg, color: s.text }}>
            {s.val} {s.label}
          </div>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-20 text-gray-400 text-sm">Loading jobs...</div>
      )}

      {/* EMPTY */}
      {!loading && jobs.length === 0 && (
        <div className="bg-white border border-[#e8ecf0] rounded-2xl p-14 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="font-bold text-[#0d1b2a] text-lg">No jobs posted yet</h3>
          <p className="text-gray-400 text-sm mt-1 mb-5">Start by posting your first job listing.</p>
          <Link
            to="/recruiter/post-job"
            className="inline-block px-6 py-[10px] bg-[#0d1b2a] text-white rounded-xl text-sm font-bold no-underline hover:bg-teal-700 transition"
          >
            Post a Job
          </Link>
        </div>
      )}

      {/* JOB CARDS */}
      {!loading && jobs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => {
            const color  = TYPE_COLORS[job.jobType] || TYPE_COLORS["Full-time"];
            const letter = (job.title || "J")[0].toUpperCase();
            const letterBg = ["#3b82f6","#8b5cf6","#f59e0b","#10b981","#ef4444","#ec4899"][
              job.title.charCodeAt(0) % 6
            ];

            return (
              <div key={job._id}
                onClick={() => navigate(`/recruiter/job/${job._id}`)}
                className="cursor-pointer bg-white border border-[#e8ecf0] rounded-2xl p-5 hover:shadow-md transition flex flex-col gap-4">

                {/* TOP */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0"
                    style={{ background: letterBg }}>
                    {letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#0d1b2a] text-sm leading-tight truncate">{job.title}</h3>
                    <p className="text-[12px] text-gray-400 mt-0.5 truncate">{job.company} · {job.location || "N/A"}</p>
                  </div>
                  {/* Status pill */}
                  <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full shrink-0
                    ${job.status === "Active" ? "bg-teal-50 text-teal-600" : "bg-gray-100 text-gray-400"}`}>
                    {job.status}
                  </span>
                </div>

                {/* TAGS */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full"
                    style={{ background: color.bg, color: color.text }}>
                    {job.jobType}
                  </span>
                  {job.experience && (
                    <span className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full bg-gray-100 text-gray-600">
                      {job.experience}
                    </span>
                  )}
                  {job.salary && (
                    <span className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full bg-gray-100 text-gray-600">
                      {job.salary}
                    </span>
                  )}
                </div>

                {/* SKILLS */}
                {job.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 4).map((s) => (
                      <span key={s} className="text-[10px] bg-[#f0f2f5] text-[#0d1b2a] px-2 py-0.5 rounded-md font-medium">
                        {s}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="text-[10px] text-gray-400">+{job.skills.length - 4} more</span>
                    )}
                  </div>
                )}

                {/* FOOTER */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-auto">
                  <Link 
                    to={`/recruiter/job/${job._id}/applicants`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[12px] font-bold text-teal-600 hover:text-teal-700 hover:underline bg-teal-50 px-2.5 py-1.5 rounded-lg transition border border-teal-100"
                  >
                    👥 {job.applicants || 0} {job.applicants === 1 ? 'Applicant' : 'Applicants'}
                  </Link>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => openEdit(e, job)}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#f0f2f5] text-[#0d1b2a] hover:bg-[#0d1b2a] hover:text-white transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(job._id); }}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── EDIT MODAL ─── */}
      {editJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8ecf0]">
              <h3 className="font-extrabold text-[#0d1b2a] text-base">Edit Job</h3>
              <button onClick={() => setEditJob(null)} className="text-gray-400 hover:text-red-500 text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">

              <div className="grid sm:grid-cols-2 gap-4">
                <EField label="Job Title *" name="title" value={editForm.title} onChange={handleEditChange} />
                <EField label="Company *" name="company" value={editForm.company} onChange={handleEditChange} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <EField label="Location" name="location" value={editForm.location} onChange={handleEditChange} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[#0d1b2a]">Job Type</label>
                  <select name="jobType" value={editForm.jobType} onChange={handleEditChange}
                    className="border border-[#dde1e8] rounded-lg px-3 py-[9px] text-sm outline-none focus:border-teal-500">
                    {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <EField label="Experience" name="experience" value={editForm.experience} onChange={handleEditChange} />
                <EField label="Salary" name="salary" value={editForm.salary} onChange={handleEditChange} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#0d1b2a]">Status</label>
                <select name="status" value={editForm.status} onChange={handleEditChange}
                  className="border border-[#dde1e8] rounded-lg px-3 py-[9px] text-sm outline-none focus:border-teal-500">
                  <option>Active</option>
                  <option>Closed</option>
                </select>
              </div>

              {/* Skills */}
              <div>
                <label className="text-[12px] font-semibold text-[#0d1b2a] block mb-1.5">Skills</label>
                <div className="flex gap-2">
                  <input type="text" name="skillInput" value={editForm.skillInput} onChange={handleEditChange}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addEditSkill(); } }}
                    placeholder="Type skill + Enter"
                    className="flex-1 border border-[#dde1e8] rounded-lg px-3 py-[9px] text-sm outline-none focus:border-teal-500" />
                  <button type="button" onClick={addEditSkill}
                    className="px-4 py-2 rounded-lg bg-[#0d1b2a] text-white text-sm font-semibold hover:bg-teal-700 transition">Add</button>
                </div>
                {editForm.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editForm.skills.map((s) => (
                      <span key={s} className="flex items-center gap-1.5 text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full">
                        {s}
                        <button type="button" onClick={() => removeEditSkill(s)} className="text-teal-400 hover:text-red-500 text-[11px]">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#0d1b2a] block mb-1.5">Description</label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange} rows={3}
                  className="w-full border border-[#dde1e8] rounded-lg px-3 py-[9px] text-sm outline-none focus:border-teal-500 resize-none" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#0d1b2a] block mb-1.5">Requirements</label>
                <textarea name="requirements" value={editForm.requirements} onChange={handleEditChange} rows={3}
                  className="w-full border border-[#dde1e8] rounded-lg px-3 py-[9px] text-sm outline-none focus:border-teal-500 resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditJob(null)}
                  className="flex-1 py-[10px] rounded-xl border border-[#dde1e8] text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-[10px] rounded-xl bg-[#0d1b2a] text-white text-sm font-bold hover:bg-teal-700 transition disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRM DIALOG ─── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="font-extrabold text-[#0d1b2a] text-lg mb-1">Delete Job?</h3>
            <p className="text-sm text-gray-400 mb-6">This action cannot be undone. The job listing will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-[10px] rounded-xl border border-[#dde1e8] text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-[10px] rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable edit field
function EField({ label, name, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-[#0d1b2a]">{label}</label>
      <input type="text" name={name} value={value} onChange={onChange}
        className="border border-[#dde1e8] rounded-lg px-3 py-[9px] text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
    </div>
  );
}
