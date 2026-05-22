"use client";

import { useRef, useState, useEffect } from "react";
import type { LiveCoachResult } from "@/lib/types";

// ── Web Speech API type declarations ────────────────────────────────────────
// Not included in all TypeScript DOM lib configs; declared locally to be safe.

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  }
}

interface CoachingEntry {
  id: number;
  result: LiveCoachResult;
}

// ── Score colour helpers ─────────────────────────────────────────────────────

function scoreGradient(score: number): string {
  if (score >= 80) return "from-emerald-400 to-teal-400";
  if (score >= 60) return "from-blue-400 to-purple-400";
  return "from-orange-400 to-red-400";
}

function scoreBg(score: number): string {
  if (score >= 80) return "border-emerald-500/30 bg-emerald-500/10";
  if (score >= 60) return "border-blue-500/30 bg-blue-500/10";
  return "border-orange-500/30 bg-orange-500/10";
}

// ── Component ────────────────────────────────────────────────────────────────

export default function LiveCoach() {
  // ── DOM refs ────────────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Live-session refs (never trigger re-render) ──────────────────────────
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFetchingRef = useRef(false);
  // Mirror of transcript state — readable inside interval without stale closure
  const transcriptRef = useRef("");

  // ── UI state ────────────────────────────────────────────────────────────
  const [isActive, setIsActive] = useState(false);
  const [hasSpeech, setHasSpeech] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  // Fallback textarea when SpeechRecognition unavailable
  const [manualText, setManualText] = useState("");
  const manualTextRef = useRef("");

  const [entries, setEntries] = useState<CoachingEntry[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);

  // ── Speech support detection (client only) ───────────────────────────────
  useEffect(() => {
    setHasSpeech(!!(window.SpeechRecognition ?? window.webkitSpeechRecognition));
  }, []);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cleanupSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── doCoachingCall stored in a ref so the interval always gets latest ────
  // Pattern: reassign ref each render → interval reads fresh closure each tick.
  const doCoachingCallRef = useRef<() => Promise<void>>(async () => {});
  doCoachingCallRef.current = async function doCoachingCall() {
    if (isFetchingRef.current) return;

    const currentTranscript = hasSpeech
      ? transcriptRef.current
      : manualTextRef.current;

    const imageBase64 = captureFrame();

    // Skip if nothing to send
    if (!currentTranscript.trim() && !imageBase64) return;

    isFetchingRef.current = true;
    setIsThinking(true);

    try {
      const res = await fetch("/api/live-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: currentTranscript.trim(),
          imageBase64: imageBase64 ?? "",
          mimeType: "image/jpeg",
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as LiveCoachResult;
        setEntries((prev) => [
          { id: Date.now(), result: data },
          ...prev.slice(0, 4), // keep last 5 entries
        ]);
      } else {
        console.error("[LiveCoach] API returned", res.status);
      }
    } catch (err) {
      console.error("[LiveCoach] fetch error:", err);
    } finally {
      isFetchingRef.current = false;
      setIsThinking(false);
    }
  };

  // ── Capture current webcam frame as JPEG base64 ──────────────────────────
  function captureFrame(): string | null {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
    return dataUrl.split(",")[1] ?? null;
  }

  // ── Session lifecycle ────────────────────────────────────────────────────
  function cleanupSession() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try {
        recognitionRef.current.stop();
      } catch {
        // already stopped
      }
      recognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  async function startLive() {
    setPermError(null);
    setEntries([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: hasSpeech, // request mic only when we'll use speech API
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setPermError(
        "Camera access denied. Allow camera permissions in your browser and try again."
      );
      return;
    }

    // Start SpeechRecognition if available
    if (hasSpeech) {
      const SpeechRecognitionAPI =
        window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const rec = new SpeechRecognitionAPI();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onresult = (event: SpeechRecognitionEvent) => {
          let finalChunk = "";
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const text = event.results[i][0].transcript;
            if (event.results[i].isFinal) finalChunk += text + " ";
            else interim += text;
          }
          if (finalChunk) {
            const updated = transcriptRef.current + finalChunk;
            transcriptRef.current = updated;
            setTranscript(updated);
          }
          setInterimText(interim);
        };

        rec.onerror = (e: Event) =>
          console.error("[LiveCoach] speech error:", e);

        // Auto-restart if recognition stops unexpectedly while session is live
        rec.onend = () => {
          if (streamRef.current) {
            try {
              rec.start();
            } catch {
              // ignore
            }
          }
        };

        rec.start();
        recognitionRef.current = rec;
      }
    }

    // Kick off coaching on a 7-second interval
    intervalRef.current = setInterval(() => {
      void doCoachingCallRef.current();
    }, 7000);

    setIsActive(true);
  }

  function stopLive() {
    cleanupSession();
    setIsActive(false);
    setInterimText("");
    isFetchingRef.current = false;
  }

  function clearTranscript() {
    transcriptRef.current = "";
    manualTextRef.current = "";
    setTranscript("");
    setManualText("");
    setInterimText("");
  }

  // ── Render ───────────────────────────────────────────────────────────────
  const latest = entries[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Video + Controls ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video card */}
        <div className="flex flex-col gap-3">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Status overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              {isActive ? (
                <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs text-red-400 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                  LIVE
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs text-slate-500 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  READY
                </span>
              )}
            </div>
            {/* Thinking overlay */}
            {isThinking && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs text-blue-300 backdrop-blur-sm">
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Coaching…
              </div>
            )}
            {/* Empty state */}
            {!isActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400">Camera preview will appear here</p>
              </div>
            )}
          </div>

          {/* Hidden canvas for frame capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Controls */}
          <div className="flex gap-3">
            {!isActive ? (
              <button
                onClick={startLive}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-sm font-semibold text-white hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-blue-500/10"
              >
                Start Live Practice
              </button>
            ) : (
              <button
                onClick={stopLive}
                className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-all duration-200"
              >
                Stop
              </button>
            )}
            <button
              onClick={clearTranscript}
              disabled={!transcript && !manualText}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400 hover:border-white/20 hover:text-slate-300 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>

          {/* Permission error */}
          {permError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400 leading-relaxed">
              {permError}
            </div>
          )}

          {/* Speech API notice */}
          {!hasSpeech && (
            <p className="text-xs text-amber-500/80 leading-relaxed">
              Speech recognition not available in this browser. Type your pitch below as you speak.
            </p>
          )}
        </div>

        {/* Transcript card */}
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 flex flex-col gap-3 min-h-[200px]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Live Transcript
              </h3>
              {hasSpeech && isActive && (
                <span className="flex items-center gap-1 text-[10px] text-blue-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Listening
                </span>
              )}
            </div>

            {hasSpeech ? (
              <div className="flex-1 text-sm text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                {transcript || interimText ? (
                  <>
                    <span>{transcript}</span>
                    {interimText && (
                      <span className="text-slate-500 italic">{interimText}</span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-600">
                    {isActive
                      ? "Start speaking — transcript appears here…"
                      : "Transcript will appear once you start."}
                  </span>
                )}
              </div>
            ) : (
              <textarea
                value={manualText}
                onChange={(e) => {
                  manualTextRef.current = e.target.value;
                  setManualText(e.target.value);
                }}
                placeholder="Type your pitch as you say it — PitchPilot reads this alongside your camera…"
                rows={6}
                className="flex-1 resize-none bg-transparent text-sm text-slate-300 placeholder-slate-600 focus:outline-none leading-relaxed"
              />
            )}
          </div>

          {/* Info blurb */}
          <p className="text-xs text-slate-600 leading-relaxed px-1">
            PitchPilot captures a camera frame every 7 seconds and sends it with your transcript for real-time coaching.
          </p>
        </div>
      </div>

      {/* ── Coaching output ───────────────────────────────────────────── */}
      {(entries.length > 0 || isThinking) && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Live Coaching
          </h3>

          {/* Thinking state */}
          {isThinking && entries.length === 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <div className="relative h-8 w-8 shrink-0">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-spin" />
              </div>
              <p className="text-sm text-slate-400">Analyzing your pitch and camera…</p>
            </div>
          )}

          {/* Latest entry */}
          {latest && (
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 flex flex-col gap-5">
              {/* Primary cue banner */}
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </span>
                <p className="text-base font-semibold text-white leading-snug">
                  {latest.result.primaryCue}
                </p>
                {isThinking && (
                  <span className="ml-auto shrink-0 flex items-center gap-1 text-[10px] text-blue-400">
                    <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Updating
                  </span>
                )}
              </div>

              {/* Coaching bubbles */}
              <div className="flex flex-wrap gap-2">
                {latest.result.coachingBubbles.map((bubble, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                  >
                    {bubble}
                  </span>
                ))}
              </div>

              {/* Delivery score + warning + next action */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Score */}
                <div className={`rounded-xl border p-3 flex flex-col gap-1 ${scoreBg(latest.result.deliveryScore)}`}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Delivery
                  </p>
                  <p className={`text-2xl font-bold bg-gradient-to-r ${scoreGradient(latest.result.deliveryScore)} bg-clip-text text-transparent`}>
                    {latest.result.deliveryScore}
                    <span className="text-sm text-slate-500 font-normal"> / 100</span>
                  </p>
                  <div className="h-1 w-full rounded-full bg-white/5">
                    <div
                      className={`h-1 rounded-full bg-gradient-to-r ${scoreGradient(latest.result.deliveryScore)} transition-all duration-700`}
                      style={{ width: `${latest.result.deliveryScore}%` }}
                    />
                  </div>
                </div>

                {/* Clarity warning */}
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 flex flex-col gap-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Warning
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {latest.result.clarityWarning}
                  </p>
                </div>

                {/* Next action */}
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 flex flex-col gap-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Next
                  </p>
                  <p className="text-xs text-purple-300 leading-relaxed">
                    {latest.result.nextBestAction}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Previous entries (compact) */}
          {entries.length > 1 && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-1">
                Previous cues
              </p>
              {entries.slice(1).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 opacity-60"
                >
                  <span className="text-xs text-slate-500 shrink-0 mt-0.5">→</span>
                  <span className="text-xs text-slate-400">{entry.result.primaryCue}</span>
                  <div className="ml-auto flex flex-wrap gap-1">
                    {entry.result.coachingBubbles.slice(0, 2).map((b, i) => (
                      <span key={i} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Empty coaching state ──────────────────────────────────────── */}
      {entries.length === 0 && !isThinking && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/5 py-12 gap-3">
          <p className="text-sm text-slate-500">
            {isActive
              ? "First coaching cue arrives in ~7 seconds…"
              : "Start Live Practice to begin real-time coaching."}
          </p>
        </div>
      )}
    </div>
  );
}
