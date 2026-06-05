"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <main className="flex flex-col min-h-screen bg-cream text-white overflow-x-hidden selection:bg-primary selection:text-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-white/10 px-6 py-5 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          {/* Custom Yellow status dot */}
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight uppercase text-white">
            PitchPilot <span className="text-primary font-normal font-sans">Live</span>
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10 text-xs font-semibold tracking-widest uppercase">
          <a href="#about" className="text-white/75 hover:text-primary transition-colors duration-200">
            About
          </a>
          <a href="#contact" className="text-white/75 hover:text-primary transition-colors duration-200">
            Contact
          </a>
          <Link href="/practice" className="text-white/75 hover:text-primary transition-colors duration-200">
            Practice Mode
          </Link>
          <Link href="/live" className="text-white/75 hover:text-primary transition-colors duration-200">
            Live Coach
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/live"
            className="hidden sm:flex items-center gap-2 px-5 py-2 text-xs font-bold tracking-widest uppercase border-2 border-primary text-primary hover:bg-primary hover:text-black transition-all duration-200"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Live Coach
          </Link>
          <Link
            href="/practice"
            className="px-5 py-2 text-xs font-bold tracking-widest uppercase bg-primary border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-primary-hover transition-all duration-200"
          >
            Practice →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col justify-center min-h-[calc(100vh-80px)] py-12 lg:py-0 px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-center lg:text-left">
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start">
            {/* Large Typographic Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white uppercase leading-none font-display">
              Interview Better.<br />
              <span className="text-primary italic font-serif font-normal lowercase tracking-normal block my-1">
                real-time coaching.
              </span>
              Succeed Faster.
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-xl text-sm sm:text-base text-white/80 leading-relaxed font-medium">
              A professional prep coach that watches, listens, and guides you during interviews or practice runs. Get live scores, posture control warnings, instant recommendations, and streaming transcripts.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center z-10 w-full sm:w-auto">
              <Link
                href="/live"
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary border-2 border-black text-black font-extrabold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-primary-hover px-8 py-3.5 text-xs tracking-widest uppercase hover:scale-[1.02] transition-all duration-200"
              >
                <span className="h-2 w-2 rounded-full bg-black animate-ping" />
                Start Live Session
              </Link>
              <Link
                href="/practice"
                className="w-full sm:w-auto text-center border-2 border-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-blue-900 hover:scale-[1.02] transition-all duration-200"
              >
                Deep Practice Mode
              </Link>
            </div>

            <div className="mt-4 flex flex-col gap-1 items-center lg:items-start">
              <span className="text-[10px] text-white/60 font-semibold tracking-wider uppercase">Free to use · Powered by Gemini 2.5 Flash</span>
            </div>
          </div>

          {/* Right Column: Mockup UI Card */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <div className="relative w-full max-w-md border-2 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden text-left">
              {/* Window control dots */}
              <div className="flex gap-1.5 border-b border-blue-900/10 pb-3 mb-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <span className="text-[9px] text-blue-900/50 font-mono ml-2">live_coach_hud.exe</span>
              </div>

              <div className="flex flex-col gap-3">
                {/* Camera Mockup & Posture */}
                <div className="border-2 border-blue-900 p-3 bg-blue-50/20 relative flex flex-col justify-between aspect-video rounded">
                  {/* Overlay elements */}
                  <div className="flex justify-between items-start">
                    <div className="bg-primary border border-black text-black text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-widest">
                      Cam Active
                    </div>
                    <div className="bg-white border border-blue-900 text-blue-900 text-[8px] font-mono px-1.5 py-0.5">
                      1080p · 30fps
                    </div>
                  </div>

                  {/* Simulated camera wireframe/outline representing posture control */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <svg className="w-24 h-24 text-blue-800" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
                      {/* Eye line */}
                      <line x1="10" y1="40" x2="90" y2="40" strokeDasharray="3 3" />
                      <circle cx="50" cy="45" r="16" />
                      <path d="M25 80 C35 72, 65 72, 75 80" />
                      <line x1="50" y1="10" x2="50" y2="90" strokeDasharray="2 2" />
                    </svg>
                  </div>

                  {/* Bottom posture validation alert */}
                  <div className="bg-emerald-50 border-2 border-emerald-500 p-2 flex items-center justify-between text-[10px] text-emerald-800 font-bold z-10">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      POSTURE STABLE
                    </span>
                    <span className="font-mono text-[9px] text-emerald-600">Shoulders Aligned ✓</span>
                  </div>
                </div>

                {/* Score & Recommendation Row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Score */}
                  <div className="border-2 border-blue-900 bg-white p-3 flex flex-col justify-between">
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-wider text-blue-900/50 mb-0.5">Live Score</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-blue-900 font-display">88</span>
                        <span className="text-[9px] text-blue-900/50 font-mono">/100</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-blue-100 mt-1.5 rounded">
                      <div className="h-1.5 bg-blue-600 rounded" style={{ width: "88%" }} />
                    </div>
                  </div>

                  {/* Recommendation Cue */}
                  <div className="border-2 border-blue-900 bg-white p-3">
                    <p className="text-[8px] font-mono uppercase text-blue-600 font-bold mb-0.5">⚡ Rec Cue</p>
                    <p className="text-[10px] font-bold text-blue-900 leading-tight">
                      "Maintain eye contact with the lens and slow down pacing."
                    </p>
                  </div>
                </div>

                {/* Transcript Preview */}
                <div className="border border-blue-900/20 bg-blue-50/30 p-3 rounded">
                  <p className="text-[8px] font-mono uppercase text-blue-900/50 mb-1">Live Transcript</p>
                  <p className="text-[10px] text-blue-900 font-medium leading-normal italic">
                    "...my experience building scalable react architectures allows me to lead the engineering team..."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="border-t-2 border-blue-950 px-6 py-24 bg-white relative text-blue-900">
        {/* Background visual detail */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-left mb-16 border-b-2 border-blue-900 pb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 font-mono block mb-2">01 / The Concept</span>
            <h2 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-blue-900 font-display">
              Real-time Interview Analysis
            </h2>
            <p className="text-sm text-slate-600 font-medium mt-3 max-w-2xl leading-relaxed">
              Standard feedback happens after you finish. PitchPilot Live reviews you in real time — analyzing your speech and camera frame to help you adjust your delivery, posture, and pacing on the fly.
            </p>
          </div>

          {/* Grid of features */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1: Scores */}
            <div className="border-2 border-blue-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] flex flex-col justify-between min-h-[220px] transition-transform duration-200 hover:-translate-y-1">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 block mb-3">01 // METRICS</span>
                <h3 className="text-lg font-extrabold text-blue-900 uppercase tracking-tight mb-2 font-display">Live Scores</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Dynamic assessment of your vocal tone, speaking clarity, and content flow. Scores adjust every few seconds as you present.
                </p>
              </div>
            </div>

            {/* Feature 2: Recommendations */}
            <div className="border-2 border-blue-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] flex flex-col justify-between min-h-[220px] transition-transform duration-200 hover:-translate-y-1">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 block mb-3">02 // FEEDBACK</span>
                <h3 className="text-lg font-extrabold text-blue-900 uppercase tracking-tight mb-2 font-display">Actionable Cues</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Immediate recommendations whispering what to do next. Hints like "Slow down", "Start demo", or "Use stronger hooks."
                </p>
              </div>
            </div>

            {/* Feature 3: Posture Control */}
            <div className="border-2 border-blue-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] flex flex-col justify-between min-h-[220px] transition-transform duration-200 hover:-translate-y-1">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 block mb-3">03 // VISION</span>
                <h3 className="text-lg font-extrabold text-blue-900 uppercase tracking-tight mb-2 font-display">Posture Control</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Webcam vision analysis tracking body language, eye alignment, speaking distance, and overall presentation posture.
                </p>
              </div>
            </div>

            {/* Feature 4: Live Transcripts */}
            <div className="border-2 border-blue-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] flex flex-col justify-between min-h-[220px] transition-transform duration-200 hover:-translate-y-1">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 block mb-3">04 // VOICE</span>
                <h3 className="text-lg font-extrabold text-blue-900 uppercase tracking-tight mb-2 font-display">Streaming Text</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Integrated real-time speech recognition transcribes your words immediately, allowing you to see how your pacing aligns with visual cues.
                </p>
              </div>
            </div>
          </div>

          {/* Expanded About Detail Rows */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 border-t-2 border-blue-900/10 pt-16">
            {/* Expanded block 1 */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">01.1 // HOW IT WORKS</span>
              <h3 className="text-2xl font-extrabold text-blue-900 uppercase font-display">Continuous Vision & Voice Capture</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                While your camera is active, PitchPilot Live captures visual frames dynamically. We feed these frames alongside your running speech transcript directly into Gemini 2.5 Flash, analyzing shoulder alignment, posture slumps, and eye contact in one single cognitive context.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                At the same time, browser-level speech recognition tracks your spoken words. This is evaluated live, ensuring you get immediate recommendations before you even finish your next sentence.
              </p>
            </div>

            {/* Expanded block 2 */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">01.2 // TARGET BENCHMARKS</span>
              <h3 className="text-2xl font-extrabold text-blue-900 uppercase font-display">Optimal Performance Goals</h3>
              
              <ul className="flex flex-col gap-3">
                <li className="flex gap-3 text-sm text-slate-700 font-medium">
                  <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-blue-900 text-[10px] font-bold">1</span>
                  <span><strong>Eye Level:</strong> Keep the camera at eye-level to project confidence and maintain virtual eye contact with the interviewer.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-700 font-medium">
                  <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-blue-900 text-[10px] font-bold">2</span>
                  <span><strong>Posture Stability:</strong> Slouching reduces breathing depth and vocal resonance. Sit up straight and align your shoulders.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-700 font-medium">
                  <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-blue-900 text-[10px] font-bold">3</span>
                  <span><strong>Speaking Pace:</strong> Aim for a steady 130 to 150 WPM (Words Per Minute). Slow down deliberately to highlight key achievements.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer containing Compact Contact Form */}
      <footer className="border-t-2 border-blue-950 bg-blue-950 px-6 py-12 text-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left: Compact Contact Form */}
          <div className="flex flex-col gap-4 max-w-md w-full">
            <h3 className="text-xs font-mono font-bold tracking-widest text-primary uppercase">02 / Contact Us</h3>
            <p className="text-xs text-white/70">Have questions or feedback? Send us a quick note directly from here.</p>
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-3 text-blue-900">
              {formSubmitted && (
                <div className="bg-emerald-50 border border-emerald-500 text-emerald-800 p-2 text-[10px] font-bold text-center">
                  MESSAGE SENT SUCCESSFULLY!
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white border border-blue-900 p-2 text-xs focus:outline-none focus:border-primary rounded-none"
                />
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white border border-blue-900 p-2 text-xs focus:outline-none focus:border-primary rounded-none"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Your message..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="flex-1 bg-white border border-blue-900 p-2 text-xs focus:outline-none focus:border-primary rounded-none"
                />
                <button
                  type="submit"
                  className="bg-primary border border-black text-black px-4 text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-primary-hover active:translate-y-0.5 rounded-none transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </div>

          {/* Right: Branding & Copyright */}
          <div className="flex flex-col items-center md:items-end justify-center text-center md:text-right gap-3">
            <span className="font-display font-extrabold text-xl tracking-tight uppercase text-white">
              PitchPilot <span className="text-primary font-normal font-sans">Live</span>
            </span>
            <p className="text-[10px] font-medium text-white/50 max-w-sm leading-relaxed">
              PitchPilot Live is an interactive, real-time prep coach utilizing the Gemini Pro multimodal context to grade interview delivery, speech clarity, and posture.
            </p>
            <p className="text-[10px] text-white/40 mt-4">&copy; {new Date().getFullYear()} PitchPilot. All rights reserved.</p>
          </div>
          
        </div>
      </footer>
    </main>
  );
}
