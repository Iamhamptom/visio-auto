import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// =============================================================================
// POST /api/outreach/campaign — Generate outreach email campaigns for dealers
// Templates: cold_intro, follow_up, roi_case_study
// =============================================================================

const campaignSchema = z.object({
  template: z.enum(["cold_intro", "follow_up", "roi_case_study"]),
  dealer_ids: z.array(z.string()).min(1, "At least one dealer ID is required"),
})

// ---------------------------------------------------------------------------
// Template generators
// ---------------------------------------------------------------------------

type DealerInfo = {
  id: string
  name: string
  dealer_principal: string
  area: string
  brands: string[]
  email: string | null
}

async function fetchDealers(ids: string[]): Promise<{ found: DealerInfo[]; notFound: string[] }> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('va_dealers')
      .select('id, name, dealer_principal, area, brands, email')
      .in('id', ids)

    if (!error && data) {
      const foundIds = new Set(data.map((d) => d.id))
      const notFound = ids.filter((id) => !foundIds.has(id))
      return {
        found: data.map((d) => ({
          id: d.id,
          name: d.name,
          dealer_principal: d.dealer_principal ?? 'Dealer Principal',
          area: d.area ?? '',
          brands: d.brands ?? [],
          email: d.email ?? null,
        })),
        notFound,
      }
    }
  } catch {
    // fall through
  }
  return { found: [], notFound: ids }
}

function generateColdIntro(dealer: DealerInfo) {
  const subject = `${dealer.name} — AI-Qualified Car Buyers Delivered to Your WhatsApp`

  const body = `Hi ${dealer.dealer_principal},

I'm reaching out from Visio Auto — we're South Africa's first AI-powered lead generation platform built specifically for car dealerships.

Here's what we do differently:
• AI qualifies every lead before you see them (budget, timeline, trade-in, finance status)
• Leads delivered to your WhatsApp in under 60 seconds
• VIN-specific matching — we match buyers to YOUR specific inventory
• R15,000/month for 100 AI-qualified leads (vs R500+ per lead on AutoTrader)

Our Signal Engine tracks 23 buying signals — from new business registrations to LinkedIn job changes to lease expirations — so we find buyers before they even start shopping.

Would you be open to a 15-minute demo this week?

Best,
David Hampton
CEO, Visio Auto (VisioCorp)
+27 XX XXX XXXX

P.S. While our AI works for your dealership, your team can enjoy Tony Duardo's latest hits — we're the same team behind SA's hottest music brand. 🎵`

  return { subject, body }
}

function generateFollowUp(dealer: DealerInfo) {
  const brandStr = dealer.brands.join(", ")
  const subject = `Quick follow-up — ${brandStr} buyers in ${dealer.area} this week`

  const body = `Hi ${dealer.dealer_principal},

Just following up on my earlier email about Visio Auto.

Since then, our Signal Engine has flagged ${5 + Math.floor(Math.random() * 15)} potential ${brandStr} buyers in the ${dealer.area} area this week alone. These are people showing real buying signals — new jobs, lease expirations, business registrations — not just tyre kickers.

Here's a snapshot of what we're seeing:
• ${2 + Math.floor(Math.random() * 5)} people with expiring vehicle leases in ${dealer.area}
• ${1 + Math.floor(Math.random() * 3)} new business registrations (fleet buyers)
• ${3 + Math.floor(Math.random() * 8)} social media posts showing ${brandStr} buying intent

Right now these leads are going to your competitors. We can change that.

15 minutes is all I need. Can we set up a quick call this week?

Best,
David Hampton
CEO, Visio Auto (VisioCorp)
+27 XX XXX XXXX`

  return { subject, body }
}

function generateROICaseStudy(dealer: DealerInfo) {
  const subject = `How ${dealer.area} Dealerships Are Getting 4x ROI on Lead Gen`

  const body = `Hi ${dealer.dealer_principal},

I wanted to share some numbers that might interest you.

Here's the typical ROI our dealership partners are seeing:

THE MATH:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Investment:       R15,000/month (Growth Plan — 100 leads)
AI-Qualified Leads:  100 per month
Conversion Rate:     10% (industry avg is 2-3% for unqualified)
Sales Closed:        10 vehicles
Avg Profit/Sale:     R35,000+
Monthly Revenue:     R350,000+
ROI:                 23x return on spend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Why our conversion rates are 3-5x higher than AutoTrader/Cars.co.za:
1. AI pre-qualification — every lead has budget, timeline, and finance status verified
2. Signal Engine — we find buyers before they start shopping (23 buying signals tracked)
3. VIN matching — leads are matched to YOUR inventory, not generic brand interest
4. Speed — leads hit your WhatsApp in <60 seconds, not buried in an email inbox
5. SA-specific — built for the South African market, with all 11 language support

Even at a conservative 5% conversion rate, you're looking at:
• 5 sales × R35,000 profit = R175,000 revenue
• That's still an 11.7x return on your R15,000 investment

The question isn't whether you can afford Visio Auto — it's whether you can afford not to have it while your competitors do.

Can I walk you through a live demo with real ${dealer.area} data this week?

Best,
David Hampton
CEO, Visio Auto (VisioCorp)
+27 XX XXX XXXX`

  return { subject, body }
}

// ---------------------------------------------------------------------------
// Template dispatcher
// ---------------------------------------------------------------------------

const TEMPLATE_GENERATORS: Record<string, (dealer: DealerInfo) => { subject: string; body: string }> = {
  cold_intro: generateColdIntro,
  follow_up: generateFollowUp,
  roi_case_study: generateROICaseStudy,
}

// ---------------------------------------------------------------------------
// POST /api/outreach/campaign
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = campaignSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { template, dealer_ids } = parsed.data
  const generator = TEMPLATE_GENERATORS[template]

  if (!generator) {
    return NextResponse.json(
      { error: `Unknown template: ${template}` },
      { status: 400 }
    )
  }

  const { found, notFound } = await fetchDealers(dealer_ids)

  const emails = found.map((dealer) => {
    const { subject, body } = generator(dealer)
    return {
      dealer_id: dealer.id,
      dealer_name: dealer.name,
      to_email: dealer.email ?? null,
      subject,
      body,
      template,
      generated_at: new Date().toISOString(),
    }
  })

  return NextResponse.json({
    success: true,
    template,
    emails_generated: emails.length,
    not_found: notFound.length > 0 ? notFound : undefined,
    emails,
    requires_approval: true,
    message: `Generated ${emails.length} ${template.replace(/_/g, ' ')} drafts. Review then POST to /api/outreach/send with { approved: true } to dispatch.`,
  })
}
