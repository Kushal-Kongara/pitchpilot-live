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

// ── Glass tokens ─────────────────────────────────────────────────────────────
const G_CARD = "bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl";
const G_SM   = "bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl";
const G_PILL = "bg-black/40 backdrop-blur-xl border border-white/10 rounded-full";
const G_BTN  =
  "bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all duration-150 select-none cursor-pointer";

// ── Partial JSON helpers ─────────────────────────────────────────────────────
// Extracts the partially-built "primaryCue" value as tokens stream in.
function extractPartialCue(partial: string): string {
  const m = /"primaryCue"\s*:\s*"([^"]*)/.exec(partial);
  return m?.[1] ?? "";
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LiveCoach() {
  const router = useRouter();

  // ── DOM refs ─────────────────────────────────────────────────────────────
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Session refs ──────────────────────────────────────────────────────────
  const streamRef       = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef  = useRef<ISpeechRecognition | null>(null);
  const isFetchingRef   = useRef(false);
  const isActiveRef     = useRef(false);
  const transcriptRef   = useRef("");
  const manualTextRef   = useRef("");
  const sessionStartRef = useRef(0); // timestamp ms

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isActive,      setIsActive]      = useState(false);
  const [isScreenShare, setIsScreenShare] = useState(false);
  const [hasSpeech,     setHasSpeech]     = useState(false);
  const [transcript,    setTranscript]    = useState("");
  const [interimText,   setInterimText]   = useState("");
  const [manualText,    setManualText]    = useState("");
  const [entries,       setEntries]       = useState<CoachingEntry[]>([]);
  const [isThinking,    setIsThinking]    = useState(false);
  const [streamingCue,  setStreamingCue]  = useState(""); // partial primaryCue while streaming
  const [permError,     setPermError]     = useState<string | null>(null);
  const [reqCount,      setReqCount]      = useState(0); // session API call counter
  const [quotaExhausted, setQuotaExhausted] = useState(false);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setHasSpeech(!!(window.SpeechRecognition ?? window.webkitSpeechRecognition));
  }, []);

  // Reattach stream when HUD mounts (new <video> element created)
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

  // Cleanup on unmount
  useEffect(() => {
    return () => { cleanupSession(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Coaching call (SSE streaming) — ref updated every render ─────────────
  const doCoachingCallRef = useRef<() => Promise<void>>(async () => {});
  doCoachingCallRef.current = async function doCoachingCall() {
    if (isFetchingRef.current) return;
    const text = hasSpeech ? transcriptRef.current : manualTextRef.current;
    const imageBase64 = captureFrame();

    // Nothing to send yet — video still initializing or transcript empty.
    // Keep loop alive instead of dying silently.
    if (!text.trim() && !imageBase64) {
      if (isActiveRef.current) {
        setTimeout(() => { void doCoachingCallRef.current(); }, 600);
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
              // Token chunk — extract partial primaryCue for live display
              partialJson += event.t;
              const partial = extractPartialCue(partialJson);
              if (partial) setStreamingCue(partial);

            } else if ("done" in event && event.done && "r" in event) {
              // Complete result received
              setEntries((prev) => [{ id: Date.now(), result: event.r }, ...prev.slice(0, 4)]);
              setStreamingCue("");
              setIsThinking(false);

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
            // Incomplete SSE line — wait for more data
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
        setTimeout(() => { void doCoachingCallRef.current(); }, 300);
      }
    }
  };

  // ── Frame capture ─────────────────────────────────────────────────────────
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

  // ── Session lifecycle ─────────────────────────────────────────────────────
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
      // no-speech fires every ~8s when silent — expected, not an error
      if (e.error === "no-speech") return;
      // These errors mean we can't use speech recognition at all — stop retrying
      if (e.error === "not-allowed" || e.error === "audio-capture" || e.error === "service-not-allowed") {
        fatalError = true;
        setHasSpeech(false);
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: hasSpeech });
      streamRef.current = stream;
      sessionStartRef.current = Date.now();
    } catch {
      setPermError("Camera access denied. Allow camera permissions in your browser and try again.");
      return;
    }
    startSpeechRecognition();
    isActiveRef.current = true;
    setReqCount(0);
    setQuotaExhausted(false);
    void doCoachingCallRef.current();
    setIsActive(true);
  }

  function stopLive() {
    // Capture state before cleanup clears it
    const capturedTranscript = transcript;
    const capturedEntries = [...entries];
    const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);

    cleanupSession();
    setIsActive(false);
    setIsScreenShare(false);
    setInterimText("");
    setStreamingCue("");
    isFetchingRef.current = false;

    // Navigate to summary if there's something to show
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
        // sessionStorage unavailable (private mode, etc.) — stay on page
      }
    }
  }

  function clearTranscript() {
    transcriptRef.current = "";
    manualTextRef.current = "";
    setTranscript("");
    setManualText("");
    setInterimText("");
  }

  async function startScreenShare() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      if (track) track.onended = () => switchToCamera();
      setIsScreenShare(true);
    } catch { /* user cancelled */ }
  }

  function switchToCamera() {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setIsScreenShare(false);
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const latest = entries[0] ?? null;
  // Show streaming partial cue while receiving, then snap to full result
  const displayCue = streamingCue || latest?.result.primaryCue;

  // ═══════════════════════════════════════════════════════════════════════════
  // IDLE SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 py-12 px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-sm">
          <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <div className="flex flex-col gap-3 max-w-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">Start when you&apos;re ready.</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your camera fills the screen. PitchPilot Live reviews your posture, tracks your pacing, and drops
            coaching recommendations continuously as you speak.
          </p>
          {!hasSpeech && (
            <p className="text-xs text-primary font-medium">
              Speech recognition not available in this browser.
              You&apos;ll type your responses in the transcript bar.
            </p>
          )}
        </div>

        {permError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600 max-w-sm leading-relaxed">
            {permError}
          </div>
        )}

        <button
          onClick={startLive}
          className="rounded-2xl bg-primary hover:bg-primary-hover px-10 py-4 text-sm font-bold text-white shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-200 hover:scale-[1.03]"
        >
          Start Live Practice
        </button>

        <p className="text-xs text-slate-400">
          Camera + mic accessed on start. Session summary generated on Stop.
        </p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FULL-SCREEN PRESENTER HUD
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black">

      {/* Video background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Gradient vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/5 to-black/75" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black/30 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/30 to-transparent" />

      {/* ══ TOP BAR ══════════════════════════════════════════════════════ */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between gap-3 px-5 pt-4 pb-3">

        {/* Left: branding + status */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 ${G_PILL}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-extrabold text-white tracking-tight">
              PitchPilot <span className="text-blue-300">Live</span>
            </span>
          </div>

          <span className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white ${G_PILL}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>

          <span className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-200 ${G_PILL}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            Posture Control
          </span>

          {isScreenShare && (
            <span className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-300 ${G_PILL}`}>
              🖥 Screen
            </span>
          )}

          {/* Streaming indicator */}
          {isThinking && (
            <span className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-300 ${G_PILL}`}>
              <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Reviewing…
            </span>
          )}

          {hasSpeech && !isThinking && (
            <span className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 ${G_PILL}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Listening
            </span>
          )}
        </div>

        {/* Right: score + controls */}
        <div className="flex items-center gap-2 flex-wrap justify-end">

          {/* Free tier quota indicator — gemini-2.0-flash: 1500 RPD */}
          {quotaExhausted ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 backdrop-blur-xl border border-red-500/40 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[10px] font-bold text-red-300">Quota exhausted</span>
              <span className="text-[10px] text-red-400/70 font-medium">· resets daily</span>
            </div>
          ) : (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 ${G_PILL}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${reqCount >= 1400 ? "bg-red-400" : reqCount >= 1000 ? "bg-yellow-400" : "bg-emerald-400"}`} />
              <span className="text-[10px] font-bold text-white/70">
                {reqCount}<span className="text-white/40">/1500</span>
              </span>
              <span className="text-[10px] text-white/40 font-medium">daily</span>
            </div>
          )}

          {latest && (
            <div className={`flex items-center gap-2 px-3 py-1.5 ${G_PILL}`}>
              <div className="relative h-7 w-7 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 28 28">
                  <circle cx="14" cy="14" r="11" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" fill="none" />
                  <circle
                    cx="14" cy="14" r="11"
                    stroke="#1A1AA7" strokeWidth="2.5" fill="none"
                    strokeDasharray={69.12}
                    strokeDashoffset={69.12 - (69.12 * latest.result.deliveryScore) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">
                  {latest.result.deliveryScore}
                </span>
              </div>
              <span className="text-xs font-bold text-white/80">Score</span>
            </div>
          )}

          {isScreenShare
            ? <button onClick={switchToCamera} className={G_BTN}>📷 Camera</button>
            : <button onClick={startScreenShare} className={G_BTN}>🖥 Screen</button>
          }
          <button onClick={clearTranscript} disabled={!transcript && !manualText}
            className={`${G_BTN} disabled:opacity-30 disabled:cursor-not-allowed`}>
            Clear
          </button>
          <button onClick={stopLive}
            className="bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-full px-3.5 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/30 hover:text-red-200 transition-all duration-150 cursor-pointer">
            ■ Stop
          </button>
        </div>
      </div>

      {/* ══ PRIMARY CUE — center-left ════════════════════════════════════ */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 max-w-[42vw]">
        {displayCue ? (
          <div className={`p-5 ${G_CARD}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-2">
              {streamingCue ? "⚡ Streaming" : "Coach"}
            </p>
            <p className="text-2xl sm:text-3xl font-black text-white leading-tight font-display">
              {displayCue}
              {/* Blinking cursor while streaming */}
              {streamingCue && (
                <span className="inline-block w-0.5 h-7 bg-primary ml-0.5 animate-pulse align-bottom" />
              )}
            </p>
          </div>
        ) : (
          <div className={`p-5 ${G_CARD} opacity-50`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Coach</p>
            <p className="text-xl font-bold text-white/40">
              {isThinking ? "Analyzing…" : "First cue in ~4 seconds…"}
            </p>
          </div>
        )}
      </div>

      {/* ══ COACHING BUBBLES — right side ════════════════════════════════ */}
      {latest && latest.result.coachingBubbles.length > 0 && (
        <div className="absolute right-6 top-20 bottom-36 flex flex-col justify-center gap-2.5 max-w-[180px] sm:max-w-[200px]">
          {latest.result.coachingBubbles.map((bubble, i) => (
            <div key={i} className={`px-4 py-2.5 ${G_SM}`}>
              <p className="text-sm font-semibold text-white/90 leading-snug">{bubble}</p>
            </div>
          ))}
        </div>
      )}

      {/* ══ PREVIOUS CUES — faded right strip ════════════════════════════ */}
      {entries.length > 1 && (
        <div className="absolute right-6 flex flex-col gap-1.5 max-w-[180px]"
          style={{ top: `${20 + (latest?.result.coachingBubbles.length ?? 0) * 54 + 80}px` }}>
          {entries.slice(1, 3).map((e) => (
            <div key={e.id} className={`px-3 py-1.5 opacity-40 ${G_SM}`}>
              <p className="text-[11px] font-semibold text-white/70 truncate">→ {e.result.primaryCue}</p>
            </div>
          ))}
        </div>
      )}

      {/* ══ NEXT BEST ACTION — bottom-right ══════════════════════════════ */}
      {latest && (
        <div className="absolute bottom-[88px] right-6 max-w-[220px] sm:max-w-[260px]">
          <div className={`p-4 ${G_CARD}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-1.5">Next</p>
            <p className="text-sm font-bold text-white leading-snug">{latest.result.nextBestAction}</p>
          </div>
        </div>
      )}

      {/* ══ CLARITY WARNING — bottom-center-left ═════════════════════════ */}
      {latest && (
        <div className="absolute bottom-[88px] left-6 max-w-[38vw]">
          <div className={`px-4 py-2.5 ${G_CARD}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400 mb-1">Warning</p>
            <p className="text-xs font-semibold text-white/80 leading-snug">{latest.result.clarityWarning}</p>
          </div>
        </div>
      )}

      {/* ══ BOTTOM TRANSCRIPT BAR ════════════════════════════════════════ */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/55 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center gap-3 px-5 py-3 min-h-[72px]">
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-white/30 self-start pt-0.5">
            Transcript
          </span>
          <div className="flex-1 overflow-y-auto max-h-14">
            {hasSpeech ? (
              <p className="text-sm text-white/80 font-medium leading-relaxed">
                {transcript
                  ? <>{transcript}{interimText && <span className="text-white/35 italic"> {interimText}</span>}</>
                  : <span className="text-white/25 italic font-normal">Start speaking…</span>
                }
              </p>
            ) : (
              <input
                type="text"
                value={manualText}
                onChange={(e) => { manualTextRef.current = e.target.value; setManualText(e.target.value); }}
                placeholder="Type your pitch as you speak…"
                className="w-full bg-transparent text-sm text-white/80 placeholder-white/25 focus:outline-none font-medium"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
