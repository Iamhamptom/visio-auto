import { NextRequest, NextResponse } from 'next/server'
import { buildDealershipPitch, buildCustomPitch } from '@/lib/agents/pitch-builder'
import type { Dealer, MarketData, Signal } from '@/lib/types'

async function getSupabase() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    return await createClient()
  } catch {
    return null
  }
}

async function fetchDealer(id: string): Promise<Partial<Dealer> | null> {
  const supabase = await getSupabase()
  if (!supabase) return MOCK_DEALERS[id] ?? null
  const { data } = await supabase.from('va_dealers').select('*').eq('id', id).single()
  if (data) return data
  return MOCK_DEALERS[id] ?? null
}

async function fetchMarketData(brands: string[]): Promise<Partial<MarketData>[]> {
  const supabase = await getSupabase()
  if (supabase) {
    let query = supabase
      .from('va_market_data')
      .select('*')
      .order('period', { ascending: false })
      .limit(30)
    if (brands.length > 0) {
      query = query.in('brand', brands)
    }
    const { data, error } = await query
    if (!error && data && data.length > 0) return data
  }
  return brands.length > 0
    ? MOCK_MARKET_DATA.filter((m) => brands.includes(m.brand ?? ''))
    : MOCK_MARKET_DATA
}

async function fetchSignalsForArea(area: string | null | undefined, city: string | null | undefined): Promise<Partial<Signal>[]> {
  const supabase = await getSupabase()
  if (supabase) {
    let query = supabase
      .from('va_signals')
      .select('*')
      .eq('is_processed', false)
      .gte('buying_probability', 50)
      .order('buying_probability', { ascending: false })
      .limit(10)
    if (area) query = query.ilike('area', `%${area}%`)
    const { data, error } = await query
    if (!error && data && data.length > 0) return data
  }
  return MOCK_SIGNALS.filter((s) => !area || s.area === area || s.city === city)
}

// Sample dealers — only used as fallback when Supabase is unreachable.
const MOCK_DEALERS: Record<string, Partial<Dealer>> = {
  sandton_motors: {
    id: 'sandton_motors',
    name: 'Sandton Motor Group',
    group_name: 'Sandton Motors (Pty) Ltd',
    brands: ['BMW', 'Mercedes-Benz', 'Audi'],
    area: 'Sandton',
    city: 'Johannesburg',
    province: 'Gauteng',
    tier: 'pro',
    dealer_principal: 'Johan van der Merwe',
  },
  cape_town_toyota: {
    id: 'cape_town_toyota',
    name: 'Cape Town Toyota',
    brands: ['Toyota'],
    area: 'Century City',
    city: 'Cape Town',
    province: 'Western Cape',
    tier: 'growth',
    dealer_principal: 'Pieter Botha',
  },
  durban_vw: {
    id: 'durban_vw',
    name: 'Durban Volkswagen',
    brands: ['Volkswagen'],
    area: 'Umhlanga',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    tier: 'growth',
    dealer_principal: 'Sipho Dlamini',
  },
  pretoria_multi: {
    id: 'pretoria_multi',
    name: 'Pretoria Auto Hub',
    brands: ['Toyota', 'Ford', 'Hyundai', 'Suzuki', 'Haval', 'GWM'],
    area: 'Menlyn',
    city: 'Pretoria',
    province: 'Gauteng',
    tier: 'enterprise',
    dealer_principal: 'Thandi Mokoena',
  },
}

const MOCK_MARKET_DATA: Partial<MarketData>[] = [
  { brand: 'Toyota', value: 12344, unit: 'units', period: 'March 2026', change_pct: 3.2, source: 'NAAMSA' },
  { brand: 'Volkswagen', value: 5621, unit: 'units', period: 'March 2026', change_pct: -1.8, source: 'NAAMSA' },
  { brand: 'BMW', value: 2156, unit: 'units', period: 'March 2026', change_pct: 5.1, source: 'NAAMSA' },
  { brand: 'Mercedes-Benz', value: 1987, unit: 'units', period: 'March 2026', change_pct: 2.4, source: 'NAAMSA' },
  { brand: 'Hyundai', value: 4532, unit: 'units', period: 'March 2026', change_pct: 8.7, source: 'NAAMSA' },
  { brand: 'Ford', value: 3876, unit: 'units', period: 'March 2026', change_pct: -0.5, source: 'NAAMSA' },
  { brand: 'Suzuki', value: 3145, unit: 'units', period: 'March 2026', change_pct: 12.3, source: 'NAAMSA' },
  { brand: 'Haval', value: 2890, unit: 'units', period: 'March 2026', change_pct: 15.6, source: 'NAAMSA' },
  { brand: 'Audi', value: 1245, unit: 'units', period: 'March 2026', change_pct: 1.9, source: 'NAAMSA' },
]

const MOCK_SIGNALS: Partial<Signal>[] = [
  { id: 's1', signal_type: 'promotion', title: 'Thabo Molefe promoted to Senior Manager at Discovery', signal_strength: 'strong', buying_probability: 0.85, area: 'Sandton', city: 'Johannesburg' },
  { id: 's2', signal_type: 'new_baby', title: 'Naledi Khumalo announced new family addition', signal_strength: 'medium', buying_probability: 0.62, area: 'Sandton', city: 'Johannesburg' },
  { id: 's3', signal_type: 'new_business', title: 'New company registered: Modise Consulting (Pty) Ltd', signal_strength: 'strong', buying_probability: 0.78, area: 'Sandton', city: 'Johannesburg' },
  { id: 's4', signal_type: 'relocation', title: 'Sipho Nkosi relocating from Cape Town to Sandton', signal_strength: 'strong', buying_probability: 0.72, area: 'Sandton', city: 'Johannesburg' },
  { id: 's5', signal_type: 'graduation', title: 'Zanele Mthembu graduated MBA from Wits Business School', signal_strength: 'medium', buying_probability: 0.55, area: 'Bryanston', city: 'Johannesburg' },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dealer_id, template, custom_prompt } = body as {
      dealer_id: string
      template?: 'standard' | 'luxury' | 'volume' | 'fleet'
      custom_prompt?: string
    }

    if (!dealer_id) {
      return NextResponse.json({ error: 'dealer_id is required' }, { status: 400 })
    }

    const dealer = await fetchDealer(dealer_id)
    if (!dealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
    }

    const dealerBrands = dealer.brands ?? []
    const relevantMarket = await fetchMarketData(dealerBrands)
    const relevantSignals = await fetchSignalsForArea(dealer.area, dealer.city)

    let slides
    if (custom_prompt) {
      slides = await buildCustomPitch(custom_prompt, dealer)
    } else {
      slides = await buildDealershipPitch(dealer, relevantMarket, relevantSignals)
    }

    const pitch = {
      id: `pitch_${Date.now()}`,
      dealer_id,
      dealer_name: dealer.name ?? 'Unknown',
      template: template ?? 'standard',
      slides,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ data: pitch })
  } catch (error) {
    console.error('Pitch generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate pitch', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
