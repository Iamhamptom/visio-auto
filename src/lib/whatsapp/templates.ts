import type { Language } from '@/lib/types'

// ---------------------------------------------------------------------------
// WhatsApp message templates — multi-language (SA official languages)
// ---------------------------------------------------------------------------

type TemplateVars = Record<string, string | number>

interface Template {
  en: string
  af: string
  zu: string
  st: string
  ts: string
  xh: string
}

const TEMPLATES: Record<string, Template> = {
  WELCOME: {
    en: 'Hi {name}! \u{1F697} I\'m your AI car advisor from Visio Auto. I\'ve found {count} vehicles matching your preferences. Let me show you the best deals!',
    af: 'Hi {name}! \u{1F697} Ek is jou KI-motoradviseur van Visio Auto. Ek het {count} voertuie gevind wat by jou voorkeure pas. Kom ek wys jou die beste aanbiedings!',
    zu: 'Sawubona {name}! \u{1F697} Ngingu-AI car advisor wakho ovela ku-Visio Auto. Ngithole izimoto ezingu-{count} ezifanele lokho okufunayo. Ake ngikukhombise!',
    st: 'Dumela {name}! \u{1F697} Ke moeletsi wa hao wa koloi ea AI ho tswa ho Visio Auto. Ke fumane likoloi tse {count} tse tsamaelanang le seo o se ratang. Ha ke o bontshe!',
    ts: 'Xewani {name}! \u{1F697} Ndzi AI car advisor wa wena ku suka eka Visio Auto. Ndzi kumile timovha ta {count} leti faneleke. A ndzi ku kombisa!',
    xh: 'Molo {name}! \u{1F697} Ndingumluleki wakho we-AI weemoto ovela ku-Visio Auto. Ndifumene iimoto eziyi-{count} ezifanele. Makhe ndikubonise!',
  },

  VEHICLE_MATCH: {
    en: 'Based on your {budget} budget for a {type}, here are your top matches:\n\n1. {vehicle1}\n2. {vehicle2}\n3. {vehicle3}\n\nWhich one interests you? Reply with the number.',
    af: 'Gebaseer op jou {budget} begroting vir \'n {type}, hier is jou top passings:\n\n1. {vehicle1}\n2. {vehicle2}\n3. {vehicle3}\n\nWatter een stel jou belang? Antwoord met die nommer.',
    zu: 'Ngokusebenzisa ibhajethi yakho ye-{budget} ye-{type}, nanti okuhamba phambili:\n\n1. {vehicle1}\n2. {vehicle2}\n3. {vehicle3}\n\nYiphi oyithandayo? Phendula ngenombolo.',
    st: 'Ho ipapisitsoe le bajete ea hau ea {budget} bakeng sa {type}, mona ke tse tsamaelanang:\n\n1. {vehicle1}\n2. {vehicle2}\n3. {vehicle3}\n\nKe efe e o khahlang? Araba ka nomoro.',
    ts: 'Hi ya tirhisa bajete ya wena ya {budget} ya {type}, tona ti laha:\n\n1. {vehicle1}\n2. {vehicle2}\n3. {vehicle3}\n\nYi hihi yi ku tsakisaka? Hlamula hi nomboro.',
    xh: 'Ngokusekwe kwibhajethi yakho ye-{budget} ye-{type}, nantsi eyona ihambelana nawe:\n\n1. {vehicle1}\n2. {vehicle2}\n3. {vehicle3}\n\nYeyiphi ekuchukumisayo? Phendula ngenani.',
  },

  TEST_DRIVE_CONFIRM: {
    en: 'Your test drive is confirmed! \u{1F389}\n\n\u{1F4CD} {dealer_name}\n\u{1F4C5} {date} at {time}\n\u{1F4CD} {address}\n\nThe dealer is expecting you. Reply CHANGE to reschedule.',
    af: 'Jou toetsrit is bevestig! \u{1F389}\n\n\u{1F4CD} {dealer_name}\n\u{1F4C5} {date} om {time}\n\u{1F4CD} {address}\n\nDie handelaar verwag jou. Antwoord VERANDER om te herskeduleer.',
    zu: 'Ukuhlola kwakho kuqinisekisiwe! \u{1F389}\n\n\u{1F4CD} {dealer_name}\n\u{1F4C5} {date} ngo-{time}\n\u{1F4CD} {address}\n\nUmthengisi uyakulindela. Phendula SHINTSHA ukuze uhlelwe kabusha.',
    st: 'Test drive ea hau e netefalisitsoe! \u{1F389}\n\n\u{1F4CD} {dealer_name}\n\u{1F4C5} {date} ka {time}\n\u{1F4CD} {address}\n\nMorekisi o o lebeletse. Araba FETOLA ho hlophisa bocha.',
    ts: 'Test drive ya wena yi tiyisisiwe! \u{1F389}\n\n\u{1F4CD} {dealer_name}\n\u{1F4C5} {date} hi {time}\n\u{1F4CD} {address}\n\nMuxavisi wa ku langutela. Hlamula CINCA ku endla nkarhi munwana.',
    xh: 'Uvavanyo lwakho luqinisekisiwe! \u{1F389}\n\n\u{1F4CD} {dealer_name}\n\u{1F4C5} {date} ngo-{time}\n\u{1F4CD} {address}\n\nUmthengisi uyakulindela. Phendula TSHINTSHA ukutshintsha ixesha.',
  },

  FOLLOW_UP: {
    en: 'Hi {name}, how was your visit to {dealer}? If you\'re still looking, I have {count} new matches for you.',
    af: 'Hi {name}, hoe was jou besoek aan {dealer}? As jy nog soek, het ek {count} nuwe passings vir jou.',
    zu: 'Sawubona {name}, bekunjani ukuvakashela kwakho ku-{dealer}? Uma usafuna, ngine-{count} matches ezintsha kuwe.',
    st: 'Dumela {name}, ketelo ea hau ho {dealer} e ile joang? Haeba o sa batla, ke na le tse {count} tse ncha bakeng sa hau.',
    ts: 'Xewani {name}, ku endrisa ka wena eka {dealer} ku yile njhani? Loko u ha lava, ndzi na {count} ta ntsena ta wena.',
    xh: 'Molo {name}, utyelelo lwakho ku-{dealer} beluqhube njani? Ukuba usafuna, ndine-{count} matches ezintsha kuwe.',
  },

  ASK_VEHICLE_TYPE: {
    en: 'What type of vehicle are you looking for?\n\n1. SUV\n2. Sedan\n3. Bakkie\n4. Hatch\n5. Coupe\n6. Van\n\nReply with the number.',
    af: 'Watter tipe voertuig soek jy?\n\n1. SUV\n2. Sedan\n3. Bakkie\n4. Hatch\n5. Coupe\n6. Van\n\nAntwoord met die nommer.',
    zu: 'Ufuna hlobo luni lwemoto?\n\n1. SUV\n2. Sedan\n3. Bakkie\n4. Hatch\n5. Coupe\n6. Van\n\nPhendula ngenombolo.',
    st: 'U batla mofuta ofe oa koloi?\n\n1. SUV\n2. Sedan\n3. Bakkie\n4. Hatch\n5. Coupe\n6. Van\n\nAraba ka nomoro.',
    ts: 'U lava muxaka muni wa movha?\n\n1. SUV\n2. Sedan\n3. Bakkie\n4. Hatch\n5. Coupe\n6. Van\n\nHlamula hi nomboro.',
    xh: 'Ufuna oluphi uhlobo lwemoto?\n\n1. SUV\n2. Sedan\n3. Bakkie\n4. Hatch\n5. Coupe\n6. Van\n\nPhendula ngenani.',
  },

  ASK_BUDGET: {
    en: 'What\'s your budget range?\n\n1. Under R200K\n2. R200K - R350K\n3. R350K - R500K\n4. R500K - R750K\n5. R750K - R1M\n6. R1M+\n\nReply with the number or type an amount.',
    af: 'Wat is jou begrotingsreeks?\n\n1. Onder R200K\n2. R200K - R350K\n3. R350K - R500K\n4. R500K - R750K\n5. R750K - R1M\n6. R1M+\n\nAntwoord met die nommer of tik \'n bedrag.',
    zu: 'Ibhajethi yakho ingakanani?\n\n1. Ngaphansi kwe-R200K\n2. R200K - R350K\n3. R350K - R500K\n4. R500K - R750K\n5. R750K - R1M\n6. R1M+\n\nPhendula ngenombolo noma uthayiphe inani.',
    st: 'Bajete ea hau ke bokae?\n\n1. Ka tlase ho R200K\n2. R200K - R350K\n3. R350K - R500K\n4. R500K - R750K\n5. R750K - R1M\n6. R1M+\n\nAraba ka nomoro kapa thaepa chelete.',
    ts: 'Bajete ya wena yi kota ku fikela kwihi?\n\n1. Ehansi ka R200K\n2. R200K - R350K\n3. R350K - R500K\n4. R500K - R750K\n5. R750K - R1M\n6. R1M+\n\nHlamula hi nomboro kumbe thayipha mali.',
    xh: 'Ibhajethi yakho yimalini?\n\n1. Phantsi kwe-R200K\n2. R200K - R350K\n3. R350K - R500K\n4. R500K - R750K\n5. R750K - R1M\n6. R1M+\n\nPhendula ngenani okanye chwetheza imali.',
  },
}

/**
 * Resolve a template with variables.
 * Falls back to English if requested language is missing.
 */
export function getTemplate(
  name: string,
  language: Language,
  variables: TemplateVars = {}
): string {
  const template = TEMPLATES[name]
  if (!template) return `[Template "${name}" not found]`

  let text = template[language] ?? template.en
  for (const [key, val] of Object.entries(variables)) {
    text = text.replaceAll(`{${key}}`, String(val))
  }
  return text
}

/** List all available template names */
export function listTemplates(): string[] {
  return Object.keys(TEMPLATES)
}
