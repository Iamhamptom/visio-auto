import type { Lead, InventoryItem, Language } from '@/lib/types'

export interface MatchResult {
  vehicle: InventoryItem
  matchScore: number
  matchReasons: string[]
}

interface LeadPreferences {
  budget_min?: number | null
  budget_max?: number | null
  preferred_brand?: string | null
  preferred_model?: string | null
  preferred_type?: string | null
  new_or_used?: 'new' | 'used' | 'any'
  area?: string | null
  city?: string | null
}

/**
 * Match vehicles from inventory to a lead's preferences.
 * Returns top 5 matches sorted by score (highest first).
 */
export function matchVehicles(
  leadPrefs: LeadPreferences,
  inventory: InventoryItem[]
): MatchResult[] {
  const available = inventory.filter((v) => v.is_available)

  const scored = available.map((vehicle) => {
    let matchScore = 0
    const matchReasons: string[] = []

    // Exact brand match (+30)
    if (
      leadPrefs.preferred_brand &&
      vehicle.brand.toLowerCase() === leadPrefs.preferred_brand.toLowerCase()
    ) {
      matchScore += 30
      matchReasons.push(`Brand match: ${vehicle.brand}`)
    }

    // Model match (+15 bonus on top of brand)
    if (
      leadPrefs.preferred_model &&
      vehicle.model.toLowerCase().includes(leadPrefs.preferred_model.toLowerCase())
    ) {
      matchScore += 15
      matchReasons.push(`Model match: ${vehicle.model}`)
    }

    // Vehicle type match (+25)
    if (
      leadPrefs.preferred_type &&
      leadPrefs.preferred_type !== 'any' &&
      vehicle.vehicle_type === leadPrefs.preferred_type
    ) {
      matchScore += 25
      matchReasons.push(`Type match: ${vehicle.vehicle_type}`)
    }

    // Within budget (+25)
    const budgetResult = scoreBudget(vehicle.price, leadPrefs.budget_min, leadPrefs.budget_max)
    matchScore += budgetResult.score
    if (budgetResult.reason) matchReasons.push(budgetResult.reason)

    // Condition match (+10)
    if (leadPrefs.new_or_used && leadPrefs.new_or_used !== 'any') {
      const isNew = vehicle.condition === 'new' || vehicle.condition === 'demo'
      const wantsNew = leadPrefs.new_or_used === 'new'
      if (isNew === wantsNew) {
        matchScore += 10
        matchReasons.push(`Condition match: ${vehicle.condition}`)
      }
    }

    // Low mileage bonus for used vehicles (+5)
    if (vehicle.condition === 'used' && vehicle.mileage < 50_000) {
      matchScore += 5
      matchReasons.push('Low mileage')
    }

    // Certified pre-owned bonus (+5)
    if (vehicle.condition === 'certified_preowned') {
      matchScore += 5
      matchReasons.push('Certified pre-owned')
    }

    // Days on lot penalty — longer sitting = dealer more motivated (+3)
    if (vehicle.days_on_lot > 60) {
      matchScore += 3
      matchReasons.push('Dealer motivated — long on lot')
    }

    return { vehicle, matchScore, matchReasons }
  })

  // Sort by score descending, return top 5
  scored.sort((a, b) => b.matchScore - a.matchScore)
  return scored.slice(0, 5)
}

function scoreBudget(
  price: number,
  budgetMin?: number | null,
  budgetMax?: number | null
): { score: number; reason: string | null } {
  if (!budgetMin && !budgetMax) return { score: 0, reason: null }

  const min = budgetMin || 0
  const max = budgetMax || Infinity

  if (price >= min && price <= max) {
    return { score: 25, reason: `Within budget: R${price.toLocaleString()}` }
  }

  // Slightly over budget — still worth showing (within 10%)
  if (budgetMax && price > max && price <= max * 1.1) {
    return { score: 15, reason: `Just above budget: R${price.toLocaleString()} (${Math.round(((price - max) / max) * 100)}% over)` }
  }

  // Under budget — good deal
  if (price < min) {
    return { score: 18, reason: `Under budget: R${price.toLocaleString()}` }
  }

  return { score: 0, reason: null }
}

