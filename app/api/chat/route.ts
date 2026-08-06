import { google } from "@ai-sdk/google";
import { streamText, type ModelMessage } from "ai";
import { buildSystemPrompt } from "../../ai/system-prompt";
import type { PersonaSettings } from "../../persona-engine";

export const maxDuration = 30;

const MAX_MESSAGES = 16;
const MAX_MESSAGE_LENGTH = 4_000;
const MAX_TOTAL_LENGTH = 20_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_REQUESTS = 12;
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

const DEFAULT_SETTINGS: PersonaSettings = {
  honesty: 85,
  talkativeness: 75,
  empathy: 80,
  designPriority: 90,
};

const clampSetting = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(100, Math.max(20, Math.round(value)))
    : fallback;

const readSettings = (value: unknown): PersonaSettings => {
  if (!value || typeof value !== "object") return DEFAULT_SETTINGS;
  const candidate = value as Record<string, unknown>;
  return {
    honesty: clampSetting(candidate.honesty, DEFAULT_SETTINGS.honesty),
    talkativeness: clampSetting(
      candidate.talkativeness,
      DEFAULT_SETTINGS.talkativeness,
    ),
    empathy: clampSetting(candidate.empathy, DEFAULT_SETTINGS.empathy),
    designPriority: clampSetting(
      candidate.designPriority,
      DEFAULT_SETTINGS.designPriority,
    ),
  };
};

const readMessages = (value: unknown): ModelMessage[] | null => {
  if (!Array.isArray(value)) return null;

  let totalLength = 0;
  const messages: ModelMessage[] = [];
  for (const item of value.slice(-MAX_MESSAGES)) {
    if (!item || typeof item !== "object") return null;
    const candidate = item as Record<string, unknown>;
    if (
      (candidate.role !== "user" && candidate.role !== "assistant") ||
      typeof candidate.content !== "string"
    ) {
      return null;
    }

    const content = candidate.content.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!content) continue;
    totalLength += content.length;
    if (totalLength > MAX_TOTAL_LENGTH) return null;
    messages.push({ role: candidate.role, content });
  }

  return messages.length > 0 ? messages : null;
};

const isSameOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

const isRateLimited = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = forwardedFor || "anonymous";
  const now = Date.now();
  const bucket = requestBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT_REQUESTS;
};

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json(
      { code: "FORBIDDEN", message: "Cross-origin requests are not allowed." },
      { status: 403 },
    );
  }

  if (isRateLimited(request)) {
    return Response.json(
      { code: "RATE_LIMITED", message: "Please wait before trying again." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { code: "AI_NOT_CONFIGURED", message: "Gemini API key is not configured." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const messages = readMessages(body.messages);
    if (!messages) {
      return Response.json(
        { code: "INVALID_REQUEST", message: "A valid conversation is required." },
        { status: 400 },
      );
    }

    const result = streamText({
      model: google(process.env.GEMINI_MODEL ?? "gemini-3.6-flash"),
      system: buildSystemPrompt(readSettings(body.settings)),
      messages,
      temperature: 0.85,
      maxOutputTokens: 1_200,
    });

    return result.toTextStreamResponse({
      headers: {
        "Cache-Control": "no-store",
        "X-Light-Model": process.env.GEMINI_MODEL ?? "gemini-3.6-flash",
      },
    });
  } catch (error) {
    console.error("Gemini chat request failed", error);
    return Response.json(
      { code: "AI_REQUEST_FAILED", message: "Gemini request failed." },
      { status: 502 },
    );
  }
}
