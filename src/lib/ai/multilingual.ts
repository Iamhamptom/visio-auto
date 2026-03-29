import type { Language } from '@/lib/types'

/**
 * Detect the language of incoming text based on keyword indicators.
 * Falls back to English if no strong signal is found.
 */
export function detectLanguage(text: string): Language {
  const lower = text.toLowerCase()

  // Zulu indicators
  const zuluWords = ['ngicela', 'yebo', 'ngifuna', 'imoto', 'malini', 'sawubona', 'cha', 'ngiyabonga', 'ngizothenga', 'izimoto', 'isithuthuthu', 'umshayeli', 'ingculungwane', 'amakhulu']
  const zuluScore = zuluWords.filter((w) => lower.includes(w)).length

  // Afrikaans indicators
  const afrikaansWords = ['asseblief', 'dankie', 'ek soek', 'motor', 'hoeveel', 'hallo', 'goeie', 'baie', 'begroting', 'bakkie', 'voertuig', 'nuwe', 'gebruik', 'handelaar', 'ry', 'duisend', 'honderd']
  const afrikaansScore = afrikaansWords.filter((w) => lower.includes(w)).length

  // Sotho indicators
  const sothoWords = ['ke batla', 'koloi', 'bokae', 'dumela', 'kea leboha', 'theko', 'e ncha', 'e sebelisitsoeng', 'chelete']
  const sothoScore = sothoWords.filter((w) => lower.includes(w)).length

  // Tswana indicators
  const tswanaWords = ['ke batla', 'koloi', 'dumelang', 'ke leboga', 'bokae', 'theko', 'e ntsha', 'e dirisitsweng']
  const tswanaScore = tswanaWords.filter((w) => lower.includes(w)).length

  // Xhosa indicators
  const xhosaWords = ['molo', 'enkosi', 'ndifuna', 'imoto', 'malini', 'ndiyacela', 'ewe', 'hayi', 'intsha', 'isetyenzisiweyo']
  const xhosaScore = xhosaWords.filter((w) => lower.includes(w)).length

  // Tsonga indicators
  const tsongaWords = ['ndzi lava', 'movha', 'avuxeni', 'inkomu', 'mali', 'mpsha', 'endzhaku']
  const tsongaScore = tsongaWords.filter((w) => lower.includes(w)).length

  const scores: [Language, number][] = [
    ['zu', zuluScore],
    ['af', afrikaansScore],
    ['st', sothoScore],
    ['ts', tsongaScore],
    ['xh', xhosaScore],
  ]

  // Tswana uses 'st' in our system — resolve Sotho vs Tswana
  // (they share keywords; prefer whichever scores higher from unique markers)
  if (tswanaScore > sothoScore && lower.includes('dumelang')) {
    // Tswana-specific: use 'st' as our closest code
    // In practice both are grouped under Sotho family
  }

  const best = scores.reduce((a, b) => (b[1] > a[1] ? b : a))
  if (best[1] >= 2) return best[0]

  return 'en'
}

/**
 * Common car-buying greetings by language.
 */
export const GREETINGS: Record<Language, string> = {
  en: "Hi! I'm your AI car advisor at Visio Auto. I'll help you find the perfect vehicle. What are you looking for?",
  af: "Hallo! Ek is jou KI-motoradviseur by Visio Auto. Ek sal jou help om die perfekte voertuig te vind. Waarna soek jy?",
  zu: "Sawubona! Ngingumeluleki wakho wezimoto we-AI ku-Visio Auto. Ngizokusiza uthole imoto efanele. Ufunani?",
  st: "Dumela! Ke moeletsi wa hao wa koloi ya AI ho Visio Auto. Ke tla o thusa ho fumana koloi e nepahetseng. O batla eng?",
  ts: "Avuxeni! Ndzi mutsundzuxi wa wena wa movha wa AI eka Visio Auto. Ndzi ta ku pfuna ku kuma movha lowu faneleke. U lava yini?",
  xh: "Molo! Ndingumcebisi wakho wemoto we-AI ku-Visio Auto. Ndiza kukunceda ufumane imoto efanelekileyo. Ukhangela ntoni?",
}

/**
 * Common car-buying phrases by language for template responses.
 */
