import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/ApiCheck";

const JOB_TYPES = ["Full-time", "Part-time", "Remote", "Hybrid", "On-site", "Contract", "Internship"];

const INITIAL_FORM = {
  title: "",
  company: "",
  location: "",
  jobType: "Full-time",
  experience: "",
  salary: "",
  description: "",
  requirements: "",
  skillInput: "",
  skills: [],
};

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success"|"error", msg }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Add a skill tag from the input
  const addSkill = () => {
    const s = form.skillInput.trim();
    if (!s || form.skills.includes(s)) return;
    setForm((p) => ({ ...p, skills: [...p.skills, s], skillInput: "" }));
  };

  const removeSkill = (skill) =>
    setForm((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company) {
      showToast("error", "Title and Company are required.");
      return;
    }
    setLoading(true);
    try {
      const { skillInput, ...payload } = form;
      await API.post("/jobs", payload);
      showToast("success", "Job posted successfully! 🎉");
      setTimeout(() => navigate("/recruiter/jobs"), 1500);
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to post job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-[Outfit] max-w-3xl mx-auto">

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 transition-all
          ${toast.type === "success" ? "bg-teal-600 text-white" : "bg-red-500 text-white"}`}
        >
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="mb-7">
        <h2 className="text-[1.55rem] font-extrabold text-[#0d1b2a] tracking-tight">
          Post a New Job
        </h2>
        <p className="text-[13px] text-gray-400 mt-1">
          Fill in the details below to publish a job listing.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#e8ecf0] rounded-2xl p-7 shadow-sm space-y-6"
      >
        {/* ROW 1 — Title & Company */}
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Job Title *" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Frontend Developer" />
          <Field label="Company *" name="company" value={form.company} onChange={handleChange} placeholder="e.g. Infosys" />
        </div>

        {/* ROW 2 — Location & Job Type */}
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Location" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bengaluru, India" />
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-[#0d1b2a]">Job Type</label>
            <select
              name="jobType"
              value={form.jobType}
              onChange={handleChange}
              className="border border-[#dde1e8] rounded-lg px-3 py-[10px] text-sm text-[#0d1b2a] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white"
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ROW 3 — Experience & Salary */}
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Experience" name="experience" value={form.experience} onChange={handleChange} placeholder="e.g. 2-4 years" />
          <Field label="Salary" name="salary" value={form.salary} onChange={handleChange} placeholder="e.g. ₹6-10 LPA" />
        </div>

        {/* SKILLS */}
        <div>
          <label className="text-[12.5px] font-semibold text-[#0d1b2a] block mb-1.5">
            Skills Required
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="skillInput"
              value={form.skillInput}
              onChange={handleChange}
              onKeyDown={handleSkillKeyDown}
              placeholder="Type skill and press Enter"
              className="flex-1 border border-[#dde1e8] rounded-lg px-3 py-[10px] text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 rounded-lg bg-[#0d1b2a] text-white text-sm font-semibold hover:bg-teal-700 transition"
            >
              Add
            </button>
          </div>
          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {form.skills.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full"
                >
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="text-teal-400 hover:text-red-500 transition text-[11px]">✕</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-[12.5px] font-semibold text-[#0d1b2a] block mb-1.5">Job Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the role, responsibilities, and perks..."
            className="w-full border border-[#dde1e8] rounded-lg px-3 py-[10px] text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none"
          />
        </div>

        {/* REQUIREMENTS */}
        <div>
          <label className="text-[12.5px] font-semibold text-[#0d1b2a] block mb-1.5">Requirements</label>
          <textarea
            name="requirements"
            value={form.requirements}
            onChange={handleChange}
            rows={3}
            placeholder="List qualifications or must-have skills..."
            className="w-full border border-[#dde1e8] rounded-lg px-3 py-[10px] text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/recruiter/jobs")}
            className="flex-1 py-[11px] rounded-xl border border-[#dde1e8] text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-[11px] rounded-xl bg-[#0d1b2a] text-white text-sm font-bold hover:bg-teal-700 transition disabled:opacity-60"
          >
            {loading ? "Posting..." : "Post Job 🚀"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---- Reusable Input Field ----
function Field({ label, name, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12.5px] font-semibold text-[#0d1b2a]">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border border-[#dde1e8] rounded-lg px-3 py-[10px] text-sm text-[#0d1b2a] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />
    </div>
  );
}
