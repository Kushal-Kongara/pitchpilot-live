import { NextRequest, NextResponse } from "next/server";
import { createPartFromText } from "@google/genai";
import ai from "@/lib/gemini";
import { SESSION_SUMMARY_PROMPT } from "@/lib/prompts";
import type {
  SessionData,
  SessionSummaryResult,
  AnalyzeErrorResponse,
} from "@/lib/types";

const MODEL = "gemini-2.0-flash";

function stripCodeFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

function isValidSummaryResult(obj: unknown): obj is SessionSummaryResult {
  if (typeof obj !== "object" || obj === null) return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.overallProgress === "string" &&
    typeof r.finalScore === "number" &&
    Array.isArray(r.topStrengths) &&
    Array.isArray(r.persistentWeaknesses) &&
    typeof r.improvedPitch === "string" &&
    Array.isArray(r.priorityFixes) &&
    typeof r.readyForDemo === "boolean" &&
    typeof r.readinessStatement === "string"
  );
}

export async function POST(req: NextRequest) {
  let body: Partial<SessionData>;
  try {
    body = (await req.json()) as Partial<SessionData>;
  } catch {
    return NextResponse.json<AnalyzeErrorResponse>({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { transcript, coachingHistory, durationSeconds } = body;

  if (typeof transcript !== "string") {
    return NextResponse.json<AnalyzeErrorResponse>({ error: "transcript required." }, { status: 400 });
  }
  if (!Array.isArray(coachingHistory) || coachingHistory.length === 0) {
    return NextResponse.json<AnalyzeErrorResponse>({ error: "coachingHistory must be a non-empty array." }, { status: 400 });
  }
  if (typeof durationSeconds !== "number") {
    return NextResponse.json<AnalyzeErrorResponse>({ error: "durationSeconds required." }, { status: 400 });
  }

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  const sessionContext = [
    `Session duration: ${durationStr}`,
    `Number of coaching check-ins: ${coachingHistory.length}`,
    "",
    "=== FULL TRANSCRIPT ===",
    transcript.trim() || "(no transcript captured)",
    "",
    "=== COACHING HISTORY (chronological) ===",
    ...coachingHistory.map((c, i) => [
      `[Check-in ${i + 1}]`,
      `  Primary cue: "${c.primaryCue}"`,
      `  Delivery score: ${c.deliveryScore}/100`,
      `  Clarity warning: "${c.clarityWarning}"`,
      `  Next action: "${c.nextBestAction}"`,
      `  Bubbles: ${c.coachingBubbles.map((b) => `"${b}"`).join(", ")}`,
    ].join("\n")),
  ].join("\n");

  let rawText: string;
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{
        role: "user",
        parts: [
          createPartFromText(SESSION_SUMMARY_PROMPT),
          createPartFromText(sessionContext),
        ],
      }],
    });
    rawText = response.text ?? "";
  } catch (err) {
    console.error("[SessionSummary] Gemini error:", err);
    return NextResponse.json<AnalyzeErrorResponse>({ error: "AI summary failed. Check server logs." }, { status: 500 });
  }

  const cleaned = stripCodeFences(rawText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("[SessionSummary] JSON.parse failed:", rawText);
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: "Model returned non-JSON.", ...(isDev ? { raw: rawText } : {}) },
      { status: 500 }
    );
  }

  if (!isValidSummaryResult(parsed)) {
    console.error("[SessionSummary] schema mismatch:", parsed);
    return NextResponse.json<AnalyzeErrorResponse>({ error: "Model response missing required fields." }, { status: 500 });
  }

  return NextResponse.json<SessionSummaryResult>(parsed);
}
