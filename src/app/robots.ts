import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://auto.visiocorp.co";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/dashboard/", "/api/", "/optout/", "/client/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
