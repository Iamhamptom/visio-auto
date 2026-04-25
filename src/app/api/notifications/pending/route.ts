import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Approval queue — leads whose notification_status = 'pending_approval'.
 * Dashboard renders this and lets the dealer approve/skip per row.
 *
 * GET ?dealer_id=...   list pending
 * POST { lead_id, action: 'approve' | 'skip' }   process one
 */

const Action = z.object({
  lead_id: z.string().uuid(),
  action: z.enum(["approve", "skip"]),
});

async function getSupabase() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    return await createClient();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const supabase = await getSupabase();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const dealerId = request.nextUrl.searchParams.get("dealer_id");

  let query = supabase
    .from("va_leads")
    .select("id, name, phone, ai_score, score_tier, source, area, city, preferred_brand, oem_pass_through, oem_brand_detected, created_at, assigned_dealer_id")
    .eq("notification_status", "pending_approval")
    .order("created_at", { ascending: false })
    .limit(100);
  if (dealerId) query = query.eq("assigned_dealer_id", dealerId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ pending: data ?? [], total: data?.length ?? 0 });
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabase();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Action.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { lead_id, action } = parsed.data;

  if (action === "skip") {
    const { error } = await supabase
      .from("va_leads")
      .update({ notification_status: "skipped" })
      .eq("id", lead_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, action: "skipped" });
  }

  // Approve → call notifyDealer with manual_override
  const { data: lead } = await supabase
    .from("va_leads")
    .select("*, assigned_dealer_id")
    .eq("id", lead_id)
    .single();

  if (!lead?.assigned_dealer_id) {
    return NextResponse.json({ error: "Lead has no assigned dealer" }, { status: 400 });
  }

  const { data: dealer } = await supabase
    .from("va_dealers")
    .select("id, name, whatsapp_number, email")
    .eq("id", lead.assigned_dealer_id)
    .single();

  if (!dealer) {
    return NextResponse.json({ error: "Dealer not found" }, { status: 404 });
  }

  const { notifyDealer } = await import("@/lib/leads/auto-notify");
  const result = await notifyDealer(dealer, lead, { manualOverride: true });

  await supabase
    .from("va_leads")
    .update({
      notification_status: result.whatsapp_sent || result.email_sent ? "sent" : "failed",
    })
    .eq("id", lead_id);

  return NextResponse.json({ ok: true, action: "approved", notification: result });
}
