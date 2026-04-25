import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://auto.visiocorp.co";

const PUBLIC_PATHS = [
  "",
  "/about",
  "/about/jess",
  "/concierge",
  "/customers",
  "/get-quote",
  "/get-started",
  "/intelligence",
  "/legal/popia",
  "/legal/privacy",
  "/legal/terms",
  "/papers/african-luxury-mobility",
  "/papers/intelligence-vol-1",
  "/papers/security",
  "/papers/suite-overview",
  "/papers/visio-approve",
  "/papers/visio-bdc",
  "/papers/visio-inspect",
  "/papers/visio-intent",
  "/papers/visio-open-finance",
  "/papers/visio-trust",
  "/pricing",
  "/research",
  "/why-visio-auto",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_PATHS.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1.0 : path.startsWith("/pricing") || path.startsWith("/papers") ? 0.8 : 0.6,
  }));
}
