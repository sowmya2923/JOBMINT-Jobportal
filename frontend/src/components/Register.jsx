import React from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const roles = [
    {
      id: "jobseeker",
      title: "Job Seeker",
      description: "Find your dream job, connect with top companies, and manage your applications in one place.",
      icon: "🎯",
      path: "/jobseeker/register",
      color: "bg-teal-50 text-teal-600 border-teal-100",
      btnColor: "bg-teal-600 hover:bg-teal-700 shadow-teal-200"
    },
    {
      id: "recruiter",
      title: "Employer",
      description: "Post job openings, discover world-class talent, and streamline your hiring process efficiently.",
      icon: "🏢",
      path: "/recruiter/register",
      color: "bg-slate-100 text-[#0d1b2a] border-slate-200",
      btnColor: "bg-[#0d1b2a] hover:bg-teal-600 shadow-slate-300"
    },
    {
      id: "admin",
      title: "Platform Admin",
      description: "Oversee systems, manage users, and maintain the platform's integrity as a system administrator.",
      icon: "🛡️",
      path: "/admin/register",
      color: "bg-amber-50 text-amber-600 border-amber-100",
      btnColor: "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f4] pt-24 pb-20 font-[Outfit]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0d1b2a] mb-4">
            Join the <span className="text-teal-600">JobMint</span> Community
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Select the role that best fits your needs to get started with your account creation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <div 
              key={role.id}
              className="group bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className={`w-20 h-20 ${role.color} rounded-3xl flex items-center justify-center text-4xl mb-8 border border-opacity-50 group-hover:scale-110 transition-transform duration-500`}>
                {role.icon}
              </div>
              
              <h3 className="text-2xl font-extrabold text-[#0d1b2a] mb-4">{role.title}</h3>
              <p className="text-slate-500 leading-relaxed text-[15px] mb-10 flex-1">
                {role.description}
              </p>

              <Link 
                to={role.path}
                className={`w-full py-4 rounded-2xl text-white font-bold text-[15px] ${role.btnColor} transition shadow-lg no-underline`}
              >
                Sign Up as {role.title.split(" ").pop()} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
