import Link from "next/link";
import LiveCoach from "@/components/LiveCoach";

export default function LivePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0 safe-top safe-x gap-3">
        <Link
          href="/"
          className="font-extrabold text-slate-900 tracking-tight hover:opacity-85 transition-opacity text-sm sm:text-base shrink-0"
        >
          PitchPilot{" "}
          <span className="text-primary">
            Live
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link
            href="/practice"
            className="text-[10px] sm:text-xs font-bold text-slate-500 hover:text-primary transition-colors whitespace-nowrap"
          >
            <span className="hidden sm:inline">← Practice Mode</span>
            <span className="sm:hidden">Practice</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold text-primary shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="hidden min-[400px]:inline">Live Reviewer Mode</span>
            <span className="min-[400px]:hidden">Live</span>
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-100 px-4 sm:px-6 py-4 sm:py-5 lg:px-10 bg-slate-50/40 text-left safe-x">
        <div className="max-w-2xl">
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-1">Live Reviewer Mode</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Turn on your camera and speak — coaching cues appear on screen in real time.
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-4 sm:p-6 lg:p-10 bg-white safe-x">
        <div className="max-w-5xl mx-auto">
          <LiveCoach />
        </div>
      </div>

      {/* Footer note */}
      <div className="border-t border-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/50 safe-x safe-bottom">
        <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-relaxed">
          Camera + transcript reviewed live. Nothing is stored on our servers.
        </p>
        <Link
          href="/practice"
          className="text-[10px] sm:text-xs font-bold text-slate-400 hover:text-primary transition-colors whitespace-nowrap shrink-0"
        >
          Deep analysis mode →
        </Link>
      </div>
    </div>
  );
}
