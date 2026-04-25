import { NextResponse } from "next/server";

/**
 * Service health check for the Visio Auto flagship.
 * Probes shared deps so /status can roll up the suite.
 */
export async function GET() {
  const checks: Record<string, "ok" | "fail" | "skip"> = {
    self: "ok",
    supabase: "skip",
    resend: "skip",
  };

  // Supabase reachability
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/va_dealers?limit=1`,
        {
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          signal: AbortSignal.timeout(3000),
        }
      );
      checks.supabase = r.ok ? "ok" : "fail";
    }
  } catch {
    checks.supabase = "fail";
  }

  // Resend reachability
  try {
    if (process.env.RESEND_API_KEY) {
      const r = await fetch("https://api.resend.com/api-keys", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        signal: AbortSignal.timeout(3000),
      });
      checks.resend = r.ok ? "ok" : "fail";
    }
  } catch {
    checks.resend = "fail";
  }

  const ok = Object.values(checks).every((v) => v !== "fail");
  return NextResponse.json(
    {
      service: "visio-auto",
      version: "1.2.0",
      status: ok ? "ok" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 }
  );
}
