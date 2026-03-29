import { NextResponse } from 'next/server'
import { checkVPraiHealth } from '@/lib/integrations/vprai'

// ---------------------------------------------------------------------------
// GET /api/integrations/vprai/status — Check V-Prai integration health
// ---------------------------------------------------------------------------

export async function GET() {
  const health = await checkVPraiHealth()

  // Try to get lead counts from Supabase
  let vpraiLeadCount = 0
  let lastSyncLead: string | null = null

  try {
    const { createServiceClient } = await import('@/lib/supabase/service')
    const supabase = createServiceClient()

    const { count } = await supabase
      .from('va_leads')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'vprai')

    vpraiLeadCount = count || 0

    // Get most recent vprai lead for "last sync" time
    const { data: latest } = await supabase
      .from('va_leads')
      .select('created_at')
      .eq('source', 'vprai')
      .order('created_at', { ascending: false })
      .limit(1)

    if (latest && latest.length > 0) {
      lastSyncLead = latest[0].created_at
    }
  } catch {
    // Supabase unavailable — continue with zeros
  }

  return NextResponse.json({
    integration: 'vprai',
    name: 'V-Prai Lead Generation',
    url: process.env.VPRAI_API_URL || 'https://prai.visioai.co',
    connected: health.connected,
    latency_ms: health.latencyMs,
    error: health.error,
    api_key_configured: !!(process.env.VPRAI_API_KEY),
    webhook_secret_configured: !!(process.env.VPRAI_WEBHOOK_SECRET || process.env.VPRAI_API_KEY),
    stats: {
      total_leads_synced: vpraiLeadCount,
      last_sync_at: lastSyncLead,
    },
    checked_at: new Date().toISOString(),
  })
}
