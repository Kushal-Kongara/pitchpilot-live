"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SessionData, SessionSummaryResult } from "@/lib/types";

const SESSION_KEY = "pitchpilot_session";

// ── Score colour helpers ─────────────────────────────────────────────────────
function scoreColor(n: number) {
  if (n >= 80) return "text-emerald-600";
  if (n >= 60) return "text-orange-500";
  return "text-red-500";
}
function scoreBg(n: number) {
  if (n >= 80) return "bg-emerald-50 border-emerald-200";
  if (n >= 60) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
}
function scoreBar(n: number) {
  if (n >= 80) return "bg-emerald-500";
  if (n >= 60) return "bg-orange-500";
  return "bg-red-500";
}

export default function SummaryPage() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [result, setResult] = useState<SessionSummaryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Read session from sessionStorage (written by LiveCoach on Stop)
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      setLoading(false);
      setError("no_session");
      return;
    }

    let data: SessionData;
    try {
      data = JSON.parse(raw) as SessionData;
    } catch {
      setLoading(false);
      setError("corrupt");
      return;
    }

    setSessionData(data);
    void generateSummary(data);
  }, []);

  async function generateSummary(data: SessionData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as SessionSummaryResult | { error: string };
      if (!res.ok) {
        setError((json as { error: string }).error ?? "Summary failed.");
      } else {
        setResult(json as SessionSummaryResult);
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  const minutes = sessionData ? Math.floor(sessionData.durationSeconds / 60) : 0;
  const secs = sessionData ? sessionData.durationSeconds % 60 : 0;
  const durationStr = minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;

  // ── No session data ──────────────────────────────────────────────────────
  if (!loading && (error === "no_session" || error === "corrupt")) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200">
          <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 mb-2">No session found</h1>
          <p className="text-sm text-slate-500">Complete a Live Coach session first — then your summary will appear here.</p>
        </div>
        <Link
          href="/live"
          className="rounded-xl bg-slate-950 hover:bg-orange-600 px-8 py-3.5 text-sm font-bold text-white transition-all duration-200"
        >
          Start Live Practice
        </Link>
      </div>
    );
  }

  // ── Nav shared by loading + result views ────────────────────────────────
  const Nav = () => (
    <nav className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="font-extrabold text-slate-900 tracking-tight">
        PitchPilot{" "}
        <span className="bg-gradient-to-r from-orange-500 to-black bg-clip-text text-transparent">Live</span>
      </Link>
      <div className="flex items-center gap-4 text-xs font-semibold">
        <Link href="/live" className="text-slate-500 hover:text-orange-600 transition-colors">← New Session</Link>
        <Link href="/practice" className="text-slate-500 hover:text-orange-600 transition-colors">Deep Analysis</Link>
      </div>
    </nav>
  );

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Nav />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-2 border-orange-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-orange-500 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-slate-700 animate-pulse">Generating your session debrief…</p>
          <p className="text-xs text-slate-400">Gemini is reviewing your coaching history</p>
        </div>
      </div>
    );
  }

  // ── API Error ────────────────────────────────────────────────────────────
  if (error && !result) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Nav />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6 text-center">
          <p className="text-sm font-bold text-red-600">Summary failed: {error}</p>
          {sessionData && (
            <button
              onClick={() => void generateSummary(sessionData)}
              className="rounded-xl bg-slate-950 hover:bg-orange-600 px-8 py-3 text-sm font-bold text-white transition-all"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!result) return null;

  // ── Full summary ─────────────────────────────────────────────────────────
  const avgScoreFromHistory =
    sessionData && sessionData.coachingHistory.length > 0
      ? Math.round(sessionData.coachingHistory.reduce((s, e) => s + e.deliveryScore, 0) / sessionData.coachingHistory.length)
      : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Nav />

      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-8 lg:px-10 bg-slate-50/40">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 border border-orange-200 px-3 py-1 text-xs font-bold text-orange-600">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              Session Debrief
            </span>
            {sessionData && (
              <span className="text-xs text-slate-400 font-medium">
                {durationStr} · {sessionData.coachingHistory.length} coaching check-ins
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Your Practice Summary</h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xl">{result.readinessStatement}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 py-10 lg:px-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">

          {/* Score row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Final score */}
            <div className={`rounded-2xl border p-5 flex flex-col gap-2 col-span-1 ${scoreBg(result.finalScore)}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Final Score</p>
              <p className={`text-4xl font-black ${scoreColor(result.finalScore)}`}>{result.finalScore}</p>
              <div className="h-1.5 w-full rounded-full bg-white/60">
                <div className={`h-1.5 rounded-full ${scoreBar(result.finalScore)} transition-all duration-700`} style={{ width: `${result.finalScore}%` }} />
              </div>
            </div>

            {/* Avg score from history */}
            {avgScoreFromHistory !== null && (
              <div className={`rounded-2xl border p-5 flex flex-col gap-2 ${scoreBg(avgScoreFromHistory)}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Avg Delivery</p>
                <p className={`text-4xl font-black ${scoreColor(avgScoreFromHistory)}`}>{avgScoreFromHistory}</p>
                <p className="text-[10px] text-slate-400">across {sessionData?.coachingHistory.length} check-ins</p>
              </div>
            )}

            {/* Ready for demo */}
            <div className={`rounded-2xl border p-5 flex flex-col gap-2 ${result.readyForDemo ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Demo Ready</p>
              <p className={`text-3xl font-black ${result.readyForDemo ? "text-emerald-600" : "text-amber-600"}`}>
                {result.readyForDemo ? "Yes ✓" : "Not yet"}
              </p>
            </div>
          </div>

          {/* Overall progress */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Overall Progress</p>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">{result.overallProgress}</p>
          </div>

          {/* Strengths + Weaknesses */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-3">Top Strengths</p>
              <ul className="flex flex-col gap-2">
                {result.topStrengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                    <span className="shrink-0 mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-200 text-emerald-700 text-[9px] font-black">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-3">Persistent Weaknesses</p>
              <ul className="flex flex-col gap-2">
                {result.persistentWeaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                    <span className="shrink-0 mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-200 text-red-700 text-[9px] font-black">!</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Improved pitch */}
          <div className="rounded-2xl border-l-4 border-l-orange-500 border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Improved 30-Second Pitch</p>
            <p className="text-sm text-slate-900 leading-relaxed font-bold italic">
              &ldquo;{result.improvedPitch}&rdquo;
            </p>
            <button
              onClick={() => void navigator.clipboard.writeText(result.improvedPitch)}
              className="mt-4 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Copy to clipboard →
            </button>
          </div>

          {/* Priority fixes */}
          <div className="rounded-2xl border border-slate-950 bg-slate-950 p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-4">Priority Fixes Before Demo Day</p>
            <ol className="flex flex-col gap-3">
              {result.priorityFixes.map((fix, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white font-semibold">
                  <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-extrabold">
                    {i + 1}
                  </span>
                  {fix}
                </li>
              ))}
            </ol>
          </div>

          {/* Score timeline (sparkline from history) */}
          {sessionData && sessionData.coachingHistory.length > 1 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Delivery Score Over Session</p>
              <div className="flex items-end gap-2 h-16">
                {sessionData.coachingHistory.map((c, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-sm transition-all duration-500 ${scoreBar(c.deliveryScore)}`}
                      style={{ height: `${(c.deliveryScore / 100) * 52}px`, minHeight: "4px" }}
                    />
                    <span className="text-[8px] text-slate-400 font-bold">{c.deliveryScore}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/live"
              className="flex-1 text-center rounded-xl bg-slate-950 hover:bg-orange-600 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] shadow-sm"
            >
              Practice Again
            </Link>
            <Link
              href="/practice"
              className="flex-1 text-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-3.5 text-sm font-bold text-slate-700 transition-all duration-200"
            >
              Deep Analysis Mode
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
