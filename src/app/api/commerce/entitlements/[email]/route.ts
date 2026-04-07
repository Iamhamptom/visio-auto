/**
 * GET /api/commerce/entitlements/[email]
 *
 * Returns the active entitlements for a buyer email.
 * Sibling apps (visio-bdc, visio-trust, etc.) call this to gate features.
 *
 * Response:
 *   {
 *     email: string,
 *     entitlements: Entitlement[],
 *     has: { bdc: bool, approve: bool, inspect: bool, intent: bool, open-finance: bool, trust: bool, leads: bool },
 *     tiers: { bdc: "pro" | null, trust: "velocity" | null, ... }
 *   }
 *
 * CORS-enabled so sibling deploys can call it from their own origins.
 */

import { NextRequest, NextResponse } from "next/server";
import { getEntitlementsForEmail } from "@/lib/commerce/db";
import type { SuiteProductKey } from "@/lib/suite";

const ALL_PRODUCT_KEYS: SuiteProductKey[] = [
  "approve",
  "inspect",
  "bdc",
  "intent",
  "open-finance",
  "trust",
];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const { email: rawEmail } = await params;
  const email = decodeURIComponent(rawEmail).toLowerCase().trim();

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Invalid email" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const entitlements = await getEntitlementsForEmail(email);

  // Build the convenience flags
  const has: Record<string, boolean> = {
    leads: false,
    concierge: false,
  };
  const tiers: Record<string, string | null> = {};

  for (const key of ALL_PRODUCT_KEYS) {
    has[key] = false;
    tiers[key] = null;
  }

  for (const ent of entitlements) {
    has[ent.product_key] = true;
    if (ent.tier && !tiers[ent.product_key]) {
      tiers[ent.product_key] = ent.tier;
    }
  }

  return NextResponse.json(
    {
      email,
      entitlement_count: entitlements.length,
      entitlements,
      has,
      tiers,
      checked_at: new Date().toISOString(),
    },
    { headers: corsHeaders() }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders(): HeadersInit {
  return {
    "Cache-Control": "private, max-age=60",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