/**
 * Format match results for WhatsApp message (short, emoji-friendly).
 */
export function formatMatchesForWhatsApp(matches: MatchResult[], language: Language): string {
  if (matches.length === 0) {
    return getNoMatchesMessage(language)
  }

  const header = getMatchesHeader(language)
  const lines = matches.map((m, i) => {
    const v = m.vehicle
    const price = `R${v.price.toLocaleString()}`
    const condition = v.condition === 'new' ? 'New' : v.condition === 'demo' ? 'Demo' : 'Used'
    const mileage = v.mileage > 0 ? ` | ${(v.mileage / 1000).toFixed(0)}k km` : ''
    const topReason = m.matchReasons[0] || ''

    return `${i + 1}. *${v.year} ${v.brand} ${v.model}${v.variant ? ` ${v.variant}` : ''}*\n   ${price} | ${condition}${mileage}\n   ${topReason}`
  })

  const footer = getMatchesFooter(language)

  return `${header}\n\n${lines.join('\n\n')}\n\n${footer}`
}

function getNoMatchesMessage(lang: Language): string {
  const msgs: Record<Language, string> = {
    en: "I couldn't find exact matches right now, but let me check with our dealers. What's most important to you — budget, brand, or vehicle type?",
    af: 'Ek kon nie nou presiese passings vind nie, maar laat ek by ons handelaars navra. Wat is vir jou die belangrikste — begroting, handelsmerk, of tipe voertuig?',
    zu: 'Angikwazanga ukuthola okufanayo okuchanekile manje, kodwa mangibheke kubadayisi bethu. Yini ebaluleke kakhulu kuwe — ibhajethi, uhlobo, noma umhlobo wemoto?',
    st: "Ha kea kgona ho fumana tse tshoanang hona joale, empa ke tla sheba le barekisi ba rona. Ho bohlokoa ho feta ke eng ho uena — bajete, brand, kapa mofuta wa koloi?",
    ts: 'A ndzi kotanga ku kuma leswi faneleke sweswi, kambe ndzi ta languta eka vathekisi va hina. Xana xa nkoka swinene eka wena i yini — bajete, brand, kumbe muxaka wa movha?',
    xh: 'Andizifumananga izinto ezifanayo ngoku, kodwa mandijonge kubathengisi bethu. Yintoni ebaluleke kakhulu kuwe — ibhajethi, uhlobo, okanye umhlobo wemoto?',
  }
  return msgs[lang] || msgs.en
}

function getMatchesHeader(lang: Language): string {
  const headers: Record<Language, string> = {
    en: "Here are your top matches from our network:",
    af: 'Hier is jou beste passings uit ons netwerk:',
    zu: 'Nanka amathuba akho aphezulu avela kunethiwekhi yethu:',
    st: "Mona ke tse tshoanang tsa hao tse ntle ho tsoa marangrang a rona:",
    ts: 'Laha ku na ni leswi faneleke swa wena swa le henhla ku suka eka netiweke ya hina:',
    xh: 'Nazi izinto ezifanayo zakho eziphezulu ukusuka kwinethiwekhi yethu:',
  }
  return headers[lang] || headers.en
}

function getMatchesFooter(lang: Language): string {
  const footers: Record<Language, string> = {
    en: 'Reply with a number to learn more or book a test drive!',
    af: 'Antwoord met \'n nommer om meer te leer of \'n proefrit te bespreek!',
    zu: 'Phendula ngenombolo ukuze ufunde kabanzi noma ubhukhe ukuhlola!',
    st: "Araba ka nomoro ho ithuta ho feta kapa ho buka test drive!",
    ts: 'Hlamula hi nomboro ku dyondza swo tala kumbe ku bhuka test drive!',
    xh: 'Phendula ngenombolo ukuze ufunde ngakumbi okanye ubhukishe uvavanyo!',
  }
  return footers[lang] || footers.en
}
