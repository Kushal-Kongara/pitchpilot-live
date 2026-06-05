"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LiveCoachResult, SessionData } from "@/lib/types";

// ── Web Speech API local type declarations ───────────────────────────────────
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
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
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

// ── Types ────────────────────────────────────────────────────────────────────
interface CoachingEntry {
  id: number;
  result: LiveCoachResult;
}

// ── SSE event shapes ─────────────────────────────────────────────────────────
interface SseToken  { t: string }
interface SseDone   { done: true; r: LiveCoachResult }
interface SseError  { error: string }
type SseEvent = SseToken | SseDone | SseError;

// ── Glass tokens — light so video shows through ──────────────────────────────
const G_PILL = "hud-glass rounded-full hud-text-shadow";
const G_BTN  =
  "hud-glass rounded-full px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-all duration-150 select-none cursor-pointer hud-text-shadow";

const NEUTRAL_WARNING = "Looking clear and aligned.";
const IS_DEV = process.env.NODE_ENV === "development";

// ── Helpers ──────────────────────────────────────────────────────────────────
function extractPartialCue(partial: string): string {
  const m = /"primaryCue"\s*:\s*"([^"]*)/.exec(partial);
  return m?.[1] ?? "";
}

function scoreRingStroke(n: number): string {
  if (n >= 80) return "#34d399";
  if (n >= 60) return "#FFC82C";
  return "#f87171";
}

function scoreTextClass(n: number): string {
  if (n >= 80) return "text-emerald-400";
  if (n >= 60) return "text-primary";
  return "text-red-400";
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function lastWords(text: string, count: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= count) return text.trim();
  return "…" + words.slice(-count).join(" ");
}

function getQuickTips(
  bubbles: string[],
  primaryCue: string,
  nextBestAction: string,
  max = 2,
): string[] {
  const norm = (s: string) => s.trim().toLowerCase();
  const exclude = new Set([norm(primaryCue), norm(nextBestAction)]);
  return bubbles.filter((b) => b.trim() && !exclude.has(norm(b))).slice(0, max);
}

