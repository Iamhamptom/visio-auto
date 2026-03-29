import type { DealerAnalytics } from '@/lib/types'

// ---------------------------------------------------------------------------
// Lead Analytics Engine
// ---------------------------------------------------------------------------

interface PlatformAnalytics {
  period: string
  total_dealers: number
  active_dealers: number
  total_leads: number
  total_contacted: number
  total_test_drives: number
  total_sales: number
  total_revenue: number
  avg_score: number
  conversion_rate: number
  top_source: string | null
  top_brand: string | null
}

/**
 * Calculate analytics for a single dealer over a given period.
 * Period format: "YYYY-MM" (e.g. "2026-03")
 */
export async function calculateDealerAnalytics(
  dealer_id: string,
  period: string
): Promise<DealerAnalytics | null> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Parse period into date range
    const [year, month] = period.split('-').map(Number)
    const startDate = new Date(year, month - 1, 1).toISOString()
    const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString()

    // Fetch all leads for this dealer in the period
    const { data: leads, error } = await supabase
      .from('va_leads')
      .select('*')
      .eq('assigned_dealer_id', dealer_id)
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    if (error) {
      console.error(`[Analytics] Error fetching leads for dealer ${dealer_id}:`, error.message)
      return null
    }

    if (!leads || leads.length === 0) {
      console.log(`[Analytics] No leads for dealer ${dealer_id} in ${period}`)
      return null
    }

    // Calculate metrics
    const leads_delivered = leads.length
    const leads_contacted = leads.filter((l) => l.contacted_at !== null).length
    const test_drives_booked = leads.filter((l) => l.test_drive_at !== null).length
    const test_drives_done = leads.filter((l) => l.status === 'test_drive_done' || l.sold_at !== null).length
    const sales_closed = leads.filter((l) => l.status === 'sold').length
    const total_revenue = leads
      .filter((l) => l.sale_amount !== null)
      .reduce((sum, l) => sum + (l.sale_amount ?? 0), 0)

    // Average response time (time between created_at and contacted_at)
    const responseTimes = leads
      .filter((l) => l.contacted_at !== null)
      .map((l) => {
        const created = new Date(l.created_at).getTime()
        const contacted = new Date(l.contacted_at).getTime()
        return (contacted - created) / 1000 // seconds
      })
      .filter((t) => t > 0)

    const avg_response_time_seconds =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : null

    // Average AI score
    const scores = leads.map((l) => l.ai_score).filter((s) => s !== null && s !== undefined)
    const ai_score_avg =
      scores.length > 0
        ? Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 10) / 10
        : null

    // Best source (most leads from)
    const sourceCounts: Record<string, number> = {}
    for (const l of leads) {
      const src = l.source ?? 'unknown'
      sourceCounts[src] = (sourceCounts[src] ?? 0) + 1
    }
    const best_source =
      Object.keys(sourceCounts).length > 0
        ? Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null

    // Best brand (most interest)
    const brandCounts: Record<string, number> = {}
    for (const l of leads) {
      if (l.preferred_brand) {
        brandCounts[l.preferred_brand] = (brandCounts[l.preferred_brand] ?? 0) + 1
      }
    }
    const best_brand =
      Object.keys(brandCounts).length > 0
        ? Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null

    const analytics: Omit<DealerAnalytics, 'id'> = {
      dealer_id,
      period,
      leads_delivered,
      leads_contacted,
      test_drives_booked,
      test_drives_done,
      sales_closed,
      total_revenue,
      avg_response_time_seconds,
      ai_score_avg,
      best_source,
      best_brand,
    }

    // Upsert into va_analytics
    const { data: upserted, error: upsertError } = await supabase
      .from('va_analytics')
      .upsert(
        { ...analytics },
        { onConflict: 'dealer_id,period' }
      )
      .select()
      .single()

    if (upsertError) {
      console.error(`[Analytics] Upsert error for dealer ${dealer_id}:`, upsertError.message)
      // Return the calculated data even if upsert failed
      return { id: '', ...analytics }
    }

    console.log(
      `[Analytics] Dealer ${dealer_id} — ${period}: ${leads_delivered} leads, ${sales_closed} sales, R${total_revenue}`
    )
    return upserted as DealerAnalytics
  } catch (err) {
    console.error('[Analytics] Error:', err)
    return null
  }
}

/**
 * Calculate platform-wide analytics across all dealers.
 */
export async function calculatePlatformAnalytics(
  period: string
): Promise<PlatformAnalytics | null> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const [year, month] = period.split('-').map(Number)
    const startDate = new Date(year, month - 1, 1).toISOString()
    const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString()

    // Fetch all dealers
    const { data: dealers } = await supabase.from('va_dealers').select('id, is_active')
    const total_dealers = dealers?.length ?? 0
    const active_dealers = dealers?.filter((d) => d.is_active).length ?? 0

    // Fetch all leads in the period
    const { data: leads, error } = await supabase
      .from('va_leads')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    if (error || !leads) {
      console.error('[Analytics] Platform analytics error:', error?.message)
      return null
    }

    const total_leads = leads.length
    const total_contacted = leads.filter((l) => l.contacted_at !== null).length
    const total_test_drives = leads.filter((l) => l.test_drive_at !== null).length
    const total_sales = leads.filter((l) => l.status === 'sold').length
    const total_revenue = leads
      .filter((l) => l.sale_amount !== null)
      .reduce((sum, l) => sum + (l.sale_amount ?? 0), 0)

    const scores = leads.map((l) => l.ai_score).filter((s) => s != null)
    const avg_score =
      scores.length > 0
        ? Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 10) / 10
        : 0

    const conversion_rate =
      total_leads > 0 ? Math.round((total_sales / total_leads) * 10000) / 100 : 0

    // Top source
    const sourceCounts: Record<string, number> = {}
    for (const l of leads) {
      const src = l.source ?? 'unknown'
      sourceCounts[src] = (sourceCounts[src] ?? 0) + 1
    }
    const top_source =
      Object.keys(sourceCounts).length > 0
        ? Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null

    // Top brand
    const brandCounts: Record<string, number> = {}
    for (const l of leads) {
      if (l.preferred_brand) {
        brandCounts[l.preferred_brand] = (brandCounts[l.preferred_brand] ?? 0) + 1
      }
    }
    const top_brand =
      Object.keys(brandCounts).length > 0
        ? Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null

    const result: PlatformAnalytics = {
      period,
      total_dealers,
      active_dealers,
      total_leads,
      total_contacted,
      total_test_drives,
      total_sales,
      total_revenue,
      avg_score,
      conversion_rate,
      top_source,
      top_brand,
    }

    console.log(
      `[Analytics] Platform ${period}: ${total_leads} leads, ${total_sales} sales, R${total_revenue}, ${conversion_rate}% conversion`
    )

    return result
  } catch (err) {
    console.error('[Analytics] Platform error:', err)
    return null
  }
}
