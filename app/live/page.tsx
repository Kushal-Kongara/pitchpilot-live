import Link from "next/link";
import LiveCoach from "@/components/LiveCoach";

export default function LivePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
        <Link
          href="/"
          className="font-extrabold text-slate-900 tracking-tight hover:opacity-85 transition-opacity"
        >
          PitchPilot{" "}
          <span className="text-primary">
            Live
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/practice"
            className="text-xs font-bold text-slate-500 hover:text-primary transition-colors"
          >
            ← Practice Mode
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Live Reviewer Mode
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-8 lg:px-10 bg-slate-50/40 text-left">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Live Reviewer Mode</h1>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            Practice your interview responses or presentation while PitchPilot Live watches, listens, and provides
            real-time coaching. No materials needed — just turn on your camera and speak naturally.
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-6 lg:p-10 bg-white">
        <div className="max-w-5xl mx-auto">
          <LiveCoach />
        </div>
      </div>

      {/* Footer note */}
      <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50/50">
        <p className="text-xs text-slate-400 font-medium">
          Camera frame + transcript sent to Gemini every 7 seconds for posture and pacing review. Nothing is stored.
        </p>
        <Link
          href="/practice"
          className="text-xs font-bold text-slate-400 hover:text-primary transition-colors"
        >
          Switch to deep analysis Mode →
        </Link>
      </div>
    </div>
  );
}
