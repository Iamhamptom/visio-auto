import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getTemplate, listTemplates } from '@/lib/whatsapp/templates'
import type { Language } from '@/lib/types'

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const SendMessageSchema = z.object({
  phone: z.string().min(9, 'Phone number is required'),
  message: z.string().min(1).optional(),
  template_name: z.string().optional(),
  template_variables: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  language: z.enum(['en', 'af', 'zu', 'st', 'ts', 'xh']).default('en'),
})

// ---------------------------------------------------------------------------
// Message log (in-memory, for dev/testing)
// ---------------------------------------------------------------------------

interface MessageLog {
  id: string
  phone: string
  message: string
  template_name?: string
  language: string
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed'
  created_at: string
}

const messageLog: MessageLog[] = []

// ---------------------------------------------------------------------------
// POST — Send a WhatsApp message
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = SendMessageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const { phone, message, template_name, template_variables, language } = parsed.data

  // Resolve message content
  let finalMessage: string

  if (template_name) {
    const available = listTemplates()
    if (!available.includes(template_name.toUpperCase())) {
      return NextResponse.json(
        { error: `Unknown template "${template_name}". Available: ${available.join(', ')}` },
        { status: 400 }
      )
    }
    finalMessage = getTemplate(
      template_name.toUpperCase(),
      language as Language,
      template_variables ?? {}
    )
  } else if (message) {
    finalMessage = message
  } else {
    return NextResponse.json(
      { error: 'Either "message" or "template_name" must be provided' },
      { status: 400 }
    )
  }

  // Normalize phone number
  let normalizedPhone = phone.replace(/[\s\-()]/g, '')
  if (normalizedPhone.startsWith('0')) {
    normalizedPhone = '27' + normalizedPhone.slice(1)
  }
  if (!normalizedPhone.startsWith('+')) {
    normalizedPhone = '+' + normalizedPhone
  }

  // -----------------------------------------------------------------------
  // WhatsApp Business API integration
  // When WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID are set,
  // this will send via the Meta Cloud API. Otherwise, it logs the message.
  // -----------------------------------------------------------------------

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  let status: MessageLog['status'] = 'queued'
  let whatsappMessageId: string | undefined

  if (accessToken && phoneNumberId) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: normalizedPhone.replace('+', ''),
            type: 'text',
            text: { body: finalMessage },
          }),
        }
      )

      if (res.ok) {
        const data = await res.json()
        whatsappMessageId = data?.messages?.[0]?.id
        status = 'sent'
        console.log(`[WhatsApp] Sent to ${normalizedPhone}: ${whatsappMessageId}`)
      } else {
        const errData = await res.json().catch(() => null)
        console.error(`[WhatsApp] Send failed:`, errData)
        status = 'failed'
      }
    } catch (err) {
      console.error('[WhatsApp] API error:', err)
      status = 'failed'
    }
  } else {
    // Dev mode — log only
    console.log(`[WhatsApp DEV] Would send to ${normalizedPhone}:`)
    console.log(finalMessage)
    status = 'queued'
  }

  // Log the message
  const logEntry: MessageLog = {
    id: whatsappMessageId ?? `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    phone: normalizedPhone,
    message: finalMessage,
    template_name: template_name?.toUpperCase(),
    language,
    status,
    created_at: new Date().toISOString(),
  }
  messageLog.unshift(logEntry)

  // Keep log bounded
  if (messageLog.length > 1000) messageLog.length = 1000

  return NextResponse.json({
    success: status !== 'failed',
    message_id: logEntry.id,
    phone: normalizedPhone,
    status,
    preview: finalMessage.slice(0, 160),
  }, { status: status === 'failed' ? 502 : 200 })
}
