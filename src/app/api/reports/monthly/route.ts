import { NextRequest, NextResponse } from 'next/server'
import { generateMonthlyHTML } from '@/lib/reports/roi-report'

// ---------------------------------------------------------------------------
// GET /api/reports/monthly?dealer_id=...&email=true
// Returns full HTML report. If email=true, sends via Resend.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const dealerId = params.get('dealer_id')
  const sendEmail = params.get('email') === 'true'

  if (!dealerId) {
    return NextResponse.json({ error: 'dealer_id is required' }, { status: 400 })
  }

  try {
    const html = await generateMonthlyHTML(dealerId)

    // Optional: send via Resend
    if (sendEmail) {
      const resendKey = process.env.RESEND_API_KEY
      if (resendKey) {
        // Fetch dealer email
        const { createServiceClient } = await import('@/lib/supabase/service')
        const supabase = createServiceClient()
        const { data: dealer } = await supabase
          .from('va_dealers')
          .select('email, name')
          .eq('id', dealerId)
          .single()

        if (dealer?.email) {
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
            const emailResult = await res.json()
            console.log('[reports/monthly] Email sent:', emailResult)
          } catch (emailErr) {
            console.error('[reports/monthly] Email send failed:', emailErr)
          }
        }
      }
    }

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[api/reports/monthly] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
