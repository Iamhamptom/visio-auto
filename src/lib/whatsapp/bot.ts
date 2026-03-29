import type { Language, VehicleType } from '@/lib/types'
import { getTemplate } from './templates'

// ---------------------------------------------------------------------------
// WhatsApp conversation state machine
// ---------------------------------------------------------------------------

export type BotState =
  | 'GREETING'
  | 'ASK_TYPE'
  | 'ASK_CONDITION'
  | 'ASK_BUDGET'
  | 'ASK_BRAND'
  | 'ASK_TIMELINE'
  | 'ASK_TRADE_IN'
  | 'QUALIFY'
  | 'MATCH'
  | 'BOOK'

export interface ConversationContext {
  state: BotState
  language: Language
  name?: string
  phone?: string
  vehicleType?: VehicleType
  newOrUsed?: 'new' | 'used' | 'any'
  budgetMin?: number
  budgetMax?: number
  brand?: string
  timeline?: string
  hasTradeIn?: boolean
  tradeInBrand?: string
  tradeInModel?: string
  tradeInYear?: number
}

interface BotResponse {
  message: string
  nextState: BotState
  context: ConversationContext
}

// ---------------------------------------------------------------------------
// Language detection — lightweight keyword matching
// ---------------------------------------------------------------------------

const ZULU_WORDS = ['sawubona', 'yebo', 'cha', 'ngiyafuna', 'imoto', 'ngicela', 'siyabonga', 'ngiyanithanda', 'malini', 'kuphi']
const AFRIKAANS_WORDS = ['hallo', 'dankie', 'motor', 'soek', 'asseblief', 'hoeveel', 'nee', 'baie', 'goed', 'mooi']
const SOTHO_WORDS = ['dumela', 'kea', 'leboha', 'koloi', 'batla', 'joang', 'hantle', 'thusa']
const TSONGA_WORDS = ['xewani', 'inkomu', 'movha', 'ndzi', 'hikuva', 'kahle']
const XHOSA_WORDS = ['molo', 'enkosi', 'imoto', 'ndifuna', 'nceda', 'malini', 'ewe', 'hayi']

export function detectLanguage(text: string): Language | null {
  const lower = text.toLowerCase()
  const words = lower.split(/\s+/)

  const scores: Record<Language, number> = { en: 0, af: 0, zu: 0, st: 0, ts: 0, xh: 0 }

  for (const w of words) {
    if (ZULU_WORDS.includes(w)) scores.zu++
    if (AFRIKAANS_WORDS.includes(w)) scores.af++
    if (SOTHO_WORDS.includes(w)) scores.st++
    if (TSONGA_WORDS.includes(w)) scores.ts++
    if (XHOSA_WORDS.includes(w)) scores.xh++
  }

  const best = (Object.entries(scores) as [Language, number][])
    .filter(([lang]) => lang !== 'en')
    .sort((a, b) => b[1] - a[1])[0]

  return best && best[1] > 0 ? best[0] : null
}

// ---------------------------------------------------------------------------
// Budget parsing — handle SA colloquial formats
// ---------------------------------------------------------------------------

const BUDGET_RANGES: Record<string, { min: number; max: number }> = {
  '1': { min: 0, max: 200_000 },
  '2': { min: 200_000, max: 350_000 },
  '3': { min: 350_000, max: 500_000 },
  '4': { min: 500_000, max: 750_000 },
  '5': { min: 750_000, max: 1_000_000 },
  '6': { min: 1_000_000, max: 5_000_000 },
}

