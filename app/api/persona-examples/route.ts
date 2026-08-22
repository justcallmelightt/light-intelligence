import { get, put } from "@vercel/blob";
import {
  MAX_PERSONA_EXAMPLES,
  type PersonaExample,
} from "../../ai/persona-examples";

const PROFILE_ID_PATTERN = /^[a-z0-9-]{16,128}$/i;
const MAX_PROMPT_LENGTH = 1_200;
const MAX_RESPONSE_LENGTH = 2_000;
const MAX_NOTE_LENGTH = 500;

const storeIsConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const isSameOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

const readProfileId = (value: unknown) =>
  typeof value === "string" && PROFILE_ID_PATTERN.test(value) ? value : null;

const readExamples = (value: unknown): PersonaExample[] => {
  if (!Array.isArray(value)) return [];

  const examples: PersonaExample[] = [];
  for (const item of value.slice(-MAX_PERSONA_EXAMPLES)) {
    if (!item || typeof item !== "object") continue;
    const candidate = item as Record<string, unknown>;
    if (
      candidate.approved !== true ||
      (candidate.kind !== "same" && candidate.kind !== "correction") ||
      typeof candidate.prompt !== "string" ||
      typeof candidate.response !== "string"
    ) {
      continue;
    }

    const prompt = candidate.prompt.trim().slice(0, MAX_PROMPT_LENGTH);
    const response = candidate.response.trim().slice(0, MAX_RESPONSE_LENGTH);
    if (!prompt || !response) continue;

    examples.push({
      id: typeof candidate.id === "string" ? candidate.id.slice(0, 100) : "",
      messageId:
        typeof candidate.messageId === "string"
          ? candidate.messageId.slice(0, 100)
          : "",
      kind: candidate.kind,
      prompt,
      response,
      reasons: Array.isArray(candidate.reasons)
        ? candidate.reasons
            .filter((reason): reason is string => typeof reason === "string")
            .map((reason) => reason.trim().slice(0, 80))
            .filter(Boolean)
            .slice(0, 5)
        : [],
      note:
        typeof candidate.note === "string"
          ? candidate.note.trim().slice(0, MAX_NOTE_LENGTH)
          : "",
      approved: true,
      createdAt:
        typeof candidate.createdAt === "string"
          ? candidate.createdAt.slice(0, 40)
          : "",
    });
  }

  return examples.slice(-MAX_PERSONA_EXAMPLES);
};

const pathnameFor = (profileId: string) =>
  `light-intelligence/persona-feedback/${profileId}.json`;

const unavailable = () =>
  Response.json(
    { code: "STORE_UNAVAILABLE", message: "Persona feedback storage is unavailable." },
    { status: 503 },
  );

export async function GET(request: Request) {
  if (!storeIsConfigured()) return unavailable();

  const profileId = readProfileId(
    new URL(request.url).searchParams.get("profileId"),
  );
  if (!profileId) {
    return Response.json({ code: "INVALID_PROFILE" }, { status: 400 });
  }

  try {
    const result = await get(pathnameFor(profileId), {
      access: "private",
      useCache: false,
    });
    if (!result || result.statusCode !== 200) {
      return Response.json({ examples: [] }, { headers: { "Cache-Control": "no-store" } });
    }

    const payload = JSON.parse(
      await new Response(result.stream).text(),
    ) as { examples?: unknown };
    return Response.json(
      { examples: readExamples(payload.examples) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Persona feedback read failed", error);
    return unavailable();
  }
}

export async function PUT(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ code: "FORBIDDEN" }, { status: 403 });
  }
  if (!storeIsConfigured()) return unavailable();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const profileId = readProfileId(body.profileId);
    if (!profileId) {
      return Response.json({ code: "INVALID_PROFILE" }, { status: 400 });
    }

    const examples = readExamples(body.examples);
    await put(
      pathnameFor(profileId),
      JSON.stringify({ examples, updatedAt: new Date().toISOString() }),
      {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      },
    );
    return Response.json({ examples, storage: "private-blob" });
  } catch (error) {
    console.error("Persona feedback write failed", error);
    return unavailable();
  }
}
