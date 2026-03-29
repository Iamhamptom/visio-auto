import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import type { Dealer, Signal, MarketData } from '@/lib/types'

// =============================================================================
// Outreach Agent — Claude-powered personalized dealer outreach
// Sonnet 4.6 for quality single-generation, Haiku 4.5 for bulk ops
// =============================================================================

const SONNET = anthropic('claude-sonnet-4-6')
const HAIKU = anthropic('claude-haiku-4-5-20251001')

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OutreachContext {
  signalCount?: number
  marketData?: Partial<MarketData>[]
  recentSignals?: Partial<Signal>[]
  competitorInfo?: string
  areaInsights?: string
}

export interface GeneratedEmail {
  subject: string
  body: string
  type: string
  generated_at: string
}

export interface WhatsAppSequence {
  messages: Array<{ step: number; label: string; content: string }>
  generated_at: string
}

export interface DealerBrief {
  title: string
  summary: string
  signals: string[]
  action_items: string[]
  generated_at: string
}

export interface PitchSlide {
  type: string
  title: string
  content: string
  data?: Record<string, unknown>
}

export interface DealerPitch {
  slides: PitchSlide[]
  dealer_name: string
  generated_at: string
}

// ---------------------------------------------------------------------------
// System prompt shared across outreach functions
// ---------------------------------------------------------------------------

const OUTREACH_SYSTEM = `You are an expert South African automotive sales copywriter for Visio Auto — SA's first AI-powered lead generation platform for car dealerships.

Your writing style:
- Professional but conversational — like a sharp business contact, not a cold robot
- SA business English with local flavour (not American spelling)
- Confident but not arrogant
- Data-driven — always include specific numbers and ROI
- Short paragraphs, scannable format
- Natural Tony Duardo reference (music brand connection) when appropriate — "Same team behind SA's hottest music brand"

Visio Auto value props:
- AI qualifies every lead (budget, timeline, trade-in, finance status) before delivery
- 23 buying signals tracked (CIPC registrations, LinkedIn job changes, lease expirations, etc.)
- Leads delivered to WhatsApp in under 60 seconds
- VIN-specific matching to dealer inventory
- Pricing: Starter R7,500/50 leads, Growth R15,000/100 leads, Pro R25,000/200 leads, Enterprise R45,000/500 leads
- 10% conversion rate (vs 2-3% industry average for unqualified leads)
- Avg profit per sale: R35,000+

Sender: David Hampton, CEO, Visio Auto (VisioCorp)
Phone: +27 XX XXX XXXX

IMPORTANT: Return ONLY the requested content. No markdown code fences. No meta commentary.`

// ---------------------------------------------------------------------------
// generateColdEmail
// ---------------------------------------------------------------------------

