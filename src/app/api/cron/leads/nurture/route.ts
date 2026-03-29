import { NextRequest, NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Cron: Lead Nurture — automated follow-up via WhatsApp
// Schedule: daily at 09:00 SAST
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

    const now = new Date()
    const results = { day1: 0, day3: 0, day7: 0, errors: 0 }

    // Fetch leads that are 'new' or 'contacted' and need nurturing
    const { data: leads, error } = await supabase
      .from('va_leads')
      .select('*')
      .in('status', ['new', 'contacted'])
      .order('created_at', { ascending: true })
      .limit(200)

    if (error || !leads) {
      console.error('[Nurture] Failed to fetch leads:', error?.message)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    // Fetch dealers for personalization
    const dealerIds = [...new Set(leads.map((l) => l.assigned_dealer_id).filter(Boolean))]
    const dealerMap: Record<string, string> = {}
    if (dealerIds.length > 0) {
      const { data: dealers } = await supabase
        .from('va_dealers')
        .select('id, name')
        .in('id', dealerIds)

      for (const d of dealers ?? []) {
        dealerMap[d.id] = d.name
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    for (const lead of leads) {
      try {
        const createdAt = new Date(lead.created_at)
        const daysSinceCreated = Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Parse current nurture stage from source_detail
        const currentStage = parseNurtureStage(lead.source_detail)

        // Determine which message to send
        let message: string | null = null
        let newStage: string | null = null

        if (lead.status === 'new' && currentStage === 0 && daysSinceCreated >= 0) {
          // Day 1: Welcome / vehicle match teaser
          const brand = lead.preferred_brand ? ` ${lead.preferred_brand}` : ''
          message = `Hi ${lead.name}, we found vehicles matching your${brand} preferences! Our AI has shortlisted the best deals in ${lead.city ?? 'your area'}. Want to see them? Reply YES.`
          newStage = 'nurture:day1'
          results.day1++
        } else if (currentStage === 1 && daysSinceCreated >= 3) {
          // Day 3: Urgency nudge
          message = `Hi ${lead.name}, the vehicles we found for you are selling fast — a few have already been sold this week. Want to schedule a test drive before they're gone? Reply DRIVE.`
          newStage = 'nurture:day3'
          results.day3++
        } else if (currentStage === 3 && daysSinceCreated >= 7) {
          // Day 7: Special offer + dealer mention
          const dealerName =
            lead.assigned_dealer_id && dealerMap[lead.assigned_dealer_id]
              ? dealerMap[lead.assigned_dealer_id]
              : 'our partner dealer'
          const brand = lead.preferred_brand ?? 'vehicles'
          message = `Hi ${lead.name}, special offer this week on ${brand} at ${dealerName}! Prices start from the lowest in 6 months. Interested? Reply OFFER.`
          newStage = 'nurture:day7'
          results.day7++
        }

        if (!message || !newStage) continue

        // Send via WhatsApp
        const phone = lead.whatsapp ?? lead.phone
        if (!phone) continue

        await fetch(`${baseUrl}/api/whatsapp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            message,
            language: lead.language ?? 'en',
          }),
        })

        // Update lead
        const updates: Record<string, unknown> = {
          source_detail: appendNurtureStage(lead.source_detail, newStage),
        }

        // After first touch, move to 'contacted'
        if (lead.status === 'new') {
          updates.status = 'contacted'
          updates.contacted_at = now.toISOString()
        }

        await supabase.from('va_leads').update(updates).eq('id', lead.id)
      } catch (err) {
        console.error(`[Nurture] Error processing lead ${lead.id}:`, err)
        results.errors++
      }
    }

    console.log(`[Nurture] Completed — Day1: ${results.day1}, Day3: ${results.day3}, Day7: ${results.day7}, Errors: ${results.errors}`)

    return NextResponse.json({
      success: true,
      processed: leads.length,
      ...results,
    })
  } catch (err) {
    console.error('[Nurture] Cron error:', err)
    return NextResponse.json({ error: 'Nurture cron failed' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse the latest nurture stage from source_detail.
 * Returns 0 (none), 1 (day1), 3 (day3), 7 (day7).
 */
function parseNurtureStage(detail: string | null): number {
  if (!detail) return 0
  if (detail.includes('nurture:day7')) return 7
  if (detail.includes('nurture:day3')) return 3
  if (detail.includes('nurture:day1')) return 1
  return 0
}

/**
 * Append a nurture stage to source_detail without overwriting existing data.
 */
function appendNurtureStage(existing: string | null, stage: string): string {
  if (!existing) return stage
  if (existing.includes(stage)) return existing
  return `${existing} | ${stage}`
}
