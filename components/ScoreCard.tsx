"use client";

interface ScoreCardProps {
  title: string;
  score: number;
  label?: string;
  maxScore?: number;
}

export default function ScoreCard({
  title,
  score,
  label,
  maxScore = 100,
}: ScoreCardProps) {
  const pct = Math.round((score / maxScore) * 100);
  // SVG circle geometry properties for the gauge ring
  const radius = 22;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-300">
      <div className="flex flex-col gap-1 text-left">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {title}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-slate-900 tracking-tight">
            {score}
          </span>
          <span className="text-xs text-slate-400 font-semibold uppercase">
            / {maxScore}
          </span>
        </div>
        {label && <p className="text-[10px] text-slate-400 leading-normal mt-1">{label}</p>}
      </div>

      {/* Modern Circular Gauge */}
      <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          {/* Base background circle */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke="#f1f5f9" /* slate-100 */
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Glowing orange progress circle */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke="#f97316" /* orange-500 */
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-[10px] font-black text-slate-800">{pct}%</span>
      </div>
    </div>
  );
}
