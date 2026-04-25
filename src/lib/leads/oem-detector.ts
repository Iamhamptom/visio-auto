/**
 * OEM pass-through detector.
 *
 * Flags when a buyer first touched a Chinese-OEM (or other manufacturer-direct)
 * site before landing on us. The OEM owns the lead first — the dealer needs to
 * know so they can run a win-back script (price-match, service package upsell)
 * rather than treat it as a fresh prospect.
 *
 * Why this matters in SA right now (2026):
 *   BYD targeting 70 SA dealerships, Chery/Haval/Jetour/GWM ~17% of passenger
 *   volume, OEMs increasingly route test-drive bookings through their own apps
 *   before the franchise dealer ever sees the buyer.
 */

const OEM_DOMAINS: Record<string, string> = {
  "byd.com": "BYD",
  "byd.co.za": "BYD",
  "bydauto.co.za": "BYD",
  "cheryauto.co.za": "Chery",
  "chery.com": "Chery",
  "havalmotors.co.za": "Haval",
  "haval.com": "Haval",
  "jetour.co.za": "Jetour",
  "jetourauto.com": "Jetour",
  "gwm.co.za": "GWM",
  "gwmauto.com": "GWM",
  "ora.co.za": "ORA",
  "tankmotors.co.za": "Tank",
  "lynkco.co.za": "Lynk & Co",
  "geely.co.za": "Geely",
  "mg.co.za": "MG",
  // German OEMs running their own digital funnels
  "bmw.co.za": "BMW",
  "mercedes-benz.co.za": "Mercedes-Benz",
  "audi.co.za": "Audi",
  "volkswagen.co.za": "Volkswagen",
  // Japanese OEM digital funnels
  "toyota.co.za": "Toyota",
  "lexus.co.za": "Lexus",
  "honda.co.za": "Honda",
  "nissan.co.za": "Nissan",
  // Korean
  "hyundai.co.za": "Hyundai",
  "kia.co.za": "Kia",
};

const WIN_BACK_SUGGESTIONS: Record<string, string> = {
  BYD: "Buyer touched BYD direct. Lead with: 5-yr/100K service plan, dealer-only test drive, finance pre-approval before they walk in.",
  Chery: "Buyer touched Chery direct. Lead with: extended warranty match, demo car this week, R-per-month vs OEM web price.",
  Haval: "Buyer touched Haval direct. Lead with: 7-yr warranty match, pickup-and-deliver test drive, trade-in value bump.",
  Jetour: "Buyer touched Jetour direct. Lead with: dealer-only loyalty bonus, on-site finance, free first service.",
  GWM: "Buyer touched GWM direct. Lead with: bakkie cargo accessories bundle, dealer service network, instant quote.",
  BMW: "Buyer touched BMW direct. Lead with: certified pre-owned alternatives, M-package upgrades, BMW Select finance.",
  "Mercedes-Benz": "Buyer touched Mercedes direct. Lead with: AGILITY finance options, demo car incentive, higher trade-in.",
  Toyota: "Buyer touched Toyota direct. Lead with: same-week stock vs factory order, R-per-month focus, accessory pack.",
};

export interface OEMDetection {
  detected: boolean;
  brand: string | null;
  referrer_url: string | null;
  suggestion: string | null;
}

/**
 * Detect OEM pass-through from referrer + UTM.
 */
export function detectOEMPassThrough(input: {
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
}): OEMDetection {
  const candidates: string[] = [];
  if (input.referrer) candidates.push(input.referrer);
  if (input.utm_source) candidates.push(input.utm_source);

  for (const c of candidates) {
    const lower = c.toLowerCase();
    for (const [domain, brand] of Object.entries(OEM_DOMAINS)) {
      if (lower.includes(domain) || lower.includes(brand.toLowerCase().replace(/[^a-z]/g, ""))) {
        return {
          detected: true,
          brand,
          referrer_url: input.referrer ?? null,
          suggestion: WIN_BACK_SUGGESTIONS[brand] ?? `Buyer touched ${brand} direct — pitch dealer advantages over OEM digital funnel.`,
        };
      }
    }
  }

  return { detected: false, brand: null, referrer_url: null, suggestion: null };
}

/**
 * Public list — used by dashboard to render the "OEM pass-through" filter chip.
 */
export function listKnownOEMs(): string[] {
  return Array.from(new Set(Object.values(OEM_DOMAINS))).sort();
}
