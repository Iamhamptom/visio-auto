/**
 * POPIA-clean lead receipt.
 *
 * Every lead delivered to a dealer is paired with a receipt that proves:
 *   1. Lawful basis (consent / legitimate interest / contractual)
 *   2. Consent timestamp + IP (when applicable)
 *   3. Source URL (where the buyer was when they consented)
 *   4. Channel of delivery (whatsapp / email / dashboard / api)
 *   5. Opt-out URL (one-click, unique per lead)
 *
 * The receipt is a defensible audit trail for Information Regulator inquiries
 * and a procurement-budget upsell ("compliance insurance") for dealers.
 */

import crypto from "crypto";
import type { Lead } from "@/lib/types";

export interface ReceiptInput {
  lead: Lead;
  dealer_id: string;
  channel: "whatsapp" | "email" | "dashboard" | "api";
}

export interface LeadReceipt {
  id: string;
  lead_id: string;
  dealer_id: string;
  delivered_at: string;
  lawful_basis: string;
  consent_version: string | null;
  consent_at: string | null;
  consent_ip: string | null;
  source: string;
  source_url: string | null;
  opt_out_url: string;
  channel: string;
  receipt_hash: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://auto.visiocorp.co";

function hashReceipt(input: Omit<LeadReceipt, "id" | "receipt_hash">): string {
  const payload = JSON.stringify(input);
  return crypto.createHash("sha256").update(payload).digest("hex").slice(0, 32);
}

/**
 * Persist a lead receipt and return it. The receipt is also exposed via
 * GET /api/leads/[id]/receipt for the dealer to download.
 */
export async function generateLeadReceipt(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  input: ReceiptInput
): Promise<LeadReceipt> {
  const lead = input.lead;
  const optOutToken = lead.opt_out_token ?? crypto.randomBytes(16).toString("hex");
  const optOutUrl = `${APP_URL}/optout/${optOutToken}`;

  const partial: Omit<LeadReceipt, "id" | "receipt_hash"> = {
    lead_id: lead.id,
    dealer_id: input.dealer_id,
    delivered_at: new Date().toISOString(),
    lawful_basis: lead.popia_lawful_basis ?? "consent",
    consent_version: lead.consent_version ?? null,
    consent_at: lead.consent_at ?? null,
    consent_ip: lead.consent_ip ?? null,
    source: lead.source ?? "unknown",
    source_url: lead.landing_referrer ?? null,
    opt_out_url: optOutUrl,
    channel: input.channel,
  };

  const receiptHash = hashReceipt(partial);

  const { data, error } = await supabase
    .from("va_lead_receipts")
    .insert({ ...partial, receipt_hash: receiptHash })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Receipt generation failed: ${error?.message ?? "no data"}`);
  }

  // If the lead didn't have an opt_out_token persisted yet, set it now.
  if (!lead.opt_out_token) {
    await supabase
      .from("va_leads")
      .update({ opt_out_token: optOutToken })
      .eq("id", lead.id);
  }

  return data as LeadReceipt;
}

/**
 * Render a receipt as a human-readable certificate for email/PDF.
 */
export function renderReceiptHtml(r: LeadReceipt, leadName: string): string {
  const date = new Date(r.delivered_at).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return `
<div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:#6b7280;border:1px solid #e5e7eb;padding:16px;margin-top:16px;">
  <div style="font-weight:600;color:#111;margin-bottom:8px;">POPIA Compliance Receipt</div>
  <div>Lead: ${leadName} (${r.lead_id})</div>
  <div>Delivered: ${date} via ${r.channel}</div>
  <div>Lawful basis: ${r.lawful_basis}</div>
  ${r.consent_at ? `<div>Consent: ${r.consent_version ?? "v1"} at ${r.consent_at}${r.consent_ip ? ` (IP ${r.consent_ip})` : ""}</div>` : ""}
  <div>Source: ${r.source}</div>
  <div>Opt-out: <a href="${r.opt_out_url}" style="color:#10b981;">${r.opt_out_url}</a></div>
  <div>Receipt hash: ${r.receipt_hash}</div>
</div>`.trim();
}
