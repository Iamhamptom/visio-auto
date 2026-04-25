import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp, rateLimitedResponse } from "@/lib/security/rate-limit";

const Schema = z.object({
  email: z.string().email(),
  next: z.string().optional().default("/dashboard"),
});

export async function POST(request: NextRequest) {
  // Rate limit magic-link requests so we don't get used as a spam channel.
  const ip = getClientIp(request);
  const limit = rateLimit(`magiclink:${ip}`, { limit: 5, window: 300 });
  if (!limit.allowed) return rateLimitedResponse(limit);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { email, next } = parsed.data;

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
    const redirectTo = `${baseUrl}/api/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      console.error("[auth/magic-link] error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Auth provider unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
