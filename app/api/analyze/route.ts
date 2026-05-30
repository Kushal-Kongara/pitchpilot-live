import { NextRequest, NextResponse } from "next/server";
import { createPartFromBase64, createPartFromText } from "@google/genai";
import ai from "@/lib/gemini";
import { SYSTEM_PROMPT } from "@/lib/prompts";
import type { AnalysisResult, AnalyzeRequest, AnalyzeErrorResponse } from "@/lib/types";

const MODEL = "gemini-2.0-flash";

function stripCodeFences(text: string): string {
  // Strip ```json ... ``` or ``` ... ``` wrappers Gemini sometimes adds
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function isValidAnalysisResult(obj: unknown): obj is AnalysisResult {
  if (typeof obj !== "object" || obj === null) return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.overallScore === "number" &&
    typeof r.clarityScore === "number" &&
    typeof r.demoFlowScore === "number" &&
    typeof r.problemStatementQuality === "string" &&
    typeof r.mainFeedback === "string" &&
    typeof r.visualFeedback === "string" &&
    typeof r.improvedPitch === "string" &&
    Array.isArray(r.judgeQuestions) &&
    Array.isArray(r.checklist)
  );
}

export async function POST(req: NextRequest) {
  let body: Partial<AnalyzeRequest>;

  try {
    body = (await req.json()) as Partial<AnalyzeRequest>;
  } catch {
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { pitch, imageBase64, mimeType } = body;

  if (!pitch || typeof pitch !== "string" || pitch.trim() === "") {
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: "pitch is required and must be a non-empty string." },
      { status: 400 }
    );
  }
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: "imageBase64 is required." },
      { status: 400 }
    );
  }
  if (!mimeType || typeof mimeType !== "string") {
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: "mimeType is required." },
      { status: 400 }
    );
  }

  const userText = `Here is the pitch text from the user:\n\n${pitch.trim()}\n\nNow analyze the pitch and the attached slide/screenshot together and return your JSON coaching report.`;

  let rawText: string;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            createPartFromText(SYSTEM_PROMPT),
            createPartFromText(userText),
            createPartFromBase64(imageBase64, mimeType),
          ],
        },
      ],
    });

    rawText = response.text ?? "";
  } catch (err) {
    console.error("[PitchPilot] Gemini API error:", err);
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: "AI analysis failed. Check server logs." },
      { status: 500 }
    );
  }

  // Strip markdown code fences Gemini sometimes wraps JSON in
  const cleaned = stripCodeFences(rawText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("[PitchPilot] JSON.parse failed. Raw model output:", rawText);
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json<AnalyzeErrorResponse>(
      {
        error: "Model returned non-JSON output.",
        ...(isDev ? { raw: rawText } : {}),
      },
      { status: 500 }
    );
  }

  if (!isValidAnalysisResult(parsed)) {
    console.error("[PitchPilot] Parsed JSON missing required fields:", parsed);
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json<AnalyzeErrorResponse>(
      {
        error: "Model response missing required fields.",
        ...(isDev ? { raw: rawText } : {}),
      },
      { status: 500 }
    );
  }

  return NextResponse.json<AnalysisResult>(parsed);
}
