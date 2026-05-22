"use client";

import { useState } from "react";
import Link from "next/link";
import UploadBox from "@/components/UploadBox";
import PitchInput from "@/components/PitchInput";
import AnalysisDashboard from "@/components/AnalysisDashboard";

export default function PracticePage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pitch, setPitch] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  function handleFileSelect(file: File) {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  async function handleAnalyze() {
    if (!pitch.trim() && !imageFile) return;
    setLoading(true);
    setHasResult(false);
    // Fake 1-second delay — swap for real API call later
    await new Promise((r) => setTimeout(r, 1100));
    setLoading(false);
    setHasResult(true);
  }

  const canAnalyze = pitch.trim().length > 0 || imageFile !== null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between shrink-0">
        <Link href="/" className="font-semibold text-white tracking-tight hover:opacity-80 transition-opacity">
          PitchPilot{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Live
          </span>
        </Link>
        <span className="text-xs text-slate-600">Practice Mode</span>
      </nav>

      {/* Main layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left: Inputs */}
        <div className="border-b lg:border-b-0 lg:border-r border-white/5 p-6 lg:p-10 flex flex-col gap-6">
          <div>
            <h1 className="text-lg font-semibold text-white mb-1">
              Your Demo Materials
            </h1>
            <p className="text-sm text-slate-500">
              Add a slide or screenshot and your pitch to get started.
            </p>
          </div>

          <UploadBox onFileSelect={handleFileSelect} preview={imagePreview} />

          <PitchInput value={pitch} onChange={setPitch} />

          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze || loading}
            className="
              w-full rounded-xl py-3.5 text-sm font-semibold transition-all duration-200
              bg-gradient-to-r from-blue-600 to-purple-600
              hover:from-blue-500 hover:to-purple-500
              shadow-lg shadow-blue-500/10
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-purple-600
              text-white
            "
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
              "Analyze My Pitch"
            )}
          </button>

          <p className="text-xs text-slate-600 text-center">
            Add at least a pitch or a screenshot to analyze.
          </p>
        </div>

        {/* Right: Dashboard */}
        <div className="p-6 lg:p-10 overflow-y-auto">
          <h2 className="text-lg font-semibold text-white mb-6">
            Coaching Report
          </h2>
          <AnalysisDashboard loading={loading} hasResult={hasResult} />
        </div>
      </div>
    </div>
  );
}
