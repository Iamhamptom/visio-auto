import { NextRequest, NextResponse } from 'next/server'
import { calculateDealerAnalytics, calculatePlatformAnalytics } from '@/lib/leads/analytics'

// ---------------------------------------------------------------------------
// Cron: Analytics — daily analytics refresh at midnight
// Schedule: 0 0 * * *
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Current period (YYYY-MM)
    const now = new Date()
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Fetch all active dealers
    const { data: dealers, error } = await supabase
      .from('va_dealers')
      .select('id, name')
      .eq('is_active', true)

    if (error || !dealers) {
      console.error('[AnalyticsCron] Failed to fetch dealers:', error?.message)
      return NextResponse.json({ error: 'Failed to fetch dealers' }, { status: 500 })
    }

    let dealerSuccess = 0
    let dealerSkipped = 0
    let dealerErrors = 0

    // Calculate analytics for each dealer
    for (const dealer of dealers) {
      try {
        const result = await calculateDealerAnalytics(dealer.id, period)
        if (result) {
          dealerSuccess++
        } else {
          dealerSkipped++ // no leads this period
        }
      } catch (err) {
        console.error(`[AnalyticsCron] Error for dealer "${dealer.name}":`, err)
        dealerErrors++
      }
    }

    // Calculate platform-wide analytics
    let platformResult = null
    try {
      platformResult = await calculatePlatformAnalytics(period)
    } catch (err) {
      console.error('[AnalyticsCron] Platform analytics error:', err)
    }

    console.log(
      `[AnalyticsCron] ${period} — Dealers: ${dealerSuccess} updated, ${dealerSkipped} skipped, ${dealerErrors} errors`
    )

    return NextResponse.json({
      success: true,
      period,
      dealers_updated: dealerSuccess,
      dealers_skipped: dealerSkipped,
      dealers_errors: dealerErrors,
      platform: platformResult
        ? {
            total_leads: platformResult.total_leads,
            total_sales: platformResult.total_sales,
            total_revenue: platformResult.total_revenue,
            conversion_rate: platformResult.conversion_rate,
          }
        : null,
    })
  } catch (err) {
    console.error('[AnalyticsCron] Fatal error:', err)
    return NextResponse.json({ error: 'Analytics cron failed' }, { status: 500 })
  }
}
