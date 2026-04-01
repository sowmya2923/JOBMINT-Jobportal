import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import API from "../api/ApiCheck";
import { AuthContext } from "./context/AuthContext";

export default function Login() {

  const { loginUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "jobseeker"
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (formData.role === "admin" && !formData.password.startsWith("AD")) {
      setAlert({ type: "error", msg: "Admin password must start with AD" });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {

      const res = await API.post("/auth/login", formData);

      setAlert({
        type: "success",
        msg: "Login successful! Redirecting..."
      });

      setTimeout(() => {
        loginUser(res.data);
      }, 800);

    } catch (err) {
      console.log("LOGIN ERROR:", err);
      const errorMsg = err.response?.data?.message 
        || (err.code === "ERR_NETWORK" ? "Network Error: Cannot connect to Backend API. Check your VITE_API_URL." : "Invalid credentials. Please try again.");
      setAlert({
        type: "error",
        msg: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6 py-6 font-[Outfit]">

      {/* BIGGER CONTAINER */}

      <div className="w-full max-w-[1050px] bg-white rounded-2xl overflow-hidden flex shadow-lg border border-gray-200">

        {/* LEFT PANEL */}

        <div className="hidden md:flex w-[46%] bg-[#0d1b2a] p-14 flex-col justify-between">

          <Link to="/" className="flex items-center gap-2 no-underline">

            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-extrabold">
              J
            </div>

            <span className="font-extrabold text-xl text-white">
              JOB<span className="text-teal-600">MINT</span>
            </span>

          </Link>

          <div>

            <h1 className="text-[38px] font-extrabold text-white leading-tight mb-4">
              Build Your <br /> Future <span className="text-teal-600">Today</span>
            </h1>

            <p className="text-gray-400 text-sm leading-7 mb-8">
              Discover opportunities, connect with companies,
              and grow your career through JobMint.
            </p>

          </div>

          <p className="text-gray-500 text-xs">
            © 2025 JobMint · India's Career Platform
          </p>

        </div>


        {/* RIGHT PANEL */}

        <div className="flex-1 p-[clamp(40px,6vw,70px)] flex flex-col justify-center">

          <h2 className="text-3xl font-extrabold text-[#0d1b2a] mb-1">
            Welcome back
          </h2>

          <p className="text-sm text-gray-400 mb-6">
            Sign in to access your workspace
          </p>


          {alert && (

            <div className={`mb-5 px-4 py-3 rounded-lg text-sm
            ${alert.type === "error"
                ? "bg-red-50 border border-red-200 text-red-600"
                : "bg-teal-50 border border-teal-200 text-teal-600"
              }`}>

              {alert.msg}

            </div>

          )}


          <form onSubmit={handleSubmit} className="flex flex-col gap-6">


            {/* ROLE SELECT */}

            <div className="flex gap-3">

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "jobseeker" })}
                className={`px-4 py-2 rounded-lg border text-sm font-semibold
                ${formData.role === "jobseeker"
                    ? "border-teal-600 text-teal-600 bg-teal-50"
                    : "border-gray-200 text-gray-500"
                  }`}>
                Job Seeker
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "recruiter" })}
                className={`px-4 py-2 rounded-lg border text-sm font-semibold
                ${formData.role === "recruiter"
                    ? "border-teal-600 text-teal-600 bg-teal-50"
                    : "border-gray-200 text-gray-500"
                  }`}>
                Recruiter
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "admin" })}
                className={`px-4 py-2 rounded-lg border text-sm font-semibold
                ${formData.role === "admin"
                    ? "border-teal-600 text-teal-600 bg-teal-50"
                    : "border-gray-200 text-gray-500"
                  }`}>
                Admin
              </button>

            </div>


            {/* EMAIL */}

            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-teal-600"
            />


            {/* PASSWORD + FORGOT LINK */}

            <div>

              <div className="flex justify-between items-center mb-2">

                <label className="text-xs font-semibold text-gray-500">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs text-teal-600 font-semibold hover:underline"
                >
                  Forgot?
                </Link>

              </div>

              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-teal-600"
              />

            </div>


            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#0d1b2a] text-white font-bold text-sm hover:opacity-90 transition">

              {loading ? "Signing in..." : "Sign In →"}

            </button>

            <div className="text-center text-sm text-gray-400 mt-6 flex flex-col gap-2">
              <p>Don't have an account?</p>
              <div className="flex justify-center gap-4">
                <Link to="/jobseeker/register" className="text-teal-600 font-semibold hover:underline">
                  Sign Up as Seeker
                </Link>
                <span className="text-gray-300">|</span>
                <Link to="/recruiter/register" className="text-teal-600 font-semibold hover:underline">
                  Sign Up as Recruiter
                </Link>
              </div>
            </div>

          </form>

        </div>

      </div>

    </div>

  );
}