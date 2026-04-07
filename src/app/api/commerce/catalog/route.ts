/**
 * GET /api/commerce/catalog
 *
 * Public catalog of every purchasable Visio Auto Suite SKU.
 * Free for all callers — sibling apps, dealer dashboards, and Jess agent
 * use this as the single source of truth for pricing and entitlements.
 *
 * Optional query params:
 *   ?family=subscription | one_off | custom
 *   ?product=approve | inspect | bdc | intent | open-finance | trust | leads | concierge
 *
 * Returns the catalog plus a meta block with totals and the data source.
 */

import { NextRequest, NextResponse } from "next/server";
import { CATALOG, formatPrice } from "@/lib/commerce/catalog";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const family = url.searchParams.get("family");
  const product = url.searchParams.get("product");

  let items = [...CATALOG];
  if (family) items = items.filter((c) => c.family === family);
  if (product) items = items.filter((c) => c.product === product);

  const enriched = items.map((c) => ({
    ...c,
    formatted_price: formatPrice(c),
  }));

  return NextResponse.json(
    {
      meta: {
        publisher: "Visio Research Labs",
        snapshot_date: "2026-04-07",
        currency: "ZAR",
        notes:
          "Single source of truth for all Visio Auto Suite SKUs. Prices in ZAR cents. Quote-only items have amountCents = -1.",
        contact: "concierge@visiocorp.co",
      },
      total: enriched.length,
      filters: { family, product },
      items: enriched,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
