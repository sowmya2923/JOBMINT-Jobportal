import React, { useState } from "react";
import API from "../api/ApiCheck";
import { useNavigate, Link } from "react-router-dom";

function Forgot_Password() {

  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {

      const res = await API.post("/auth/forgot-password", { email });

      alert(res.data.message);

      navigate("/reset-password", { state: { email } });

    } catch (error) {

      alert(error.response?.data?.message || "Error sending OTP");

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
        <div className="flex items-center gap-4 px-8 py-6"
          style={{ background: "#0d1b2a" }}>
          <div className="flex items-center justify-center text-2xl rounded-2xl flex-shrink-0"
            style={{ width: 50, height: 50, background: "#0d9488" }}>🔐</div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0d9488" }}>
              Account Recovery
            </p>
            <h1 className="text-xl font-extrabold tracking-tight m-0" style={{ color: "#fff" }}>
              Forgot Password
            </h1>
          </div>
        </div>

        {/* FORM BODY */}
        <div className="px-8 py-8 flex flex-col gap-5">

          <p className="text-sm text-center" style={{ color: "#6b7280" }}>
            Enter your registered email and we'll send you an OTP to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8896a4" }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ background: "#eef1f5", border: "1.5px solid #e2e8f0", fontFamily: "'Outfit',sans-serif", color: "#0d1b2a" }}
                onFocus={e => e.target.style.borderColor = "#0d9488"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all"
              style={{ background: "#0d1b2a", color: "#fff", border: "none", fontFamily: "'Outfit',sans-serif", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "#1b2c3e"}
              onMouseLeave={e => e.currentTarget.style.background = "#0d1b2a"}
            >
              Send OTP →
            </button>

          </form>

          <p className="text-center text-xs" style={{ color: "#b0bac6" }}>
            Remember your password?{" "}
            <Link to="/login" className="font-semibold no-underline" style={{ color: "#0d9488" }}>Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Forgot_Password;