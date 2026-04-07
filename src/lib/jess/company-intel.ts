/**
 * Fetch public information about a South African car dealership.
 *
 * Used by Jess during onboarding to enrich what the buyer tells her with
 * public-domain facts about their business — brands sold, location, year
 * founded, social handles. Strictly POPIA-compliant: only public business
 * information, never personal data.
 *
 * Strategy:
 *   1. Try Google Custom Search (if GOOGLE_CSE_KEY + GOOGLE_CSE_CX configured)
 *   2. Fall back to direct web fetch if a likely website is provided
 *   3. Extract structured fields with Gemini 2.5 Flash (cheap + fast)
 *   4. Always degrade gracefully — return partial data with confidence flags
 */

import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export interface CompanyIntel {
  name: string;
  website: string | null;
  city: string | null;
  province: string | null;
  brands_sold: string[];
  year_founded: number | null;
  social_handles: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    x?: string;
  };
  description: string | null;
  confidence: "high" | "medium" | "low";
  sources: string[];
  found_anything: boolean;
}

const IntelSchema = z.object({
  website: z.string().nullable(),
  city: z.string().nullable(),
  province: z.string().nullable(),
  brands_sold: z.array(z.string()),
  year_founded: z.number().int().nullable(),
  social_handles: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
    x: z.string().optional(),
  }),
  description: z.string().nullable(),
  confidence: z.enum(["high", "medium", "low"]),
});

const SA_PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
];

/**
 * Google Custom Search wrapper. Returns top results or empty array.
 */
async function googleSearch(query: string, maxResults = 5): Promise<
  Array<{ title: string; snippet: string; url: string }>
> {
  const apiKey = process.env.GOOGLE_CSE_KEY;
  const cx = process.env.GOOGLE_CSE_CX;
  if (!apiKey || !cx) return [];

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", query);
  url.searchParams.set("num", String(Math.min(maxResults, 10)));

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      items?: Array<{ title?: string; snippet?: string; link?: string }>;
    };
    return (json.items ?? []).map((it) => ({
      title: it.title ?? "",
      snippet: it.snippet ?? "",
      url: it.link ?? "",
    }));
  } catch {
    return [];
  }
}

/**
 * Direct web fetch with timeout + size limit.
 * Returns the first ~50KB of text content from the page.
 */
async function fetchWebsite(url: string): Promise<string | null> {
  if (!url) return null;
  let normalised = url.trim();
  if (!normalised.startsWith("http")) normalised = `https://${normalised}`;

  try {
    const res = await fetch(normalised, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent":
          "VisioAutoOnboard/1.0 (+https://visio-auto.vercel.app/about)",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const text = await res.text();
    // Strip HTML tags + collapse whitespace, cap at 50KB
    return text
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 50000);
  } catch {
    return null;
  }
}

/**
 * Main entry point. Given a dealership name (and optional website hint),
 * fetch public intel and return a structured CompanyIntel object.
 */
export async function fetchCompanyIntel(
  name: string,
  websiteHint?: string
): Promise<CompanyIntel> {
  const cleanName = name.trim();
  if (!cleanName) {
    return emptyIntel(cleanName);
  }

  // Step 1 — collect raw signal from up to 3 sources, in parallel
  const sources: string[] = [];
  const [searchResults, websiteText] = await Promise.all([
    googleSearch(`"${cleanName}" South Africa car dealer`, 5),
    websiteHint ? fetchWebsite(websiteHint) : Promise.resolve(null),
  ]);

  if (searchResults.length > 0) {
    sources.push(`google:${searchResults.length}`);
  }
  if (websiteText) {
    sources.push(`fetch:${websiteHint}`);
  }

  // If we have nothing, return empty
  if (searchResults.length === 0 && !websiteText) {
    return emptyIntel(cleanName);
  }

  // Step 2 — collapse the raw signal into a single context blob
  const contextBlob = [
    websiteText ? `WEBSITE CONTENT:\n${websiteText.slice(0, 8000)}` : "",
    searchResults.length > 0
      ? `GOOGLE RESULTS:\n${searchResults
          .map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.snippet}`)
          .join("\n\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  // Step 3 — extract structured fields with Gemini 2.5 Flash via v6 Output.object
  try {
    const result = await generateText({
      model: google("gemini-2.5-flash"),
      experimental_output: Output.object({ schema: IntelSchema }),
      prompt: `Extract structured information about this South African car dealership from the public sources below.

Dealership name: ${cleanName}
${websiteHint ? `Website hint: ${websiteHint}` : ""}

Public sources:
${contextBlob}

Extraction rules:
- website: the canonical .co.za or .com URL if visible, else null
- city: SA city only (Johannesburg, Cape Town, Durban, Pretoria, Sandton, Umhlanga, Centurion, etc.)
- province: one of ${SA_PROVINCES.join(", ")} — null if uncertain
- brands_sold: array of car brands the dealership represents (Toyota, BMW, Ford, Hyundai, etc.) — only brands mentioned in the source material
- year_founded: integer year if explicitly stated, else null
- social_handles: extract @handles or URLs for instagram, facebook, linkedin, x — leave each undefined if not found
- description: one concise sentence about the dealership
- confidence: "high" if multiple sources agree on city + at least one brand, "medium" if some data found, "low" if mostly guessing

NEVER fabricate. If a field is not in the source material, return null or empty array. Confidence "low" is acceptable.`,
    });

    const obj = result.experimental_output as z.infer<typeof IntelSchema>;
    return {
      name: cleanName,
      website: obj.website,
      city: obj.city,
      province: obj.province,
      brands_sold: obj.brands_sold,
      year_founded: obj.year_founded,
      social_handles: obj.social_handles,
      description: obj.description,
      confidence: obj.confidence,
      sources,
      found_anything: true,
    };
  } catch {
    return emptyIntel(cleanName);
  }
}

function emptyIntel(name: string): CompanyIntel {
  return {
    name,
    website: null,
    city: null,
    province: null,
    brands_sold: [],
    year_founded: null,
    social_handles: {},
    description: null,
    confidence: "low",
    sources: [],
    found_anything: false,
  };
}
