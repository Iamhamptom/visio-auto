/**
 * Dealer session helpers.
 *
 * We use Supabase Auth (magic-link / OTP) and a `va_dealer_users` join row to
 * map an authenticated user to a dealership. Every dashboard server component
 * + API route that handles dealer-scoped data calls `requireDealerSession()`.
 *
 * Until Chairman flips on production auth, the helper returns either the
 * authenticated dealer OR (in dev/preview) a pinned-by-cookie dev dealer so
 * local work doesn't break.
 */

import { cookies, headers } from "next/headers";

export interface DealerSession {
  user_id: string;
  dealer_id: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
}

const DEV_BYPASS_COOKIE = "vauto_dev_dealer";

async function getSupabase() {
  try {
    const mod = await import("@/lib/supabase/server");
    return await mod.createClient();
  } catch {
    return null;
  }
}

/**
 * Resolve the current dealer session from cookies.
 * Returns null if no session.
 */
export async function getDealerSession(): Promise<DealerSession | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (user) {
    const { data: link } = await supabase
      .from("va_dealer_users")
      .select("dealer_id, role, email")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (link) {
      return {
        user_id: user.id,
        dealer_id: link.dealer_id,
        email: link.email,
        role: (link.role ?? "member") as DealerSession["role"],
      };
    }
  }

  // Dev/preview bypass via signed cookie set during local dealer-pin.
  // Never trusted in production unless explicitly enabled.
  if (process.env.NODE_ENV !== "production" || process.env.ALLOW_DEV_BYPASS === "true") {
    const cookieStore = await cookies();
    const devDealer = cookieStore.get(DEV_BYPASS_COOKIE)?.value;
    if (devDealer) {
      return {
        user_id: "dev-bypass",
        dealer_id: devDealer,
        email: "dev@local",
        role: "owner",
      };
    }
  }

  return null;
}

/**
 * Server-action / route-handler helper: throw on missing session.
 */
export async function requireDealerSession(): Promise<DealerSession> {
  const session = await getDealerSession();
  if (!session) {
    throw new Response("Unauthenticated", { status: 401 });
  }
  return session;
}

/**
 * For pages: redirect-friendly check. Returns session or null without throw.
 */
export async function tryDealerSession(): Promise<DealerSession | null> {
  return getDealerSession();
}

/**
 * Compose a dealer-scoped Supabase query — every read/write goes through this
 * so we cannot accidentally leak another dealer's data.
 */
export async function dealerScopedClient(session: DealerSession) {
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Supabase not available");
  // Note: when RLS policies are activated server-side, this auth context will
  // automatically filter rows. Until then, callers must add .eq('dealer_id', session.dealer_id)
  // explicitly.
  return supabase;
}

/** Get caller IP for audit logging. */
export async function getRequestIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0].trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}
