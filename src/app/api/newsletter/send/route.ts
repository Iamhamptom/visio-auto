import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  generateWeeklyNewsletter,
  generateMarketAlert,
  type MarketAlertEvent,
} from '@/lib/newsletter/generator'

// ---------------------------------------------------------------------------
// POST /api/newsletter/send
// Generate + send newsletter to dealer(s)
// Body: { dealer_ids: string[], type: 'weekly' | 'market_alert', event?: MarketAlertEvent }
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { dealer_ids, type, event } = body as {
      dealer_ids: string[]
      type: 'weekly' | 'market_alert'
      event?: MarketAlertEvent
    }

    if (!dealer_ids?.length || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: dealer_ids, type' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const resendKey = process.env.RESEND_API_KEY
    const whatsappToken = process.env.WHATSAPP_TOKEN
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_ID

    // Fetch dealers
    const { data: dealers, error: dealersErr } = await supabase
      .from('va_dealers')
      .select('id, name, brands, area, city, province, tier, email, whatsapp_number')
      .in('id', dealer_ids)

    if (dealersErr || !dealers?.length) {
      return NextResponse.json(
        { error: `No dealers found: ${dealersErr?.message || 'empty result'}` },
        { status: 404 }
      )
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const results: { dealer_id: string; dealer_name: string; email_sent: boolean; whatsapp_sent: boolean; error?: string }[] = []

    for (const dealer of dealers) {
      try {
        let newsletter

        if (type === 'market_alert' && event) {
          newsletter = await generateMarketAlert(event, dealer)
        } else {
          // Fetch per-dealer data
          const [signalsResult, leadsResult] = await Promise.all([
            supabase
              .from('va_signals')
              .select('*')
              .or(`city.eq.${dealer.city},province.eq.${dealer.province}`)
              .gte('created_at', weekAgo)
              .order('buying_probability', { ascending: false })
              .limit(20),
            supabase
              .from('va_leads')
              .select('id, status')
              .eq('assigned_dealer_id', dealer.id)
              .gte('created_at', weekAgo),
          ])

          const signals = signalsResult.data || []
          const leads = leadsResult.data || []

          const leadStats = {
            delivered: leads.length,
            contacted: leads.filter((l) =>
              ['contacted', 'qualified', 'test_drive_booked', 'test_drive_done', 'negotiating', 'sold'].includes(l.status)
            ).length,
            converted: leads.filter((l) => l.status === 'sold').length,
          }

          newsletter = await generateWeeklyNewsletter(dealer, signals, leadStats)
        }

        let emailSent = false
        let whatsappSent = false

        // Send email via Resend
        if (resendKey && dealer.email) {
          try {
            const res = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${resendKey}`,
              },
              body: JSON.stringify({
                from: 'Visio Auto <intelligence@visio-auto.vercel.app>',
                to: [dealer.email],
                subject: newsletter.subject,
                html: newsletter.html,
              }),
            })

            if (res.ok) {
              emailSent = true
            } else {
              const errData = await res.json().catch(() => ({}))
              console.error(`[newsletter/send] Email failed for ${dealer.name}:`, errData)
            }
          } catch (emailErr) {
            console.error(`[newsletter/send] Email error for ${dealer.name}:`, emailErr)
          }
        }

        // Send WhatsApp summary
        if (whatsappToken && whatsappPhoneId && dealer.whatsapp_number) {
          try {
            // Truncate plain text for WhatsApp (max ~4096 chars)
            const whatsappText = newsletter.plain_text.length > 3500
              ? newsletter.plain_text.slice(0, 3500) + '\n\n... Full brief sent to your email.'
              : newsletter.plain_text

            const res = await fetch(
              `https://graph.facebook.com/v19.0/${whatsappPhoneId}/messages`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${whatsappToken}`,
                },
                body: JSON.stringify({
                  messaging_product: 'whatsapp',
                  to: dealer.whatsapp_number.replace(/[^0-9]/g, ''),
                  type: 'text',
                  text: { body: whatsappText },
                }),
              }
            )

            if (res.ok) {
              whatsappSent = true
            } else {
              const errData = await res.json().catch(() => ({}))
              console.error(`[newsletter/send] WhatsApp failed for ${dealer.name}:`, errData)
            }
          } catch (waErr) {
            console.error(`[newsletter/send] WhatsApp error for ${dealer.name}:`, waErr)
          }
        }

        // Store newsletter record
        await supabase.from('va_newsletters').insert({
          dealer_id: dealer.id,
          type: newsletter.type,
          subject: newsletter.subject,
          html: newsletter.html,
          plain_text: newsletter.plain_text,
          generated_at: newsletter.generated_at,
          sent_at: new Date().toISOString(),
          email_sent: emailSent,
          whatsapp_sent: whatsappSent,
        })

        results.push({
          dealer_id: dealer.id,
          dealer_name: dealer.name,
          email_sent: emailSent,
          whatsapp_sent: whatsappSent,
        })
      } catch (dealerErr) {
        console.error(`[newsletter/send] Failed for ${dealer.name}:`, dealerErr)
        results.push({
          dealer_id: dealer.id,
          dealer_name: dealer.name,
          email_sent: false,
          whatsapp_sent: false,
          error: dealerErr instanceof Error ? dealerErr.message : 'Unknown error',
        })
      }
    }

    const sent = results.filter((r) => r.email_sent || r.whatsapp_sent).length
    const failed = results.filter((r) => r.error).length

    return NextResponse.json({
      total: dealers.length,
      sent,
      failed,
      results,
    })
  } catch (err) {
    console.error('[api/newsletter/send] Error:', err)
    return NextResponse.json(
      { error: 'Failed to send newsletters' },
      { status: 500 }
    )
  }
}
