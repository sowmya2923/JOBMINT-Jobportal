import React, { useEffect, useState, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/ApiCheck';
import { AuthContext } from './context/AuthContext';

// Realistic Unsplash image URLs for job portal
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80&auto=format&fit=crop",
  team: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&q=80&auto=format&fit=crop",
  interview: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&q=80&auto=format&fit=crop",
  office: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&auto=format&fit=crop",
  avatar1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop&crop=face",
  avatar2: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80&auto=format&fit=crop&crop=face",
  avatar3: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop&crop=face",
};

export default function Home() {
  const { user } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('seekers');
  const [heroNotificationIndex, setHeroNotificationIndex] = useState(0);
  const [matchNotificationIndex, setMatchNotificationIndex] = useState(0);

  const jobDiscoveryRef = useRef(null);

  const heroNotifications = [
    { type: 'Interview Scheduled', title: 'Senior Tech Lead', subtitle: 'Tomorrow · 10:00 AM', avatar: IMAGES.avatar1 },
    { type: 'Application Viewed', title: 'Google UX Team', subtitle: 'Just now', avatar: IMAGES.avatar2 },
    { type: 'Message Received', title: 'Sarah Jenkins', subtitle: '"Can we chat today?"', avatar: IMAGES.avatar3 },
  ];

  const matchNotifications = [
    { title: '5 New Matches', subtitle: 'Based on your skills', avatars: [IMAGES.avatar1, IMAGES.avatar2, IMAGES.avatar3], plusCount: "+2" },
    { title: 'Offer Extended', subtitle: 'Check your portal', avatars: [IMAGES.avatar2], plusCount: null },
    { title: 'Profile Trending', subtitle: '+24 views this week', avatars: [IMAGES.avatar3, IMAGES.avatar1], plusCount: "+8" },
  ];

  // JOBS DATA
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  useEffect(() => {
    const heroTimer = setInterval(() => {
      setHeroNotificationIndex((prev) => (prev + 1) % heroNotifications.length);
    }, 4500);
    const matchTimer = setInterval(() => {
      setMatchNotificationIndex((prev) => (prev + 1) % matchNotifications.length);
    }, 6000);
    return () => { clearInterval(heroTimer); clearInterval(matchTimer); };
  }, []);

  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs/all-jobs");
      setJobs(res.data || []);
    } catch (err) {
      console.error("Failed to fetch jobs in Home", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const filteredJobsBySearch = jobs.filter(job => {
    const matchesTitle = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLoc = job.location.toLowerCase().includes(searchLocation.toLowerCase());
    return matchesTitle && matchesLoc;
  });

  const handleSearchClick = () => {
    jobDiscoveryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible) return;
    const animateCount = (target, setter, duration = 1800) => {
      let start = 0;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setter(target); clearInterval(timer); }
        else setter(Math.floor(start));
      }, 16);
    };
    animateCount(10000, setCount1);
    animateCount(850, setCount2);
    animateCount(98, setCount3);
  }, [statsVisible]);

  return (
    <div style={{ fontFamily: "'Sora', 'Outfit', sans-serif" }} className="bg-[#f8f7f4] min-h-screen text-[#0d1b2a] overflow-x-hidden">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap');
        
        .hero-img-wrap { position: relative; border-radius: 2rem; overflow: hidden; }
        .hero-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
        
        .card-glass {
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.9);
        }
        
        .marquee-track {
          display: flex;
          animation: marquee 18s linear infinite;
          gap: 4rem;
          width: max-content;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .step-line::after {
          content: '';
          position: absolute;
          top: 2.5rem;
          left: calc(50% + 2.5rem);
          width: calc(100% - 2.5rem);
          height: 2px;
          background: linear-gradient(90deg, #14b8a6, transparent);
        }

        .feature-tab-btn {
          padding: 0.6rem 1.5rem;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.8rem;
          letter-spacing: 0.03em;
          transition: all 0.3s;
          cursor: pointer;
          border: none;
          outline: none;
        }
        .feature-tab-btn.active {
          background: #0d1b2a;
          color: white;
        }
        .feature-tab-btn:not(.active) {
          background: transparent;
          color: #64748b;
        }
        .feature-tab-btn:not(.active):hover {
          color: #0d1b2a;
        }

        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation: floatUp 0.8s ease forwards; }
        .delay-1 { animation-delay: 0.15s; opacity: 0; }
        .delay-2 { animation-delay: 0.3s; opacity: 0; }
        .delay-3 { animation-delay: 0.45s; opacity: 0; }
        .delay-4 { animation-delay: 0.6s; opacity: 0; }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .float-anim { animation: floatSlow 4s ease-in-out infinite; }
        .float-anim-2 { animation: floatSlow 5s ease-in-out infinite 1s; }

        .job-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #334155;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          white-space: nowrap;
        }
        .job-pill .dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #14b8a6;
        }

        .section-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .section-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .img-card-shadow {
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04);
        }
        
        .cta-gradient {
          background: linear-gradient(135deg, #0d1b2a 0%, #0f3460 50%, #0d1b2a 100%);
        }
      `}</style>

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        {/* Warm organic BG */}
        <div className="absolute inset-0 z-0">
          <div style={{ background: "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(20,184,166,0.10) 0%, transparent 70%)" }} className="absolute inset-0"></div>
          <div style={{ background: "radial-gradient(ellipse 60% 50% at 10% 80%, rgba(59,130,246,0.07) 0%, transparent 70%)" }} className="absolute inset-0"></div>
          {/* Grid texture */}
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "repeating-linear-gradient(0deg,#0d1b2a,#0d1b2a 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#0d1b2a,#0d1b2a 1px,transparent 1px,transparent 40px)" }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left Copy */}
            <div>
              <div className="animate-in inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-200 bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                The Future of Hiring is Here
              </div>

              <h1 className="animate-in delay-1" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2.8rem, 5vw, 4.2rem)", lineHeight: 1.08, marginBottom: "1.5rem", color: "#0d1b2a" }}>
                Where Great <br />
                <em style={{ color: "#14b8a6", fontStyle: "italic" }}>Talent Meets</em> <br />
                Opportunity.
              </h1>

              <p className="animate-in delay-2 text-slate-500 text-lg leading-relaxed mb-10 max-w-lg" style={{ fontFamily: "'Sora', sans-serif", fontWeight: 300 }}>
                JobMint is the premier hiring platform connecting innovative companies with world-class professionals. Fast, intelligent, and built for results.
              </p>

              <div className="animate-in delay-3 flex flex-wrap gap-4 mb-12">
                <Link 
                  to={user?.role === "jobseeker" ? "/jobseeker/dashboard" : "/jobseeker/register"} 
                  className="group relative px-8 py-4 bg-[#0d1b2a] text-white rounded-2xl font-bold text-sm overflow-hidden transition-all hover:-translate-y-1 shadow-2xl shadow-slate-200"
                >
                  <div className="absolute inset-0 bg-teal-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    Find Your Dream Job
                  </span>
                </Link>
                <Link 
                  to={user?.role === "recruiter" ? "/recruiter/dashboard" : "/recruiter/register"} 
                  className="px-8 py-4 bg-white text-[#0d1b2a] border-2 border-slate-200 rounded-2xl font-bold text-sm hover:border-teal-500 hover:text-teal-600 transition-all hover:-translate-y-1 shadow-sm"
                >
                  Hire Top Talent
                </Link>
              </div>

              {/* Floating job pills */}
              <div className="animate-in delay-4 flex flex-wrap gap-2">
                {["Product Designer", "Full Stack Dev", "Data Analyst", "UX Research", "DevOps"].map((tag, i) => (
                  <span key={i} className="job-pill">
                    <span className="dot"></span>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Image Collage */}
            <div className="relative hidden lg:block" style={{ height: "560px" }}>
              {/* Main large image */}
              <div className="hero-img-wrap img-card-shadow absolute right-0 top-0" style={{ width: "50%", height: "360px", borderRadius: "2rem" }}>
                <img src={IMAGES.hero} alt="Professional team in a modern office" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a]/30 to-transparent rounded-[2rem]"></div>
              </div>

              {/* Secondary image */}
              <div className="hero-img-wrap img-card-shadow absolute left-0 bottom-8 float-anim" style={{ width: "42%", height: "240px", borderRadius: "1.5rem" }}>
                <img src={IMAGES.interview} alt="Job interview" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a]/20 to-transparent rounded-[1.5rem]"></div>
              </div>

              {/* Floating card — Dynamic Hero Notification */}
              <div className="card-glass float-anim-2 absolute top-12 left-0 rounded-2xl shadow-xl z-20 overflow-hidden" style={{ minWidth: "210px" }}>
                <div className="p-4 transition-all duration-500 ease-in-out">
                  <div className="flex items-center gap-3">
                    <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid #14b8a6", flexShrink: 0 }}>
                      <img src={heroNotifications[heroNotificationIndex].avatar} alt="candidate" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "all 0.3s" }} />
                    </div>
                    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300" key={heroNotificationIndex}>
                      <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{heroNotifications[heroNotificationIndex].type}</p>
                      <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0d1b2a" }}>{heroNotifications[heroNotificationIndex].title}</p>
                      <p style={{ fontSize: "0.65rem", color: "#14b8a6", fontWeight: 600 }}>{heroNotifications[heroNotificationIndex].subtitle}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card — Dynamic Match Notification */}
              <div className="card-glass absolute bottom-12 right-0 rounded-2xl shadow-xl z-20 float-anim overflow-hidden" style={{ minWidth: "200px", animationDelay: "1.5s" }}>
                <div className="p-4 transition-all duration-500 ease-in-out">
                  <div className="flex items-center gap-3 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300" key={`match-text-${matchNotificationIndex}`}>
                    <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#14b8a6,#3b82f6)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                        {matchNotificationIndex === 0 ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" /> : 
                         matchNotificationIndex === 1 ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> : 
                         <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />}
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0d1b2a" }}>{matchNotifications[matchNotificationIndex].title}</p>
                      <p style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600 }}>{matchNotifications[matchNotificationIndex].subtitle}</p>
                    </div>
                  </div>
                  {/* Stacked avatars */}
                  <div style={{ display: "flex", gap: "-8px" }} className="animate-in fade-in duration-500" key={`match-avatars-${matchNotificationIndex}`}>
                    {matchNotifications[matchNotificationIndex].avatars.map((av, i) => (
                      <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", border: "2px solid white", marginLeft: i > 0 ? "-8px" : 0 }}>
                        <img src={av} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                    {matchNotifications[matchNotificationIndex].plusCount && (
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0d1b2a", border: "2px solid white", marginLeft: "-8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", fontWeight: 800, color: "white" }}>
                        {matchNotifications[matchNotificationIndex].plusCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Accent circle */}
              <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg,rgba(20,184,166,0.15),rgba(59,130,246,0.10))", bottom: "20%", left: "30%", zIndex: 0, filter: "blur(30px)" }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── JOB DISCOVERY SECTION ─────────────────────────── */}
      <section id="browse-jobs" className="py-24 bg-[#f8f7f4] relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-teal-600 font-bold text-xs uppercase tracking-widest mb-3 block">Discover Jobs</span>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: "#0d1b2a" }}>Find Opportunities Before You Join</h2>
          </div>

          {/* SEARCH BAR */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input 
                  type="text" 
                  placeholder="Job title, company..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-teal-500/20 text-sm outline-none transition"
                />
              </div>
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📍</span>
                <input 
                  type="text" 
                  placeholder="Location..." 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-teal-500/20 text-sm outline-none transition"
                />
              </div>
              <button 
                onClick={handleSearchClick}
                className="bg-[#0d1b2a] text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-teal-600 transition shadow-lg shadow-[#0d1b2a]/20"
              >
                Search Jobs
              </button>
            </div>
          </div>

          <div ref={jobDiscoveryRef}>
            {/* JOB GRID */}
          {loadingJobs ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin text-teal-600 text-3xl">⚙️</div>
            </div>
          ) : filteredJobsBySearch.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 italic text-slate-400">
              No matching jobs found. Try different criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobsBySearch.slice(0, 6).map((job) => (
                <div key={job._id} className="bg-white border border-slate-100 rounded-[2rem] p-7 group hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 relative flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-black text-2xl border border-teal-100 shadow-sm transition-transform group-hover:scale-110">
                      {job.company?.charAt(0).toUpperCase() || "C"}
                    </div>
                    <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                      {job.jobType}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-[#0d1b2a] mb-1 group-hover:text-teal-600 transition">
                      {job.title}
                    </h4>
                    <p className="text-slate-500 text-sm font-medium mb-5">{job.company} • {job.location}</p>
                  </div>
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Salary</p>
                      <p className="text-sm font-black text-[#0d1b2a]">{job.salary || "N/A"}</p>
                    </div>
                    <Link 
                      to={user ? (user.role === 'jobseeker' ? `/jobseeker/job/${job._id}` : `/recruiter/job/${job._id}`) : "/login"} 
                      className="text-xs font-black text-white bg-[#0d1b2a] px-5 py-2.5 rounded-xl hover:bg-teal-600 transition"
                    >
                      {user ? "Details" : "Login to Apply"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          {filteredJobsBySearch.length > 6 && (
            <div className="text-center mt-12">
               <Link 
                 to={user?.role === 'jobseeker' ? "/jobseeker/jobs" : "/jobseeker/register"} 
                 className="text-teal-600 font-bold hover:underline"
               >
                 View all {filteredJobsBySearch.length} jobs
               </Link>
            </div>
          )}
        </div>
      </div>
    </section>

      {/* ─── STATS ───────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-16 bg-white border-y border-slate-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest col-span-2 md:col-span-1">Trusted by industry leaders worldwide</p>
            <div className="text-center">
              <h4 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.5rem", color: "#0d1b2a" }}>{count1 >= 10000 ? "10k+" : count1.toLocaleString()}</h4>
              <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em" }}>Active Seekers</p>
            </div>
            <div className="text-center">
              <h4 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.5rem", color: "#0d1b2a" }}>{count2 >= 850 ? "850+" : count2}</h4>
              <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em" }}>Global Brands</p>
            </div>
            <div className="text-center">
              <h4 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.5rem", color: "#14b8a6" }}>{count3 >= 98 ? "98%" : count3 + "%"}</h4>
              <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em" }}>Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PARTNERS MARQUEE ────────────────────────────────────── */}
      <section className="py-14 bg-[#f8f7f4] overflow-hidden">
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">Trusted by industry leaders</p>
        <div style={{ display: "flex", overflow: "hidden" }}>
          <div className="marquee-track" style={{ opacity: 0.35 }}>
            {["GOOGLE", "META", "AIRBNB", "STRIPE", "NETFLIX", "SPOTIFY", "FIGMA", "NOTION", "GOOGLE", "META", "AIRBNB", "STRIPE", "NETFLIX", "SPOTIFY", "FIGMA", "NOTION"].map((name, i) => (
              <span key={i} style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: "1.3rem", letterSpacing: "-0.02em", color: "#0d1b2a", whiteSpace: "nowrap" }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-teal-600 font-bold text-xs uppercase tracking-widest mb-3 block">Simple Workflow</span>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", color: "#0d1b2a" }}>Three Steps to Your Next Chapter</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              { num: "01", icon: "👤", title: "Create Your Profile", desc: "Set up your professional identity or company brand in minutes with our intelligent profile builder.", color: "#f0fdf9", accent: "#14b8a6" },
              { num: "02", icon: "🤖", title: "Smart Discovery", desc: "Our AI matching engine finds the perfect alignment between your skills and the right opportunities.", color: "#eff6ff", accent: "#3b82f6" },
              { num: "03", icon: "🚀", title: "Direct Access", desc: "Communicate effortlessly, schedule interviews, and finalize your next big career move.", color: "#fdf4ff", accent: "#a855f7" },
            ].map((step, i) => (
              <div key={i} className="relative group">
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-8 z-10 -translate-x-4">
                    <div style={{ height: 2, background: "linear-gradient(90deg,#14b8a6,#e2e8f0)", borderRadius: 9 }}></div>
                  </div>
                )}
                <div className="p-8 rounded-3xl border border-slate-100 hover:shadow-2xl hover:shadow-slate-100 hover:-translate-y-2 transition-all duration-500 bg-white h-full">
                  <div style={{ width: 60, height: 60, borderRadius: "1rem", background: step.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", marginBottom: "1.5rem" }}>
                    {step.icon}
                  </div>
                  <div style={{ fontSize: "3rem", fontWeight: 900, color: "#f1f5f9", position: "absolute", top: 16, right: 24, fontFamily: "'Sora',sans-serif" }}>{step.num}</div>
                  <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1.2rem", marginBottom: "0.75rem", color: "#0d1b2a" }}>{step.title}</h3>
                  <p style={{ color: "#64748b", lineHeight: 1.7, fontSize: "0.9rem" }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES — IMAGE + TABS ─────────────────────────────── */}
      <section className="py-28 bg-[#f8f7f4]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left image */}
            <div className="relative">
              <div className="hero-img-wrap img-card-shadow" style={{ height: "500px", borderRadius: "2rem" }}>
                <img src={activeTab === 'seekers' ? IMAGES.interview : IMAGES.team} alt="Features" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "all 0.5s" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a]/40 to-transparent" style={{ borderRadius: "2rem" }}></div>
              </div>

              {/* Overlay stat */}
              <div className="card-glass absolute bottom-8 left-8 right-8 p-5 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>Today's Matches</p>
                    <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: "2rem", color: "#0d1b2a" }}>1,240+</p>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[75, 90, 60, 85, 95, 70, 88].map((h, i) => (
                      <div key={i} style={{ width: 6, height: h * 0.5 + "px", background: i === 6 ? "#14b8a6" : "#e2e8f0", borderRadius: 9, alignSelf: "flex-end" }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right copy */}
            <div>
              <span className="text-teal-600 font-bold text-xs uppercase tracking-widest mb-4 block">Capabilities</span>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2rem,3.5vw,3rem)", color: "#0d1b2a", lineHeight: 1.1, marginBottom: "2rem" }}>
                Advanced tools for <br />
                <em>modern hiring.</em>
              </h2>

              {/* Tabs */}
              <div style={{ display: "inline-flex", background: "#f1f5f9", borderRadius: "9999px", padding: "4px", marginBottom: "2.5rem" }}>
                <button className={`feature-tab-btn ${activeTab === 'seekers' ? 'active' : ''}`} onClick={() => setActiveTab('seekers')}>For Job Seekers</button>
                <button className={`feature-tab-btn ${activeTab === 'recruiters' ? 'active' : ''}`} onClick={() => setActiveTab('recruiters')}>For Recruiters</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {(activeTab === 'seekers' ? [
                  { icon: "⚡", title: "Real-time Tracking", desc: "Monitor every stage of your application lifecycle instantly with live status updates." },
                  { icon: "🤖", title: "AI Skill Matching", desc: "Our engine understands your capabilities and finds roles that truly fit your profile." },
                  { icon: "📩", title: "Seamless Comms", desc: "In-portal notifications and email integrations keep you always in the loop." },
                ] : [
                  { icon: "🎯", title: "Precision Sourcing", desc: "Surface top-tier candidates ranked by skill alignment, not just keyword matches." },
                  { icon: "📊", title: "Hiring Analytics", desc: "Track pipeline velocity, source quality, and team performance in real time." },
                  { icon: "🤝", title: "Collaborative Hiring", desc: "Invite your whole team to evaluate, comment, and decide together seamlessly." },
                ]).map((f, i) => (
                  <FeatureRow key={i} {...f} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DARK FEATURES BAND ──────────────────────────────────── */}
      <section className="py-28 bg-[#0d1b2a] text-white rounded-[3rem] lg:rounded-[5rem] mx-4 lg:mx-8 my-8 relative overflow-hidden shadow-2xl">
        <div style={{ position: "absolute", top: 0, right: 0, width: 500, height: 500, background: "radial-gradient(circle,rgba(20,184,166,0.12) 0%,transparent 70%)", borderRadius: "50%", transform: "translate(30%,-30%)" }}></div>
        <div style={{ position: "absolute", bottom: 0, left: 0, width: 400, height: 400, background: "radial-gradient(circle,rgba(59,130,246,0.10) 0%,transparent 70%)", borderRadius: "50%", transform: "translate(-30%,30%)" }}></div>

        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left mock UI */}
            <div>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2rem", padding: "2rem" }}>
                {/* Mock profile card */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", border: "2px solid #14b8a6" }}>
                    <img src={IMAGES.avatar2} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: "1rem" }}>David Chen</p>
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Senior Software Engineer • San Francisco</p>
                  </div>
                  <div style={{ marginLeft: "auto", background: "#14b8a6", borderRadius: "9999px", padding: "0.3rem 0.9rem", fontSize: "0.65rem", fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: "0.08em" }}>Active</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  {[{ l: "Applied", v: 24 }, { l: "Interviews", v: 8 }, { l: "Offers", v: 2 }].map((m, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "1rem", textAlign: "center" }}>
                      <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.8rem", color: i === 2 ? "#14b8a6" : "white" }}>{m.v}</p>
                      <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{m.l}</p>
                    </div>
                  ))}
                </div>
                {/* Job list mock */}
                {[
                  { role: "Lead Product Designer", co: "Figma", status: "Interview", color: "#14b8a6" },
                  { role: "UX Researcher", co: "Google", status: "Applied", color: "#3b82f6" },
                  { role: "Product Manager", co: "Stripe", status: "Offer", color: "#a855f7" },
                ].map((j, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: "0.85rem" }}>{j.role}</p>
                      <p style={{ fontSize: "0.7rem", color: "#64748b" }}>{j.co}</p>
                    </div>
                    <span style={{ background: j.color + "22", color: j.color, borderRadius: "9999px", padding: "0.25rem 0.75rem", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>{j.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right copy */}
            <div>
              <span style={{ color: "#14b8a6", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.25em", display: "block", marginBottom: "1.5rem" }}>Dashboard Preview</span>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2rem,3.5vw,3.2rem)", lineHeight: 1.1, marginBottom: "2rem" }}>
                Everything you need,<br />
                <em style={{ color: "#14b8a6" }}>all in one place.</em>
              </h2>
              <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "2.5rem", fontSize: "1rem" }}>
                Track applications, manage interviews, and make data-driven decisions — all within a beautifully designed, intuitive workspace.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {[
                  "Live application pipeline tracking",
                  "AI-powered candidate scoring",
                  "Integrated calendar & scheduling",
                  "Team collaboration & notes",
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#14b8a622", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <span style={{ fontSize: "0.9rem", color: "#cbd5e1", fontWeight: 500 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-teal-600 font-bold text-xs uppercase tracking-widest mb-3 block">Success Stories</span>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2rem,3.5vw,3rem)", color: "#0d1b2a" }}>People love JobMint</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { name: "Sarah Jenkins", role: "Senior Designer at Creative", content: "JobMint completely transformed how I look for work. The UI is so clean and I got matched with top-tier companies within 48 hours.", img: IMAGES.avatar1, rating: 5 },
              { name: "David Chen", role: "CTO, Nexa Solutions", content: "Hiring used to be a nightmare of spreadsheets and email chains. Now our entire team coordinates on JobMint effortlessly.", img: IMAGES.avatar2, rating: 5 },
              { name: "Marcus Rivera", role: "Full Stack Developer", content: "The interview scheduling tool is absolutely amazing. No more back-and-forth emails. Professional and incredibly time-saving.", img: IMAGES.avatar3, rating: 5 },
            ].map((t, i) => (
              <div key={i} style={{ background: "#f8f7f4", borderRadius: "2rem", padding: "2.5rem", border: "1px solid #f1f5f9", transition: "all 0.4s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 24px 48px -12px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ display: "flex", gap: 3, marginBottom: "1.5rem" }}>
                  {Array(t.rating).fill(0).map((_, j) => (
                    <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  ))}
                </div>
                <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.05rem", color: "#0d1b2a", lineHeight: 1.7, marginBottom: "2rem", fontStyle: "italic" }}>"{t.content}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid #e2e8f0" }}>
                    <img src={t.img} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: "0.85rem", color: "#0d1b2a" }}>{t.name}</p>
                    <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#14b8a6", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─────────────────────────────────────────── */}
      <section className="pb-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-[3rem] lg:rounded-[4rem]" style={{ minHeight: 400 }}>
            {/* BG image */}
            <img src={IMAGES.office} alt="Modern office" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(13,27,42,0.92) 0%,rgba(15,52,96,0.88) 100%)", zIndex: 1 }}></div>

            {/* Decorative */}
            <div style={{ position: "absolute", top: 0, right: 0, width: 400, height: 400, background: "radial-gradient(circle,rgba(20,184,166,0.2) 0%,transparent 70%)", borderRadius: "50%", transform: "translate(30%,-30%)", zIndex: 2 }}></div>

            <div className="relative z-10 text-center py-20 px-8">
              <span style={{ color: "#14b8a6", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.25em", display: "block", marginBottom: "1.5rem" }}>Get Started Today</span>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2.2rem,5vw,4rem)", color: "white", lineHeight: 1.1, marginBottom: "1.5rem" }}>
                Your next chapter <br />
                <em style={{ color: "#14b8a6" }}>starts today.</em>
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "1rem", marginBottom: "2.5rem", maxWidth: 480, margin: "0 auto 2.5rem" }}>
                Join over 10,000 professionals who've already found their perfect match on JobMint.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
                <Link to="/login" style={{ padding: "1rem 3rem", background: "#14b8a6", color: "white", borderRadius: "1rem", fontWeight: 800, fontSize: "0.9rem", textDecoration: "none", transition: "all 0.3s", display: "inline-block" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#0d9488"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#14b8a6"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  Log In to Portal
                </Link>
                <Link to="/jobseeker/register" style={{ padding: "1rem 3rem", background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "1rem", fontWeight: 800, fontSize: "0.9rem", textDecoration: "none", transition: "all 0.3s", display: "inline-block", backdropFilter: "blur(10px)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  Create Account →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="py-16 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 42, height: 42, background: "#0d1b2a", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#14b8a6", fontWeight: 900, fontSize: "1.2rem", fontFamily: "'Sora',sans-serif" }}>J</div>
              <span style={{ fontWeight: 900, fontSize: "1.4rem", letterSpacing: "-0.03em", fontFamily: "'Sora',sans-serif" }}>JOB<span style={{ color: "#14b8a6" }}>MINT</span></span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2.5rem" }}>
              {["Privacy", "Terms", "Security", "Contact"].map((l) => (
                <a key={l} href="#" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#14b8a6"}
                  onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid #f1f5f9", textAlign: "center", fontSize: "0.65rem", fontWeight: 800, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            © 2026 JobMint Portal. Engineered for Excellence.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureRow({ icon, title, desc }) {
  return (
    <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}
      className="group">
      <div style={{ width: 52, height: 52, background: "#f8f7f4", border: "1px solid #e2e8f0", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0, transition: "all 0.3s" }}
        onMouseEnter={e => { e.currentTarget.style.background = "#14b8a6"; e.currentTarget.style.transform = "rotate(-6deg)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#f8f7f4"; e.currentTarget.style.transform = "rotate(0)"; }}>
        {icon}
      </div>
      <div>
        <h4 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.3rem", color: "#0d1b2a" }}>{title}</h4>
        <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.65 }}>{desc}</p>
      </div>
    </div>
  );
}