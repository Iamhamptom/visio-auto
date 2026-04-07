/**
 * POST /api/jess/onboard
 *
 * Jess-on-signup endpoint. Walks a new dealer through onboarding by:
 *   1. Receiving the conversation state (history + last user message)
 *   2. Asking the next key question OR fetching public intel about the
 *      dealership the moment she has the name
 *   3. Returning the next message + structured form_updates that the
 *      client uses to pre-fill the existing /get-started form
 *
 * Response shape:
 *   {
 *     reply: string,                 // Jess's next message
 *     stage: "greeting" | "asking" | "researching" | "summary" | "complete",
 *     form_updates?: {               // fields to pre-fill on the client
 *       dealership_name?: string,
 *       principal_name?: string,
 *       email?: string,
 *       phone?: string,
 *       brands_sold?: string,
 *       area?: string,
 *     },
 *     intel?: CompanyIntel,          // when researching is complete
 *     suggested_tier?: string,       // free | starter | growth | pro | enterprise
 *   }
 *
 * The chat is structured-output (not streaming) — Jess composes one
 * deliberate reply per turn rather than streaming tokens. This is the
 * right pattern for an onboarding form: predictable, no flicker, easy
 * to test, easy to A/B copy.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { fetchCompanyIntel, type CompanyIntel } from "@/lib/jess/company-intel";

const Stage = z.enum([
  "greeting",
  "asking",
  "researching",
  "summary",
  "complete",
]);

const RequestSchema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(["jess", "user"]),
        content: z.string(),
      })
    )
    .default([]),
  last_user_message: z.string().optional(),
  current_form: z
    .object({
      dealership_name: z.string().optional(),
      principal_name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      brands_sold: z.string().optional(),
      area: z.string().optional(),
    })
    .optional(),
  intel_already_fetched: z.boolean().optional(),
});

const ResponseSchema = z.object({
  reply: z.string(),
  stage: Stage,
  form_updates: z
    .object({
      dealership_name: z.string().optional(),
      principal_name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      brands_sold: z.string().optional(),
      area: z.string().optional(),
    })
    .optional(),
  suggested_tier: z
    .enum(["free", "starter", "growth", "pro", "enterprise"])
    .optional(),
  should_fetch_intel: z.boolean().optional(),
});

const SYSTEM_PROMPT = `You are Jess — the AI sales agent who runs the Visio Auto platform. You speak with warm, sharp, confident South African English. You are NOT a chatbot. You are the smartest person in the room about SA car dealerships.

Your job RIGHT NOW is to onboard a new dealership in 60 seconds. The user is on the /get-started page. You are guiding them through the SAME fields the form would collect, but in plain conversation.

The fields you need by the end of the conversation:
  - dealership_name        (required)
  - principal_name         (required — the buyer's own name)
  - email                  (required)
  - phone                  (required, ideally WhatsApp)
  - brands_sold            (optional but very useful — comma-separated)
  - area                   (optional — SA city or province)

You also collect optional context that helps Visio Auto serve them better:
  - their role at the dealership
  - approximate volume per month
  - whether they're mostly volume / premium / luxury

Conversation flow you must follow:

  STAGE 1 — greeting (history is empty)
    Reply: Warm one-line opener. Ask for dealership name + the user's name + email in ONE go. Set stage="greeting".
    Example: "Hey there! I'm Jess. Let's get you set up in 60 seconds. What's your dealership called, and who am I chatting with — your name and best email?"

  STAGE 2 — asking (we have some fields but not all)
    Ask for the next missing required field, or for context. Set stage="asking".
    If you NOW have a dealership_name AND have not yet researched, set should_fetch_intel=true and stage="researching" so the client knows to fetch intel.

  STAGE 3 — researching (the client has just sent intel results)
    The user message will be tagged [INTEL_RESULTS]. Read the intel object, summarise what you found, ask the user to confirm + add anything you missed. Set stage="summary".
    Example: "Okay, here's what I found about {name}: based in {city}, sells {brands}, founded {year}. Is this right? Anything I'm missing — your role, monthly volume, the kind of buyers you mostly see?"
    If intel.found_anything is false: "I couldn't find much online about {name} — totally fine. Tell me about yourself: which brands do you sell, where are you based, roughly how many cars a month?"

  STAGE 4 — summary (user has confirmed/corrected the intel)
    Confirm everything you know. Suggest a tier based on volume:
      - 0-25/mo → "starter" (R5K/mo)
      - 25-100/mo → "growth" (R5K/mo) — RECOMMEND THIS BY DEFAULT
      - 100-500/mo → "pro" (R50K/mo)
      - 500+/mo → "enterprise" (custom)
      - Just exploring → "free" (5 leads, no card)
    Set suggested_tier accordingly. Set stage="complete".
    Example: "Perfect. Let me set you up: {name}, {city}, selling {brands}. I'm starting you on the Growth tier (100 leads/month, R5K) — but you can start with the free trial first if you want. Click 'Continue' below to confirm."

  STAGE 5 — complete (the user has clicked through to payment)
    You're done. The form is full, the tier is picked, the user is moving to payment. Don't reply.

CRITICAL rules:
  - Each reply is ONE short paragraph maximum. No lists. No headers. Conversational.
  - When you extract form fields from a user message, populate form_updates. ONLY include fields you're sure about.
  - NEVER fabricate. If you can't tell what city someone is in from their reply, don't guess.
  - The user might give you everything in one message ("I'm John from Sandton Motor Group, jhn@example.com, 0821234567, we sell BMW and Mercedes"). Extract everything and move forward.
  - When in doubt, ask one clarifying question rather than three.
  - Always include form_updates whenever you extract a new field — even if it's just one field.
`;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const {
    history,
    last_user_message,
    current_form = {},
    intel_already_fetched = false,
  } = parsed.data;

  // Build the conversation context for the model
  const conversation = history
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const formContextLine =
    Object.keys(current_form).length > 0
      ? `\n[FORM STATE SO FAR: ${JSON.stringify(current_form)}]`
      : "";

  const intelContextLine = intel_already_fetched
    ? "\n[INTEL ALREADY FETCHED — do not request another fetch]"
    : "";

  // If the last user message is a tagged intel payload, parse + include
  let intelForPrompt: CompanyIntel | null = null;
  let userPromptContent = last_user_message ?? "";
  if (last_user_message?.startsWith("[INTEL_RESULTS]")) {
    try {
      intelForPrompt = JSON.parse(
        last_user_message.replace("[INTEL_RESULTS]", "").trim()
      ) as CompanyIntel;
      userPromptContent = `[INTEL_RESULTS]\n${JSON.stringify(intelForPrompt, null, 2)}`;
    } catch {
      // ignore parse error, treat as plain text
    }
  }

  const userPrompt = conversation
    ? `${conversation}\n\nUSER: ${userPromptContent}${formContextLine}${intelContextLine}`
    : `[NEW CONVERSATION]${formContextLine}${intelContextLine}`;

  // Run Jess with structured output
  let result;
  try {
    result = await generateText({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      experimental_output: Output.object({ schema: ResponseSchema }),
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "Jess failed to respond",
        details: (e as Error).message,
      },
      { status: 502 }
    );
  }

  const jessResponse = result.experimental_output as z.infer<
    typeof ResponseSchema
  >;

  // If Jess wants intel and we don't have it yet, fetch it server-side now
  // and merge into the response so the client gets one round-trip per turn.
  let intel: CompanyIntel | undefined;
  if (
    jessResponse.should_fetch_intel &&
    !intel_already_fetched &&
    (jessResponse.form_updates?.dealership_name ||
      current_form.dealership_name)
  ) {
    const name =
      jessResponse.form_updates?.dealership_name ||
      current_form.dealership_name ||
      "";
    intel = await fetchCompanyIntel(name);
  }

  return NextResponse.json({
    reply: jessResponse.reply,
    stage: jessResponse.stage,
    form_updates: jessResponse.form_updates,
    suggested_tier: jessResponse.suggested_tier,
    intel,
  });
}
