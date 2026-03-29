/**
 * Signal Intelligence Agent
 *
 * The AI brain of Visio Auto's signal engine. Uses Gemini 2.5 Flash
 * to enrich raw signals, route them to dealers, classify urgency,
 * and generate intelligence briefs.
 */

import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import type { Signal, Dealer } from '@/lib/types'
import {
  ENRICHMENT_PROMPT,
  ROUTING_PROMPT,
  BRIEF_PROMPT,
  URGENCY_PROMPT,
} from './prompts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EnrichedSignal {
  person_name: string | null
  person_role: string | null
  company_name: string | null
  income_bracket: 'entry' | 'mid' | 'senior' | 'executive' | 'hnw'
  budget_min: number | null
  budget_max: number | null
  vehicle_type_likely: string | null
  vehicle_reason: string
  brand_suggestions: string[]
  buying_probability: number
  probability_reasoning: string
  urgency: 'URGENT' | 'SOON' | 'PLANNING' | 'PASSIVE'
  urgency_reasoning: string
  language_preference: string
  area: string | null
  city: string
  dealer_pitch: string
}

export interface DealerMatch {
  dealer_id: string
  match_score: number
  match_reasons: string[]
}

export interface UrgencyClassification {
  urgency: 'URGENT' | 'SOON' | 'PLANNING' | 'PASSIVE'
  confidence: number
  reasoning: string
  days_to_purchase: number
  recommended_action: string
}

// ---------------------------------------------------------------------------
// Model — Gemini 2.5 Flash for speed + cost efficiency
// ---------------------------------------------------------------------------

// Signal intelligence uses Claude Sonnet for reasoning
const MODEL = anthropic('claude-sonnet-4-6')

// ---------------------------------------------------------------------------
// Core Agent Functions
// ---------------------------------------------------------------------------

/**
 * Enrich a raw signal with AI-extracted intelligence.
 *
 * Takes the raw signal from collectors and uses Gemini to determine
 * buyer profile, budget, vehicle needs, urgency, and a dealer pitch.
 */
