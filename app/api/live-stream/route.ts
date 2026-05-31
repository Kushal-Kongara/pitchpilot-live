import { NextRequest, NextResponse } from "next/server";
import { createPartFromBase64, createPartFromText } from "@google/genai";
import ai from "@/lib/gemini";
import { LIVE_COACH_PROMPT } from "@/lib/prompts";
import type { LiveCoachRequest, AnalyzeErrorResponse, LiveCoachResult } from "@/lib/types";

const MODEL = "gemini-2.0-flash";

function stripCodeFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
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
    return NextResponse.json<AnalyzeErrorResponse>({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { transcript, imageBase64, mimeType } = body;

  if (typeof transcript !== "string") {
    return NextResponse.json<AnalyzeErrorResponse>({ error: "transcript required." }, { status: 400 });
  }

  const hasImage = typeof imageBase64 === "string" && imageBase64.length > 0;
  if (hasImage && (!mimeType || typeof mimeType !== "string")) {
    return NextResponse.json<AnalyzeErrorResponse>({ error: "mimeType required when imageBase64 provided." }, { status: 400 });
  }

  if (!transcript.trim() && !hasImage) {
    return NextResponse.json<AnalyzeErrorResponse>({ error: "Provide transcript or imageBase64." }, { status: 400 });
  }

  let userText: string;
  if (transcript.trim() && hasImage) {
    userText = `Transcript so far:\n\n"${transcript.trim()}"\n\nAnalyze the transcript and camera frame together. Return real-time coaching JSON.`;
  } else if (transcript.trim()) {
    userText = `Transcript so far:\n\n"${transcript.trim()}"\n\nNo camera frame available — analyze speech delivery only. Return real-time coaching JSON.`;
  } else {
    userText = `Presenter has not spoken yet. Analyze only the camera frame. Return real-time coaching JSON.`;
  }

  const parts = [
    createPartFromText(LIVE_COACH_PROMPT),
    createPartFromText(userText),
    ...(hasImage ? [createPartFromBase64(imageBase64!, mimeType!)] : []),
  ];

  // Init stream — if this throws, return a regular HTTP error before SSE headers are sent
  let geminiStream: Awaited<ReturnType<typeof ai.models.generateContentStream>>;
  try {
    geminiStream = await ai.models.generateContentStream({
      model: MODEL,
      contents: [{
        role: "user",
        parts,
      }],
    });
  } catch (err) {
    console.error("[LiveStream] Gemini init:", err);
    const is429 = String(err).includes("429") || String(err).includes("RESOURCE_EXHAUSTED");
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: is429 ? "Quota exceeded." : "AI stream failed to start." },
      { status: is429 ? 429 : 500 }
    );
  }

  const encoder = new TextEncoder();

  // Pipe Gemini token stream → SSE ReadableStream
  const sseBody = new ReadableStream({
    async start(controller) {
      let accumulated = "";
      try {
        for await (const chunk of geminiStream) {
          const token = chunk.text ?? "";
          if (!token) continue;
          accumulated += token;
          // Send each token so client can do partial primaryCue extraction
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ t: token })}\n\n`));
        }

        // Parse and send complete structured result
        const cleaned = stripCodeFences(accumulated);
        const parsed: unknown = JSON.parse(cleaned);
        if (isValidLiveCoachResult(parsed)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, r: parsed })}\n\n`));
        } else {
          console.error("[LiveStream] schema mismatch:", parsed);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Schema mismatch." })}\n\n`));
        }
      } catch (e) {
        console.error("[LiveStream] stream error:", e);
        const msg = String(e);
        const errPayload = (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED"))
          ? { error: "429: Quota exceeded." }
          : { error: msg };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errPayload)}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(sseBody, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // disable nginx/proxy buffering
    },
  });
}
