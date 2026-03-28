import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function RecruiterSignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", company_name: "", mobile: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const sendOtp = async () => {
    if (!form.email) return Swal.fire("Error", "Please enter your email first.", "error");
    setOtpLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/recruiter/send-otp/recruiter", { email: form.email });
      if (res.status === 200) { setOtpSent(true); Swal.fire("OTP Sent", "Check your email inbox.", "success"); }
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to send OTP.", "error");
    } finally { setOtpLoading(false); }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/recruiter/verify-otp/recruiter", { email: form.email, otp: form.otp });
      if (res.status === 200) { setOtpVerified(true); Swal.fire("Verified", "Email verified successfully.", "success"); }
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Invalid OTP.", "error");
    }
  };

  const registerRecruiter = async (e) => {
    e.preventDefault();
    if (!otpVerified) return Swal.fire("Error", "Please verify your email first.", "error");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/recruiter/register", form);
      if (res.status === 200) { Swal.fire("Success", "Recruiter account created!", "success"); navigate("/login"); }
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Registration failed.", "error");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", minHeight: "100vh", background: "#f0f2f5", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" />
      <style>{`
        .jm-input { width:100%; background:#f8fafc; border:1.5px solid #e8ecf0; border-radius:10px; padding:12px 16px; font-size:14px; font-family:'Outfit',sans-serif; color:#0d1b2a; outline:none; box-sizing:border-box; transition:border-color 0.2s; }
        .jm-input:focus { border-color:#0d9488; }
        .jm-input::placeholder { color:#aab4be; }
        .jm-label { display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.09em; color:#8896a4; margin-bottom:7px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; display:inline-block; }
      `}</style>

      {/* TOP BAR */}
      <div style={{ width: "100%", maxWidth: 640, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, background: "#0d1b2a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#0d9488", fontWeight: 800, fontSize: 17, fontFamily: "'Outfit',sans-serif" }}>J</div>
          <span style={{ fontWeight: 800, fontSize: 19, color: "#0d1b2a", letterSpacing: "-0.3px" }}>JOB<span style={{ color: "#0d9488" }}>MINT</span></span>
        </Link>
        <span style={{ fontSize: 14, color: "#6b7280" }}>
          Already registered?{" "}
          <Link to="/login" style={{ color: "#0d1b2a", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
        </span>
      </div>

      {/* CARD */}
      <div style={{ width: "100%", maxWidth: 640, background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 20px rgba(13,27,42,0.08)", border: "1px solid #e8ecf0" }}>

        {/* DARK HEADER */}
        <div style={{ background: "#0d1b2a", padding: "24px 30px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, background: "#0d9488", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>💼</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0d9488", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>For Employers</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.3px" }}>Recruiter Registration</h1>
          </div>
        </div>

        {/* FORM */}
        <div style={{ padding: "30px" }}>
          <form onSubmit={registerRecruiter}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className="jm-label">Full Name</label>
                <input className="jm-input" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Jane Smith" />
              </div>

              <div>
                <label className="jm-label">Password</label>
                <input className="jm-input" type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" />
              </div>

              <div>
                <label className="jm-label">Company Name</label>
                <input className="jm-input" type="text" name="company_name" value={form.company_name} onChange={handleChange} required placeholder="Acme Technologies" />
              </div>

              <div>
                <label className="jm-label">Mobile</label>
                <input className="jm-input" type="text" name="mobile" value={form.mobile} onChange={handleChange} required placeholder="+91 98765 43210" />
              </div>

              {/* EMAIL */}
              <div className="sm:col-span-2">
                <label className="jm-label">Email Address</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <input className="jm-input" style={{ flex: 1, minWidth: 0 }} type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@company.com" />
                  {!otpSent ? (
                    <button type="button" onClick={sendOtp} disabled={otpLoading}
                      style={{ background: "#0d1b2a", color: "#fff", padding: "0 22px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 600, cursor: otpLoading ? "not-allowed" : "pointer", flexShrink: 0, whiteSpace: "nowrap", fontFamily: "'Outfit',sans-serif", opacity: otpLoading ? 0.65 : 1 }}>
                      {otpLoading ? "Sending..." : "Send OTP"}
                    </button>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#0d9488", flexShrink: 0, padding: "0 6px" }}>
                      <span style={{ width: 18, height: 18, background: "#ccfbf1", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✓</span> Sent
                    </span>
                  )}
                </div>
              </div>

              {/* OTP */}
              {otpSent && (
                <div className="sm:col-span-2">
                  <label className="jm-label">Enter OTP</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input className="jm-input" style={{ flex: 1, minWidth: 0 }} type="text" name="otp" value={form.otp} onChange={handleChange} placeholder="6-digit code" />
                    {!otpVerified ? (
                      <button type="button" onClick={verifyOtp}
                        style={{ background: "transparent", color: "#0d9488", border: "1.5px solid #0d9488", padding: "0 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap", fontFamily: "'Outfit',sans-serif", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#0d9488"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#0d9488"; }}>
                        Verify OTP
                      </button>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#0d9488", flexShrink: 0, background: "#f0fdfa", border: "1px solid #99f6e4", padding: "0 14px", borderRadius: 10 }}>✓ Verified</span>
                    )}
                  </div>
                  {!otpVerified && <p style={{ fontSize: 12, color: "#aab4be", marginTop: 7 }}>Check your inbox for the 6-digit code.</p>}
                </div>
              )}
            </div>

            {otpVerified && (
              <div style={{ marginTop: 20, background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <span>✅</span>
                <span style={{ fontSize: 14, color: "#0d9488", fontWeight: 600 }}>Email verified — you're ready to register!</span>
              </div>
            )}

            <button type="submit" disabled={loading || !otpVerified}
              style={{ width: "100%", marginTop: 22, padding: "14px", borderRadius: 11, background: otpVerified ? "#0d1b2a" : "#e2e8f0", color: otpVerified ? "#fff" : "#9ca3af", fontWeight: 700, fontSize: 15, border: "none", cursor: otpVerified ? "pointer" : "not-allowed", fontFamily: "'Outfit',sans-serif", letterSpacing: "0.01em" }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Creating Account...
                </span>
              ) : "Create Recruiter Account →"}
            </button>

            <p style={{ textAlign: "center", fontSize: 12, color: "#aab4be", marginTop: 16 }}>
              By registering you agree to JobMint's{" "}
              <span style={{ color: "#0d9488", cursor: "pointer" }}>Terms</span> &{" "}
              <span style={{ color: "#0d9488", cursor: "pointer" }}>Privacy Policy</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}