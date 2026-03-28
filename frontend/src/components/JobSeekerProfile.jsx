import React, { useEffect, useState, useContext } from "react";
import API from "../api/ApiCheck";
import ImageCropper from "./ImageCropper";
import { AuthContext } from "./context/AuthContext";
import Swal from "sweetalert2";

/* ---------------- INPUT STYLE ---------------- */
const inputClasses =
  "w-full bg-slate-50 border border-[#e8ecf0] rounded-[10px] px-[14px] py-[10px] text-[14px] text-[#0d1b2a] outline-none transition focus:border-[#0d9488]";

/* ---------------- FIELD COMPONENT ---------------- */
const Field = ({ label, name, value, full, textarea, edit, handleChange }) => (
  <div className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8896a4]">
      {label}
    </span>
    {edit ? (
      textarea ? (
        <textarea
          name={name}
          value={value || ""}
          onChange={handleChange}
          rows={3}
          className={`${inputClasses} resize-y`}
        />
      ) : (
        <input
          name={name}
          value={value || ""}
          onChange={handleChange}
          className={inputClasses}
        />
      )
    ) : (
      <span
        className={`text-[14px] ${value ? "text-[#0d1b2a]" : "text-[#aab4be] italic"
          }`}
      >
        {value || "Not added"}
      </span>
    )}
  </div>
);

/* ---------------- SECTION COMPONENT ---------------- */
const Section = ({ title, children }) => (
  <div className="bg-white border border-[#e8ecf0] rounded-[14px] px-4 md:px-6 py-[22px]">
    <h3 className="text-[14px] font-bold text-[#0d1b2a] pb-[14px] border-b border-slate-100 mb-5">
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
  </div>
);

/* ---------------- MAIN COMPONENT ---------------- */

