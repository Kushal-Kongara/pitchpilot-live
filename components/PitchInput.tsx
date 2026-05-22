"use client";

interface PitchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PitchInput({ value, onChange }: PitchInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-300">
        Your Pitch or Demo Script
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your pitch or demo script here…"
        rows={7}
        className="
          w-full resize-none rounded-xl border border-white/10 bg-white/[0.03]
          px-4 py-3 text-sm text-slate-200 placeholder-slate-600
          focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05]
          transition-all duration-200 leading-relaxed
        "
      />
      <p className="text-xs text-slate-600 leading-relaxed">
        Rough drafts are okay.{" "}
        <span className="text-slate-500">
          PitchPilot is designed to improve messy first versions.
        </span>
      </p>
    </div>
  );
}
