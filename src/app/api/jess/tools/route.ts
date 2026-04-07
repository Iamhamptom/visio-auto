/**
 * POST /api/jess/tools
 *
 * Single unified webhook endpoint for Jess (the ElevenLabs Conversational AI
 * agent). ElevenLabs calls this with `{ tool, args }` and we dispatch to the
 * correct handler.
 *
 * Tools:
 *   - lookup_dealer     → public intel about a dealership (Google CSE + web)
 *   - fetch_intel       → alias for lookup_dealer
 *   - check_entitlement → read a buyer's active entitlements
 *   - create_order      → create a real Yoco checkout for a SKU
 *   - save_lead         → persist the onboarding lead to Supabase
 *
 * Auth: shared secret via `X-Jess-Tool-Secret` header. Configured on the
 * ElevenLabs agent side as a webhook header so only ElevenLabs can call
 * these tools.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchCompanyIntel } from "@/lib/jess/company-intel";
import { createClient } from "@/lib/supabase/server";
import { CATALOG } from "@/lib/commerce/catalog";

const TOOL_SECRET = process.env.JESS_TOOL_SECRET;

function authOk(req: NextRequest) {
  if (!TOOL_SECRET) return false;
  return req.headers.get("x-jess-tool-secret") === TOOL_SECRET;
}

export async function POST(request: NextRequest) {
  if (!authOk(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { tool?: string; args?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { tool, args = {} } = body;
  if (!tool) {
    return NextResponse.json({ error: "tool required" }, { status: 400 });
  }

  try {
    switch (tool) {
      case "lookup_dealer":
      case "fetch_intel": {
        const name = String(args.name ?? args.dealership_name ?? "");
        if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
        const intel = await fetchCompanyIntel(name);
        return NextResponse.json({ ok: true, intel });
      }

      case "check_entitlement": {
        const email = String(args.email ?? "").toLowerCase();
        if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
        const origin = request.nextUrl.origin;
        const res = await fetch(`${origin}/api/commerce/entitlements/${encodeURIComponent(email)}`);
        const data = await res.json();
        return NextResponse.json({ ok: true, ...data });
      }

      case "create_order": {
        const sku = String(args.sku ?? "");
        const email = String(args.email ?? args.buyer_email ?? "");
        const name = String(args.name ?? args.buyer_name ?? "Jess-created order");
        if (!sku || !email) {
          return NextResponse.json({ error: "sku and email required" }, { status: 400 });
        }
        const origin = request.nextUrl.origin;
        const res = await fetch(`${origin}/api/commerce/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [{ sku, quantity: 1 }],
            buyer_email: email,
            buyer_name: name,
            data_source: "jess elevenlabs agent",
          }),
        });
        const data = await res.json();
        return NextResponse.json({ ok: res.ok, ...data });
      }

      case "save_lead": {
        const supabase = await createClient();
        const payload = {
          dealership_name: String(args.dealership_name ?? ""),
          principal_name: String(args.principal_name ?? ""),
          email: String(args.email ?? "").toLowerCase(),
          phone: String(args.phone ?? ""),
          brands_sold: String(args.brands_sold ?? ""),
          area: String(args.area ?? ""),
          source: "jess-voice-agent",
          created_at: new Date().toISOString(),
        };
        const { data, error } = await supabase
          .from("va_dealer_signups")
          .insert(payload)
          .select()
          .single();
        if (error) {
          // Fallback: log even if table missing, return success so Jess continues
          console.error("[jess/tools/save_lead] insert failed:", error.message);
          return NextResponse.json({ ok: true, stored: false, warning: error.message });
        }
        return NextResponse.json({ ok: true, stored: true, lead: data });
      }

      case "list_products": {
        return NextResponse.json({
          ok: true,
          products: CATALOG.map((s) => ({
            sku: s.sku,
            label: s.label,
            amount_cents: s.amountCents,
            family: s.family,
            self_serve: s.selfServe,
          })),
        });
      }

      default:
        return NextResponse.json({ error: `unknown tool: ${tool}` }, { status: 400 });
    }
  } catch (err) {
    console.error("[jess/tools] error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
