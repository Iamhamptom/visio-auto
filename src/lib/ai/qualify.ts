import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { detectLanguage, parseBudgetFromText } from '@/lib/ai/multilingual'
import type { Lead, Language, ScoreTier, VehicleType } from '@/lib/types'

export interface QualificationResult {
  score: number
  tier: ScoreTier
  budget_extracted: { min: number | null; max: number | null }
  brand_preference: string | null
  model_preference: string | null
  vehicle_type: VehicleType | null
  timeline: 'this_week' | 'this_month' | 'three_months' | 'just_browsing' | null
  trade_in: {
    has_trade_in: boolean
    brand: string | null
    model: string | null
    year: number | null
  }
  finance_status: 'pre_approved' | 'needs_finance' | 'cash' | 'unknown'
  new_or_used: 'new' | 'used' | 'any'
  recommended_vehicles: string[]
  next_question: string
  language_detected: Language
  confidence: number
}

const SYSTEM_PROMPT = `You are a South African car sales AI assistant for Visio Auto. Qualify car buyers by extracting: budget, preferred brand/model, new vs used, timeline, trade-in details, financing needs. Be friendly, professional, and conversational. Respond in the buyer's language (English, Afrikaans, Zulu, Sotho, Tswana, Xhosa). Keep responses short for WhatsApp.

Your job is to analyze the conversation and extract qualification data. Return a JSON object with these fields:
- score: 0-100 qualification score (higher = more ready to buy)
- tier: "hot" (70+), "warm" (40-69), or "cold" (0-39)
- budget_min: number in ZAR or null (parse "500k" as 500000, "half a million" as 500000, "1.5m" as 1500000)
- budget_max: number in ZAR or null
- brand_preference: brand name or null
- model_preference: model name or null
- vehicle_type: "sedan", "suv", "bakkie", "hatch", "coupe", "van", or null (parse "bakkie" = bakkie, "double cab" = bakkie, "family car" = suv, "small car" = hatch)
- timeline: "this_week", "this_month", "three_months", "just_browsing", or null
- trade_in_has: boolean
- trade_in_brand: string or null
- trade_in_model: string or null
- trade_in_year: number or null
- finance_status: "pre_approved", "needs_finance", "cash", "unknown"
- new_or_used: "new", "used", or "any"
- recommended_vehicles: array of up to 3 vehicle suggestions based on their needs (e.g., ["Toyota Hilux 2.8 GD-6", "Ford Ranger 2.0 Bi-Turbo"])
- next_question: the next question to ask to further qualify this lead (in their language)
- language: "en", "af", "zu", "st", "ts", or "xh"
- confidence: 0-1 how confident you are in the extraction

South African context:
- Prices in ZAR (Rands). R500,000 is mid-range. R1M+ is premium.
- Popular brands: Toyota, VW, Ford, BMW, Mercedes, Hyundai, Kia, Nissan, Suzuki, Haval
- "Bakkie" = pickup truck. Very popular in SA.
- "Double cab" = double cab bakkie
- Finance is common — most buyers need it
- Trade-ins are very common
- Parse Afrikaans numbers: "vyf honderd duisend" = 500000
- Parse Zulu numbers: "izinkulungwane ezingamakhulu amahlanu" = 500000
- "ngifuna imoto" = "I want a car" (Zulu)
- "ek soek 'n motor" = "I'm looking for a car" (Afrikaans)

IMPORTANT: Only return valid JSON. No markdown, no explanation.`

export async function qualifyLead(
  conversation: string[],
  leadData: Partial<Lead> = {}
): Promise<QualificationResult> {
  const detectedLang = detectLanguage(conversation.join(' '))

  // Build conversation context
  const conversationText = conversation
    .map((msg, i) => (i % 2 === 0 ? `Customer: ${msg}` : `Advisor: ${msg}`))
    .join('\n')

  const existingDataContext = buildExistingDataContext(leadData)

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'), // Haiku for speed on high-volume qualification
    system: SYSTEM_PROMPT,
    prompt: `Analyze this conversation and extract qualification data.

${existingDataContext}

Conversation:
${conversationText}

Return JSON only.`,
  })

  const parsed = parseQualificationResponse(text, detectedLang)

  // Merge with any budget parsed directly from conversation
  if (!parsed.budget_extracted.min && !parsed.budget_extracted.max) {
    const directBudget = extractBudgetFromConversation(conversation)
    if (directBudget) {
      parsed.budget_extracted = directBudget
    }
  }

  return parsed
}

