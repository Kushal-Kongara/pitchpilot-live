export interface AnalysisResult {
  overallScore: number;
  clarityScore: number;
  demoFlowScore: number;
  problemStatementQuality: string;
  mainFeedback: string;
  visualFeedback: string;
  improvedPitch: string;
  judgeQuestions: string[];
  checklist: string[];
}

export interface AnalyzeRequest {
  pitch: string;
  imageBase64: string;
  mimeType: string;
}

export interface AnalyzeErrorResponse {
  error: string;
  raw?: string; // dev-only
}

// ── Live Coach ──────────────────────────────────────────────────────────────

export interface LiveCoachResult {
  primaryCue: string;
  coachingBubbles: string[];
  deliveryScore: number;
  clarityWarning: string;
  nextBestAction: string;
}

export interface LiveCoachRequest {
  transcript: string;
  imageBase64: string;
  mimeType: string;
}

// ── Session Summary ─────────────────────────────────────────────────────────

export interface SessionData {
  transcript: string;
  coachingHistory: LiveCoachResult[];
  durationSeconds: number;
}

export interface SessionSummaryResult {
  overallProgress: string;
  finalScore: number;
  topStrengths: string[];
  persistentWeaknesses: string[];
  improvedPitch: string;
  priorityFixes: string[];
  readyForDemo: boolean;
  readinessStatement: string;
}
