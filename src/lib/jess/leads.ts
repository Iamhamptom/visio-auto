// Jess leads helpers — upsert + qualify against the jess_leads table.

import type { SupabaseClient } from '@supabase/supabase-js'

export interface NormalizedJessLead {
  type: 'buyer' | 'dealer' | 'dealer_principal' | 'partner'
  full_name?: string | null
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  company?: string | null
  role?: string | null
  province?: string | null
  source: string
  raw_payload: Record<string, unknown>
}

export interface UpsertResult {
  inserted: number
}

export async function upsertJessLead(
  lead: NormalizedJessLead,
  supabase: SupabaseClient
): Promise<UpsertResult> {
  if (lead.email) {
    const normalized = { ...lead, email: lead.email.toLowerCase().trim() }
    const { data, error } = await supabase
      .from('jess_leads')
      .upsert([normalized], { onConflict: 'email', ignoreDuplicates: true })
      .select('id')
    if (error) {
      console.warn('[jess/leads] upsert failed:', error.message)
      return { inserted: 0 }
    }
    return { inserted: data?.length ?? 0 }
  }

  const { data, error } = await supabase
    .from('jess_leads')
    .insert([lead])
    .select('id')
  if (error) {
    console.warn('[jess/leads] insert failed:', error.message)
    return { inserted: 0 }
  }
  return { inserted: data?.length ?? 0 }
}

export interface QualifyResult {
  score: number
  grade: 'A' | 'B' | 'C' | 'D'
  intent_tier: 'hot' | 'warm' | 'cold' | 'dead'
  reasons: string[]
}

export async function qualifyJessLead(
  leadId: string,
  supabase: SupabaseClient
): Promise<QualifyResult | null> {
  const { data: lead, error } = await supabase
    .from('jess_leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (error || !lead) {
    console.warn('[jess/leads] qualify: lead not found', leadId, error?.message)
    return null
  }

  let score = 0
  const reasons: string[] = []

  if (lead.email) { score += 15; reasons.push('+15 email') }
  if (lead.phone) { score += 10; reasons.push('+10 phone') }
  if (lead.whatsapp) { score += 5; reasons.push('+5 whatsapp') }
  if (lead.full_name) { score += 10; reasons.push('+10 named') }
  if (lead.company) { score += 5; reasons.push('+5 company') }
  if (lead.role) { score += 5; reasons.push('+5 role') }

  const enrichment = (lead.enrichment ?? {}) as Record<string, unknown>
  if (enrichment.linkedin_url) { score += 10; reasons.push('+10 linkedin') }
  if (enrichment.company_website) { score += 5; reasons.push('+5 website') }

  const freeTextParts: string[] = []
  const payload = (lead.raw_payload ?? {}) as Record<string, unknown>
  for (const v of Object.values(payload)) {
    if (typeof v === 'string') freeTextParts.push(v)
  }
  const freeText = freeTextParts.join(' ').toLowerCase()

  if (/\b(budget|finance|when|test drive|today|this week)\b/.test(freeText)) {
    score += 30; reasons.push('+30 hot intent')
  } else if (/\b(looking|interested|considering)\b/.test(freeText)) {
    score += 20; reasons.push('+20 warm intent')
  } else {
    score += 5; reasons.push('+5 default')
  }

  score = Math.min(100, score)

  let grade: QualifyResult['grade']
  if (score >= 80) grade = 'A'
  else if (score >= 60) grade = 'B'
  else if (score >= 40) grade = 'C'
  else grade = 'D'

  let intent_tier: QualifyResult['intent_tier']
  if (score >= 80) intent_tier = 'hot'
  else if (score >= 60) intent_tier = 'warm'
  else if (score >= 40) intent_tier = 'cold'
  else intent_tier = 'dead'

  const { error: updateErr } = await supabase
    .from('jess_leads')
    .update({ score, grade, intent_tier })
    .eq('id', leadId)

  if (updateErr) {
    console.warn('[jess/leads] qualify update failed:', updateErr.message)
  }

  return { score, grade, intent_tier, reasons }
}
