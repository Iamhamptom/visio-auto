import { NextRequest, NextResponse } from 'next/server'
import { generateMonthlyHTML } from '@/lib/reports/roi-report'
import { createServiceClient } from '@/lib/supabase/service'

// ---------------------------------------------------------------------------
// Cron: Monthly Reports — 1st of every month at 6am
// Schedule: 0 6 1 * *
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

  try {
    // Fetch all active dealers
    const { data: dealers, error } = await supabase
      .from('va_dealers')
      .select('id, name, email')
      .eq('is_active', true)

    if (error || !dealers) {
      console.error('[cron/reports/monthly] Failed to fetch dealers:', error?.message)
      return NextResponse.json({ error: 'Failed to fetch dealers' }, { status: 500 })
    }

    let generated = 0
    let emailed = 0
    let errors = 0

    for (const dealer of dealers) {
      try {
        const html = await generateMonthlyHTML(dealer.id)
        generated++

        // Send via Resend if email configured
        if (resendKey && dealer.email) {
          try {
            const res = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${resendKey}`,
              },
              body: JSON.stringify({
                from: 'Visio Auto <reports@visioauto.co.za>',
                to: [dealer.email],
                subject: `Your Monthly ROI Report — ${dealer.name}`,
                html,
              }),
            })

            if (res.ok) {
              emailed++
              console.log(`[cron/reports/monthly] Emailed report to ${dealer.name} (${dealer.email})`)
            } else {
              const errBody = await res.text()
              console.error(`[cron/reports/monthly] Resend failed for ${dealer.name}:`, errBody)
            }
          } catch (emailErr) {
            console.error(`[cron/reports/monthly] Email error for ${dealer.name}:`, emailErr)
          }
        }

        // Log in analytics
        try {
          await supabase.from('va_analytics').insert({
            dealer_id: dealer.id,
            event_type: 'monthly_report_generated',
            metadata: { emailed: !!(resendKey && dealer.email), period: new Date().toISOString().slice(0, 7) },
          })
        } catch {
          // Non-critical
        }
      } catch (err) {
        console.error(`[cron/reports/monthly] Error for ${dealer.name}:`, err)
        errors++
      }
    }

    console.log(`[cron/reports/monthly] Generated: ${generated}, Emailed: ${emailed}, Errors: ${errors}`)

    return NextResponse.json({
      success: true,
      dealers_total: dealers.length,
      reports_generated: generated,
      reports_emailed: emailed,
      errors,
    })
  } catch (err) {
    console.error('[cron/reports/monthly] Fatal error:', err)
    return NextResponse.json({ error: 'Monthly report cron failed' }, { status: 500 })
  }
}
