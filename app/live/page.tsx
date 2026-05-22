import Link from "next/link";
import LiveCoach from "@/components/LiveCoach";

export default function LivePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between shrink-0">
        <Link
          href="/"
          className="font-semibold text-white tracking-tight hover:opacity-80 transition-opacity"
        >
          PitchPilot{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Live
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/practice"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Practice Mode
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            Live Mode
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-white/5 px-6 py-8 lg:px-10">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-white mb-2">Live Coach Mode</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Practice your demo while PitchPilot watches, listens, and gives
            real-time coaching cues. No upload needed — just turn on your camera
            and start talking.
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          <LiveCoach />
        </div>
      </div>

      {/* Footer note */}
      <div className="border-t border-white/5 px-6 py-4 flex items-center justify-between">
        <p className="text-xs text-slate-600">
          Camera frame + transcript sent to Gemini every 7 seconds. Nothing is stored.
        </p>
        <Link
          href="/practice"
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Switch to deep analysis →
        </Link>
      </div>
    </div>
  );
}
