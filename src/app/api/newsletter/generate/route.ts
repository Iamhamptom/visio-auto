import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  generateWeeklyNewsletter,
  generateMarketAlert,
  type MarketAlertEvent,
} from '@/lib/newsletter/generator'

// ---------------------------------------------------------------------------
// POST /api/newsletter/generate
// Generate a newsletter for a specific dealer
// Body: { dealer_id: string, type: 'weekly' | 'market_alert', event?: MarketAlertEvent }
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { dealer_id, type, event } = body as {
      dealer_id: string
      type: 'weekly' | 'market_alert'
      event?: MarketAlertEvent
    }

    if (!dealer_id || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: dealer_id, type' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Fetch dealer
    const { data: dealer, error: dealerErr } = await supabase
      .from('va_dealers')
      .select('id, name, brands, area, city, province, tier')
      .eq('id', dealer_id)
      .single()

    if (dealerErr || !dealer) {
      return NextResponse.json(
        { error: `Dealer not found: ${dealerErr?.message || dealer_id}` },
        { status: 404 }
      )
    }

    if (type === 'market_alert') {
      if (!event) {
        return NextResponse.json(
          { error: 'market_alert type requires an event object' },
          { status: 400 }
        )
      }

      const newsletter = await generateMarketAlert(event, dealer)
      return NextResponse.json({ newsletter })
    }

    // Weekly newsletter — fetch signals and lead stats
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

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
        .eq('assigned_dealer_id', dealer_id)
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

    // Store in database
    await supabase.from('va_newsletters').insert({
      dealer_id: dealer.id,
      type: newsletter.type,
      subject: newsletter.subject,
      html: newsletter.html,
      plain_text: newsletter.plain_text,
      generated_at: newsletter.generated_at,
    })

    return NextResponse.json({ newsletter })
  } catch (err) {
    console.error('[api/newsletter/generate] Error:', err)
    return NextResponse.json(
      { error: 'Failed to generate newsletter' },
      { status: 500 }
    )
  }
}