export function parseBudget(input: string): { min: number; max: number } | null {
  const trimmed = input.trim()

  // Menu option number
  if (BUDGET_RANGES[trimmed]) return BUDGET_RANGES[trimmed]

  // "500k", "500K", "R500k"
  const kMatch = trimmed.match(/r?\s*(\d+)\s*k/i)
  if (kMatch) {
    const val = parseInt(kMatch[1], 10) * 1_000
    return { min: Math.max(0, val - 50_000), max: val + 50_000 }
  }

  // "half a million", "half mil"
  if (/half\s*(a\s*)?(mil|million)/i.test(trimmed)) {
    return { min: 400_000, max: 600_000 }
  }

  // "1 million", "1m", "1 mil"
  const mMatch = trimmed.match(/r?\s*(\d+(?:\.\d+)?)\s*(m|mil|million)/i)
  if (mMatch) {
    const val = parseFloat(mMatch[1]) * 1_000_000
    return { min: Math.max(0, val - 100_000), max: val + 100_000 }
  }

  // Raw number: "350000", "R350,000", "R 350 000"
  const rawMatch = trimmed.replace(/[r,\s]/gi, '').match(/^(\d{4,})$/)
  if (rawMatch) {
    const val = parseInt(rawMatch[1], 10)
    if (val >= 10_000 && val <= 10_000_000) {
      return { min: Math.max(0, val - 50_000), max: val + 50_000 }
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// Vehicle type parsing
// ---------------------------------------------------------------------------

const TYPE_MAP: Record<string, VehicleType> = {
  '1': 'suv', suv: 'suv',
  '2': 'sedan', sedan: 'sedan',
  '3': 'bakkie', bakkie: 'bakkie', truck: 'bakkie', pickup: 'bakkie',
  '4': 'hatch', hatch: 'hatch', hatchback: 'hatch',
  '5': 'coupe', coupe: 'coupe',
  '6': 'van', van: 'van',
}

function parseVehicleType(input: string): VehicleType | null {
  const lower = input.trim().toLowerCase()
  return TYPE_MAP[lower] ?? null
}

// ---------------------------------------------------------------------------
// Brand detection
// ---------------------------------------------------------------------------

const KNOWN_BRANDS = [
  'toyota', 'bmw', 'volkswagen', 'vw', 'mercedes', 'mercedes-benz', 'merc',
  'audi', 'ford', 'hyundai', 'kia', 'suzuki', 'haval', 'chery', 'gwm',
  'nissan', 'mazda', 'honda', 'subaru', 'volvo', 'lexus', 'porsche',
  'land rover', 'range rover', 'jeep', 'mitsubishi', 'renault', 'peugeot',
  'isuzu', 'mahindra', 'opel', 'chevrolet', 'fiat', 'alfa romeo', 'baic',
  'jac', 'mg', 'omoda', 'jetour',
]

const BRAND_ALIASES: Record<string, string> = {
  vw: 'Volkswagen',
  merc: 'Mercedes-Benz',
  'mercedes-benz': 'Mercedes-Benz',
  mercedes: 'Mercedes-Benz',
  'range rover': 'Land Rover',
  'land rover': 'Land Rover',
  'alfa romeo': 'Alfa Romeo',
}

function parseBrand(input: string): string | null {
  const lower = input.trim().toLowerCase()

  // Direct match or alias
  if (lower === 'no' || lower === 'no preference' || lower === 'none' || lower === 'any') {
    return null
  }

  for (const brand of KNOWN_BRANDS) {
    if (lower.includes(brand)) {
      return BRAND_ALIASES[brand] ?? brand.charAt(0).toUpperCase() + brand.slice(1)
    }
  }

  // Could be a brand we don't recognize — return capitalized if it's a single word
  if (/^[a-z]+$/i.test(lower) && lower.length >= 2 && lower.length <= 20) {
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  }

  return null
}

// ---------------------------------------------------------------------------
// State machine — getNextMessage
// ---------------------------------------------------------------------------

export function getNextMessage(
  ctx: ConversationContext,
  userInput: string
): BotResponse {
  // Detect language shifts
  const detected = detectLanguage(userInput)
  if (detected) ctx.language = detected

  const lang = ctx.language

  switch (ctx.state) {
    case 'GREETING': {
      return {
        message: getTemplate('ASK_VEHICLE_TYPE', lang),
        nextState: 'ASK_TYPE',
        context: { ...ctx, state: 'ASK_TYPE' },
      }
    }

    case 'ASK_TYPE': {
      const type = parseVehicleType(userInput)
      if (!type) {
        return {
          message: getTemplate('ASK_VEHICLE_TYPE', lang),
          nextState: 'ASK_TYPE',
          context: ctx,
        }
      }
      const newCtx = { ...ctx, vehicleType: type, state: 'ASK_CONDITION' as BotState }
      const msg = lang === 'af'
        ? 'Nuut of gebruik?  Antwoord NUUT of GEBRUIK.'
        : lang === 'zu'
        ? 'Entsha noma esetshenzisiwe? Phendula ENTSHA noma ESETSHENZISIWE.'
        : 'New or Used? Reply NEW, USED, or BOTH.'
      return { message: msg, nextState: 'ASK_CONDITION', context: newCtx }
    }

    case 'ASK_CONDITION': {
      const lower = userInput.trim().toLowerCase()
      let condition: 'new' | 'used' | 'any' = 'any'
      if (['new', 'nuut', 'entsha', '1'].includes(lower)) condition = 'new'
      else if (['used', 'gebruik', 'esetshenzisiwe', '2', 'secondhand', 'second hand'].includes(lower)) condition = 'used'
      else if (['both', 'any', 'albei', 'zombili', '3'].includes(lower)) condition = 'any'

      const newCtx = { ...ctx, newOrUsed: condition, state: 'ASK_BUDGET' as BotState }
      return {
        message: getTemplate('ASK_BUDGET', lang),
        nextState: 'ASK_BUDGET',
        context: newCtx,
      }
    }

    case 'ASK_BUDGET': {
      const budget = parseBudget(userInput)
      if (!budget) {
        return {
          message: getTemplate('ASK_BUDGET', lang),
          nextState: 'ASK_BUDGET',
          context: ctx,
        }
      }
      const newCtx = { ...ctx, budgetMin: budget.min, budgetMax: budget.max, state: 'ASK_BRAND' as BotState }
      const msg = lang === 'af'
        ? 'Enige handelsmerkvoorkeur? Bv. Toyota, BMW — of antwoord NEE.'
        : lang === 'zu'
        ? 'Ukhethela iphathi ethile? Isib. Toyota, BMW — noma phendula CHA.'
        : 'Any brand preference? E.g. Toyota, BMW — or reply NO.'
      return { message: msg, nextState: 'ASK_BRAND', context: newCtx }
    }

    case 'ASK_BRAND': {
      const brand = parseBrand(userInput)
      const newCtx = { ...ctx, brand: brand ?? undefined, state: 'ASK_TIMELINE' as BotState }
      const msg = lang === 'af'
        ? 'Wanneer wil jy koop?\n\n1. Hierdie week\n2. Hierdie maand\n3. Volgende 3 maande\n4. Net kyk'
        : lang === 'zu'
        ? 'Ufuna ukuthenga nini?\n\n1. Leli viki\n2. Le nyanga\n3. Izinyanga ezi-3 ezizayo\n4. Ngibheka nje'
        : 'When are you looking to buy?\n\n1. This week\n2. This month\n3. Next 3 months\n4. Just browsing'
      return { message: msg, nextState: 'ASK_TIMELINE', context: newCtx }
    }

    case 'ASK_TIMELINE': {
      const lower = userInput.trim().toLowerCase()
      let timeline = 'just_browsing'
      if (['1', 'this week', 'hierdie week', 'leli viki', 'now', 'asap'].includes(lower)) timeline = 'this_week'
      else if (['2', 'this month', 'hierdie maand', 'le nyanga'].includes(lower)) timeline = 'this_month'
      else if (['3', 'next 3 months', '3 months', 'volgende 3 maande'].includes(lower)) timeline = 'three_months'
      else if (['4', 'just browsing', 'browsing', 'net kyk', 'ngibheka nje'].includes(lower)) timeline = 'just_browsing'

      const newCtx = { ...ctx, timeline, state: 'ASK_TRADE_IN' as BotState }
      const msg = lang === 'af'
        ? 'Het jy \'n inruil-voertuig? Antwoord JA of NEE.'
        : lang === 'zu'
        ? 'Unayo imoto yokushintsha? Phendula YEBO noma CHA.'
        : 'Do you have a trade-in vehicle? Reply YES or NO.'
      return { message: msg, nextState: 'ASK_TRADE_IN', context: newCtx }
    }

    case 'ASK_TRADE_IN': {
      const lower = userInput.trim().toLowerCase()
      const hasTradeIn = ['yes', 'ja', 'yebo', 'ewe', 'y', '1'].includes(lower)
      const newCtx = { ...ctx, hasTradeIn, state: 'QUALIFY' as BotState }

      if (hasTradeIn) {
        const msg = lang === 'af'
          ? 'Wat is jou inruil? Bv. "Toyota Hilux 2019"'
          : lang === 'zu'
          ? 'Iyiphi imoto yakho yokushintsha? Isib. "Toyota Hilux 2019"'
          : 'What\'s your trade-in? E.g. "Toyota Hilux 2019"'
        return { message: msg, nextState: 'QUALIFY', context: newCtx }
      }

      const typeLabel = ctx.vehicleType ?? 'vehicle'
      const budgetLabel = ctx.budgetMax
        ? `R${Math.round(ctx.budgetMax / 1000)}K`
        : 'your budget'

      return {
        message: lang === 'af'
          ? `Dankie! Ek soek nou die beste ${typeLabel} aanbiedings binne ${budgetLabel} vir jou. Gee my \'n oomblik... \u{1F50D}`
          : lang === 'zu'
          ? `Siyabonga! Ngisafuna izimoto ze-${typeLabel} ezingcono ku-${budgetLabel}. Ngicela ulinde kancane... \u{1F50D}`
          : `Thanks! I\'m now searching for the best ${typeLabel} deals within ${budgetLabel} for you. Give me a moment... \u{1F50D}`,
        nextState: 'MATCH',
        context: { ...newCtx, state: 'MATCH' },
      }
    }

    case 'QUALIFY': {
      // Parse trade-in details from free text like "Toyota Hilux 2019"
      const parts = userInput.trim().split(/\s+/)
      let tradeInBrand: string | undefined
      let tradeInModel: string | undefined
      let tradeInYear: number | undefined

      for (const part of parts) {
        const yearMatch = part.match(/^(19|20)\d{2}$/)
        if (yearMatch) {
          tradeInYear = parseInt(part, 10)
        } else if (!tradeInBrand) {
          tradeInBrand = parseBrand(part) ?? part
        } else if (!tradeInModel) {
          tradeInModel = part.charAt(0).toUpperCase() + part.slice(1)
        }
      }

      const typeLabel = ctx.vehicleType ?? 'vehicle'
      const budgetLabel = ctx.budgetMax
        ? `R${Math.round(ctx.budgetMax / 1000)}K`
        : 'your budget'

      const newCtx: ConversationContext = {
        ...ctx,
        tradeInBrand,
        tradeInModel,
        tradeInYear,
        state: 'MATCH',
      }

      return {
        message: lang === 'af'
          ? `Dankie! Ek soek nou die beste ${typeLabel} aanbiedings binne ${budgetLabel} vir jou. Gee my \'n oomblik... \u{1F50D}`
          : lang === 'zu'
          ? `Siyabonga! Ngisafuna izimoto ze-${typeLabel} ezingcono ku-${budgetLabel}. Ngicela ulinde kancane... \u{1F50D}`
          : `Thanks! I\'m now searching for the best ${typeLabel} deals within ${budgetLabel} for you. Give me a moment... \u{1F50D}`,
        nextState: 'MATCH',
        context: newCtx,
      }
    }

    case 'MATCH': {
      // Placeholder — this state is handled by the matching engine externally
      return {
        message: lang === 'af'
          ? 'Wil jy \'n toetsrit bespreek by een van hierdie handelaars? Antwoord met die nommer.'
          : lang === 'zu'
          ? 'Uyafuna ukuhlola enye yalezi zimoto? Phendula ngenombolo.'
          : 'Would you like to book a test drive at one of these dealers? Reply with the number.',
        nextState: 'BOOK',
        context: { ...ctx, state: 'BOOK' },
      }
    }

    case 'BOOK': {
      return {
        message: lang === 'af'
          ? 'Ek sal die handelaar laat weet en bevestig jou toetsrit via WhatsApp. Baie dankie! \u{1F64F}'
          : lang === 'zu'
          ? 'Ngizomtshela umthengisi bese ngikuqinisekisela i-test drive nge-WhatsApp. Siyabonga kakhulu! \u{1F64F}'
          : 'I\'ll notify the dealer and confirm your test drive via WhatsApp. Thank you! \u{1F64F}',
        nextState: 'BOOK',
        context: ctx,
      }
    }

    default: {
      return {
        message: getTemplate('WELCOME', lang, { name: ctx.name ?? 'there', count: 0 }),
        nextState: 'GREETING',
        context: { ...ctx, state: 'GREETING' },
      }
    }
  }
}