export async function enrichSignal(
  rawSignal: Pick<
    Signal,
    | 'signal_type'
    | 'title'
    | 'description'
    | 'person_name'
    | 'person_email'
    | 'person_phone'
    | 'company_name'
    | 'area'
    | 'city'
    | 'province'
  >
): Promise<EnrichedSignal> {
  try {
    const signalContext = [
      `Signal type: ${rawSignal.signal_type}`,
      `Title: ${rawSignal.title}`,
      rawSignal.description ? `Description: ${rawSignal.description}` : null,
      rawSignal.person_name ? `Person: ${rawSignal.person_name}` : null,
      rawSignal.person_email ? `Email: ${rawSignal.person_email}` : null,
      rawSignal.company_name ? `Company: ${rawSignal.company_name}` : null,
      rawSignal.area ? `Area: ${rawSignal.area}` : null,
      rawSignal.city ? `City: ${rawSignal.city}` : null,
      rawSignal.province ? `Province: ${rawSignal.province}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    const { text } = await generateText({
      model: MODEL,
      system: ENRICHMENT_PROMPT,
      prompt: `Analyze this buying signal and extract all intelligence:\n\n${signalContext}\n\nReturn JSON only.`,
    })

    return parseEnrichmentResponse(text, rawSignal)
  } catch (err) {
    console.error('[SignalAgent] enrichSignal failed:', err)
    // Return safe defaults — never lose the raw signal
    return {
      person_name: rawSignal.person_name ?? null,
      person_role: null,
      company_name: rawSignal.company_name ?? null,
      income_bracket: 'mid',
      budget_min: null,
      budget_max: null,
      vehicle_type_likely: null,
      vehicle_reason: 'AI enrichment failed — manual review needed',
      brand_suggestions: [],
      buying_probability: 30,
      probability_reasoning: 'Could not enrich — default score applied',
      urgency: 'PASSIVE',
      urgency_reasoning: 'AI unavailable — defaulting to passive',
      language_preference: 'en',
      area: rawSignal.area ?? null,
      city: rawSignal.city ?? 'Johannesburg',
      dealer_pitch: 'New signal detected — please review manually.',
    }
  }
}

/**
 * Route a signal to the best matching dealers using AI reasoning.
 *
 * Considers brand match, geographic proximity, dealer tier,
 * and current capacity to find the optimal 3 dealers.
 */
export async function routeSignalToDealers(
  signal: {
    title: string
    signal_type: string
    person_name?: string | null
    company_name?: string | null
    area?: string | null
    city?: string | null
    buying_probability?: number
    estimated_budget_min?: number | null
    estimated_budget_max?: number | null
    vehicle_type_likely?: string | null
  },
  dealers: Dealer[]
): Promise<DealerMatch[]> {
  if (dealers.length === 0) return []

  try {
    const signalSummary = [
      `Signal: ${signal.title} (${signal.signal_type})`,
      signal.person_name ? `Person: ${signal.person_name}` : null,
      signal.company_name ? `Company: ${signal.company_name}` : null,
      signal.area ? `Area: ${signal.area}` : null,
      signal.city ? `City: ${signal.city}` : null,
      signal.buying_probability != null
        ? `Buying probability: ${signal.buying_probability}%`
        : null,
      signal.estimated_budget_min != null
        ? `Budget: R${signal.estimated_budget_min.toLocaleString()} - R${(signal.estimated_budget_max ?? signal.estimated_budget_min * 1.3).toLocaleString()}`
        : null,
      signal.vehicle_type_likely
        ? `Likely vehicle type: ${signal.vehicle_type_likely}`
        : null,
    ]
      .filter(Boolean)
      .join('\n')

    const dealerList = dealers
      .map(
        (d) =>
          `ID: ${d.id} | ${d.name} | Brands: ${d.brands.join(', ')} | Area: ${d.area}, ${d.city} | Tier: ${d.tier} | Quota: ${d.leads_quota}`
      )
      .join('\n')

    const { text } = await generateText({
      model: MODEL,
      system: ROUTING_PROMPT,
      prompt: `Match this signal to the best dealers:\n\nSIGNAL:\n${signalSummary}\n\nAVAILABLE DEALERS:\n${dealerList}\n\nReturn JSON array only.`,
    })

    return parseRoutingResponse(text, dealers)
  } catch (err) {
    console.error('[SignalAgent] routeSignalToDealers failed:', err)
    // Fallback: return first 3 dealers with basic scoring
    return dealers.slice(0, 3).map((d, i) => ({
      dealer_id: d.id,
      match_score: 50 - i * 10,
      match_reasons: ['AI routing unavailable — fallback assignment'],
    }))
  }
}

/**
 * Generate a daily intelligence brief for a specific dealer.
 *
 * Produces a Bloomberg-style morning briefing personalized to the
 * dealer's brands, location, and tier.
 */
export async function generateSignalBrief(
  signals: Signal[],
  dealer: Dealer
): Promise<string> {
  if (signals.length === 0) {
    return `No new buying signals detected for ${dealer.name} today. Pipeline is quiet — good time to follow up on existing leads.`
  }

  try {
    const dealerContext = [
      `Dealer: ${dealer.name}`,
      `Brands: ${dealer.brands.join(', ')}`,
      `Area: ${dealer.area}, ${dealer.city}`,
      `Tier: ${dealer.tier}`,
      `Lead quota: ${dealer.leads_quota}/month`,
    ].join('\n')

    const signalList = signals
      .map(
        (s, i) =>
          `${i + 1}. [${s.signal_type}] ${s.title}` +
          (s.person_name ? ` — ${s.person_name}` : '') +
          (s.company_name ? ` at ${s.company_name}` : '') +
          (s.area ? ` (${s.area})` : '') +
          ` | Probability: ${s.buying_probability}%` +
          (s.estimated_budget_min
            ? ` | Budget: R${s.estimated_budget_min.toLocaleString()}-R${(s.estimated_budget_max ?? s.estimated_budget_min).toLocaleString()}`
            : '') +
          (s.vehicle_type_likely ? ` | Wants: ${s.vehicle_type_likely}` : '')
      )
      .join('\n')

    const { text } = await generateText({
      model: MODEL,
      system: BRIEF_PROMPT,
      prompt: `Generate a morning intelligence brief for this dealer.\n\nDEALER:\n${dealerContext}\n\nSIGNALS:\n${signalList}\n\nWrite the brief now.`,
    })

    return text.trim()
  } catch (err) {
    console.error('[SignalAgent] generateSignalBrief failed:', err)
    // Return a basic non-AI brief
    const urgent = signals.filter((s) => s.buying_probability >= 80).length
    const warm = signals.filter(
      (s) => s.buying_probability >= 50 && s.buying_probability < 80
    ).length
    return [
      `Signal Brief for ${dealer.name} — ${new Date().toLocaleDateString('en-ZA')}`,
      `${signals.length} signals detected. ${urgent} urgent, ${warm} warm.`,
      '',
      'AI briefing unavailable — please review signals manually in the dashboard.',
      '',
      signals
        .slice(0, 5)
        .map((s) => `- ${s.title} (${s.buying_probability}%)`)
        .join('\n'),
    ].join('\n')
  }
}

/**
 * Classify signal urgency using AI reasoning.
 *
 * Determines how quickly the buyer is likely to purchase
 * and what action the dealer should take.
 */
export async function classifySignalUrgency(
  signal: Pick<
    Signal,
    | 'signal_type'
    | 'title'
    | 'description'
    | 'person_name'
    | 'company_name'
    | 'area'
    | 'city'
    | 'buying_probability'
  >
): Promise<UrgencyClassification> {
  try {
    const context = [
      `Type: ${signal.signal_type}`,
      `Title: ${signal.title}`,
      signal.description ? `Description: ${signal.description}` : null,
      signal.person_name ? `Person: ${signal.person_name}` : null,
      signal.company_name ? `Company: ${signal.company_name}` : null,
      signal.area ? `Area: ${signal.area}` : null,
      signal.city ? `City: ${signal.city}` : null,
      signal.buying_probability != null
        ? `Current probability score: ${signal.buying_probability}%`
        : null,
    ]
      .filter(Boolean)
      .join('\n')

    const { text } = await generateText({
      model: MODEL,
      system: URGENCY_PROMPT,
      prompt: `Classify the urgency of this buying signal:\n\n${context}\n\nReturn JSON only.`,
    })

    return parseUrgencyResponse(text)
  } catch (err) {
    console.error('[SignalAgent] classifySignalUrgency failed:', err)
    return {
      urgency: 'PASSIVE',
      confidence: 0,
      reasoning: 'AI classification unavailable — defaulting to passive',
      days_to_purchase: 180,
      recommended_action: 'Add to pipeline for manual review',
    }
  }
}

// ---------------------------------------------------------------------------
// Response Parsers — defensive, never throw
// ---------------------------------------------------------------------------

function cleanJsonResponse(text: string): string {
  return text.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
}

function parseEnrichmentResponse(
  text: string,
  rawSignal: { person_name?: string | null; company_name?: string | null; area?: string | null; city?: string | null }
): EnrichedSignal {
  try {
    const data = JSON.parse(cleanJsonResponse(text))
    return {
      person_name: data.person_name ?? rawSignal.person_name ?? null,
      person_role: data.person_role ?? null,
      company_name: data.company_name ?? rawSignal.company_name ?? null,
      income_bracket: validateIncomeBracket(data.income_bracket),
      budget_min: parseNum(data.budget_min),
      budget_max: parseNum(data.budget_max),
      vehicle_type_likely: data.vehicle_type_likely ?? null,
      vehicle_reason: data.vehicle_reason ?? 'Not determined',
      brand_suggestions: Array.isArray(data.brand_suggestions)
        ? data.brand_suggestions.slice(0, 3)
        : [],
      buying_probability: clamp(Number(data.buying_probability) || 30, 0, 100),
      probability_reasoning: data.probability_reasoning ?? 'No reasoning provided',
      urgency: validateUrgency(data.urgency),
      urgency_reasoning: data.urgency_reasoning ?? 'No reasoning provided',
      language_preference: data.language_preference ?? 'en',
      area: data.area ?? rawSignal.area ?? null,
      city: data.city ?? rawSignal.city ?? 'Johannesburg',
      dealer_pitch: data.dealer_pitch ?? 'New signal detected — review and contact.',
    }
  } catch {
    return {
      person_name: rawSignal.person_name ?? null,
      person_role: null,
      company_name: rawSignal.company_name ?? null,
      income_bracket: 'mid',
      budget_min: null,
      budget_max: null,
      vehicle_type_likely: null,
      vehicle_reason: 'Failed to parse AI response',
      brand_suggestions: [],
      buying_probability: 30,
      probability_reasoning: 'AI response parsing failed',
      urgency: 'PASSIVE',
      urgency_reasoning: 'Parse failure — defaulting to passive',
      language_preference: 'en',
      area: rawSignal.area ?? null,
      city: rawSignal.city ?? 'Johannesburg',
      dealer_pitch: 'New signal — please review manually.',
    }
  }
}

function parseRoutingResponse(text: string, dealers: Dealer[]): DealerMatch[] {
  try {
    const data = JSON.parse(cleanJsonResponse(text))
    if (!Array.isArray(data)) return []

    const validDealerIds = new Set(dealers.map((d) => d.id))

    return data
      .filter(
        (item: Record<string, unknown>) =>
          item.dealer_id && validDealerIds.has(item.dealer_id as string)
      )
      .slice(0, 3)
      .map((item: Record<string, unknown>) => ({
        dealer_id: item.dealer_id as string,
        match_score: clamp(Number(item.match_score) || 50, 0, 100),
        match_reasons: Array.isArray(item.match_reasons)
          ? (item.match_reasons as string[])
          : ['Matched by AI'],
      }))
  } catch {
    return []
  }
}

function parseUrgencyResponse(text: string): UrgencyClassification {
  try {
    const data = JSON.parse(cleanJsonResponse(text))
    return {
      urgency: validateUrgency(data.urgency),
      confidence: clamp(Number(data.confidence) || 0.5, 0, 1),
      reasoning: data.reasoning ?? 'No reasoning provided',
      days_to_purchase: Math.max(1, Number(data.days_to_purchase) || 90),
      recommended_action: data.recommended_action ?? 'Review signal manually',
    }
  } catch {
    return {
      urgency: 'PASSIVE',
      confidence: 0,
      reasoning: 'Failed to parse urgency response',
      days_to_purchase: 180,
      recommended_action: 'Manual review required',
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

function parseNum(val: unknown): number | null {
  if (val === null || val === undefined) return null
  const n = Number(val)
  return isNaN(n) ? null : n
}

function validateUrgency(
  val: unknown
): 'URGENT' | 'SOON' | 'PLANNING' | 'PASSIVE' {
  const valid = ['URGENT', 'SOON', 'PLANNING', 'PASSIVE']
  return typeof val === 'string' && valid.includes(val.toUpperCase())
    ? (val.toUpperCase() as 'URGENT' | 'SOON' | 'PLANNING' | 'PASSIVE')
    : 'PASSIVE'
}

function validateIncomeBracket(
  val: unknown
): 'entry' | 'mid' | 'senior' | 'executive' | 'hnw' {
  const valid = ['entry', 'mid', 'senior', 'executive', 'hnw']
  return typeof val === 'string' && valid.includes(val)
    ? (val as 'entry' | 'mid' | 'senior' | 'executive' | 'hnw')
    : 'mid'
}
