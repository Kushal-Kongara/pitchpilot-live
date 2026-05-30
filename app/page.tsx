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
    <main className="flex flex-col min-h-screen bg-cream text-dark-navy overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-dark-navy/10 px-6 py-5 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          {/* Custom Royal Blue radar/status dot */}
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight uppercase">
            PitchPilot <span className="text-primary font-normal font-sans">Live</span>
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10 text-xs font-semibold tracking-widest uppercase">
          <a href="#about" className="text-dark-navy/60 hover:text-primary transition-colors duration-200">
            About
          </a>
          <a href="#contact" className="text-dark-navy/60 hover:text-primary transition-colors duration-200">
            Contact
          </a>
          <Link href="/practice" className="text-dark-navy/60 hover:text-primary transition-colors duration-200">
            Practice Mode
          </Link>
          <Link href="/live" className="text-dark-navy/60 hover:text-primary transition-colors duration-200">
            Live Coach
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/live"
            className="hidden sm:flex items-center gap-2 px-5 py-2 text-xs font-bold tracking-widest uppercase border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Live Coach
          </Link>
          <Link
            href="/practice"
            className="px-5 py-2 text-xs font-bold tracking-widest uppercase bg-primary text-white hover:bg-primary-hover transition-all duration-200"
          >
            Practice →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-20 pb-16 px-6 text-center max-w-6xl mx-auto w-full">
        {/* Category tag */}
        <div className="mb-6 inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Real-time Interview & Presentation Reviewer
        </div>

        {/* Large Typographic Title */}
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tighter text-dark-navy sm:text-7xl lg:text-8xl uppercase leading-none font-display">
          Interview Better.<br />
          <span className="text-primary italic font-serif font-normal lowercase tracking-normal block mt-2">
            real-time coaching.
          </span>
          Succeed Faster.
        </h1>

        {/* Description */}
        <p className="mt-8 max-w-2xl text-base md:text-lg text-dark-navy/70 leading-relaxed font-medium">
          A professional prep coach that watches, listens, and guides you during interviews or practice runs. Get live scores, posture control warnings, instant recommendations, and streaming transcripts.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-5 items-center z-10 w-full justify-center">
          <Link
            href="/live"
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover px-10 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            <span className="h-2 w-2 rounded-full bg-white animate-ping" />
            Start Live Session
          </Link>
          <Link
            href="/practice"
            className="w-full sm:w-auto text-center border-2 border-dark-navy px-10 py-4 text-xs font-bold uppercase tracking-widest text-dark-navy hover:bg-dark-navy hover:text-white hover:scale-[1.02] transition-all duration-200"
          >
            Deep Practice Mode
          </Link>
        </div>

        <span className="mt-4 text-xs text-dark-navy/40 font-semibold tracking-wider uppercase">Free to use · Powered by Gemini 2.5 Flash</span>

        {/* Custom Mockup UI Card - Recreating the structured overlap aesthetic */}
        <div className="relative w-full max-w-4xl mt-20 border-2 border-primary bg-white p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(26,26,167,0.15)] overflow-hidden text-left">
          {/* Window control dots */}
          <div className="flex gap-1.5 border-b border-dark-navy/10 pb-4 mb-4">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
            <span className="text-[10px] text-dark-navy/40 font-mono ml-3">live_coach_hud.exe</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Camera Mockup & Posture */}
            <div className="md:col-span-2 border-2 border-dark-navy p-4 bg-cool-grey/20 relative flex flex-col justify-between aspect-video rounded">
              {/* Overlay elements */}
              <div className="flex justify-between items-start">
                <div className="bg-primary text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest">
                  Cam Source Active
                </div>
                <div className="bg-white border border-dark-navy text-dark-navy text-[9px] font-mono px-2 py-1">
                  1080p · 30fps
                </div>
              </div>

              {/* Simulated camera wireframe/outline representing posture control */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <svg className="w-40 h-40 text-primary" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                  {/* Eye line */}
                  <line x1="10" y1="40" x2="90" y2="40" strokeDasharray="3 3" />
                  <text x="12" y="37" className="text-[6px] fill-current stroke-none">EYE LEVEL</text>
                  {/* Head circle */}
                  <circle cx="50" cy="45" r="18" />
                  {/* Shoulders */}
                  <path d="M20 85 C35 75, 65 75, 80 85" />
                  <line x1="50" y1="10" x2="50" y2="90" strokeDasharray="2 2" />
                </svg>
              </div>

              {/* Bottom posture validation alert */}
              <div className="bg-emerald-50 border-2 border-emerald-500 p-2.5 flex items-center justify-between text-xs text-emerald-800 font-bold z-10">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  POSTURE STABLE
                </span>
                <span className="font-mono text-[10px] text-emerald-600">Shoulders Aligned ✓</span>
              </div>
            </div>

            {/* Column 2: Live AI Reviews */}
            <div className="flex flex-col justify-between gap-4">
              {/* Score */}
              <div className="border-2 border-primary bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-dark-navy/40 mb-1">Live Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-primary font-display">88</span>
                  <span className="text-xs text-dark-navy/40 font-mono">/ 100</span>
                </div>
                <div className="h-1.5 w-full bg-cool-grey mt-2 rounded">
                  <div className="h-1.5 bg-primary rounded" style={{ width: "88%" }} />
                </div>
              </div>

              {/* Recommendation Cue */}
              <div className="border-2 border-dark-navy bg-white p-4">
                <p className="text-[9px] font-mono uppercase text-primary font-bold mb-1">⚡ Dynamic Recommendation</p>
                <p className="text-sm font-extrabold text-dark-navy leading-snug">
                  "Maintain eye contact with the lens and slow down your pacing."
                </p>
              </div>

              {/* Transcript Preview */}
              <div className="border border-dark-navy/20 bg-cool-grey/10 p-4 flex-1 flex flex-col justify-between min-h-[100px]">
                <p className="text-[9px] font-mono uppercase text-dark-navy/40 mb-2">Live Transcript</p>
                <p className="text-xs text-dark-navy/80 font-medium leading-relaxed italic">
                  "...my experience building scalable react architectures allows me to lead the engineering team..."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="border-t-2 border-dark-navy px-6 py-24 bg-white relative">
        {/* Background visual detail */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-left mb-16 border-b-2 border-dark-navy pb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono block mb-2">01 / The Concept</span>
            <h2 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-dark-navy font-display">
              Real-time Interview Analysis
            </h2>
            <p className="text-sm text-dark-navy/60 font-medium mt-3 max-w-2xl leading-relaxed">
              Standard feedback happens after you finish. PitchPilot Live reviews you in real time — analyzing your speech and camera frame to help you adjust your delivery, posture, and pacing on the fly.
            </p>
          </div>

          {/* Grid of features */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1: Scores */}
            <div className="border-2 border-primary bg-cream p-6 shadow-[4px_4px_0px_0px_rgba(26,26,167,1)] flex flex-col justify-between min-h-[220px] transition-transform duration-200 hover:-translate-y-1">
              <div>
                <span className="text-xs font-mono font-bold text-primary block mb-3">01 // METRICS</span>
                <h3 className="text-lg font-extrabold text-dark-navy uppercase tracking-tight mb-2 font-display">Live Scores</h3>
                <p className="text-xs text-dark-navy/70 leading-relaxed font-medium">
                  Dynamic assessment of your vocal tone, speaking clarity, and content flow. Scores adjust every few seconds as you present.
                </p>
              </div>
            </div>

            {/* Feature 2: Recommendations */}
            <div className="border-2 border-dark-navy bg-cream p-6 shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] flex flex-col justify-between min-h-[220px] transition-transform duration-200 hover:-translate-y-1">
              <div>
                <span className="text-xs font-mono font-bold text-dark-navy/60 block mb-3">02 // FEEDBACK</span>
                <h3 className="text-lg font-extrabold text-dark-navy uppercase tracking-tight mb-2 font-display">Actionable Cues</h3>
                <p className="text-xs text-dark-navy/70 leading-relaxed font-medium">
                  Immediate recommendations whispering what to do next. Hints like "Slow down", "Start demo", or "Use stronger hooks."
                </p>
              </div>
            </div>

            {/* Feature 3: Posture Control */}
            <div className="border-2 border-primary bg-cream p-6 shadow-[4px_4px_0px_0px_rgba(26,26,167,1)] flex flex-col justify-between min-h-[220px] transition-transform duration-200 hover:-translate-y-1">
              <div>
                <span className="text-xs font-mono font-bold text-primary block mb-3">03 // VISION</span>
                <h3 className="text-lg font-extrabold text-dark-navy uppercase tracking-tight mb-2 font-display">Posture Control</h3>
                <p className="text-xs text-dark-navy/70 leading-relaxed font-medium">
                  Webcam vision analysis tracking body language, eye alignment, speaking distance, and overall presentation posture.
                </p>
              </div>
            </div>

            {/* Feature 4: Live Transcripts */}
            <div className="border-2 border-dark-navy bg-cream p-6 shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] flex flex-col justify-between min-h-[220px] transition-transform duration-200 hover:-translate-y-1">
              <div>
                <span className="text-xs font-mono font-bold text-dark-navy/60 block mb-3">04 // VOICE</span>
                <h3 className="text-lg font-extrabold text-dark-navy uppercase tracking-tight mb-2 font-display">Streaming Text</h3>
                <p className="text-xs text-dark-navy/70 leading-relaxed font-medium">
                  Integrated real-time speech recognition transcribes your words immediately, allowing you to see how your pacing aligns with visual cues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="border-t-2 border-dark-navy px-6 py-24 bg-cream relative">
        <div className="mx-auto max-w-xl">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono block mb-2">02 / Contact</span>
            <h2 className="text-4xl font-extrabold uppercase tracking-tight text-dark-navy font-display">
              Get In Touch
            </h2>
            <p className="text-xs text-dark-navy/60 font-semibold uppercase tracking-wider mt-2">
              Have questions or feedback? Drop us a line.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleContactSubmit} className="border-2 border-dark-navy p-8 bg-white shadow-[8px_8px_0px_0px_rgba(9,9,11,1)] flex flex-col gap-6">
            {formSubmitted ? (
              <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-800 p-4 text-xs font-bold text-center">
                THANK YOU! YOUR MESSAGE WAS SUBMITTED SUCCESSFULLY.
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-dark-navy/60">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full border-2 border-cool-grey focus:border-primary p-3 text-sm focus:outline-none bg-cream rounded-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-dark-navy/60">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full border-2 border-cool-grey focus:border-primary p-3 text-sm focus:outline-none bg-cream rounded-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-dark-navy/60">
                Your Message
              </label>
              <textarea
                id="message"
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us what you think..."
                className="w-full border-2 border-cool-grey focus:border-primary p-3 text-sm focus:outline-none bg-cream rounded-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-widest py-4 transition-colors duration-200 mt-2"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-dark-navy bg-white px-6 py-10 text-center text-[10px] font-bold uppercase tracking-widest text-dark-navy/55">
        <p className="mb-2">PitchPilot Live — Real-time Interview Review & Prep Coach</p>
        <p className="text-dark-navy/30">&copy; {new Date().getFullYear()} PitchPilot. All rights reserved.</p>
      </footer>
    </main>
  );
}
