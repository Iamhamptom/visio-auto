import { NextRequest, NextResponse } from 'next/server'
import { matchVehicles, formatMatchesForWhatsApp } from '@/lib/ai/match'
import type { InventoryItem, Language } from '@/lib/types'

async function getSupabase() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    return await createClient()
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lead_id, preferences, dealer_id, format } = body as {
      lead_id?: string
      preferences?: {
        budget_min?: number
        budget_max?: number
        preferred_brand?: string
        preferred_model?: string
        preferred_type?: string
        new_or_used?: 'new' | 'used' | 'any'
        area?: string
        city?: string
      }
      dealer_id?: string
      format?: 'json' | 'whatsapp'
    }

    if (!lead_id && !preferences) {
      return NextResponse.json(
        { error: 'Either lead_id or preferences must be provided' },
        { status: 400 }
      )
    }

    const supabase = await getSupabase()

    if (!supabase) {
      // Without DB, match against mock inventory using provided preferences
      const { matchVehicles: mv } = await import('@/lib/ai/match')
      const mockMatches = mv(preferences || {}, [])
      return NextResponse.json({ success: true, matches: mockMatches, mock: true })
    }

    // Resolve lead preferences
    let leadPrefs = preferences || {}
    let language: Language = 'en'

    if (lead_id) {
      const { data: lead } = await supabase
        .from('va_leads')
        .select('*')
        .eq('id', lead_id)
        .single()

      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      }

      leadPrefs = {
        budget_min: lead.budget_min,
        budget_max: lead.budget_max,
        preferred_brand: lead.preferred_brand,
        preferred_model: lead.preferred_model,
        preferred_type: lead.preferred_type,
        new_or_used: lead.new_or_used,
        area: lead.area,
        city: lead.city,
      }
      language = lead.language || 'en'
    }

    // Fetch inventory
    let inventoryQuery = supabase
      .from('va_inventory')
      .select('*')
      .eq('is_available', true)

    if (dealer_id) {
      inventoryQuery = inventoryQuery.eq('dealer_id', dealer_id)
    }

    const { data: inventory, error: invError } = await inventoryQuery.limit(500)

    if (invError) {
      console.error('Inventory fetch error:', invError)
      return NextResponse.json(
        { error: 'Failed to fetch inventory' },
        { status: 500 }
      )
    }

    const matches = matchVehicles(leadPrefs, (inventory || []) as InventoryItem[])

    // Update lead with top match if we have one
    if (lead_id && matches.length > 0) {
      const topMatch = matches[0].vehicle
      await supabase
        .from('va_leads')
        .update({
          matched_vin: topMatch.vin,
          matched_vehicle: `${topMatch.year} ${topMatch.brand} ${topMatch.model}`,
        })
        .eq('id', lead_id)
    }

    // Format for WhatsApp if requested
    if (format === 'whatsapp') {
      const whatsappMessage = formatMatchesForWhatsApp(matches, language)
      return NextResponse.json({
        success: true,
        matches,
        whatsapp_message: whatsappMessage,
      })
    }

    return NextResponse.json({ success: true, matches })
  } catch (error) {
    console.error('Vehicle matching error:', error)
    return NextResponse.json(
      { error: 'Failed to match vehicles' },
      { status: 500 }
    )
  }
}
