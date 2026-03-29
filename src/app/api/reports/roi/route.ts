import { NextRequest, NextResponse } from 'next/server'
import { generateROIReport, generateMonthlyHTML } from '@/lib/reports/roi-report'

// ---------------------------------------------------------------------------
// GET /api/reports/roi?dealer_id=...&period=...&format=json|html
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const dealerId = params.get('dealer_id')
  const period = (params.get('period') || 'last_month') as 'this_month' | 'last_month' | 'last_3_months' | 'custom'
  const format = params.get('format') || 'json'
  const customStart = params.get('start') || undefined
  const customEnd = params.get('end') || undefined

  if (!dealerId) {
    return NextResponse.json({ error: 'dealer_id is required' }, { status: 400 })
  }

  try {
    if (format === 'html') {
      const html = await generateMonthlyHTML(dealerId)
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    const report = await generateROIReport(dealerId, period, customStart, customEnd)
    return NextResponse.json({ success: true, report })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[api/reports/roi] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
