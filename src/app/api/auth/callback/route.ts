import { NextRequest, NextResponse } from "next/server";

/**
 * Supabase auth email callback.
 * After the user clicks the magic link, Supabase sends them here with a code.
 * We exchange it for a session, then redirect to ?next=...
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/dashboard/login?error=missing_code`);
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchange error:", error.message);
      return NextResponse.redirect(`${origin}/dashboard/login?error=exchange_failed`);
    }
    return NextResponse.redirect(`${origin}${next}`);
  } catch (err) {
    console.error("[auth/callback] error:", err);
    return NextResponse.redirect(`${origin}/dashboard/login?error=server`);
  }
}
