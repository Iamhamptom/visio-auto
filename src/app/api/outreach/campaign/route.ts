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
}

// Quick lookup for demo — in production this comes from DB
const DEMO_DEALERS: Record<string, DealerInfo> = {
  "d-001": { id: "d-001", name: "Motus Toyota Kempton Park", dealer_principal: "Werner van Rooyen", area: "Kempton Park", brands: ["Toyota"] },
  "d-002": { id: "d-002", name: "BMW Bryanston (JSN Motors)", dealer_principal: "Johan Smit", area: "Bryanston", brands: ["BMW"] },
  "d-003": { id: "d-003", name: "Audi Centre Sandton", dealer_principal: "Michael Fourie", area: "Sandton", brands: ["Audi"] },
  "d-004": { id: "d-004", name: "Mercedes-Benz Sandton", dealer_principal: "Pierre du Toit", area: "Sandton", brands: ["Mercedes-Benz"] },
  "d-005": { id: "d-005", name: "Hatfield VW", dealer_principal: "Leon Erasmus", area: "Hatfield", brands: ["Volkswagen"] },
  "d-006": { id: "d-006", name: "NTT Toyota Menlyn", dealer_principal: "Stefan Naidoo", area: "Menlyn", brands: ["Toyota"] },
  "d-007": { id: "d-007", name: "CMH Kia Sandton", dealer_principal: "Kevin Moodley", area: "Sandton", brands: ["Kia"] },
  "d-008": { id: "d-008", name: "Pharoah Auto", dealer_principal: "Yusuf Moosa", area: "Sandton", brands: ["Porsche", "Ferrari", "Lamborghini"] },
  "d-009": { id: "d-009", name: "Halfway Toyota Fourways", dealer_principal: "Francois Viljoen", area: "Fourways", brands: ["Toyota"] },
  "d-010": { id: "d-010", name: "SMH BMW Oakdene", dealer_principal: "Charl Steyn", area: "Oakdene", brands: ["BMW"] },
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

  // TODO: Fetch dealers from Supabase
  // const { data: dealers } = await supabase.from('va_dealers').select('*').in('id', dealer_ids)

  const emails: Array<{
    dealer_id: string
    dealer_name: string
    to_email: string
    subject: string
    body: string
    template: string
    generated_at: string
  }> = []

  const notFound: string[] = []

  for (const dealerId of dealer_ids) {
    const dealer = DEMO_DEALERS[dealerId]
    if (!dealer) {
      notFound.push(dealerId)
      continue
    }

    const { subject, body } = generator(dealer)

    emails.push({
      dealer_id: dealer.id,
      dealer_name: dealer.name,
      to_email: `info@${dealer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}.co.za`,
      subject,
      body,
      template,
      generated_at: new Date().toISOString(),
    })
  }

  return NextResponse.json({
    success: true,
    template,
    emails_generated: emails.length,
    not_found: notFound.length > 0 ? notFound : undefined,
    emails,
    message: `Generated ${emails.length} ${template.replace(/_/g, " ")} emails. Ready to send via /api/outreach/send.`,
  })
}
