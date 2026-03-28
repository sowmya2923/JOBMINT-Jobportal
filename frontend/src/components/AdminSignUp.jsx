import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/ApiCheck";

export default function AdminSignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password.startsWith("AD")) {
      setAlert({ type: "error", msg: "Admin password must start with AD" });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      await API.post("/admin/register", formData);
      setAlert({ type: "success", msg: "Admin registered successfully! Redirecting to login..." });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setAlert({
        type: "error",
        msg: err.response?.data?.message || "Registration failed. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", minHeight: "100vh", background: "#f0f2f5", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" />
      <style>{`
        .jm-input { width:100%; background:#f8fafc; border:1.5px solid #e8ecf0; border-radius:10px; padding:12px 16px; font-size:14px; font-family:'Outfit',sans-serif; color:#0d1b2a; outline:none; box-sizing:border-box; transition:border-color 0.2s; }
        .jm-input:focus { border-color:#0d9488; }
        .jm-input::placeholder { color:#aab4be; }
        .jm-label { display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.09em; color:#8896a4; margin-bottom:7px; }
      `}</style>

      {/* TOP BAR */}
      <div style={{ width: "100%", maxWidth: 640, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, background: "#0d1b2a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#0d9488", fontWeight: 800, fontSize: 17, fontFamily: "'Outfit',sans-serif" }}>J</div>
          <span style={{ fontWeight: 800, fontSize: 19, color: "#0d1b2a", letterSpacing: "-0.3px" }}>JOB<span style={{ color: "#0d9488" }}>MINT</span></span>
        </Link>
        <span style={{ fontSize: 14, color: "#6b7280" }}>
          Authorized access only
        </span>
      </div>

      {/* CARD */}
      <div style={{ width: "100%", maxWidth: 600, background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 20px rgba(13,27,42,0.08)", border: "1px solid #e8ecf0" }}>

        {/* DARK HEADER */}
        <div style={{ background: "#0d1b2a", padding: "24px 30px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, background: "#0d9488", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🛡️</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0d9488", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>System Control</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.3px" }}>Admin Portal Registration</h1>
          </div>
        </div>

        {/* FORM */}
        <div style={{ padding: "30px" }}>
          {alert && (
            <div style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600, background: alert.type === "error" ? "#fef2f2" : "#f0fdfa", color: alert.type === "error" ? "#ef4444" : "#0d9488", border: `1px solid ${alert.type === 'error' ? '#fee2e2' : '#ccfbf1'}` }}>
              {alert.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="jm-label">Administrator Name</label>
              <input className="jm-input" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Full Name" />
            </div>
            
            <div>
              <label className="jm-label">System Email</label>
              <input className="jm-input" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="admin@jobmint.com" />
            </div>

            <div>
              <label className="jm-label">Secure Password</label>
              <input className="jm-input" type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Starts with AD..." />
              <p style={{ fontSize: 11, color: "#aab4be", marginTop: 6, fontStyle: "italic" }}>* Security required: Must begin with 'AD' prefix</p>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", marginTop: 10, padding: "14px", borderRadius: 11, background: "#0d1b2a", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit',sans-serif", transition: "background 0.2s", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Establishing Credentials..." : "Create Admin Account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280", marginTop: 24 }}>
            Already have admin access?{" "}
            <Link to="/login" style={{ color: "#0d9488", fontWeight: 700, textDecoration: "none" }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
