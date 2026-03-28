import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-400 ease-in-out ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 py-3' : 'bg-white shadow-sm border-b border-gray-100 py-4'}`} 
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 no-underline group flex-shrink-0">
          <div className="w-10 h-10 bg-[#0d1b2a] rounded-[14px] flex items-center justify-center text-[#14b8a6] font-black text-[1.1rem] shadow-md group-hover:bg-[#14b8a6] group-hover:text-white group-hover:-rotate-3 transition-all duration-300">J</div>
          <span className="font-extrabold text-[1.4rem] text-[#0d1b2a] tracking-tight">
            JOB<span className="text-[#14b8a6]">MINT</span>
          </span>
        </Link>

        {/* DESKTOP NAVLINKS */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/about" className="text-sm font-bold text-slate-600 hover:text-[#14b8a6] transition-colors no-underline">About Us</Link>
          <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-[#14b8a6] transition-colors no-underline">Companies</Link>
          <Link to="/jobseeker/jobs" className="text-sm font-bold text-slate-600 hover:text-[#14b8a6] transition-colors no-underline">Find Jobs</Link>
        </div>

        {/* CTA BUTTONS & MOBILE TOGGLE */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-[#14b8a6] px-3 py-2 transition-colors no-underline">
              Log In
            </Link>
            <Link to="/register" className="text-[13px] font-bold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-sm uppercase tracking-wide flex items-center gap-1 cursor-pointer no-underline" style={{ background: "#14b8a6", color: "#fff" }}>
              Sign Up
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button 
            className="md:hidden flex items-center justify-center p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl py-6 px-6 flex flex-col gap-5 origin-top animate-in slide-in-from-top-4 fade-in-80 duration-200">
          <Link to="/" className="text-[15px] font-bold text-slate-700 hover:text-[#14b8a6] no-underline" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/about" className="text-[15px] font-bold text-slate-700 hover:text-[#14b8a6] no-underline" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
          <Link to="/login" className="text-[15px] font-bold text-slate-700 hover:text-[#14b8a6] no-underline" onClick={() => setMobileMenuOpen(false)}>Browse Companies</Link>
          <Link to="/jobseeker/jobs" className="text-[15px] font-bold text-slate-700 hover:text-[#14b8a6] no-underline" onClick={() => setMobileMenuOpen(false)}>Find Jobs</Link>
          <hr className="border-slate-100 my-1" />
          <Link to="/login" className="text-[15px] font-bold text-slate-700 hover:text-[#14b8a6] no-underline" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
          <div className="flex flex-col gap-3 mt-2">
            <Link to="/register" className="text-center text-[14px] font-bold bg-[#14b8a6] text-white px-5 py-3.5 rounded-xl shadow-md no-underline uppercase tracking-wide" onClick={() => setMobileMenuOpen(false)}>Get Started / Sign Up</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;