/**
 * Lead Marketplace Logic
 *
 * Distributes a single lead to multiple dealers simultaneously.
 * Each dealer pays for the same lead = 3-5x revenue multiplier.
 * Tracks first-responder advantage.
 */

import { createServiceClient } from '@/lib/supabase/service'

interface MarketplaceDealerMatch {
  id: string
  name: string
  brands: string[]
  area: string
  city: string
  whatsapp_number: string | null
  email: string | null
}

interface DistributionResult {
  lead_id: string
  distributed_to: { dealer_id: string; dealer_name: string }[]
  total_dealers: number
  marketplace_id: string
}

interface FirstResponderResult {
  lead_id: string
  dealer_id: string
  responded_at: string
}

/**
 * Find 3-5 best matching dealers for a lead based on brand + area.
 * Prefers dealers that sell the lead's preferred brand and are in the same area/city.
 */
export async function findMatchingDealers(
  lead: { preferred_brand?: string | null; area?: string | null; city?: string | null },
  maxDealers = 5
): Promise<MarketplaceDealerMatch[]> {
  const supabase = createServiceClient()

  const { data: dealers, error } = await supabase
    .from('va_dealers')
    .select('id, name, brands, area, city, whatsapp_number, email')
    .eq('is_active', true)
    .limit(50)

  if (error || !dealers) {
    console.error('[marketplace] Failed to fetch dealers:', error?.message)
    return []
  }

  // Score each dealer based on match quality
  const scored = dealers.map((dealer) => {
    let score = 0

    // Brand match (strongest signal)
    if (
      lead.preferred_brand &&
      dealer.brands?.some((b: string) => b.toLowerCase() === lead.preferred_brand!.toLowerCase())
    ) {
      score += 10
    }

    // Area match
    if (lead.area && dealer.area?.toLowerCase() === lead.area.toLowerCase()) {
      score += 5
    }

    // City match
    if (lead.city && dealer.city?.toLowerCase() === lead.city.toLowerCase()) {
      score += 3
    }

    return { dealer, score }
  })

  // Sort by score descending, take top N
  scored.sort((a, b) => b.score - a.score)

  return scored
    .slice(0, maxDealers)
    .filter((s) => s.score > 0) // Only include dealers with at least some match
    .map((s) => s.dealer)
}

/**
 * Distribute a lead to multiple dealers.
 * Creates a marketplace record in va_leads with marketplace_dealers JSONB.
 */
export async function distributeLeadToMultipleDealers(
  leadId: string,
  dealerIds: string[]
): Promise<DistributionResult> {
  const supabase = createServiceClient()

  // Fetch the lead
  const { data: lead, error: leadError } = await supabase
    .from('va_leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (leadError || !lead) {
    throw new Error(`Lead not found: ${leadId}`)
  }

  // Fetch dealer details
  const { data: dealers, error: dealerError } = await supabase
    .from('va_dealers')
    .select('id, name, whatsapp_number, email')
    .in('id', dealerIds)

  if (dealerError || !dealers) {
    throw new Error('Failed to fetch dealers')
  }

  // Build marketplace assignment record
  const marketplaceDealers = dealers.map((d) => ({
    dealer_id: d.id,
    dealer_name: d.name,
    assigned_at: new Date().toISOString(),
    responded: false,
    responded_at: null,
    is_first_responder: false,
  }))

  const marketplaceId = `mp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  // Update lead with marketplace data
  const { error: updateError } = await supabase
    .from('va_leads')
    .update({
      marketplace_dealers: marketplaceDealers,
      marketplace_id: marketplaceId,
      source_detail: `${lead.source_detail || ''} | marketplace: ${dealers.map((d) => d.name).join(', ')}`.trim(),
    })
    .eq('id', leadId)

  if (updateError) {
    console.error('[marketplace] Failed to update lead:', updateError.message)
    throw new Error(`Failed to distribute lead: ${updateError.message}`)
  }

  console.log(`[marketplace] Lead ${leadId} distributed to ${dealers.length} dealers`)

  return {
    lead_id: leadId,
    distributed_to: dealers.map((d) => ({ dealer_id: d.id, dealer_name: d.name })),
    total_dealers: dealers.length,
    marketplace_id: marketplaceId,
  }
}

/**
 * Record which dealer responded first to a marketplace lead.
 */
export async function trackFirstResponder(
  leadId: string,
  dealerId: string
): Promise<FirstResponderResult> {
  const supabase = createServiceClient()

  // Fetch current marketplace_dealers
  const { data: lead, error } = await supabase
    .from('va_leads')
    .select('marketplace_dealers')
    .eq('id', leadId)
    .single()

  if (error || !lead?.marketplace_dealers) {
    throw new Error(`Lead ${leadId} not found or not a marketplace lead`)
  }

  const dealers = lead.marketplace_dealers as Array<{
    dealer_id: string
    dealer_name: string
    assigned_at: string
    responded: boolean
    responded_at: string | null
    is_first_responder: boolean
  }>

  // Check if anyone already responded first
  const alreadyHasFirst = dealers.some((d) => d.is_first_responder)

  // Update the responding dealer
  const updated = dealers.map((d) => {
    if (d.dealer_id === dealerId) {
      return {
        ...d,
        responded: true,
        responded_at: new Date().toISOString(),
        is_first_responder: !alreadyHasFirst, // First responder only if nobody else was first
      }
    }
    return d
  })

  const { error: updateError } = await supabase
    .from('va_leads')
    .update({
      marketplace_dealers: updated,
      assigned_dealer_id: !alreadyHasFirst ? dealerId : undefined, // Assign to first responder
    })
    .eq('id', leadId)

  if (updateError) {
    throw new Error(`Failed to track response: ${updateError.message}`)
  }

  return {
    lead_id: leadId,
    dealer_id: dealerId,
    responded_at: new Date().toISOString(),
  }
}
