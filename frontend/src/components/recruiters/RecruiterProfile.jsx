import React, { useEffect, useState, useContext } from "react";
import API from "../../api/ApiCheck";
import ImageCropper from "../ImageCropper";
import { AuthContext } from "../context/AuthContext";
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
        className={`text-[14px] ${
          value ? "text-[#0d1b2a]" : "text-[#aab4be] italic"
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

export default function RecruiterProfile() {
  const { updateUser } = useContext(AuthContext);
  const [data, setData]           = useState({});
  const [edit, setEdit]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [photo, setPhoto]         = useState(null);
  const [responses, setResponses] = useState(0);
  const [croppingImage, setCroppingImage] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchResponses();
  }, []);

  const fetchProfile = async () => {
    try {
      const r = await API.get("/recruiter/profile");
      setData(r.data || {});
    } catch (err) {}
  };

  // Fetch total applicants count from all jobs posted by this recruiter
  const fetchResponses = async () => {
    try {
      const r = await API.get("/jobs/my-jobs");
      const total = (r.data || []).reduce((sum, job) => sum + (job.applicants || 0), 0);
      setResponses(total);
    } catch (err) {}
  };

  /* ---------------- HANDLE CHANGE ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
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

  /* ---------------- PHOTO CHANGE ---------------- */

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCroppingImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
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

  /* ---------------- SAVE PROFILE ---------------- */

  const saveProfile = async () => {
    setLoading(true);

    try {
      await API.put("/recruiter/profile", data);

      if (photo) {
        setIsUploadingFiles && setIsUploadingFiles(true);
        await API.post("/recruiter/profile-photo-base64", { photo });
      }

      Swal.fire("Success", "Profile updated successfully!", "success");
      updateUser({ name: data.name });
      fetchProfile();
    } catch (err) {
      Swal.fire("Error", "Failed to update profile", "error");
    }

    setLoading(false);
    setEdit(false);
  };

  const initial = data.name?.charAt(0)?.toUpperCase() || "R";

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-3xl w-full mx-auto flex flex-col gap-4 font-[Outfit] px-3 md:px-0">

      {/* HERO */}
      <div className="flex items-center gap-5 flex-wrap bg-[#0d1b2a] rounded-2xl px-[22px] md:px-[28px] py-[26px]">

        {/* PROFILE PHOTO */}
        <div className="relative group">
          {data.profilePhoto ? (
            <img
              src={
                data.profilePhoto.startsWith("data:image")
                  ? data.profilePhoto
                  : `http://localhost:5000/uploads/${data.profilePhoto}`
              }
              alt="profile"
              className="w-[64px] h-[64px] md:w-[70px] md:h-[70px] rounded-xl object-cover border border-white/20 bg-[#0d9488]"
              onError={(e) => { 
                e.target.style.display = 'none'; 
                const fallback = e.target.nextSibling;
                if (fallback) fallback.classList.remove('hidden');
                if (fallback) fallback.classList.add('flex');
              }}
            />
          ) : (
            <div className="w-[64px] h-[64px] md:w-[70px] md:h-[70px] bg-[#0d9488] rounded-xl flex items-center justify-center text-white font-extrabold text-[26px]">
              {initial}
            </div>
          )}

          {edit && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="absolute bottom-0 right-0 bg-white text-[10px] px-2 py-[2px] rounded-md shadow">
                edit
              </div>
            </>
          )}
        </div>

        {/* NAME */}
        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] font-extrabold text-white tracking-[-0.3px]">
            {data.name || "Your Name"}
          </h2>

          <p className="text-[13px] text-slate-400 mt-[3px]">
            {data.designation || "Add designation"} ·{" "}
            {data.company_name || "Add company"}
          </p>

          <p className="text-[12px] text-teal-400 mt-1">
            Total Applications Received: {responses}
          </p>
        </div>

        {/* BUTTONS */}
        {!edit ? (
          <button
            onClick={() => setEdit(true)}
            className="px-5 py-[9px] text-[13px] font-semibold border border-white/20 rounded-[9px] text-white hover:bg-white/10 transition"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setEdit(false)}
              className="px-4 py-[9px] text-[13px] font-semibold border border-red-400 rounded-[9px] text-red-400"
            >
              Cancel
            </button>

            <button
              onClick={saveProfile}
              className="px-4 py-[9px] text-[13px] font-semibold border border-emerald-400 rounded-[9px] text-emerald-400"
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* PERSONAL */}
      <Section title="Personal Information">
        <Field label="Full Name" name="name" value={data.name} edit={edit} handleChange={handleChange} />

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8896a4]">
            Email
          </span>
          <span className="text-[14px] text-[#0d1b2a] flex items-center gap-2">
            {data.email || "—"}
            <span className="text-[11px] border border-[#e8ecf0] px-2 py-[2px] rounded-full text-slate-400">
              read-only
            </span>
          </span>
        </div>

        <Field label="Mobile"      name="mobile"      value={data.mobile}      edit={edit} handleChange={handleChange} />
        <Field label="Designation" name="designation" value={data.designation} edit={edit} handleChange={handleChange} />
      </Section>

      {/* COMPANY */}
      <Section title="Company Information">
        <Field label="Company Name"  name="company_name" value={data.company_name} edit={edit} handleChange={handleChange} />
        <Field label="Industry"      name="industry"     value={data.industry}     edit={edit} handleChange={handleChange} />
        <Field label="Company Size"  name="company_size" value={data.company_size} edit={edit} handleChange={handleChange} />
        <Field label="Website"       name="website"      value={data.website}      edit={edit} handleChange={handleChange} />

        <Field
          label="Description"
          name="description"
          value={data.description}
          textarea
          full
          edit={edit}
          handleChange={handleChange}
        />
      </Section>

      {/* LOCATION */}
      <Section title="Location">
        <Field label="City"    name="location.city"    value={data.location?.city}    edit={edit} handleChange={handleChange} />
        <Field label="State"   name="location.state"   value={data.location?.state}   edit={edit} handleChange={handleChange} />
        <Field label="Country" name="location.country" value={data.location?.country} edit={edit} handleChange={handleChange} />
      </Section>

      {/* SOCIAL */}
      <Section title="Social Links">
        <Field label="LinkedIn" name="linkedin" value={data.linkedin} full edit={edit} handleChange={handleChange} />
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