export const PHRASES = {
  budget_question: {
    en: "What's your budget range?",
    af: 'Wat is jou begrotingsomvang?',
    zu: 'Ibhajethi yakho ingakanani?',
    st: 'Bajete ya hao ke bokae?',
    ts: 'Bajete ya wena i kota ku fika kwihi?',
    xh: 'Ibhajethi yakho yimalini?',
  } satisfies Record<Language, string>,
  brand_question: {
    en: 'Any particular brand you prefer?',
    af: "Is daar 'n spesifieke handelsmerk wat jy verkies?",
    zu: 'Ingabe kukhona uhlobo oluthile olukhetha?',
    st: 'Na ho na le brand e itseng eo o e ratang?',
    ts: 'Xana ku na brand yo karhi u yi rhandza?',
    xh: 'Ingaba ikhona ibrand ethile oyithandayo?',
  } satisfies Record<Language, string>,
  timeline_question: {
    en: 'When are you looking to buy?',
    af: 'Wanneer wil jy koop?',
    zu: 'Ufuna ukuthenga nini?',
    st: 'O batla ho reka neng?',
    ts: 'U lava ku xava rini?',
    xh: 'Ufuna ukuthenga nini?',
  } satisfies Record<Language, string>,
  trade_in_question: {
    en: 'Do you have a vehicle to trade in?',
    af: "Het jy 'n voertuig om in te ruil?",
    zu: 'Ingabe unemoto ozoyishintsha?',
    st: 'Na o na le koloi eo o ka e fetolang?',
    ts: 'Xana u na movha lowu u nga wu cinca?',
    xh: 'Ingaba unemoto yokutshintshisa?',
  } satisfies Record<Language, string>,
  test_drive_offer: {
    en: "Would you like to book a test drive?",
    af: "Wil jy 'n proefrit bespreek?",
    zu: 'Ungathanda ukubhukha ukuhlola?',
    st: "Na u ka rata ho buka test drive?",
    ts: 'Xana u ta tsakela ku bhuka test drive?',
    xh: 'Ungathanda ukubhukisha uvavanyo?',
  } satisfies Record<Language, string>,
  thanks: {
    en: 'Thank you! Let me find the best options for you.',
    af: 'Dankie! Laat ek die beste opsies vir jou vind.',
    zu: 'Ngiyabonga! Mangikutholele izinketho ezinhle kakhulu.',
    st: "Kea leboha! Ke tla o fumanela likhetho tse ntle ka ho fetisisa.",
    ts: 'Inkomu! Ndzi ta ku kumela swikhetho swa kahle swinene.',
    xh: 'Enkosi! Mandikufumanele iinketho ezilungileyo.',
  } satisfies Record<Language, string>,
}

/**
 * Parse a budget string from natural language text.
 * Handles SA colloquialisms, abbreviations, and multilingual numbers.
 */
export function parseBudgetFromText(text: string): number | null {
  const lower = text.toLowerCase().replace(/\s+/g, ' ')

  // Direct Rand amounts: R500,000 / R500 000 / R500000
  const randMatch = lower.match(/r\s?(\d{1,3}[\s,]?\d{3}[\s,]?\d{3}|\d{1,3}[\s,]?\d{3}|\d+)/)
  if (randMatch) {
    const cleaned = randMatch[1].replace(/[\s,]/g, '')
    const val = parseInt(cleaned, 10)
    if (val > 0) return val
  }

  // Shorthand: "500k", "1.5m", "1m"
  const shortMatch = lower.match(/(\d+(?:\.\d+)?)\s*([km])\b/)
  if (shortMatch) {
    const num = parseFloat(shortMatch[1])
    const mult = shortMatch[2] === 'm' ? 1_000_000 : 1_000
    return Math.round(num * mult)
  }

  // English phrases
  if (lower.includes('half a million') || lower.includes('half a mil')) return 500_000
  if (lower.includes('quarter million') || lower.includes('quarter mil')) return 250_000
  const millionMatch = lower.match(/(\d+(?:\.\d+)?)\s*million/)
  if (millionMatch) return Math.round(parseFloat(millionMatch[1]) * 1_000_000)

  // Afrikaans
  if (lower.includes('vyf honderd duisend') || lower.includes('vyfhonderdduisend')) return 500_000
  if (lower.includes('drie honderd duisend') || lower.includes('driehonderdduisend')) return 300_000
  if (lower.includes('vier honderd duisend') || lower.includes('vierhonderdduisend')) return 400_000
  if (lower.includes('ses honderd duisend') || lower.includes('seshonderdduisend')) return 600_000
  if (lower.includes('twee honderd duisend') || lower.includes('tweehonderdduisend')) return 200_000
  if (lower.includes('een miljoen') || lower.includes('miljoen')) {
    const milMatch = lower.match(/(\w+)\s*miljoen/)
    if (milMatch) {
      const afNum = parseAfrikaansNumber(milMatch[1])
      if (afNum) return afNum * 1_000_000
    }
    return 1_000_000
  }
  const afDuisendMatch = lower.match(/(\w+)\s*duisend/)
  if (afDuisendMatch) {
    const afNum = parseAfrikaansNumber(afDuisendMatch[1])
    if (afNum) return afNum * 1_000
  }

  // Zulu — simplified common patterns
  if (lower.includes('izinkulungwane ezingamakhulu amahlanu') || lower.includes('inkulungwane ezinhlanu')) return 500_000
  if (lower.includes('isigidi')) return 1_000_000

  return null
}

function parseAfrikaansNumber(word: string): number | null {
  const nums: Record<string, number> = {
    een: 1, twee: 2, drie: 3, vier: 4, vyf: 5,
    ses: 6, sewe: 7, agt: 8, nege: 9, tien: 10,
    twintig: 20, dertig: 30, veertig: 40, vyftig: 50,
    sestig: 60, sewentig: 70, tagtig: 80, negentig: 90,
    honderd: 100, tweehonderd: 200, driehonderd: 300,
    vierhonderd: 400, vyfhonderd: 500, seshonderd: 600,
  }
  return nums[word.toLowerCase()] || null
}

/**
 * Get the language display name.
 */
export function getLanguageName(lang: Language): string {
  const names: Record<Language, string> = {
    en: 'English',
    af: 'Afrikaans',
    zu: 'isiZulu',
    st: 'Sesotho',
    ts: 'Xitsonga',
    xh: 'isiXhosa',
  }
  return names[lang] || 'English'
}
