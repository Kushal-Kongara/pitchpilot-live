"use client";

import { useId } from "react";

interface DeliveryScoreChartProps {
  scores: number[];
  durationSeconds?: number;
  animated?: boolean;
  compact?: boolean;
  className?: string;
}

function scoreStroke(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#FFC82C";
  return "#ef4444";
}

export default function DeliveryScoreChart({
  scores,
  durationSeconds,
  animated = true,
  compact = false,
  className = "",
}: DeliveryScoreChartProps) {
  const chartId = useId().replace(/:/g, "");

  if (scores.length === 0) return null;

  const chronological = [...scores].reverse();
  const count = chronological.length;

  const W = Math.max(400, count * 72);
  const H = compact ? 130 : 160;
  const pad = { top: 22, right: 16, bottom: 32, left: 28 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const points = chronological.map((score, i) => {
    const x = pad.left + (count === 1 ? chartW / 2 : (i / (count - 1)) * chartW);
    const y = pad.top + chartH - (score / 100) * chartH;
    return { x, y, score, index: i };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${pad.top + chartH} L ${points[0].x.toFixed(1)} ${pad.top + chartH} Z`;

  const avg = Math.round(chronological.reduce((s, n) => s + n, 0) / count);
  const avgY = pad.top + chartH - (avg / 100) * chartH;
  const latest = chronological[count - 1];
  const peak = Math.max(...chronological);
  const low = Math.min(...chronological);

  const yTicks = [0, 25, 50, 75, 100];
  const intervalSec = durationSeconds && count > 1
    ? Math.round(durationSeconds / (count - 1))
    : null;

  return (
    <div className={className}>
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Delivery Score
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              {latest}
              <span className="text-xs sm:text-sm font-semibold text-slate-400 ml-1">/100 final</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
            <span>Avg <strong className="text-slate-800">{avg}</strong></span>
            <span>Peak <strong className="text-emerald-600">{peak}</strong></span>
            <span>Low <strong className="text-red-500">{low}</strong></span>
          </div>
        </div>
      )}

      <div className="-mx-1 sm:mx-0 overflow-x-auto overscroll-x-contain touch-pan-x">
        <div
          className="relative rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 overflow-hidden min-w-[280px]"
          style={{ minWidth: count > 4 ? `${Math.min(W, count * 72)}px` : undefined }}
        >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto min-h-[120px] sm:min-h-[140px]"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Delivery score chart from ${chronological[0]} to ${latest} across ${count} checkpoints`}
        >
          <defs>
            <linearGradient id={`${chartId}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFC82C" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FFC82C" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id={`${chartId}-line`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="50%" stopColor="#FFC82C" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Grid */}
          {yTicks.map((tick) => {
            const y = pad.top + chartH - (tick / 100) * chartH;
            return (
              <g key={tick}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={W - pad.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={tick === 0 ? "0" : "4 4"}
                />
                <text
                  x={pad.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400"
                  fontSize="9"
                  fontWeight="600"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Average reference line */}
          <line
            x1={pad.left}
            y1={avgY}
            x2={W - pad.right}
            y2={avgY}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="6 4"
            opacity="0.6"
          />
          <text
            x={W - pad.right + 2}
            y={avgY + 3}
            className="fill-slate-400"
            fontSize="8"
            fontWeight="700"
          >
            avg
          </text>

          {/* Area fill */}
          <path
            d={areaPath}
            fill={`url(#${chartId}-area)`}
            className={animated ? "delivery-chart-area" : ""}
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={`url(#${chartId}-line)`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={animated ? "delivery-chart-line" : ""}
          />

          {/* Points */}
          {points.map((p) => (
            <g key={p.index}>
              <circle
                cx={p.x}
                cy={p.y}
                r={count > 4 ? 5 : 6}
                fill="white"
                stroke={scoreStroke(p.score)}
                strokeWidth="2.5"
                className={animated ? "delivery-chart-dot" : ""}
                style={{ animationDelay: `${p.index * 0.12}s` }}
              />
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                className="fill-slate-700"
                fontSize="10"
                fontWeight="800"
              >
                {p.score}
              </text>
              <text
                x={p.x}
                y={H - 10}
                textAnchor="middle"
                className="fill-slate-400"
                fontSize="8"
                fontWeight="600"
              >
                {intervalSec !== null && p.index > 0
                  ? `${Math.round((p.index * intervalSec) / 60)}:${String((p.index * intervalSec) % 60).padStart(2, "0")}`
                  : `#${p.index + 1}`}
              </text>
            </g>
          ))}
        </svg>
        </div>
      </div>

      {!compact && (
        <p className="mt-2 text-[10px] text-slate-400 font-medium text-center">
          {count} checkpoint{count !== 1 ? "s" : ""} across your session
          {durationSeconds ? ` · ${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s total` : ""}
        </p>
      )}
    </div>
  );
}
