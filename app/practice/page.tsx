"use client";

import { useState } from "react";
import Link from "next/link";
import UploadBox from "@/components/UploadBox";
import PitchInput from "@/components/PitchInput";
import AnalysisDashboard from "@/components/AnalysisDashboard";
import type { AnalysisResult, AnalyzeErrorResponse } from "@/lib/types";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      if (!base64) reject(new Error("Failed to read file as base64"));
      else resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function PracticePage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pitch, setPitch] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(file: File) {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  async function handleAnalyze() {
    if (!pitch.trim() || !imageFile) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const imageBase64 = await fileToBase64(imageFile);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitch: pitch.trim(),
          imageBase64,
          mimeType: imageFile.type,
        }),
      });

      const data = (await res.json()) as AnalysisResult | AnalyzeErrorResponse;

      if (!res.ok) {
        const errData = data as AnalyzeErrorResponse;
        setError(errData.error ?? "Analysis failed. Please try again.");
      } else {
        setResult(data as AnalysisResult);
      }
    } catch (err) {
      console.error("[PitchPilot] fetch error:", err);
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const canAnalyze = pitch.trim().length > 0 && imageFile !== null;

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
            href="/live"
            className="flex items-center gap-1.5 text-xs text-primary font-bold hover:text-primary-hover transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Live Reviewer Mode
          </Link>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Practice Mode</span>
        </div>
      </nav>

      {/* Main layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left: Inputs */}
        <div className="bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-6 lg:p-10 flex flex-col gap-6">
          <div className="text-left">
            <h1 className="text-lg font-extrabold text-slate-900 mb-1">
              Your Practice Materials
            </h1>
            <p className="text-sm text-slate-450 font-medium">
              Upload your resume, slide, or screenshot and paste your response script to get evaluated.
            </p>
          </div>

          <UploadBox onFileSelect={handleFileSelect} preview={imagePreview} />

          <PitchInput value={pitch} onChange={setPitch} />

          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze || loading}
            className="
              w-full rounded-xl py-3.5 text-sm font-bold transition-all duration-200
              bg-primary text-white hover:bg-primary-hover
              shadow-md shadow-primary/5 hover:shadow-primary/10
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary
              hover:scale-[1.01]
            "
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Analyzing…
              </span>
            ) : (
              "Analyze My Response"
            )}
          </button>

          <p className="text-xs text-slate-400 font-medium text-center">
            Both a visual reference and response text are required for analysis.
          </p>
        </div>

        {/* Right: Dashboard */}
        <div className="p-6 lg:p-10 overflow-y-auto bg-slate-50/50 text-left">
          <h2 className="text-lg font-extrabold text-slate-900 mb-6">
            Coaching Report
          </h2>
          <AnalysisDashboard loading={loading} result={result} error={error} />
        </div>
      </div>
    </div>
  );
}
