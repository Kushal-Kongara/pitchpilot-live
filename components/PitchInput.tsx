"use client";

interface PitchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PitchInput({ value, onChange }: PitchInputProps) {
  return (
    <div className="flex flex-col gap-2 text-left">
      <label className="text-sm font-bold text-slate-700">
        Your Pitch or Demo Script
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your pitch or demo script here…"
        rows={7}
        className="
          w-full resize-none rounded-xl border border-slate-200 bg-slate-50
          px-4 py-3 text-sm text-slate-800 placeholder-slate-400
          focus:outline-none focus:border-orange-500/60 focus:bg-white
          transition-all duration-200 leading-relaxed font-medium
        "
      />
      <p className="text-xs text-slate-400 leading-relaxed">
        Rough drafts are okay.{" "}
        <span className="text-slate-500 font-medium">
          PitchPilot is designed to improve messy first versions.
        </span>
      </p>
    </div>
  );
}
