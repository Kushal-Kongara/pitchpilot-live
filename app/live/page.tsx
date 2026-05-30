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
          <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-black bg-clip-text text-transparent">
            Live
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/practice"
            className="text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors"
          >
            ← Practice Mode
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 px-3 py-1.5 text-xs font-bold text-orange-655">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            Live Mode
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-8 lg:px-10 bg-slate-50/40 text-left">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Live Coach Mode</h1>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            Practice your demo while PitchPilot watches, listens, and gives
            real-time coaching cues. No upload needed — just turn on your camera
            and start talking.
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
          Camera frame + transcript sent to Gemini every 7 seconds. Nothing is stored.
        </p>
        <Link
          href="/practice"
          className="text-xs font-bold text-slate-400 hover:text-orange-600 transition-colors"
        >
          Switch to deep analysis →
        </Link>
      </div>
    </div>
  );
}
