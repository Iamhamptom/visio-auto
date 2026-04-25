import { NextRequest, NextResponse } from "next/server";

/**
 * Dealer-scoped KPI feed for the main dashboard.
 *
 * Returns 6 figures with deltas vs the prior period. If a dealer_id is passed
 * we scope to that dealer; otherwise we return the platform total (used by
 * Chairman's overview).
 */

async function getSupabase() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    return await createClient();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const dealerId = request.nextUrl.searchParams.get("dealer_id");

  const supabase = await getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const now = new Date();
  const periodStart = new Date(now);
  periodStart.setDate(1);
  periodStart.setHours(0, 0, 0, 0);
  const priorStart = new Date(periodStart);
  priorStart.setMonth(priorStart.getMonth() - 1);

  const periodStartISO = periodStart.toISOString();
  const priorStartISO = priorStart.toISOString();

  function leadQuery(start: string, end?: string) {
    let q = supabase!
      .from("va_leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", start);
    if (end) q = q.lt("created_at", end);
    if (dealerId) q = q.eq("assigned_dealer_id", dealerId);
    return q;
  }

  const [
    totalThisMonth,
    totalLastMonth,
    hotThisMonth,
    hotLastMonth,
    testDrivesThisMonth,
    testDrivesLastMonth,
    soldThisMonth,
    soldLastMonth,
  ] = await Promise.all([
    leadQuery(periodStartISO),
    leadQuery(priorStartISO, periodStartISO),
    leadQuery(periodStartISO).then((q) => q),
    leadQuery(priorStartISO, periodStartISO),
    (async () => {
      let q = supabase!
        .from("va_leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", periodStartISO)
        .not("test_drive_at", "is", null);
      if (dealerId) q = q.eq("assigned_dealer_id", dealerId);
      return q;
    })(),
    (async () => {
      let q = supabase!
        .from("va_leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", priorStartISO)
        .lt("created_at", periodStartISO)
        .not("test_drive_at", "is", null);
      if (dealerId) q = q.eq("assigned_dealer_id", dealerId);
      return q;
    })(),
    (async () => {
      let q = supabase!
        .from("va_leads")
        .select("sale_amount", { count: "exact" })
        .eq("status", "sold")
        .gte("sold_at", periodStartISO);
      if (dealerId) q = q.eq("assigned_dealer_id", dealerId);
      return q;
    })(),
    (async () => {
      let q = supabase!
        .from("va_leads")
        .select("sale_amount", { count: "exact" })
        .eq("status", "sold")
        .gte("sold_at", priorStartISO)
        .lt("sold_at", periodStartISO);
      if (dealerId) q = q.eq("assigned_dealer_id", dealerId);
      return q;
    })(),
  ]);

  // Hot leads (re-query with score_tier filter)
  const hotThis = await (async () => {
    let q = supabase!
      .from("va_leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", periodStartISO)
      .eq("score_tier", "hot");
    if (dealerId) q = q.eq("assigned_dealer_id", dealerId);
    return q;
  })();
  const hotPrior = await (async () => {
    let q = supabase!
      .from("va_leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", priorStartISO)
      .lt("created_at", periodStartISO)
      .eq("score_tier", "hot");
    if (dealerId) q = q.eq("assigned_dealer_id", dealerId);
    return q;
  })();

  function pctChange(curr: number, prior: number): number {
    if (prior === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prior) / prior) * 100);
  }

  const totalLeads = totalThisMonth.count ?? 0;
  const totalLeadsPrior = totalLastMonth.count ?? 0;
  const hot = hotThis.count ?? 0;
  const hotPriorCount = hotPrior.count ?? 0;
  const testDrives = testDrivesThisMonth.count ?? 0;
  const testDrivesPrior = testDrivesLastMonth.count ?? 0;
  const sold = soldThisMonth.count ?? 0;
  const soldPrior = soldLastMonth.count ?? 0;

  const revenue = (soldThisMonth.data ?? []).reduce(
    (s, r: { sale_amount: number | null }) => s + (r.sale_amount ?? 0),
    0
  );
  const revenuePrior = (soldLastMonth.data ?? []).reduce(
    (s, r: { sale_amount: number | null }) => s + (r.sale_amount ?? 0),
    0
  );

  return NextResponse.json({
    period: periodStart.toISOString().slice(0, 7),
    dealer_id: dealerId,
    kpis: [
      {
        title: "Total Leads",
        value: totalLeads,
        change_pct: pctChange(totalLeads, totalLeadsPrior),
        format: "number",
      },
      {
        title: "Hot Leads",
        value: hot,
        change_pct: pctChange(hot, hotPriorCount),
        format: "number",
        subtitle: "Score 80+",
      },
      {
        title: "Test Drives",
        value: testDrives,
        change_pct: pctChange(testDrives, testDrivesPrior),
        format: "number",
      },
      {
        title: "Sales Closed",
        value: sold,
        change_pct: pctChange(sold, soldPrior),
        format: "number",
      },
      {
        title: "Revenue",
        value: revenue,
        change_pct: pctChange(revenue, revenuePrior),
        format: "rand",
      },
      {
        title: "Conversion",
        value: totalLeads > 0 ? Math.round((sold / totalLeads) * 1000) / 10 : 0,
        change_pct: 0,
        format: "percent",
      },
    ],
  });
}
