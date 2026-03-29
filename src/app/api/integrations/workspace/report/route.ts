import { NextRequest, NextResponse } from 'next/server'
import { reportToWorkspace, type WorkspaceReport } from '@/lib/integrations/workspace'

// ---------------------------------------------------------------------------
// POST /api/integrations/workspace/report
// Send Visio Auto performance report to Visio Workspace
// Called by the analytics cron or manually
// ---------------------------------------------------------------------------

const REPORT_API_KEY = process.env.VISIO_GATEWAY_KEY || process.env.VPRAI_API_KEY || ''

export async function POST(request: NextRequest) {
  // Auth — accept gateway key or internal cron header
  const authHeader = request.headers.get('authorization')?.replace('Bearer ', '') || ''
  const cronSecret = request.headers.get('x-cron-secret') || ''
  const isAuthed = (REPORT_API_KEY && authHeader === REPORT_API_KEY) ||
    (cronSecret === process.env.CRON_SECRET)

  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Gather analytics from Supabase
  let metrics = {
    total_leads: 0,
    active_dealers: 0,
    revenue: 0,
    conversion_rate: 0,
    avg_response_time_seconds: 0,
    leads_by_source: {} as Record<string, number>,
    top_brands: [] as string[],
    score_distribution: { hot: 0, warm: 0, cold: 0 },
  }

  try {
    const { createServiceClient } = await import('@/lib/supabase/service')
    const supabase = createServiceClient()

    // Total leads
    const { count: leadCount } = await supabase
      .from('va_leads')
      .select('*', { count: 'exact', head: true })
    metrics.total_leads = leadCount || 0

    // Active dealers
    const { count: dealerCount } = await supabase
      .from('va_dealers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    metrics.active_dealers = dealerCount || 0

    // Score distribution
    const { count: hotCount } = await supabase
      .from('va_leads')
      .select('*', { count: 'exact', head: true })
      .eq('score_tier', 'hot')
    const { count: warmCount } = await supabase
      .from('va_leads')
      .select('*', { count: 'exact', head: true })
      .eq('score_tier', 'warm')
    const { count: coldCount } = await supabase
      .from('va_leads')
      .select('*', { count: 'exact', head: true })
      .eq('score_tier', 'cold')

    metrics.score_distribution = {
      hot: hotCount || 0,
      warm: warmCount || 0,
      cold: coldCount || 0,
    }

    // Revenue from sold leads
    const { data: soldLeads } = await supabase
      .from('va_leads')
      .select('sale_amount')
      .eq('status', 'sold')
      .not('sale_amount', 'is', null)

    if (soldLeads) {
      metrics.revenue = soldLeads.reduce((sum, l) => sum + (l.sale_amount || 0), 0)
    }

    // Conversion rate
    if (metrics.total_leads > 0) {
      const { count: soldCount } = await supabase
        .from('va_leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sold')
      metrics.conversion_rate = ((soldCount || 0) / metrics.total_leads) * 100
    }
  } catch (err) {
    console.error('[workspace-report] Supabase query failed:', err)
    // Continue with zeros — still send the report
  }

  const now = new Date()
  const report: WorkspaceReport = {
    product_id: 'visio-auto',
    product_name: 'Visio Auto',
    period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    metrics,
    reported_at: now.toISOString(),
  }

  const result = await reportToWorkspace(report)

  if (!result.success) {
    return NextResponse.json(
      { error: `Report delivery failed: ${result.error}`, report },
      { status: 502 }
    )
  }

  console.log('[workspace-report] sent successfully:', report.period)

  return NextResponse.json({
    success: true,
    report,
  })
}
