import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { scoreLead } from '@/lib/ai/scoring'
import { getNextMessage, type ConversationContext } from '@/lib/whatsapp/bot'
import type { Lead } from '@/lib/types'

const inMemoryLeads: Lead[] = []
const conversations = new Map<string, ConversationContext>()

const WhatsAppMessageSchema = z.object({
  from: z.string(),
  id: z.string(),
  timestamp: z.string(),
  type: z.string(),
  text: z.object({ body: z.string() }).optional(),
})

const WhatsAppWebhookSchema = z.object({
  object: z.string(),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messaging_product: z.string().optional(),
            metadata: z
              .object({
                display_phone_number: z.string().optional(),
                phone_number_id: z.string().optional(),
              })
              .optional(),
            contacts: z
              .array(
                z.object({
                  profile: z.object({ name: z.string() }).optional(),
                  wa_id: z.string(),
                })
              )
              .optional(),
            messages: z.array(WhatsAppMessageSchema).optional(),
            statuses: z.array(z.unknown()).optional(),
          }),
          field: z.string(),
        })
      ),
    })
  ),
})

async function getSupabase() {
  try {
    const mod = await import('@/lib/supabase/server')
    return await mod.createClient()
  } catch {
    return null
  }
}

function generateId(): string {
  return `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

async function findLeadByPhone(phone: string): Promise<Lead | null> {
  const supabase = await getSupabase()
  if (supabase) {
    try {
      const { data } = await supabase
        .from('va_leads')
        .select('*')
        .eq('phone', phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (data) return data as Lead
    } catch {
      // fall through
    }
  }
  return inMemoryLeads.find((l) => l.phone === phone) ?? null
}

async function createLeadFromWhatsApp(
  phone: string,
  contactName: string
): Promise<Lead> {
  const { score, tier } = scoreLead({ source: 'whatsapp' })

  const leadRow = {
    name: contactName,
    phone,
    email: null,
    whatsapp: phone,
    area: null,
    city: 'Johannesburg',
    province: 'Gauteng',
    budget_min: null,
    budget_max: null,
    preferred_brand: null,
    preferred_model: null,
    preferred_type: null,
    new_or_used: 'any' as const,
    has_trade_in: false,
    trade_in_brand: null,
    trade_in_model: null,
    trade_in_year: null,
    timeline: 'just_browsing' as const,
    finance_status: 'unknown' as const,
    ai_score: score,
    score_tier: tier,
    source: 'whatsapp',
    source_detail: 'inbound_message',
    language: 'en' as const,
    status: 'new' as const,
  }

  const supabase = await getSupabase()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('va_leads')
        .insert(leadRow)
        .select()
        .single()
      if (!error && data) return data as Lead
    } catch {
      // fall through
    }
  }

  const lead: Lead = {
    id: generateId(),
    ...leadRow,
    assigned_dealer_id: null,
    matched_vin: null,
    matched_vehicle: null,
    contacted_at: null,
    test_drive_at: null,
    sold_at: null,
    sale_amount: null,
    created_at: new Date().toISOString(),
  }
  inMemoryLeads.push(lead)
  return lead
}

// GET: WhatsApp webhook verification (hub challenge)

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const mode = sp.get('hub.mode')
  const hubToken = sp.get('hub.verify_token')
  const challenge = sp.get('hub.challenge')

  const expected = process.env.WHATSAPP_VERIFY_TOKEN

  if (mode === 'subscribe' && hubToken === expected) {
    console.log('[WA] Webhook verified')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// POST: Receive incoming WhatsApp messages

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = WhatsAppWebhookSchema.safeParse(body)
  if (!parsed.success) {
    console.log('[WA] Unrecognized payload, ignoring')
    return NextResponse.json({ received: true })
  }

  const webhook = parsed.data

  for (const entry of webhook.entry) {
    for (const change of entry.changes) {
      const { messages, contacts } = change.value
      if (!messages || messages.length === 0) continue

      for (const inbound of messages) {
        const textContent = inbound.text?.body
        if (inbound.type !== 'text' || !textContent) continue

        const phone = inbound.from
        const contactName =
          contacts?.find((c) => c.wa_id === phone)?.profile?.name ?? 'Unknown'

        console.log(`[WA] From ${phone} (${contactName}): ${textContent}`)

        let lead = await findLeadByPhone(phone)
        if (!lead) {
          lead = await createLeadFromWhatsApp(phone, contactName)
          console.log(`[WA] New lead created: ${lead.id}`)
        }

        let ctx = conversations.get(phone)
        if (!ctx) {
          ctx = {
            state: 'GREETING',
            language: lead.language ?? 'en',
            name: lead.name,
            phone: lead.phone,
            vehicleType: lead.preferred_type ?? undefined,
            budgetMin: lead.budget_min ?? undefined,
            budgetMax: lead.budget_max ?? undefined,
            brand: lead.preferred_brand ?? undefined,
            timeline: lead.timeline ?? undefined,
            hasTradeIn: lead.has_trade_in ?? undefined,
          }
        }

        const response = getNextMessage(ctx, textContent)
        conversations.set(phone, response.context)

        console.log(
          `[WA] Reply to ${phone} [${response.nextState}]: ${response.message}`
        )
      }
    }
  }

  return NextResponse.json({ received: true })
}
