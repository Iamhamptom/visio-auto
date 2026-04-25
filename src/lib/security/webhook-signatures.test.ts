import { describe, it, expect, beforeEach, afterEach } from "vitest";
import crypto from "crypto";
import { verifyWhatsAppSignature, safeEquals } from "./webhook-signatures";

const ORIG = process.env;

function sign(body: string, secret: string): string {
  return "sha256=" + crypto.createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

describe("verifyWhatsAppSignature", () => {
  beforeEach(() => {
    process.env = { ...ORIG, NODE_ENV: "production", WHATSAPP_APP_SECRET: "shh-its-a-secret" };
  });
  afterEach(() => {
    process.env = ORIG;
  });

  it("accepts valid signature", () => {
    const body = '{"foo":"bar"}';
    const sig = sign(body, "shh-its-a-secret");
    expect(verifyWhatsAppSignature(body, sig)).toBe(true);
  });

  it("rejects altered body", () => {
    const sig = sign('{"foo":"bar"}', "shh-its-a-secret");
    expect(verifyWhatsAppSignature('{"foo":"baz"}', sig)).toBe(false);
  });

  it("rejects wrong secret", () => {
    const body = '{"a":1}';
    const sig = sign(body, "wrong-secret");
    expect(verifyWhatsAppSignature(body, sig)).toBe(false);
  });

  it("rejects missing header in prod", () => {
    expect(verifyWhatsAppSignature("body", null)).toBe(false);
  });

  it("rejects malformed header", () => {
    expect(verifyWhatsAppSignature("body", "not-a-real-sig")).toBe(false);
  });
});

describe("safeEquals", () => {
  it("returns true on equal", () => {
    expect(safeEquals("abc", "abc")).toBe(true);
  });
  it("returns false on inequal", () => {
    expect(safeEquals("abc", "abd")).toBe(false);
  });
  it("returns false on length mismatch", () => {
    expect(safeEquals("abc", "abcd")).toBe(false);
  });
});
