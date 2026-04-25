import crypto from "crypto";

/**
 * Verify Meta WhatsApp webhook signature.
 * Meta signs each POST with HMAC-SHA256 using the App Secret in the
 * `X-Hub-Signature-256` header (format: `sha256=<hex>`).
 *
 * Docs: https://developers.facebook.com/docs/graph-api/webhooks/getting-started/#validate-payloads
 */
export function verifyWhatsAppSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    // In dev without an app secret, allow the webhook through so local testing
    // works. In prod, missing secret means the webhook can't be verified — and
    // the route must reject (caller checks NODE_ENV).
    return process.env.NODE_ENV !== "production";
  }

  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const provided = signatureHeader.slice("sha256=".length);
  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");

  if (provided.length !== expected.length) return false;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(provided, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Verify Retell voice webhook signature.
 * Retell signs with HMAC-SHA256 using the agent webhook secret.
 */
export function verifyRetellSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.RETELL_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!signatureHeader) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Generic constant-time string comparison.
 */
export function safeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}
