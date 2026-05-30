import { NextRequest, NextResponse } from "next/server";
import { createPartFromBase64, createPartFromText } from "@google/genai";
import ai from "@/lib/gemini";
import { LIVE_COACH_PROMPT } from "@/lib/prompts";
import type {
  LiveCoachResult,
  LiveCoachRequest,
  AnalyzeErrorResponse,
} from "@/lib/types";

const MODEL = "gemini-2.0-flash";

function stripCodeFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function isValidLiveCoachResult(obj: unknown): obj is LiveCoachResult {
  if (typeof obj !== "object" || obj === null) return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.primaryCue === "string" &&
    Array.isArray(r.coachingBubbles) &&
    typeof r.deliveryScore === "number" &&
    typeof r.clarityWarning === "string" &&
    typeof r.nextBestAction === "string"
  );
}

export async function POST(req: NextRequest) {
  let body: Partial<LiveCoachRequest>;

  try {
    body = (await req.json()) as Partial<LiveCoachRequest>;
  } catch {
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { transcript, imageBase64, mimeType } = body;

  if (typeof transcript !== "string") {
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: "transcript is required." },
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

  const userText =
    transcript.trim().length > 0
      ? `Transcript so far:\n\n"${transcript.trim()}"\n\nAnalyze the transcript and the live camera frame together and return your real-time coaching JSON.`
      : `The presenter has not spoken yet or transcript is empty. Analyze only the live camera frame and return your real-time coaching JSON.`;

  let rawText: string;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            createPartFromText(LIVE_COACH_PROMPT),
            createPartFromText(userText),
            createPartFromBase64(imageBase64, mimeType),
          ],
        },
      ],
    });

    rawText = response.text ?? "";
  } catch (err) {
    console.error("[LiveCoach] Gemini API error:", err);
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: "Live coach AI call failed. Check server logs." },
      { status: 500 }
    );
  }

  const cleaned = stripCodeFences(rawText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("[LiveCoach] JSON.parse failed. Raw output:", rawText);
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json<AnalyzeErrorResponse>(
      {
        error: "Model returned non-JSON output.",
        ...(isDev ? { raw: rawText } : {}),
      },
      { status: 500 }
    );
  }

  if (!isValidLiveCoachResult(parsed)) {
    console.error("[LiveCoach] Missing required fields:", parsed);
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json<AnalyzeErrorResponse>(
      {
        error: "Model response missing required fields.",
        ...(isDev ? { raw: rawText } : {}),
      },
      { status: 500 }
    );
  }

  return NextResponse.json<LiveCoachResult>(parsed);
}
