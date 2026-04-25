import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PREFIXES = ["/dashboard"];
const PUBLIC_DASHBOARD_PATHS = ["/dashboard/login", "/dashboard/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only gate dashboard routes (the marketing site stays public).
  const needsAuth =
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) &&
    !PUBLIC_DASHBOARD_PATHS.some((p) => pathname.startsWith(p));

  if (!needsAuth) return NextResponse.next();

  // Dev bypass: local cookie pin. Never honoured in production unless explicitly opted in.
  const devBypass =
    (process.env.NODE_ENV !== "production" || process.env.ALLOW_DEV_BYPASS === "true") &&
    request.cookies.get("vauto_dev_dealer")?.value;
  if (devBypass) return NextResponse.next();

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase env not present, fail closed in prod, open in dev.
  if (!supaUrl || !supaKey) {
    return process.env.NODE_ENV === "production"
      ? NextResponse.redirect(new URL("/dashboard/login", request.url))
      : NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createServerClient(supaUrl, supaKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const url = new URL("/dashboard/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
