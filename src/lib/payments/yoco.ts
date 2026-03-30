/**
 * Yoco Payment Gateway — Visio Auto
 * Docs: https://developer.yoco.com/online/resources/integration-guide
 */

import crypto from "crypto";

const YOCO_SECRET = process.env.YOCO_SECRET_KEY || "";
const YOCO_WEBHOOK_SECRET = process.env.YOCO_WEBHOOK_SECRET || "";
const YOCO_BASE = "https://payments.yoco.com/api";

export const YOCO_PUBLIC_KEY = process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY || "";

/** Tier amounts in ZAR cents */
export const TIER_AMOUNTS: Record<string, number> = {
  starter: 500000,     // R5,000
  growth: 1500000,     // R15,000
  pro: 5000000,        // R50,000
  enterprise: 15000000, // R150,000
};

export const TIER_LABELS: Record<string, string> = {
  free: "Free Trial",
  starter: "Starter — R5,000/mo",
  growth: "Growth — R15,000/mo",
  pro: "Pro — R50,000/mo",
  enterprise: "Enterprise — R150,000+/mo",
};

/** Create a Yoco checkout session */
export async function createCheckout(opts: {
  amountInCents: number;
  currency?: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
  failureUrl?: string;
  metadata?: Record<string, string>;
}): Promise<{ id: string; redirectUrl: string; status: string }> {
  const res = await fetch(`${YOCO_BASE}/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${YOCO_SECRET}`,
    },
    body: JSON.stringify({
      amount: opts.amountInCents,
      currency: opts.currency || "ZAR",
      description: opts.description,
      successUrl: opts.successUrl,
      cancelUrl: opts.cancelUrl,
      failureUrl: opts.failureUrl || opts.cancelUrl,
      metadata: opts.metadata || {},
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Yoco checkout failed: ${err}`);
  }

  return res.json();
}

/** Verify a checkout payment status */
export async function getCheckout(checkoutId: string) {
  const res = await fetch(`${YOCO_BASE}/checkouts/${checkoutId}`, {
    headers: {
      Authorization: `Bearer ${YOCO_SECRET}`,
    },
  });

  if (!res.ok) return null;
  return res.json() as Promise<{
    id: string;
    status: "pending" | "completed" | "failed";
    amount: number;
    currency: string;
    metadata: Record<string, string>;
  }>;
}

/** Verify Yoco webhook signature */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!YOCO_WEBHOOK_SECRET || !signature) return false;

  const expected = crypto
    .createHmac("sha256", YOCO_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}