function buildExistingDataContext(leadData: Partial<Lead>): string {
  const parts: string[] = []
  if (leadData.name) parts.push(`Name: ${leadData.name}`)
  if (leadData.area) parts.push(`Area: ${leadData.area}`)
  if (leadData.city) parts.push(`City: ${leadData.city}`)
  if (leadData.budget_min) parts.push(`Known budget min: R${leadData.budget_min.toLocaleString()}`)
  if (leadData.budget_max) parts.push(`Known budget max: R${leadData.budget_max.toLocaleString()}`)
  if (leadData.preferred_brand) parts.push(`Preferred brand: ${leadData.preferred_brand}`)
  if (leadData.preferred_model) parts.push(`Preferred model: ${leadData.preferred_model}`)

  return parts.length > 0
    ? `Existing lead data:\n${parts.join('\n')}\n`
    : ''
}

function parseQualificationResponse(text: string, fallbackLang: Language): QualificationResult {
  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    const data = JSON.parse(cleaned)

    const score = Math.min(100, Math.max(0, Number(data.score) || 0))

    let tier: ScoreTier = 'cold'
    if (score >= 70) tier = 'hot'
    else if (score >= 40) tier = 'warm'

    return {
      score,
      tier,
      budget_extracted: {
        min: parseNumber(data.budget_min),
        max: parseNumber(data.budget_max),
      },
      brand_preference: data.brand_preference || null,
      model_preference: data.model_preference || null,
      vehicle_type: validateVehicleType(data.vehicle_type),
      timeline: validateTimeline(data.timeline),
      trade_in: {
        has_trade_in: Boolean(data.trade_in_has),
        brand: data.trade_in_brand || null,
        model: data.trade_in_model || null,
        year: parseNumber(data.trade_in_year),
      },
      finance_status: validateFinanceStatus(data.finance_status),
      new_or_used: validateNewOrUsed(data.new_or_used),
      recommended_vehicles: Array.isArray(data.recommended_vehicles)
        ? data.recommended_vehicles.slice(0, 3)
        : [],
      next_question: data.next_question || getDefaultNextQuestion(fallbackLang),
      language_detected: validateLanguage(data.language) || fallbackLang,
      confidence: Math.min(1, Math.max(0, Number(data.confidence) || 0.5)),
    }
  } catch {
    // If AI response is not valid JSON, return a safe default
    return {
      score: 0,
      tier: 'cold',
      budget_extracted: { min: null, max: null },
      brand_preference: null,
      model_preference: null,
      vehicle_type: null,
      timeline: null,
      trade_in: { has_trade_in: false, brand: null, model: null, year: null },
      finance_status: 'unknown',
      new_or_used: 'any',
      recommended_vehicles: [],
      next_question: getDefaultNextQuestion(fallbackLang),
      language_detected: fallbackLang,
      confidence: 0,
    }
  }
}

function extractBudgetFromConversation(messages: string[]): { min: number | null; max: number | null } | null {
  const allText = messages.join(' ')
  const budget = parseBudgetFromText(allText)
  if (budget) {
    return { min: budget, max: Math.round(budget * 1.15) }
  }
  return null
}

function parseNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null
  const n = Number(val)
  return isNaN(n) ? null : n
}

function validateVehicleType(val: unknown): VehicleType | null {
  const valid: VehicleType[] = ['sedan', 'suv', 'bakkie', 'hatch', 'coupe', 'van', 'any']
  return typeof val === 'string' && valid.includes(val as VehicleType) ? (val as VehicleType) : null
}

function validateTimeline(val: unknown): QualificationResult['timeline'] {
  const valid = ['this_week', 'this_month', 'three_months', 'just_browsing']
  return typeof val === 'string' && valid.includes(val) ? (val as QualificationResult['timeline']) : null
}

function validateFinanceStatus(val: unknown): QualificationResult['finance_status'] {
  const valid = ['pre_approved', 'needs_finance', 'cash', 'unknown']
  return typeof val === 'string' && valid.includes(val)
    ? (val as QualificationResult['finance_status'])
    : 'unknown'
}

function validateNewOrUsed(val: unknown): 'new' | 'used' | 'any' {
  const valid = ['new', 'used', 'any']
  return typeof val === 'string' && valid.includes(val) ? (val as 'new' | 'used' | 'any') : 'any'
}

function validateLanguage(val: unknown): Language | null {
  const valid: Language[] = ['en', 'af', 'zu', 'st', 'ts', 'xh']
  return typeof val === 'string' && valid.includes(val as Language) ? (val as Language) : null
}

function getDefaultNextQuestion(lang: Language): string {
  const questions: Record<Language, string> = {
    en: "What kind of car are you looking for, and what's your budget?",
    af: 'Watter tipe motor soek jy, en wat is jou begroting?',
    zu: 'Ufuna hlobo luni lwemoto, futhi ibhajethi yakho ingakanani?',
    st: "O batla mofuta ofe wa koloi, 'me bajete ya hao ke bokae?",
    ts: 'U lava muxaka muni wa movha, naswona bajete ya wena i kota ku fika kwihi?',
    xh: 'Ufuna uhlobo luni lwemoto, kwaye ibhajethi yakho yimalini?',
  }
  return questions[lang] || questions.en
}
