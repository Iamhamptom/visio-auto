import type { Dealer, Lead, Language } from '@/lib/types'

// ---------------------------------------------------------------------------
// Dealer notification after lead assignment
// ---------------------------------------------------------------------------

/**
 * Notification templates in multiple languages for dealer alerts.
 */
const DEALER_TEMPLATES: Record<Language, string> = {
  en: `New lead assigned to you!

Name: {name}
Score: {score}/100 ({tier})
Budget: {budget}
Brand: {brand}
Timeline: {timeline}
Phone: {phone}
Area: {area}

Reply ACCEPT to confirm or PASS to reassign.`,

  af: `Nuwe leidraad aan jou toegewys!

Naam: {name}
Telling: {score}/100 ({tier})
Begroting: {budget}
Merk: {brand}
Tydlyn: {timeline}
Foon: {phone}
Area: {area}

Antwoord AANVAAR om te bevestig of VERBY om te hertoewy.`,

  zu: `Umuntu omusha ohlonzwe kuwe!

Igama: {name}
Amaphuzu: {score}/100 ({tier})
Ibhajethi: {budget}
Ibhrendi: {brand}
Isikhathi: {timeline}
Ucingo: {phone}
Indawo: {area}

Phendula YAMUKELA ukuqinisekisa noma DLULISA ukuhlonza kabusha.`,

  st: `Motataisi e mocha o abetsoe ho uena!

Lebitso: {name}
Lintlha: {score}/100 ({tier})
Bajete: {budget}
Mofuta: {brand}
Nako: {timeline}
Mohala: {phone}
Sebaka: {area}

Araba AMOHELA ho netefatsa kapa FETA ho aba hape.`,

  ts: `Munhu wo ntshwa u averiwile eka wena!

Vito: {name}
Swikoro: {score}/100 ({tier})
Bajete: {budget}
Xitiho: {brand}
Nkarhi: {timeline}
Riqingho: {phone}
Ndhawu: {area}

Hlamula AMUKELA ku tiyisisa kumbe HUNDZA ku averiwa nakambe.`,

  xh: `Umntu omtsha unikwe kuwe!

Igama: {name}
Amanqaku: {score}/100 ({tier})
Ibhajethi: {budget}
Ibhrandhi: {brand}
Ixesha: {timeline}
Umnxeba: {phone}
Indawo: {area}

Phendula YAMKELA ukuqinisekisa okanye DLULA ukuphinda unikwe.`,
}

const EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1a1a2e; color: #fff; padding: 20px; border-radius: 8px 8px 0 0;">
    <h2 style="margin:0;">New Lead Assigned — Visio Auto</h2>
  </div>
  <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
    <table style="width:100%; border-collapse: collapse;">
      <tr><td style="padding:8px; font-weight:bold;">Name</td><td style="padding:8px;">{name}</td></tr>
      <tr><td style="padding:8px; font-weight:bold;">AI Score</td><td style="padding:8px;">{score}/100 ({tier})</td></tr>
      <tr><td style="padding:8px; font-weight:bold;">Budget</td><td style="padding:8px;">{budget}</td></tr>
      <tr><td style="padding:8px; font-weight:bold;">Brand</td><td style="padding:8px;">{brand}</td></tr>
      <tr><td style="padding:8px; font-weight:bold;">Timeline</td><td style="padding:8px;">{timeline}</td></tr>
      <tr><td style="padding:8px; font-weight:bold;">Phone</td><td style="padding:8px;">{phone}</td></tr>
      <tr><td style="padding:8px; font-weight:bold;">Area</td><td style="padding:8px;">{area}</td></tr>
      <tr><td style="padding:8px; font-weight:bold;">Source</td><td style="padding:8px;">{source}</td></tr>
    </table>
    <div style="margin-top: 16px; text-align: center;">
      <a href="{dashboard_url}" style="background: #e94560; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">View in Dashboard</a>
    </div>
  </div>
</body>
</html>
`

function formatBudget(min: number | null, max: number | null): string {
  if (min && max) return `R${(min / 1000).toFixed(0)}K – R${(max / 1000).toFixed(0)}K`
  if (max) return `Up to R${(max / 1000).toFixed(0)}K`
  if (min) return `From R${(min / 1000).toFixed(0)}K`
  return 'Not specified'
}

function formatTimeline(t: string): string {
  const map: Record<string, string> = {
    this_week: 'This week',
    this_month: 'This month',
    three_months: 'Within 3 months',
    just_browsing: 'Just browsing',
  }
  return map[t] ?? t
}

/**
 * Notify a dealer about a newly assigned lead.
 * Sends a WhatsApp message (via /api/whatsapp/send) and prepares an email payload.
 */
export async function notifyDealer(
  dealer: Pick<Dealer, 'id' | 'name' | 'whatsapp_number' | 'email'>,
  lead: Pick<
    Lead,
    | 'id' | 'name' | 'phone' | 'ai_score' | 'score_tier'
    | 'budget_min' | 'budget_max' | 'preferred_brand'
    | 'timeline' | 'area' | 'source' | 'language'
  >
): Promise<{ whatsapp_sent: boolean; email_prepared: boolean }> {
  const result = { whatsapp_sent: false, email_prepared: false }
  const lang: Language = (lead.language as Language) ?? 'en'

  const vars: Record<string, string> = {
    name: lead.name,
    score: String(lead.ai_score),
    tier: lead.score_tier.toUpperCase(),
    budget: formatBudget(lead.budget_min, lead.budget_max),
    brand: lead.preferred_brand ?? 'Any',
    timeline: formatTimeline(lead.timeline),
    phone: lead.phone,
    area: lead.area ?? 'Not specified',
    source: lead.source ?? 'Unknown',
    dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://visio-auto.vercel.app'}/dashboard/leads/${lead.id}`,
  }

  // --- WhatsApp notification ---
  if (dealer.whatsapp_number) {
    try {
      let message = DEALER_TEMPLATES[lang] ?? DEALER_TEMPLATES.en
      for (const [key, val] of Object.entries(vars)) {
        message = message.replaceAll(`{${key}}`, val)
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: dealer.whatsapp_number,
          message,
          language: lang,
        }),
      })

      if (res.ok) {
        result.whatsapp_sent = true
        console.log(`[Notify] WhatsApp sent to dealer "${dealer.name}" (${dealer.whatsapp_number})`)
      } else {
        console.error(`[Notify] WhatsApp failed for dealer "${dealer.name}":`, await res.text())
      }
    } catch (err) {
      console.error('[Notify] WhatsApp error:', err)
    }
  } else {
    console.log(`[Notify] Dealer "${dealer.name}" has no WhatsApp number — skipping`)
  }

  // --- Email notification (prepare payload, log for now) ---
  if (dealer.email) {
    try {
      let emailHtml = EMAIL_TEMPLATE
      for (const [key, val] of Object.entries(vars)) {
        emailHtml = emailHtml.replaceAll(`{${key}}`, val)
      }

      // TODO: Integrate with Resend/SendGrid when configured
      console.log(`[Notify] Email prepared for dealer "${dealer.name}" (${dealer.email})`)
      console.log(`[Notify] Subject: New ${lead.score_tier.toUpperCase()} Lead — ${lead.name}`)
      result.email_prepared = true
    } catch (err) {
      console.error('[Notify] Email error:', err)
    }
  }

  return result
}