export async function generateColdEmail(
  dealer: Partial<Dealer>,
  context: OutreachContext = {}
): Promise<GeneratedEmail> {
  const brandStr = dealer.brands?.join(', ') || 'vehicles'
  const signalCount = context.signalCount ?? Math.floor(Math.random() * 15) + 5

  const { text } = await generateText({
    model: SONNET,
    system: OUTREACH_SYSTEM,
    prompt: `Write a personalised cold email to a car dealership.

Dealer info:
- Name: ${dealer.name || 'Dealer'}
- Principal: ${dealer.dealer_principal || 'Dealer Principal'}
- Brands: ${brandStr}
- Area: ${dealer.area || 'Gauteng'}
- Group: ${dealer.group_name || 'Independent'}

Context:
- We've detected ${signalCount} buying signals in the ${dealer.area || 'Gauteng'} area this week
- ${context.areaInsights || `Strong demand for ${brandStr} in the area`}
- ${context.competitorInfo || 'Competitors in the area are not using AI lead gen yet'}

Requirements:
- First line must be the subject line, prefixed with "SUBJECT: "
- Then a blank line
- Then the email body
- Include specific ROI math for their brand/area
- Mention the Tony Duardo / music brand connection naturally (P.S. or brief aside)
- End with a clear CTA for a 15-minute demo
- Keep under 250 words for the body`,
  })

  const lines = text.trim().split('\n')
  const subjectLine = lines[0]?.replace(/^SUBJECT:\s*/i, '') || `${dealer.name} — AI-Qualified ${brandStr} Buyers Delivered to Your WhatsApp`
  const body = lines.slice(1).join('\n').trim()

  return {
    subject: subjectLine,
    body,
    type: 'cold_email',
    generated_at: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// generateFollowUp
// ---------------------------------------------------------------------------

export async function generateFollowUp(
  dealer: Partial<Dealer>,
  previousEmail: { subject: string; body: string },
  daysSince: number = 3
): Promise<GeneratedEmail> {
  const brandStr = dealer.brands?.join(', ') || 'vehicles'

  const { text } = await generateText({
    model: SONNET,
    system: OUTREACH_SYSTEM,
    prompt: `Write a follow-up email to a dealer who received our initial email ${daysSince} days ago but hasn't responded.

Dealer info:
- Name: ${dealer.name || 'Dealer'}
- Principal: ${dealer.dealer_principal || 'Dealer Principal'}
- Brands: ${brandStr}
- Area: ${dealer.area || 'Gauteng'}

Previous email subject: "${previousEmail.subject}"

Requirements:
- First line must be the subject line, prefixed with "SUBJECT: "
- Then a blank line
- Then the email body
- Reference the previous email briefly
- Add NEW value: mention new signals found since the last email, or a fresh market insight
- More direct CTA than the first email
- Keep under 200 words for the body
- Don't be pushy — be helpful and data-driven`,
  })

  const lines = text.trim().split('\n')
  const subjectLine = lines[0]?.replace(/^SUBJECT:\s*/i, '') || `Quick follow-up — ${brandStr} buyers in ${dealer.area}`
  const body = lines.slice(1).join('\n').trim()

  return {
    subject: subjectLine,
    body,
    type: 'follow_up',
    generated_at: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// generateLinkedInDM
// ---------------------------------------------------------------------------

export async function generateLinkedInDM(
  dealer: Partial<Dealer>,
  principalLinkedIn?: string | null
): Promise<GeneratedEmail> {
  const brandStr = dealer.brands?.join(', ') || 'vehicles'

  const { text } = await generateText({
    model: SONNET,
    system: OUTREACH_SYSTEM,
    prompt: `Write a LinkedIn DM to a dealership principal.

Dealer info:
- Name: ${dealer.name || 'Dealer'}
- Principal: ${dealer.dealer_principal || 'Dealer Principal'}
- Brands: ${brandStr}
- Area: ${dealer.area || 'Gauteng'}
- Group: ${dealer.group_name || 'Independent'}
- LinkedIn: ${principalLinkedIn || 'N/A'}

Requirements:
- Return ONLY the message text (no subject line needed for DMs)
- Short — max 100 words. LinkedIn DMs must be punchy.
- Personal, not salesy
- Reference something specific about their dealership (brand performance, area growth, awards if applicable)
- Ask for a 15-min call
- Do NOT use "SUBJECT:" prefix — just the message`,
  })

  return {
    subject: `LinkedIn DM — ${dealer.dealer_principal || dealer.name}`,
    body: text.trim(),
    type: 'linkedin_dm',
    generated_at: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// generateWhatsAppCampaign
// ---------------------------------------------------------------------------

export async function generateWhatsAppCampaign(
  dealer: Partial<Dealer>
): Promise<WhatsAppSequence> {
  const brandStr = dealer.brands?.join(', ') || 'vehicles'

  const { text } = await generateText({
    model: SONNET,
    system: OUTREACH_SYSTEM,
    prompt: `Write a 4-message WhatsApp sequence for dealer outreach.

Dealer info:
- Name: ${dealer.name || 'Dealer'}
- Principal: ${dealer.dealer_principal || 'Dealer Principal'}
- Brands: ${brandStr}
- Area: ${dealer.area || 'Gauteng'}

Requirements:
- 4 messages, each on its own line, prefixed with "MSG1: ", "MSG2: ", "MSG3: ", "MSG4: "
- MSG1: Intro + value prop (max 60 words)
- MSG2: Market insight specific to their brand (max 60 words)
- MSG3: Signal example from their area — make it specific and compelling (max 60 words)
- MSG4: CTA for demo — create urgency without being pushy (max 40 words)
- Use WhatsApp-friendly formatting (short paragraphs, emoji sparingly)
- SA business tone`,
  })

  const messages: WhatsAppSequence['messages'] = []
  const labels = ['Intro & Value Prop', 'Market Insight', 'Signal Example', 'CTA']

  const msgLines = text.trim().split('\n').filter(l => l.trim())
  for (let i = 0; i < 4; i++) {
    const line = msgLines[i] || ''
    const content = line.replace(/^MSG\d:\s*/i, '').trim()
    messages.push({
      step: i + 1,
      label: labels[i],
      content: content || `[Message ${i + 1} — regenerate]`,
    })
  }

  return {
    messages,
    generated_at: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// generateDealerBrief
// ---------------------------------------------------------------------------

export async function generateDealerBrief(
  signals: Partial<Signal>[],
  marketData: Partial<MarketData>[],
  dealer: Partial<Dealer>
): Promise<DealerBrief> {
  const brandStr = dealer.brands?.join(', ') || 'vehicles'
  const signalSummary = signals.slice(0, 10).map(s =>
    `- [${s.signal_type}] ${s.title} (${s.area}, ${s.signal_strength} signal, ${s.buying_probability}% buy probability)`
  ).join('\n')

  const marketSummary = marketData.slice(0, 5).map(m =>
    `- ${m.brand || 'Market'}: ${m.value} ${m.unit || 'units'} (${m.change_pct ? `${m.change_pct > 0 ? '+' : ''}${m.change_pct}%` : 'no change'})`
  ).join('\n')

  const { text } = await generateText({
    model: SONNET,
    system: `You are a South African automotive market intelligence analyst for Visio Auto. Write concise, data-driven morning briefings for dealership sales teams.`,
    prompt: `Generate a morning intelligence brief for this dealer.

Dealer: ${dealer.name || 'Dealer'} (${brandStr}) — ${dealer.area || 'Gauteng'}

Recent signals in their area:
${signalSummary || '- No new signals detected'}

Market data:
${marketSummary || '- Market data loading'}

Requirements:
- Line 1: Brief title (e.g., "Morning Brief — {dealer_name} — {date}")
- Line 2: Empty
- Line 3: 2-3 sentence executive summary
- Then "SIGNALS:" followed by bullet points of the most relevant signals
- Then "ACTIONS:" followed by bullet points of recommended actions
- Keep the entire brief under 300 words
- Focus on actionable intelligence, not fluff`,
  })

  const lines = text.trim().split('\n')
  const title = lines[0] || `Morning Brief — ${dealer.name} — ${new Date().toLocaleDateString('en-ZA')}`

  // Parse signals section
  const signalLines: string[] = []
  const actionLines: string[] = []
  let section = 'summary'
  let summary = ''

  for (const line of lines.slice(1)) {
    const trimmed = line.trim()
    if (/^SIGNALS?:/i.test(trimmed)) { section = 'signals'; continue }
    if (/^ACTIONS?:/i.test(trimmed)) { section = 'actions'; continue }
    if (section === 'summary' && trimmed) summary += (summary ? ' ' : '') + trimmed
    if (section === 'signals' && trimmed.startsWith('-')) signalLines.push(trimmed.slice(1).trim())
    if (section === 'actions' && trimmed.startsWith('-')) actionLines.push(trimmed.slice(1).trim())
  }

  return {
    title,
    summary: summary || `${signals.length} new signals detected in ${dealer.area || 'your area'} today.`,
    signals: signalLines.length > 0 ? signalLines : signals.slice(0, 5).map(s => s.title || 'Signal detected'),
    action_items: actionLines.length > 0 ? actionLines : ['Review new signals', 'Follow up on hot leads'],
    generated_at: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Bulk generation helper (uses Haiku for cost efficiency)
// ---------------------------------------------------------------------------

export async function generateBulkColdEmails(
  dealers: Partial<Dealer>[],
  context: OutreachContext = {}
): Promise<Array<{ dealer_id: string; dealer_name: string; email: GeneratedEmail }>> {
  const results: Array<{ dealer_id: string; dealer_name: string; email: GeneratedEmail }> = []

  // Process in batches of 5 to respect API rate limits
  const batchSize = 5
  for (let i = 0; i < dealers.length; i += batchSize) {
    const batch = dealers.slice(i, i + batchSize)

    const batchResults = await Promise.all(
      batch.map(async (dealer) => {
        const brandStr = dealer.brands?.join(', ') || 'vehicles'
        const signalCount = context.signalCount ?? Math.floor(Math.random() * 15) + 5

        const { text } = await generateText({
          model: HAIKU, // Haiku for bulk — faster and cheaper
          system: OUTREACH_SYSTEM,
          prompt: `Write a personalised cold email for this dealer.

Dealer: ${dealer.name || 'Dealer'}
Principal: ${dealer.dealer_principal || 'Dealer Principal'}
Brands: ${brandStr}
Area: ${dealer.area || 'Gauteng'}

${signalCount} buying signals detected in their area this week.

Requirements:
- First line: "SUBJECT: " followed by the subject
- Then blank line, then body
- Include ROI math
- Under 200 words body
- Clear CTA for 15-min demo`,
        })

        const lines = text.trim().split('\n')
        const subject = lines[0]?.replace(/^SUBJECT:\s*/i, '') || `${dealer.name} — AI Leads`
        const body = lines.slice(1).join('\n').trim()

        return {
          dealer_id: dealer.id || 'unknown',
          dealer_name: dealer.name || 'Unknown Dealer',
          email: {
            subject,
            body,
            type: 'cold_email' as const,
            generated_at: new Date().toISOString(),
          },
        }
      })
    )

    results.push(...batchResults)
  }

  return results
}
