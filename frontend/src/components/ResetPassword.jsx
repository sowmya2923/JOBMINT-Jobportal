import React, { useState, useEffect } from "react";
import API from "../api/ApiCheck";
import { useNavigate, useLocation, Link } from "react-router-dom";

function ResetPassword() {

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verified, setVerified] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  useEffect(() => {

    if (!email) {
      alert("Session expired. Please enter email again.");
      navigate("/forgot-password");
    }

  }, [email, navigate]);


  // VERIFY OTP
  const verifyOtp = async () => {

    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    try {

      const res = await API.post("/auth/verify-otp", { email, otp });

      alert(res.data.message);
      setVerified(true);

    } catch (err) {

      alert(err.response?.data?.message || "OTP verification failed");

    }

  };


  // RESET PASSWORD
  const resetPassword = async () => {

    if (!newPassword) {
      alert("Enter new password");
      return;
    }

    try {

      const res = await API.post("/auth/reset-password", { email, otp, newPassword });

      alert(res.data.message);

      navigate("/login");

    } catch (err) {

      alert(err.response?.data?.message || "Password reset failed");

    }

  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: "#eef0f3", fontFamily: "'Outfit', sans-serif" }}>

      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" />

      {/* TOP BAR */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="flex items-center justify-center font-extrabold text-lg rounded-xl"
            style={{ width: 36, height: 36, background: "#0d1b2a", color: "#0d9488" }}>J</div>
          <span className="font-extrabold text-lg tracking-tight" style={{ color: "#0d1b2a" }}>
            JOB<span style={{ color: "#0d9488" }}>MINT</span>
          </span>
        </Link>
        <Link to="/login" className="text-sm font-semibold no-underline" style={{ color: "#0d1b2a" }}>
          Back to Login
        </Link>
      </div>

      {/* CARD */}
      <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden"
        style={{ border: "1px solid #e2e8f0", boxShadow: "0 2px 24px rgba(13,27,42,0.09)" }}>

        {/* DARK HEADER */}
        <div className="flex items-center gap-4 px-8 py-6" style={{ background: "#0d1b2a" }}>
          <div className="flex items-center justify-center text-2xl rounded-2xl flex-shrink-0"
            style={{ width: 50, height: 50, background: "#0d9488" }}>🔑</div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0d9488" }}>
              Account Recovery
            </p>
            <h1 className="text-xl font-extrabold tracking-tight m-0" style={{ color: "#fff" }}>
              Reset Password
            </h1>
          </div>
        </div>

        {/* STEP INDICATOR */}
        <div className="flex items-center gap-0 px-8 pt-6">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold"
              style={{ background: verified ? "#0d9488" : "#0d1b2a", color: "#fff" }}>
              {verified ? "✓" : "1"}
            </div>
            <span className="text-xs font-semibold" style={{ color: verified ? "#0d9488" : "#0d1b2a" }}>Verify OTP</span>
          </div>
          {/* Line */}
          <div className="flex-1 h-0.5 mx-2 mb-4 rounded"
            style={{ background: verified ? "#0d9488" : "#e2e8f0" }} />
          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold"
              style={{ background: verified ? "#0d1b2a" : "#e2e8f0", color: verified ? "#fff" : "#9ca3af" }}>
              2
            </div>
            <span className="text-xs font-semibold" style={{ color: verified ? "#0d1b2a" : "#9ca3af" }}>New Password</span>
          </div>
        </div>

        {/* FORM BODY */}
        <div className="px-8 py-6 flex flex-col gap-5">

          {/* ── STEP 1: VERIFY OTP ── */}
          {!verified && (
            <>
              <p className="text-sm text-center" style={{ color: "#6b7280" }}>
                Enter the 6-digit OTP sent to{" "}
                <span className="font-semibold" style={{ color: "#0d1b2a" }}>{email}</span>
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8896a4" }}>
                  OTP Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all text-center tracking-widest font-bold"
                  style={{ background: "#eef1f5", border: "1.5px solid #e2e8f0", fontFamily: "'Outfit',sans-serif", color: "#0d1b2a", fontSize: 18, letterSpacing: "0.3em" }}
                  onFocus={e => e.target.style.borderColor = "#0d9488"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
                <p className="text-xs text-center" style={{ color: "#b0bac6" }}>
                  Check your inbox for the OTP code
                </p>
              </div>

              <button
                onClick={verifyOtp}
                className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all"
                style={{ background: "#0d1b2a", color: "#fff", border: "none", fontFamily: "'Outfit',sans-serif", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#1b2c3e"}
                onMouseLeave={e => e.currentTarget.style.background = "#0d1b2a"}
              >
                Verify OTP →
              </button>
            </>
          )}

          {/* ── STEP 2: NEW PASSWORD ── */}
          {verified && (
            <>
              {/* Verified banner */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{ background: "#f0fdfa", border: "1px solid #99f6e4" }}>
                <span>✅</span>
                <span className="text-sm font-semibold" style={{ color: "#0d9488" }}>
                  OTP Verified — set your new password below
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8896a4" }}>
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{ background: "#eef1f5", border: "1.5px solid #e2e8f0", fontFamily: "'Outfit',sans-serif", color: "#0d1b2a" }}
                  onFocus={e => e.target.style.borderColor = "#0d9488"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>

              <button
                onClick={resetPassword}
                className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all"
                style={{ background: "#0d9488", color: "#fff", border: "none", fontFamily: "'Outfit',sans-serif", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#0f766e"}
                onMouseLeave={e => e.currentTarget.style.background = "#0d9488"}
              >
                Reset Password →
              </button>
            </>
          )}

          <p className="text-center text-xs" style={{ color: "#b0bac6" }}>
            Remember your password?{" "}
            <Link to="/login" className="font-semibold no-underline" style={{ color: "#0d9488" }}>Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default ResetPassword;