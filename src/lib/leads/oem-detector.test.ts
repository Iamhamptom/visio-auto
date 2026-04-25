import { describe, it, expect } from "vitest";
import { detectOEMPassThrough, listKnownOEMs } from "./oem-detector";

describe("detectOEMPassThrough", () => {
  it("flags BYD referrer", () => {
    const r = detectOEMPassThrough({ referrer: "https://www.byd.co.za/models/dolphin" });
    expect(r.detected).toBe(true);
    expect(r.brand).toBe("BYD");
    expect(r.suggestion).toContain("BYD");
  });

  it("flags Chery utm_source", () => {
    const r = detectOEMPassThrough({ utm_source: "cheryauto.co.za" });
    expect(r.detected).toBe(true);
    expect(r.brand).toBe("Chery");
  });

  it("ignores non-OEM referrers", () => {
    const r = detectOEMPassThrough({ referrer: "https://google.com/search?q=hilux" });
    expect(r.detected).toBe(false);
  });

  it("ignores empty input", () => {
    const r = detectOEMPassThrough({});
    expect(r.detected).toBe(false);
  });
});

describe("listKnownOEMs", () => {
  it("returns alphabetically sorted unique brand list", () => {
    const oems = listKnownOEMs();
    expect(oems.length).toBeGreaterThan(5);
    const sorted = [...oems].sort();
    expect(oems).toEqual(sorted);
  });
});
