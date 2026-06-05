"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DeliveryScoreChart from "@/components/DeliveryScoreChart";
import type { SessionData, SessionSummaryResult } from "@/lib/types";

const SESSION_KEY = "pitchpilot_session";

const LOADING_STEPS = [
  "Reviewing your transcript…",
  "Analyzing delivery & posture…",
  "Mapping score trends…",
  "Crafting your interview prep plan…",
];

// ── Score colour helpers ─────────────────────────────────────────────────────
function scoreColor(n: number) {
  if (n >= 80) return "text-emerald-600";
  if (n >= 60) return "text-primary";
  return "text-red-500";
}
function scoreBg(n: number) {
  if (n >= 80) return "bg-emerald-50 border-emerald-200";
  if (n >= 60) return "bg-primary/5 border-primary/20";
  return "bg-red-50 border-red-200";
}
function scoreBar(n: number) {
  if (n >= 80) return "bg-emerald-500";
  if (n >= 60) return "bg-primary";
  return "bg-red-500";
}

export default function SummaryPage() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [result, setResult] = useState<SessionSummaryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => {
      setLoadingStep((s) => (s + 1) % LOADING_STEPS.length);
    }, 2200);
    return () => clearInterval(id);
  }, [loading]);

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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 p-4 sm:p-6 text-center safe-x safe-bottom">
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
          className="rounded-xl bg-primary hover:bg-primary-hover px-8 py-3.5 text-sm font-bold text-white transition-all duration-200"
        >
          Start Live Practice
        </Link>
      </div>
    );
  }

  // ── Nav shared by loading + result views ────────────────────────────────
  const Nav = () => (
    <nav className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 safe-top safe-x">
      <Link href="/" className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base shrink-0">
        PitchPilot{" "}
        <span className="text-primary">Live</span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
        <Link href="/live" className="text-slate-500 hover:text-primary transition-colors whitespace-nowrap">← New</Link>
        <Link href="/practice" className="text-slate-500 hover:text-primary transition-colors whitespace-nowrap hidden min-[380px]:inline">Deep Analysis</Link>
        <Link href="/practice" className="text-slate-500 hover:text-primary transition-colors whitespace-nowrap min-[380px]:hidden">Analysis</Link>
      </div>
    </nav>
  );

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    const loadingScores = sessionData?.coachingHistory.map((c) => c.deliveryScore) ?? [];
    const loadingAvg = loadingScores.length > 0
      ? Math.round(loadingScores.reduce((s, n) => s + n, 0) / loadingScores.length)
      : null;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-primary/5 flex flex-col">
        <Nav />
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 safe-x">
          <div className="w-full max-w-lg flex flex-col gap-4 sm:gap-6">

            {/* Header card */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-lg shadow-slate-200/50 text-center">
              <div className="absolute inset-0 summary-shimmer pointer-events-none" />
              <div className="relative flex flex-col items-center gap-5">
                <div className="relative h-20 w-20">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" stroke="#f1f5f9" strokeWidth="5" fill="none" />
                    <circle
                      cx="40" cy="40" r="34"
                      stroke="#FFC82C" strokeWidth="5" fill="none"
                      strokeDasharray={213.6}
                      strokeDashoffset={53}
                      strokeLinecap="round"
                      className="animate-spin"
                      style={{ animationDuration: "2.5s" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black text-primary font-display">AI</span>
                  </div>
                </div>

                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display mb-1 px-1">
                    Generating your session summary
                  </h1>
                  <p
                    key={loadingStep}
                    className="text-sm text-slate-500 font-medium summary-step-active"
                  >
                    {LOADING_STEPS[loadingStep]}
                  </p>
                </div>

                {sessionData && (
                  <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">{durationStr}</span>
                    <span className="px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
                      {sessionData.coachingHistory.length} checkpoints
                    </span>
                    {loadingAvg !== null && (
                      <span className="px-2.5 sm:px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                        avg {loadingAvg}
                      </span>
                    )}
                  </div>
                )}

                {/* Progress steps */}
                <div className="flex items-center gap-2 w-full max-w-xs">
                  {LOADING_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                        i <= loadingStep ? "bg-primary" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Live score chart preview while generating */}
            {loadingScores.length > 0 && (
              <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 text-center">
                  Your delivery score so far
                </p>
                <DeliveryScoreChart
                  scores={loadingScores}
                  durationSeconds={sessionData?.durationSeconds}
                  animated
                  compact
                />
                <p className="text-[10px] text-slate-400 text-center mt-3 animate-pulse">
                  Full analysis loading…
                </p>
              </div>
            )}
          </div>
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
              className="rounded-xl bg-primary hover:bg-primary-hover px-8 py-3 text-sm font-bold text-white transition-all"
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
      <div className="border-b border-slate-100 px-4 sm:px-6 py-6 sm:py-8 lg:px-10 bg-slate-50/40 safe-x">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Session Debrief
            </span>
            {sessionData && (
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
                {durationStr} · {sessionData.coachingHistory.length} checkpoints
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 font-display">Your Interview Prep Summary</h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xl">{result.readinessStatement}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 sm:px-6 py-6 sm:py-10 lg:px-10 safe-x pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="max-w-3xl mx-auto flex flex-col gap-5 sm:gap-8">

          {/* Score row */}
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Final score */}
            <div className={`rounded-2xl border p-4 sm:p-5 flex flex-col gap-2 ${scoreBg(result.finalScore)}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Final Score</p>
              <p className={`text-3xl sm:text-4xl font-black ${scoreColor(result.finalScore)}`}>{result.finalScore}</p>
              <div className="h-1.5 w-full rounded-full bg-white/60">
                <div className={`h-1.5 rounded-full ${scoreBar(result.finalScore)} transition-all duration-700`} style={{ width: `${result.finalScore}%` }} />
              </div>
            </div>

            {/* Avg score from history */}
            {avgScoreFromHistory !== null && (
              <div className={`rounded-2xl border p-4 sm:p-5 flex flex-col gap-2 ${scoreBg(avgScoreFromHistory)}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Avg Delivery</p>
                <p className={`text-3xl sm:text-4xl font-black ${scoreColor(avgScoreFromHistory)}`}>{avgScoreFromHistory}</p>
                <p className="text-[10px] text-slate-400">across {sessionData?.coachingHistory.length} check-ins</p>
              </div>
            )}

            {/* Ready for Interview */}
            <div className={`rounded-2xl border p-4 sm:p-5 flex flex-col gap-2 min-[420px]:col-span-2 lg:col-span-1 ${result.readyForDemo ? "bg-emerald-50 border-emerald-200" : "bg-primary/5 border-primary/20"}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Interview Ready</p>
              <p className={`text-2xl sm:text-3xl font-black ${result.readyForDemo ? "text-emerald-600" : "text-primary"}`}>
                {result.readyForDemo ? "Yes ✓" : "Not yet"}
              </p>
            </div>
          </div>

          {/* Delivery score graph */}
          {sessionData && sessionData.coachingHistory.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Delivery Score Across Session
              </p>
              <DeliveryScoreChart
                scores={sessionData.coachingHistory.map((c) => c.deliveryScore)}
                durationSeconds={sessionData.durationSeconds}
                animated
              />
            </div>
          )}

          {/* Overall progress */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Overall Progress</p>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">{result.overallProgress}</p>
          </div>

          {/* Strengths + Weaknesses */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
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

            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5">
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
          <div className="rounded-2xl border-l-4 border-l-primary border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Improved 30-Second Response</p>
            <p className="text-sm text-slate-900 leading-relaxed font-bold italic">
              &ldquo;{result.improvedPitch}&rdquo;
            </p>
            <button
              onClick={() => void navigator.clipboard.writeText(result.improvedPitch)}
              className="mt-4 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
            >
              Copy to clipboard →
            </button>
          </div>

          {/* Priority fixes */}
          <div className="rounded-2xl border border-slate-950 bg-slate-950 p-4 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-4">Priority Fixes Before Interview Day</p>
            <ol className="flex flex-col gap-3">
              {result.priorityFixes.map((fix, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white font-semibold">
                  <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-blue-300 text-[10px] font-extrabold">
                    {i + 1}
                  </span>
                  {fix}
                </li>
              ))}
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/live"
              className="flex-1 text-center rounded-xl bg-primary hover:bg-primary-hover py-4 sm:py-3.5 text-xs font-bold text-white transition-all duration-200 hover:scale-[1.02] shadow-sm font-display tracking-wider uppercase min-h-[48px] flex items-center justify-center"
            >
              Practice Again
            </Link>
            <Link
              href="/practice"
              className="flex-1 text-center rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 py-4 sm:py-3.5 text-xs font-bold text-slate-700 transition-all duration-200 font-display tracking-wider uppercase min-h-[48px] flex items-center justify-center"
            >
              Deep Analysis Mode
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
