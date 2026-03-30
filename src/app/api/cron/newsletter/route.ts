import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { generateWeeklyNewsletter } from '@/lib/newsletter/generator'

// ---------------------------------------------------------------------------
// Cron: Weekly Newsletter — Every Monday at 7am
// Schedule: 0 7 * * 1
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const resendKey = process.env.RESEND_API_KEY
  const whatsappToken = process.env.WHATSAPP_TOKEN
  const whatsappPhoneId = process.env.WHATSAPP_PHONE_ID

  try {
    // Fetch all active dealers
    const { data: dealers, error: dealersErr } = await supabase
      .from('va_dealers')
      .select('id, name, brands, area, city, province, tier, email, whatsapp_number')
      .eq('is_active', true)

    if (dealersErr || !dealers?.length) {
      console.error('[cron/newsletter] No active dealers:', dealersErr?.message)
      return NextResponse.json({
        error: 'No active dealers found',
        detail: dealersErr?.message,
      }, { status: 500 })
    }

    console.log(`[cron/newsletter] Generating weekly briefs for ${dealers.length} dealers`)

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    let generated = 0
    let emailed = 0
    let whatsapped = 0
    let errors = 0

    for (const dealer of dealers) {
      try {
        // Fetch signals and leads for this dealer
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

        const newsletter = await generateWeeklyNewsletter(dealer, signals, leadStats)
        generated++

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
              emailed++
            }
          } catch (emailErr) {
            console.error(`[cron/newsletter] Email failed for ${dealer.name}:`, emailErr)
          }
        }

        // Send WhatsApp summary
        if (whatsappToken && whatsappPhoneId && dealer.whatsapp_number) {
          try {
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
              whatsapped++
            }
          } catch (waErr) {
            console.error(`[cron/newsletter] WhatsApp failed for ${dealer.name}:`, waErr)
          }
        }

        // Store newsletter
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

        console.log(`[cron/newsletter] ${dealer.name}: generated=${true}, email=${emailSent}, whatsapp=${whatsappSent}`)
      } catch (err) {
        errors++
        console.error(`[cron/newsletter] Failed for ${dealer.name}:`, err)
      }
    }

    console.log(`[cron/newsletter] Done: ${generated} generated, ${emailed} emailed, ${whatsapped} WhatsApp, ${errors} errors`)

    return NextResponse.json({
      success: true,
      dealers: dealers.length,
      generated,
      emailed,
      whatsapped,
      errors,
    })
  } catch (err) {
    console.error('[cron/newsletter] Fatal error:', err)
    return NextResponse.json(
      { error: 'Newsletter cron failed' },
      { status: 500 }
    )
  }
}
