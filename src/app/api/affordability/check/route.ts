import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp, rateLimitedResponse } from "@/lib/security/rate-limit";
import { checkAffordability } from "@/lib/finance/affordability";
import { checkBureau } from "@/lib/finance/bureau";

const Schema = z.object({
  gross_income_monthly: z.number().min(0),
  net_income_monthly: z.number().min(0).optional(),
  declared_expenses_monthly: z.number().min(0).optional(),
  declared_debts_monthly: z.number().min(0).optional(),
  interest_rate: z.number().min(0).max(50).optional(),
  term_months: z.number().min(12).max(96).optional(),
  deposit: z.number().min(0).optional(),
  // Optional bureau check
  id_number: z.string().regex(/^\d{13}$/, "SA ID must be 13 digits").optional(),
  full_name: z.string().optional(),
  // Linkage
  lead_id: z.string().uuid().optional(),
  dealer_id: z.string().uuid().optional(),
  consent: z.boolean(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`affordability:${ip}`, { limit: 30, window: 60 });
  if (!limit.allowed) return rateLimitedResponse(limit);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (!data.consent) {
    return NextResponse.json(
      {
        error: "Consent required",
        detail: "POPIA: explicit consent must accompany credit-affordability assessments.",
      },
      { status: 400 }
    );
  }

  const result = checkAffordability(data);

  // Bureau check is optional. If we have an SA ID and a bureau provider key,
  // fold it in. Otherwise return the model-only assessment with a flag.
  let bureau = null as Awaited<ReturnType<typeof checkBureau>>;
  if (data.id_number) {
    bureau = await checkBureau({ id_number: data.id_number, full_name: data.full_name });
  }

  // Adjust recommendation if bureau disagrees with model.
  let finalRecommendation = result.recommendation;
  if (bureau) {
    if (bureau.score_band === "very_low" || bureau.judgment_count > 0) {
      finalRecommendation = "decline_likely";
    } else if (bureau.score_band === "low" && finalRecommendation === "approve_likely") {
      finalRecommendation = "borderline";
    }
  }

  // Persist for audit + later analytics.
  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    const supabase = createServiceClient();
    await supabase.from("va_affordability_checks").insert({
      lead_id: data.lead_id ?? null,
      dealer_id: data.dealer_id ?? null,
      gross_income_monthly: data.gross_income_monthly,
      net_income_monthly: result.net_income_monthly,
      declared_expenses_monthly: result.declared_expenses_used,
      expense_norm_used: result.expense_norm_used,
      discretionary_income: result.discretionary_income,
      affordable_installment: result.affordable_installment,
      affordable_vehicle_price: result.affordable_vehicle_price,
      declined_reasons: result.reasons,
      bureau_check_attempted: data.id_number != null,
      bureau_check_score: bureau?.score ?? null,
      bureau_provider: bureau?.provider ?? null,
      recommendation: finalRecommendation,
    });
  } catch (err) {
    console.error("[affordability/check] log failed (non-fatal):", err);
  }

  return NextResponse.json({
    ...result,
    recommendation: finalRecommendation,
    bureau,
    bureau_attempted: data.id_number != null,
  });
}
