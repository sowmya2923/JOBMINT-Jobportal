import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] pt-24 pb-20 font-[Outfit]" style={{ fontFamily: "'Sora', 'Outfit', sans-serif" }}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0d1b2a] mb-6" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Revolutionizing the way <br/><span className="text-teal-500 italic">talent meets opportunity.</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            JobMint was founded on a simple premise: hiring and job seeking shouldn't be a fragmented, stressful process. We build intelligent tools that bridge the gap between world-class professionals and innovative companies.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300">
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-2xl mb-6">💡</div>
            <h3 className="text-xl font-bold text-[#0d1b2a] mb-4">Our Mission</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              We aim to eliminate the friction in traditional recruitment by leveraging smart algorithms and beautifully crafted interfaces to ensure that the best candidates always find their way to the best roles.
            </p>
          </div>
          <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl mb-6">🤝</div>
            <h3 className="text-xl font-bold text-[#0d1b2a] mb-4">Our Culture</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Collaboration and transparency are at the core of everything we do. We believe in empowering our users with data, immediate feedback, and intuitive workflows that naturally drive success.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