function isNeutralWarning(warning: string): boolean {
  return warning.trim().toLowerCase() === NEUTRAL_WARNING.toLowerCase();
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LiveCoach() {
  const router = useRouter();

  // ── DOM refs ─────────────────────────────────────────────────────────────
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const menuRef     = useRef<HTMLDivElement>(null);
  const lastCueRef    = useRef("");
  const prevEntryIdRef = useRef<number | null>(null);

  // ── Session refs ──────────────────────────────────────────────────────────
  const streamRef       = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef  = useRef<ISpeechRecognition | null>(null);
  const isFetchingRef   = useRef(false);
  const isActiveRef     = useRef(false);
  const transcriptRef   = useRef("");
  const manualTextRef   = useRef("");
  const sessionStartRef = useRef(0);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isActive,           setIsActive]           = useState(false);
  const [isScreenShare,      setIsScreenShare]      = useState(false);
  const [hasSpeech,          setHasSpeech]          = useState(false);
  const [transcript,         setTranscript]         = useState("");
  const [interimText,        setInterimText]        = useState("");
  const [manualText,         setManualText]         = useState("");
  const [entries,            setEntries]            = useState<CoachingEntry[]>([]);
  const [isThinking,         setIsThinking]         = useState(false);
  const [streamingCue,       setStreamingCue]       = useState("");
  const [permError,          setPermError]          = useState<string | null>(null);
  const [reqCount,           setReqCount]           = useState(0);
  const [quotaExhausted,     setQuotaExhausted]     = useState(false);
  const [countdown,          setCountdown]          = useState<number | null>(null);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const [menuOpen,           setMenuOpen]           = useState(false);
  const [focusMode,          setFocusMode]          = useState(false);
  const [elapsed,            setElapsed]            = useState(0);
  const [warningVisible,     setWarningVisible]     = useState(false);
  const [cueAnimKey,         setCueAnimKey]         = useState(0);

  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setHasSpeech(!!(window.SpeechRecognition ?? window.webkitSpeechRecognition));
  }, []);

  // Countdown before session starts
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      void startLive();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  // Reattach stream when HUD mounts
  useEffect(() => {
    if (!isActive || !videoRef.current) return;
    const src = screenStreamRef.current ?? streamRef.current;
    if (src) videoRef.current.srcObject = src;
  }, [isActive]);

  // Reattach when source switches (camera ↔ screen)
  useEffect(() => {
    if (!videoRef.current) return;
    if (isScreenShare && screenStreamRef.current) {
      videoRef.current.srcObject = screenStreamRef.current;
    } else if (streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isScreenShare]);

  // Session elapsed timer
  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [isActive]);

  // Warning toast auto-dismiss
  useEffect(() => {
    if (!warningVisible) return;
    const t = setTimeout(() => setWarningVisible(false), 6000);
    return () => clearTimeout(t);
  }, [warningVisible, entries[0]?.id]);

  // Close overflow menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Cue crossfade when coaching updates
  useEffect(() => {
    const current = entries[0];
    if (!current) return;
    if (current.id === prevEntryIdRef.current) return;
    const prevCue = entries[1]?.result.primaryCue;
    if (current.result.primaryCue !== prevCue) {
      setCueAnimKey((k) => k + 1);
    }
    prevEntryIdRef.current = current.id;
  }, [entries]);

  // Keyboard shortcuts during active session
  useEffect(() => {
    if (!isActive) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        stopLive();
      } else if (e.key === "t" || e.key === "T") {
        setTranscriptExpanded((v) => !v);
      } else if (e.key === "m" || e.key === "M") {
        setMenuOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { cleanupSession(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Coaching call (SSE streaming) ─────────────────────────────────────────
  const doCoachingCallRef = useRef<() => Promise<void>>(async () => {});
  doCoachingCallRef.current = async function doCoachingCall() {
    if (isFetchingRef.current) return;
    const text = hasSpeech ? transcriptRef.current : manualTextRef.current;
    const imageBase64 = captureFrame();

    if (!text.trim() && !imageBase64) {
      if (isActiveRef.current) {
        setTimeout(() => { void doCoachingCallRef.current(); }, 500);
      }
      return;
    }

    isFetchingRef.current = true;
    setIsThinking(true);
    setStreamingCue("");

    try {
      const res = await fetch("/api/live-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: text.trim(),
          ...(imageBase64 ? { imageBase64, mimeType: "image/jpeg" } : {}),
        }),
      });

      if (!res.ok || !res.body) {
        if (res.status === 429) {
          setQuotaExhausted(true);
          isActiveRef.current = false;
        }
        console.error("[LiveCoach] stream HTTP error:", res.status);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let partialJson = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          const jsonStr = part.slice(6).trim();
          if (!jsonStr) continue;
          try {
            const event = JSON.parse(jsonStr) as SseEvent;

            if ("t" in event && typeof event.t === "string") {
              partialJson += event.t;
              const partial = extractPartialCue(partialJson);
              if (partial) setStreamingCue(partial);

            } else if ("done" in event && event.done && "r" in event) {
              setEntries((prev) => [{ id: Date.now(), result: event.r }, ...prev.slice(0, 4)]);
              setStreamingCue("");
              setIsThinking(false);

              if (!isNeutralWarning(event.r.clarityWarning)) {
                setWarningVisible(true);
              }

            } else if ("error" in event) {
              console.error("[LiveCoach] SSE error:", event.error);
              if (typeof event.error === "string" && event.error.includes("429")) {
                setQuotaExhausted(true);
                isActiveRef.current = false;
              }
              setIsThinking(false);
              setStreamingCue("");
            }
          } catch {
            // Incomplete SSE line
          }
        }
      }
    } catch (err) {
      console.error("[LiveCoach] SSE fetch:", err);
    } finally {
      isFetchingRef.current = false;
      setIsThinking(false);
      setStreamingCue("");
      setReqCount((n) => n + 1);
      if (isActiveRef.current) {
        setTimeout(() => { void doCoachingCallRef.current(); }, 2000);
      }
    }
  };

  function captureFrame(): string | null {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c || v.readyState < 2) return null;
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0);
    return c.toDataURL("image/jpeg", 0.75).split(",")[1] ?? null;
  }

  function cleanupSession() {
    isActiveRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
      recognitionRef.current = null;
    }
    [screenStreamRef, streamRef].forEach((ref) => {
      ref.current?.getTracks().forEach((t) => t.stop());
      ref.current = null;
    });
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  function startSpeechRecognition() {
    if (!hasSpeech) return;
    const API = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!API) return;
    const rec = new API();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let fin = "", interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) fin += t + " "; else interim += t;
      }
      if (fin) { transcriptRef.current += fin; setTranscript(transcriptRef.current); }
      setInterimText(interim);
    };
    let fatalError = false;
    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "no-speech") return;
      if (e.error === "not-allowed" || e.error === "audio-capture" || e.error === "service-not-allowed") {
        fatalError = true;
        setHasSpeech(false);
        setTranscriptExpanded(true);
      }
      console.error("[LiveCoach] speech error:", e.error);
    };
    rec.onend = () => {
      if (streamRef.current && !fatalError) {
        try { rec.start(); } catch { /* already restarting */ }
      }
    };
    rec.start();
    recognitionRef.current = rec;
  }

  async function startLive() {
    setPermError(null);
    setEntries([]);
    lastCueRef.current = "";
    prevEntryIdRef.current = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: hasSpeech });
      streamRef.current = stream;
      sessionStartRef.current = Date.now();
      setElapsed(0);
    } catch {
      setPermError("Camera access denied. Allow camera permissions in your browser and try again.");
      return;
    }
    startSpeechRecognition();
    isActiveRef.current = true;
    setReqCount(0);
    setQuotaExhausted(false);
    setTranscriptExpanded(!hasSpeech);
    setFocusMode(false);
    setMenuOpen(false);
    setWarningVisible(false);
    void doCoachingCallRef.current();
    setIsActive(true);
  }

  function stopLive() {
    const capturedTranscript = hasSpeech ? transcriptRef.current : manualTextRef.current;
    const capturedEntries = [...entriesRef.current];
    const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);

    cleanupSession();
    setIsActive(false);
    setIsScreenShare(false);
    setInterimText("");
    setStreamingCue("");
    setMenuOpen(false);
    isFetchingRef.current = false;

    if (capturedEntries.length > 0) {
      try {
        const sessionData: SessionData = {
          transcript: capturedTranscript,
          coachingHistory: capturedEntries.map((e) => e.result),
          durationSeconds,
        };
        sessionStorage.setItem("pitchpilot_session", JSON.stringify(sessionData));
        router.push("/summary");
      } catch {
        // sessionStorage unavailable
      }
    }
  }

  function clearTranscript() {
    transcriptRef.current = "";
    manualTextRef.current = "";
    setTranscript("");
    setManualText("");
    setInterimText("");
    setMenuOpen(false);
  }

  async function startScreenShare() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      if (track) track.onended = () => switchToCamera();
      setIsScreenShare(true);
      setMenuOpen(false);
    } catch { /* user cancelled */ }
  }

  function switchToCamera() {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setIsScreenShare(false);
    setMenuOpen(false);
  }

  function handleStartClick() {
    setCountdown(3);
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const latest = entries[0] ?? null;
  const prevEntry = entries[1] ?? null;

  let displayCue = streamingCue || latest?.result.primaryCue || "";
  if (!streamingCue && latest) {
    const newCue = latest.result.primaryCue;
    const prevCue = entries[1]?.result.primaryCue;
    if (newCue === prevCue && lastCueRef.current) {
      displayCue = lastCueRef.current;
    } else {
      lastCueRef.current = newCue;
      displayCue = newCue;
    }
  }

  const quickTips = latest && !focusMode
    ? getQuickTips(
        latest.result.coachingBubbles,
        latest.result.primaryCue,
        latest.result.nextBestAction,
      )
    : [];

  const scoreDelta = latest && prevEntry
    ? latest.result.deliveryScore - prevEntry.result.deliveryScore
    : null;

  const showWarningToast = warningVisible && latest && !isNeutralWarning(latest.result.clarityWarning);

  const transcriptFull = hasSpeech
    ? `${transcript}${interimText ? ` ${interimText}` : ""}`.trim()
    : manualText;

  const transcriptCollapsed = hasSpeech && !transcriptExpanded && !focusMode;

  // ═══════════════════════════════════════════════════════════════════════════
  // IDLE SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (!isActive) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[50vh] gap-5 py-8 px-4 sm:py-12 sm:px-6 text-center">
        {countdown !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-bold uppercase tracking-widest text-white/60">Get ready</p>
              <span className="text-6xl sm:text-8xl font-black text-primary font-display tabular-nums animate-cue-fade-in">
                {countdown}
              </span>
            </div>
          </div>
        )}

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
          <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <div className="flex flex-col gap-2 max-w-sm">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Ready to practice?</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Speak naturally — coaching cues appear on screen as you go.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>Camera</span>
          <span className="text-slate-300">·</span>
          <span>Mic</span>
          <span className="text-slate-300">·</span>
          <span>{hasSpeech ? "Speech" : "Manual input"}</span>
        </div>

        {permError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600 max-w-sm leading-relaxed">
            {permError}
          </div>
        )}

        {!hasSpeech && (
          <p className="text-xs text-primary font-medium max-w-sm">
            Speech recognition unavailable — you&apos;ll type responses during the session.
          </p>
        )}

        <button
          onClick={handleStartClick}
          disabled={countdown !== null}
          className="w-full max-w-xs sm:w-auto rounded-2xl bg-primary hover:bg-primary-hover px-8 sm:px-10 py-4 text-sm font-bold text-white shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-200 hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[48px]"
        >
          Start Live Practice
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FULL-SCREEN PRESENTER HUD
  // ═══════════════════════════════════════════════════════════════════════════
  const scoreCircumference = 2 * Math.PI * 18;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black safe-x">

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35" />

      {/* ══ TOP BAR ══════════════════════════════════════════════════════ */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between gap-1.5 sm:gap-3 px-3 sm:px-5 safe-top pb-2 z-20">

        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <span className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-white shrink-0 ${G_PILL}`}>
            <span className="h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-red-500 animate-pulse drop-shadow-md" />
            <span className="hud-text-shadow">LIVE</span>
          </span>
          <span className="text-[10px] sm:text-xs font-mono font-semibold text-white/80 tabular-nums hud-text-shadow">
            {formatElapsed(elapsed)}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">

          {quotaExhausted && (
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 backdrop-blur-xl border border-red-500/40 rounded-full text-[10px] font-bold text-red-300">
              Quota exhausted
            </span>
          )}

          {latest && (
            <div className={`flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 ${G_PILL}`}>
              <div className="relative h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.12)" strokeWidth="3" fill="none" />
                  <circle
                    cx="20" cy="20" r="18"
                    stroke={scoreRingStroke(latest.result.deliveryScore)}
                    strokeWidth="3" fill="none"
                    strokeDasharray={scoreCircumference}
                    strokeDashoffset={scoreCircumference - (scoreCircumference * latest.result.deliveryScore) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-[10px] sm:text-[11px] font-black hud-text-shadow ${scoreTextClass(latest.result.deliveryScore)}`}>
                  {latest.result.deliveryScore}
                </span>
              </div>
              {scoreDelta !== null && scoreDelta !== 0 && (
                <span className={`hidden sm:inline text-[10px] font-bold ${scoreDelta > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {scoreDelta > 0 ? "↑" : "↓"}{Math.abs(scoreDelta)}
                </span>
              )}
            </div>
          )}

          {/* Overflow menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More options"
              aria-expanded={menuOpen}
              className={`${G_BTN} w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center px-0 touch-manipulation`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 py-1 shadow-xl z-30">
                <button
                  onClick={() => { setFocusMode((v) => !v); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {focusMode ? "Show all panels" : "Focus mode"}
                </button>
                <button
                  onClick={() => { isScreenShare ? switchToCamera() : void startScreenShare(); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {isScreenShare ? "Switch to camera" : "Share screen"}
                </button>
                <button
                  onClick={clearTranscript}
                  disabled={!transcript && !manualText}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Clear transcript
                </button>
                {hasSpeech && (
                  <button
                    onClick={() => { setTranscriptExpanded((v) => !v); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {transcriptExpanded ? "Collapse transcript" : "Expand transcript"}
                  </button>
                )}
                {IS_DEV && (
                  <div className="px-4 py-2.5 text-[10px] font-mono text-white/40 border-t border-white/10 mt-1">
                    {reqCount}/1500 daily
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={stopLive}
            className="bg-red-500/15 backdrop-blur-sm border border-red-400/35 rounded-full px-3 sm:px-4 py-2 sm:py-1.5 text-[11px] sm:text-xs font-bold text-red-200 hover:bg-red-500/25 hover:text-red-100 transition-all duration-150 cursor-pointer hud-text-shadow touch-manipulation min-h-[40px] sm:min-h-0"
          >
            Stop
          </button>
        </div>
      </div>

      {/* ══ COACHING ZONE — top, below controls (in natural glance path) ══ */}
      <div className="absolute top-[calc(3.25rem+env(safe-area-inset-top,0px))] sm:top-[52px] left-0 right-0 z-10 flex flex-col items-center gap-2 px-3 sm:px-5 w-full max-w-3xl mx-auto pointer-events-none">
        {/* Clarity warning — prominent at top when something is off */}
        {showWarningToast && (
          <div className="pointer-events-auto hud-glass-warn flex items-start sm:items-center gap-2 w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl animate-cue-fade-in">
            <svg className="h-4 w-4 shrink-0 text-amber-300 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="flex-1 text-xs sm:text-sm font-bold text-amber-100 leading-snug hud-text-shadow-strong">{latest!.result.clarityWarning}</p>
            <button
              onClick={() => setWarningVisible(false)}
              className="shrink-0 text-amber-300/60 hover:text-amber-200 pointer-events-auto"
              aria-label="Dismiss warning"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Hero cue — main fix, easy to read while looking at camera */}
        <div
          className={`w-full hud-glass border-l-4 border-l-primary rounded-xl sm:rounded-2xl px-3.5 py-3 sm:px-6 sm:py-5 ${
            streamingCue ? "border-l-primary/70 animate-pulse" : ""
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1.5 flex items-center gap-1.5 hud-text-shadow">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse drop-shadow-md" />
            Fix this now
          </p>

          {displayCue ? (
            <p
              key={cueAnimKey}
              aria-live="polite"
              aria-atomic="true"
              className="text-lg sm:text-2xl lg:text-3xl font-black text-white leading-snug sm:leading-tight font-display animate-cue-fade-in hud-text-shadow-strong"
            >
              {displayCue}
            </p>
          ) : (
            <p className="text-lg sm:text-xl font-bold text-white/80 hud-text-shadow">
              {isThinking ? "Listening…" : "Feedback appears here in a few seconds…"}
            </p>
          )}

          {latest?.result.nextBestAction && !focusMode && (
            <p className="mt-2 text-xs sm:text-sm font-semibold text-white/90 leading-snug border-t border-white/15 pt-2 sm:pt-2.5 hud-text-shadow">
              <span className="text-primary font-bold">Then:</span>{" "}
              {latest.result.nextBestAction}
            </p>
          )}
        </div>

        {/* Quick tip chips */}
        {!focusMode && quickTips.length > 0 && (
          <div className="w-full overflow-x-auto overscroll-x-contain touch-pan-x -mx-1 px-1">
            <div className="flex items-center gap-2 min-w-min pb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 shrink-0 hud-text-shadow">
                Also try
              </span>
              {quickTips.map((tip, i) => (
                <span
                  key={i}
                  className="shrink-0 px-2.5 sm:px-3 py-1.5 hud-glass-chip rounded-full text-xs sm:text-sm font-semibold text-white hud-text-shadow whitespace-nowrap"
                >
                  {tip}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══ BOTTOM TRANSCRIPT BAR ════════════════════════════════════════ */}
      {!focusMode && (
        <div className="absolute bottom-0 left-0 right-0 hud-glass border-t border-white/10 z-10 safe-bottom">
          {transcriptCollapsed ? (
            <button
              onClick={() => setTranscriptExpanded(true)}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 w-full text-left hover:bg-white/5 transition-colors touch-manipulation min-h-[48px]"
            >
              <span className="shrink-0 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Listening
              </span>
              <p className="flex-1 text-sm text-white/85 font-medium truncate hud-text-shadow">
                {transcriptFull
                  ? lastWords(transcriptFull, 12)
                  : "Start speaking…"}
              </p>
              <svg className="h-4 w-4 shrink-0 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 min-h-[56px] sm:min-h-[72px]">
              {hasSpeech ? (
                <>
                  <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400/80 self-start pt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Listening
                  </span>
                  <div className="flex-1 overflow-y-auto max-h-14">
                    <p className="text-sm text-white/90 font-medium leading-relaxed hud-text-shadow">
                      {transcript
                        ? <>{transcript}{interimText && <span className="text-white/35 italic"> {interimText}</span>}</>
                        : <span className="text-white/25 italic font-normal">Start speaking…</span>
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => setTranscriptExpanded(false)}
                    className="shrink-0 text-white/30 hover:text-white/60 transition-colors self-start pt-0.5"
                    aria-label="Collapse transcript"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-white/30 self-start pt-0.5">
                    Type
                  </span>
                  <input
                    type="text"
                    value={manualText}
                    onChange={(e) => { manualTextRef.current = e.target.value; setManualText(e.target.value); }}
                    placeholder="Type your pitch as you speak…"
                    className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/25 focus:outline-none font-medium"
                  />
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
