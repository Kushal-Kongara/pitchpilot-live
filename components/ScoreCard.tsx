"use client";

interface ScoreCardProps {
  title: string;
  score: number;
  label?: string;
  maxScore?: number;
}

function getScoreColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.8) return "from-emerald-400 to-teal-400";
  if (pct >= 0.6) return "from-blue-400 to-purple-400";
  return "from-orange-400 to-red-400";
}

function getScoreBg(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.8) return "bg-emerald-500/10 border-emerald-500/20";
  if (pct >= 0.6) return "bg-blue-500/10 border-blue-500/20";
  return "bg-orange-500/10 border-orange-500/20";
}

export default function ScoreCard({
  title,
  score,
  label,
  maxScore = 100,
}: ScoreCardProps) {
  const colorClass = getScoreColor(score, maxScore);
  const bgClass = getScoreBg(score, maxScore);
  const pct = Math.round((score / maxScore) * 100);

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-3 ${bgClass}`}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
        {title}
      </p>
      <div className="flex items-end gap-1.5">
        <span
          className={`text-4xl font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}
        >
          {score}
        </span>
        <span className="text-slate-500 text-sm mb-1">/ {maxScore}</span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-white/5">
        <div
          className={`h-1.5 rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {label && (
        <p className="text-xs text-slate-400">{label}</p>
      )}
    </div>
  );
}
