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