export default function JobSeekerProfile() {
  const { updateUser } = useContext(AuthContext);
  const [data, setData] = useState({});
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [croppingImage, setCroppingImage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/seeker/profile");
      const fetchedData = res.data || {};

      // Ensure nested objects exist to avoid undefined errors during edit
      fetchedData.education = fetchedData.education || {};
      fetchedData.experience = fetchedData.experience || {};
      fetchedData.skills = fetchedData.skills?.join(", ") || "";

      setData(fetchedData);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const parent = name.split(".")[0];
      const child = name.split(".")[1];

      setData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value,
        },
      }));
    } else {
      setData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  /* ---------------- FILE CHANGE HANDLERS ---------------- */
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Large File", "Image size exceeds the 2MB limit. Please upload a smaller photo.", "warning");
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCroppingImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = null; // allows selecting the same file again
  };

  const handleCropComplete = (croppedBase64) => {
    setCroppingImage(null);
    setPhoto(croppedBase64);
    setData((prev) => ({
      ...prev,
      profilePhoto: croppedBase64,
    }));
  };

  const handleCropCancel = () => {
    setCroppingImage(null);
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);
  };

  /* ---------------- SAVE PROFILE ---------------- */
  const saveProfile = async () => {
    setLoading(true);

    try {
      // Convert skills back to array
      const updatedData = {
        ...data,
        skills: typeof data.skills === "string"
          ? data.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : data.skills,
      };

      await API.put("/seeker/profile", updatedData);

      // Upload Photo if exists
      if (photo) {
        setIsUploadingFiles(true);
        const payload = { photo };
        await API.post("/seeker/upload-photo-base64", payload);
      }

      // Upload Resume if exists
      if (resumeFile) {
        setIsUploadingFiles(true);
        const resumeData = new FormData();
        resumeData.append("resume", resumeFile);
        await API.post("/seeker/upload-resume", resumeData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      Swal.fire("Success", "Profile updated successfully!", "success");
      
      // Update global AuthContext
      updateUser({ name: data.name });

      // Refresh to get updated GridFS filenames
      await fetchProfile();
      setPhoto(null);
      setResumeFile(null);

    } catch (err) {
      console.error("Save failed:", err);
      const detailedError = err.response?.data?.error || err.response?.data?.message || err.message;
      Swal.fire("Error", `Failed to save profile.\nReason: ${detailedError}`, "error");
    }

    setIsUploadingFiles(false);
    setLoading(false);
    setEdit(false);
  };

  const initial = data.name?.charAt(0)?.toUpperCase() || "J";

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-3xl w-full mx-auto flex flex-col gap-4 font-[Outfit] px-3 md:px-0 pb-10">

      {/* HEADER SECTION */}
      <div className="mb-2 mt-4 flex items-center justify-between">
        <div>
          <h2 className="text-[1.55rem] font-extrabold text-[#0d1b2a] tracking-tight">
            My Profile
          </h2>
          <p className="text-[13px] text-gray-400 mt-0.5">
            Manage your personal information and resume.
          </p>
        </div>
        {!edit ? (
          <button
            onClick={() => setEdit(true)}
            className="px-5 py-[9px] text-[13px] font-semibold bg-[#0d1b2a] text-white rounded-[9px] hover:bg-slate-800 transition shadow-md shadow-slate-200"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEdit(false);
                setPhoto(null);
                setResumeFile(null);
                fetchProfile(); // Revert changes
              }}
              className="px-4 py-[9px] text-[13px] font-semibold border border-red-400 rounded-[9px] text-red-500 hover:bg-red-50 transition bg-white"
            >
              Cancel
            </button>
            <button
              onClick={saveProfile}
              disabled={loading}
              className="px-5 py-[9px] text-[13px] font-semibold bg-[#0d9488] text-white rounded-[9px] hover:bg-teal-700 transition shadow-md shadow-teal-100 disabled:opacity-70"
            >
              {loading ? (isUploadingFiles ? "Uploading files..." : "Saving...") : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* HERO / AVATAR CARD */}
      <div className="flex items-center gap-5 flex-wrap bg-[#0d1b2a] rounded-2xl px-[22px] md:px-[28px] py-[26px] shadow-lg shadow-slate-200 border border-slate-800">

        {/* PROFILE PHOTO */}
        <div className="relative group">
          {data.profilePhoto ? (
            <img
              src={
                data.profilePhoto.startsWith("data:image")
                  ? data.profilePhoto
                  : `http://localhost:5000/api/file/${data.profilePhoto}`
              }
              alt="profile"
              className="w-[64px] h-[64px] md:w-[70px] md:h-[70px] rounded-xl object-cover border border-white/20 bg-[#0d9488]"
              onError={(e) => { 
                // Fallback for cases where the blob/data URL is invalid or the file is missing
                e.target.style.display = 'none'; 
                const fallback = e.target.nextSibling;
                if (fallback) fallback.classList.remove('hidden');
                if (fallback) fallback.classList.add('flex');
              }}
            />
          ) : null}

          <div
            className={`w-[64px] h-[64px] md:w-[70px] md:h-[70px] bg-[#0d9488] rounded-xl flex items-center justify-center text-white font-extrabold text-[26px] ${data.profilePhoto ? 'hidden' : 'flex'}`}
          >
            {initial}
          </div>

          {edit && (
            <>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handlePhotoChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none">
                <span className="text-white text-[10px] font-bold">CHANGE</span>
              </div>
            </>
          )}
        </div>

        {/* NAME AND BASIC INFO */}
        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] font-extrabold text-white tracking-[-0.3px]">
            {data.name || "Your Name"}
          </h2>
          <p className="text-[13px] text-slate-400 mt-[3px]">
            {data.experience?.role || "Add your role"} ·{" "}
            {data.location || "Add your location"}
          </p>
        </div>

      </div>

      {/* RESUME UPLOAD SECTION */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 rounded-[14px] px-4 md:px-6 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
            📄
          </div>
          <div>
            <h4 className="font-bold text-[#0d1b2a] text-[14px]">Resume (PDF)</h4>
            <p className="text-[12px] text-slate-500">
              {resumeFile ? resumeFile.name : (data.resume ? "Resume uploaded" : "No resume uploaded")}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {data.resume && !resumeFile && (
            <a
              href={`http://localhost:5000/api/file/${data.resume}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-white text-teal-700 text-[12px] font-bold rounded-lg border border-teal-200 hover:bg-teal-50 transition"
            >
              View Resume
            </a>
          )}

          {edit && (
            <div className="relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleResumeChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <button className="px-4 py-2 bg-teal-600 text-white text-[12px] font-bold rounded-lg hover:bg-teal-700 transition pointer-events-none">
                {data.resume ? "Replace" : "Upload Document"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PERSONAL */}
      <Section title="Personal Information">
        <Field label="Full Name" name="name" value={data.name} edit={edit} handleChange={handleChange} />
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8896a4]">
            Email
          </span>
          <span className="text-[14px] text-[#0d1b2a] flex items-center gap-2 h-[42px]">
            {data.email || "—"}
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">
              read-only
            </span>
          </span>
        </div>
        <Field label="Mobile" name="mobile" value={data.mobile} edit={edit} handleChange={handleChange} />
        <Field label="Location" name="location" value={data.location} edit={edit} handleChange={handleChange} />
        <Field label="Skills (comma separated)" name="skills" value={data.skills} full edit={edit} handleChange={handleChange} />
        <Field label="Professional Summary" name="summary" value={data.summary} textarea full edit={edit} handleChange={handleChange} />
      </Section>

      {/* EXPERIENCE */}
      <Section title="Current Experience">
        <Field label="Company" name="experience.company" value={data.experience?.company} edit={edit} handleChange={handleChange} />
        <Field label="Role / Title" name="experience.role" value={data.experience?.role} edit={edit} handleChange={handleChange} />
        <Field label="Duration" name="experience.duration" value={data.experience?.duration} edit={edit} handleChange={handleChange} />
        <Field label="Description" name="experience.description" value={data.experience?.description} textarea full edit={edit} handleChange={handleChange} />
      </Section>

      {/* EDUCATION */}
      <Section title="Education">
        <Field label="Degree" name="education.degree" value={data.education?.degree} edit={edit} handleChange={handleChange} />
        <Field label="College / University" name="education.college" value={data.education?.college} edit={edit} handleChange={handleChange} />
        <Field label="Year of Passing" name="education.year" value={data.education?.year} edit={edit} handleChange={handleChange} />
        <Field label="CGPA / Percentage" name="education.cgpa" value={data.education?.cgpa} edit={edit} handleChange={handleChange} />
      </Section>

      {/* SOCIAL LINKS */}
      <Section title="Social & Portfolio">
        <Field label="LinkedIn Profile" name="linkedin" value={data.linkedin} edit={edit} handleChange={handleChange} />
        <Field label="GitHub Profile" name="github" value={data.github} edit={edit} handleChange={handleChange} />
        <Field label="Portfolio URL" name="portfolio" value={data.portfolio} full edit={edit} handleChange={handleChange} />
      </Section>

      {/* CROPPER MODAL */}
      {croppingImage && (
        <ImageCropper
          imageSrc={croppingImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}