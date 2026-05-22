"use client";

import ScoreCard from "./ScoreCard";

const MOCK_RESULT = {
  pitchScore: 78,
  clarityScore: 72,
  demoFlowScore: 81,
  missing:
    "You explain the product features, but the problem and target user are not clear enough.",
  improvedPitch:
    "Hackathon teams often build strong products but struggle to explain them clearly. PitchPilot Live helps teams practice by analyzing their slide and pitch together, then giving instant feedback on story, clarity, and judge readiness.",
  judgeQuestions: [
    "Who is your target user?",
    "Why is this better than a normal chatbot?",
    "How does this use multimodal AI?",
    "What data is stored?",
    "How would this scale after the hackathon?",
  ],
  checklist: [
    "Start with the problem",
    "Explain the target user",
    "Show one strong demo moment",
    "Mention Gemini clearly",
    "End with impact",
  ],
};

interface AnalysisDashboardProps {
  loading: boolean;
  hasResult: boolean;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
      {children}
    </h3>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/5 bg-white/[0.03] p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export default function AnalysisDashboard({
  loading,
  hasResult,
}: AnalysisDashboardProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
          <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-spin" />
        </div>
        <p className="text-sm text-slate-400">Analyzing your pitch…</p>
        <p className="text-xs text-slate-600">Checking clarity, story, and demo flow</p>
      </div>
    );
  }

  if (!hasResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 rounded-2xl border border-dashed border-white/5">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/10">
          <svg
            className="h-6 w-6 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-400">
          Your coaching report will appear here.
        </p>
        <p className="text-xs text-slate-600 text-center max-w-[220px]">
          Upload a visual and paste your pitch, then click Analyze.
        </p>
      </div>
    );
  }

  const r = MOCK_RESULT;

  return (
    <div className="flex flex-col gap-6">
      {/* Score row */}
      <div>
        <SectionHeader>Scores</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ScoreCard title="Overall Pitch" score={r.pitchScore} />
          <ScoreCard title="Clarity" score={r.clarityScore} />
          <ScoreCard title="Demo Flow" score={r.demoFlowScore} />
        </div>
      </div>

      {/* What's missing */}
      <Card>
        <SectionHeader>What&apos;s Missing</SectionHeader>
        <p className="text-sm text-slate-300 leading-relaxed">{r.missing}</p>
      </Card>

      {/* Improved pitch */}
      <Card>
        <SectionHeader>Improved 30-Second Pitch</SectionHeader>
        <p className="text-sm text-slate-300 leading-relaxed italic">
          &ldquo;{r.improvedPitch}&rdquo;
        </p>
      </Card>

      {/* Judge questions */}
      <Card>
        <SectionHeader>Likely Judge Questions</SectionHeader>
        <ul className="flex flex-col gap-2">
          {r.judgeQuestions.map((q, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/15 text-purple-400 text-[10px] font-bold">
                {i + 1}
              </span>
              {q}
            </li>
          ))}
        </ul>
      </Card>

      {/* Checklist */}
      <Card>
        <SectionHeader>Final Demo Checklist</SectionHeader>
        <ul className="flex flex-col gap-2">
          {r.checklist.map((item, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
              <svg
                className="h-4 w-4 shrink-0 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
