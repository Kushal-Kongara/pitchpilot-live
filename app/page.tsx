import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Upload your visual",
    description:
      "Drop in a slide, demo screenshot, or product mockup. PitchPilot reads the visual context alongside your words.",
  },
  {
    number: "02",
    title: "Paste your pitch",
    description:
      "Dump your draft script or talking points. Rough is fine — that's exactly what we're here to fix.",
  },
  {
    number: "03",
    title: "Get coached",
    description:
      "Receive a scored report: clarity, demo flow, missing elements, an improved pitch, and the questions judges will ask.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-white text-slate-800 overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-100 px-6 py-4 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          {/* Animated radar/logo icon in orange */}
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-lg">
            PitchPilot{" "}
            <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-black bg-clip-text text-transparent">
              Live
            </span>
          </span>
        </div>

        {/* Center menu links */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          <a href="#features" className="text-slate-600 hover:text-orange-600 transition-colors duration-200 font-medium">
            How It Works
          </a>
          <a href="#highlights" className="text-slate-600 hover:text-orange-600 transition-colors duration-200 font-medium">
            Highlights
          </a>
          <a href="/practice" className="text-slate-600 hover:text-orange-600 transition-colors duration-200 font-medium">
            Deep Coach
          </a>
          <a href="/live" className="text-slate-600 hover:text-orange-600 transition-colors duration-200 font-medium">
            Live Coach
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/live"
            className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 transition-colors font-semibold"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
            Live Coach
          </Link>
          <Link
            href="/practice"
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full transition-all duration-200 hover:scale-[1.02]"
          >
            Practice →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-24 pb-12 px-6 text-center">
        {/* Floating Bubble Icons in Orange/Black theme */}
        <div className="absolute top-12 flex justify-center items-center gap-4 py-2 px-4 bg-slate-50 border border-slate-100 rounded-full shadow-sm backdrop-blur-sm animate-fade-in">
          {/* Camera bubble */}
          <div className="p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-orange-500 hover:scale-110 transition-all duration-300 cursor-help" title="Video Feedback">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          {/* Mic bubble */}
          <div className="p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-orange-500 hover:scale-110 transition-all duration-300 cursor-help" title="Voice Analysis">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M12 1v10M19 8a7 7 0 0 1-14 0" />
            </svg>
          </div>
          {/* Slide bubble */}
          <div className="p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-orange-500 hover:scale-110 transition-all duration-300 cursor-help" title="Slide Visual Alignment">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="2" y1="20" x2="22" y2="20" />
            </svg>
          </div>
          {/* AI bubble */}
          <div className="p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-orange-500 hover:scale-110 transition-all duration-300 cursor-help" title="Gemini Pro Brain">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
            </svg>
          </div>
        </div>

        {/* Badge in Orange theme */}
        <div className="mt-6 mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-1.5 text-xs text-orange-600 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
          AI-Powered Hackathon Coaching
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-7xl lg:text-8xl uppercase leading-none">
          Pitch Better.<br />
          <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
            Demo Sharper.
          </span><br />
          Win the Room.
        </h1>

        {/* Subtitle */}
        <p className="mt-8 max-w-2xl text-lg text-slate-600 leading-relaxed font-normal">
          Upload your slide or demo screenshot, paste your pitch, and get
          instant AI coaching on story clarity, demo flow, and judge readiness —
          in seconds.
        </p>

        {/* CTA Buttons - Black & Orange theme */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center z-10">
          <Link
            href="/practice"
            className="group relative rounded-full bg-slate-950 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-slate-900/10 hover:bg-orange-600 hover:shadow-orange-500/20 hover:scale-[1.03] transition-all duration-300"
          >
            Start Practice Mode
            <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link
            href="/live"
            className="flex items-center gap-2 rounded-full border border-orange-500 bg-orange-500/5 px-8 py-4 text-sm font-bold text-orange-600 hover:bg-orange-500/10 hover:scale-[1.03] transition-all duration-300"
          >
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
            Try Live Coach
          </Link>
        </div>
        
        <span className="mt-4 text-xs text-slate-400 font-medium">No signup or API keys required</span>

        {/* 3D Character Group & Badges Container */}
        <div className="relative w-full max-w-4xl mt-16 bg-gradient-to-b from-slate-100/80 to-transparent border border-slate-200/60 rounded-3xl p-4 md:p-6 shadow-sm overflow-hidden">
          {/* Soft background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />

          {/* Floating UI badges - Crisp White Cards with dark/orange details */}
          {/* Badge 1: Top Left */}
          <div className="absolute top-8 left-4 md:left-12 z-20 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-md hover:scale-105 transition-transform duration-200 cursor-help">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-emerald-500">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Clarity: 92%
          </div>

          {/* Badge 2: Top Right */}
          <div className="absolute top-16 right-4 md:right-12 z-20 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-md hover:scale-105 transition-transform duration-200 cursor-help">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-orange-500">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            Demo Flow: Smooth
          </div>

          {/* Badge 3: Mid Left */}
          <div className="absolute bottom-16 left-6 md:left-16 z-20 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-md hover:scale-105 transition-transform duration-200 cursor-help">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-amber-500">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Delivery: Engaging
          </div>

          {/* Badge 4: Mid Right */}
          <div className="absolute bottom-24 right-6 md:right-24 z-20 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-md hover:scale-105 transition-transform duration-200 cursor-help">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            Coach Cues: Active
          </div>

          {/* Hero Illustration */}
          <div className="relative z-10 w-full overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-inner">
            <img
              src="/hero_group.png"
              alt="Diverse 3D hackathon team celebrating pitch success"
              className="w-full object-cover max-h-[500px] object-top scale-102 hover:scale-100 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* Grid Highlights Section */}
      <section id="highlights" className="relative py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-950">
              PitchPilot Highlights
            </h2>
            <p className="text-sm text-orange-600 font-bold tracking-widest uppercase mt-2">
              Performance & Community Benchmarks
            </p>
          </div>

          {/* Highlights Grid Layout */}
          <div className="flex flex-col gap-6">
            {/* Card 1: Black Card + Warm Orange/Black collage grid */}
            <div className="bg-slate-950 border border-slate-900 rounded-3xl p-8 flex flex-col lg:flex-row items-center justify-between gap-8 hover:shadow-xl transition-all duration-300">
              <div className="flex-1 text-left">
                <span className="text-xs font-bold text-orange-500 uppercase tracking-widest block mb-2 font-mono">Hackathon Performance</span>
                <span className="text-8xl md:text-9xl font-black text-orange-500 tracking-tighter block leading-none">
                  98%
                </span>
                <h3 className="text-lg font-bold text-white mt-4 mb-2">
                  Demo Score Improvement
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                  Average clarity and delivery score increase recorded from first run to final pitch evaluation.
                </p>
              </div>

              {/* Colorful Orange-Black palette themed grid */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-[360px] aspect-[4/3] shrink-0">
                {/* 1. SaaS */}
                <div className="rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md hover:scale-105 transition-all duration-200 cursor-help" title="SaaS Pitches Coached">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="2" y1="20" x2="22" y2="20" />
                    <line x1="12" y1="17" x2="12" y2="20" />
                  </svg>
                </div>
                {/* 2. Health */}
                <div className="rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shadow-md hover:scale-105 transition-all duration-200 cursor-help" title="MedTech & HealthTech">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                {/* 3. GreenTech */}
                <div className="rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md hover:scale-105 transition-all duration-200 cursor-help" title="Sustainability & GreenTech">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 1 9.3a7 7 0 0 1-9 8.7z" />
                  </svg>
                </div>
                {/* 4. Security */}
                <div className="rounded-xl bg-slate-900 flex items-center justify-center text-slate-400 shadow-md hover:scale-105 transition-all duration-200 cursor-help" title="Cybersecurity & DevTools">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                {/* 5. E-commerce */}
                <div className="rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md hover:scale-105 transition-all duration-200 cursor-help" title="Retail & E-commerce">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                </div>
                {/* 6. FinTech */}
                <div className="rounded-xl bg-slate-700 flex items-center justify-center text-slate-300 shadow-md hover:scale-105 transition-all duration-200 cursor-help" title="FinTech & Blockchain">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                {/* 7. EdTech */}
                <div className="rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md hover:scale-105 transition-all duration-200 cursor-help" title="Education & E-learning">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                  </svg>
                </div>
                {/* 8. Gaming */}
                <div className="rounded-xl bg-slate-600 flex items-center justify-center text-slate-300 shadow-md hover:scale-105 transition-all duration-200 cursor-help" title="Entertainment & Gaming">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect x="2" y="6" width="20" height="12" rx="3" />
                    <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01" />
                  </svg>
                </div>
                {/* 9. Web3 */}
                <div className="rounded-xl bg-orange-700 flex items-center justify-center text-white shadow-md hover:scale-105 transition-all duration-200 cursor-help" title="DAO & Crypto Infrastructure">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                {/* 10. AI */}
                <div className="rounded-xl bg-slate-800 flex items-center justify-center text-orange-500 shadow-md hover:scale-105 transition-all duration-200 cursor-help" title="Generative AI & LLMs">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4M8 15h.01M16 15h.01" />
                  </svg>
                </div>
                {/* 11. Hardware */}
                <div className="rounded-xl bg-amber-700 flex items-center justify-center text-white shadow-md hover:scale-105 transition-all duration-200 cursor-help" title="IoT & Hardware Demos">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M4.5 16.5c-1.5 1.5-2.5 3.5-2.5 5.5C4 22 6 21 7.5 19.5" />
                    <path d="M14 14.75a17.24 17.24 0 0 0 5.25-5.25L21 3l-6.5 1.75a17.24 17.24 0 0 0-5.25 5.25L9 12h5z" />
                  </svg>
                </div>
                {/* 12. Impact */}
                <div className="rounded-xl bg-black border border-slate-900 flex items-center justify-center text-orange-500 shadow-md hover:scale-105 transition-all duration-200 cursor-help" title="Social Good & Civic Hackathons">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M12 2a5 5 0 0 1 5 5v5a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 2: Wide Light Card (Total Pitches Analyzed) */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all duration-300">
              <div className="flex-1 text-left w-full">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Total analyzed volume</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">VND</span>
                  <span className="text-6xl font-black text-slate-950 tracking-tight">124,802</span>
                  <span className="text-sm font-bold text-slate-500 ml-1">pitches</span>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="hidden md:block w-[1.5px] h-12 bg-slate-200 self-stretch my-auto" />

              <div className="flex-1 text-left w-full md:pl-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Growth Index</span>
                <span className="text-5xl font-black text-slate-950 tracking-tight block">
                  +40,240
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mt-1">
                  Pitches year-on-year
                </span>
              </div>
            </div>

            {/* Card 3 (Orange) & Card 4 (Black) Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 3: Orange Card */}
              <div className="bg-orange-500 text-white rounded-3xl p-8 flex flex-col justify-between min-h-[220px] shadow-sm hover:bg-orange-600 hover:shadow-orange-500/10 transition-all duration-300">
                <div className="text-left">
                  <span className="text-xs font-bold text-orange-100 uppercase tracking-widest block mb-1">Live practice minutes</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-semibold">VND</span>
                    <span className="text-5xl font-black text-white tracking-tight">10,968</span>
                    <span className="text-xs font-bold ml-1">hours</span>
                  </div>
                </div>
                
                {/* Horizontal line divider */}
                <div className="w-full h-px bg-white/20 my-4" />
                
                <div className="text-left flex items-baseline gap-1 text-xs font-bold text-orange-100">
                  <span>VND</span>
                  <span className="text-sm font-black">+472</span>
                  <span className="font-semibold ml-1">hours year-on-year</span>
                </div>
              </div>

              {/* Card 4: Black Card */}
              <div className="bg-slate-950 text-white rounded-3xl p-8 flex flex-col justify-between min-h-[220px] shadow-md hover:bg-black hover:shadow-slate-900/10 transition-all duration-300">
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Evaluation Quality</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-semibold">VND</span>
                    <span className="text-5xl font-black text-orange-500 tracking-tight">9.4 / 10</span>
                  </div>
                </div>
                
                <div className="text-left text-xs font-bold text-slate-400 mt-auto">
                  <span>Average rating by hackathon judges</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-step section ("How it works") */}
      <section id="features" className="border-t border-slate-100 px-6 py-24 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              How it works
            </h2>
            <p className="text-3xl font-black text-slate-950 mt-2">
              Three Steps to a Winning Demo
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative rounded-2xl border border-slate-150 bg-slate-50 p-6 hover:border-slate-200 hover:bg-slate-100/65 transition-all duration-300"
              >
                <div className="mb-4 text-3xl font-black bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                  {step.number}
                </div>
                <h3 className="mb-2 font-bold text-slate-900 text-lg">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50 px-6 py-8 text-center text-xs text-slate-500">
        <p className="mb-2">PitchPilot Live — built with AI for hackathons</p>
        <p>&copy; {new Date().getFullYear()} PitchPilot. All rights reserved.</p>
      </footer>
    </main>
  );
}
