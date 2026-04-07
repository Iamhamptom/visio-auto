// Jess funnel — deterministic L1 rules + simple grader.
// Ported from /Users/hga/jess-agent/src/funnel/ (no L3/LLM).

export type FunnelMode = 'listing' | 'lead' | 'dealer'
export interface RuleFlag { rule: string; severity: 'block' | 'warn'; msg: string }
export interface RuleResult { passed: boolean; flags: RuleFlag[] }
export type Grade = 'A' | 'B' | 'C' | 'D'

const SA_PROVINCES = new Set([
  'GP', 'WC', 'KZN', 'EC', 'FS', 'NW', 'MP', 'LP', 'NC',
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State',
  'North West', 'Mpumalanga', 'Limpopo', 'Northern Cape',
])

const VALID_FUELS = new Set(['petrol', 'diesel', 'hybrid', 'electric', 'lpg', 'cng'])
const VALID_BRANDS = new Set([
  'toyota', 'volkswagen', 'ford', 'hyundai', 'kia', 'nissan', 'suzuki', 'renault',
  'mahindra', 'haval', 'chery', 'mg', 'gwm', 'isuzu', 'mercedes-benz', 'bmw', 'audi',
  'volvo', 'mazda', 'mitsubishi', 'honda', 'jeep', 'land rover', 'lexus', 'porsche',
  'mini', 'peugeot', 'citroen', 'fiat', 'opel', 'jaguar', 'subaru', 'tata', 'datsun',
])

const CURRENT_YEAR = 2026
const PRICE_FLOOR = 5_000
const PRICE_CEILING = 25_000_000

export function runLayer1Listing(input: Record<string, unknown>): RuleResult {
  const flags: RuleFlag[] = []
  const push = (rule: string, severity: 'block' | 'warn', msg: string) =>
    flags.push({ rule, severity, msg })

  if (!input.make) push('missing_make', 'block', 'Listing has no make')
  if (!input.model) push('missing_model', 'block', 'Listing has no model')
  if (!input.price_zar) push('missing_price', 'block', 'Listing has no price')

  if (input.make && !VALID_BRANDS.has(String(input.make).toLowerCase()))
    push('unknown_brand', 'warn', `Unknown brand: ${String(input.make)}`)

  if (typeof input.year === 'number') {
    if (input.year < 1950 || input.year > CURRENT_YEAR + 1)
      push('year_out_of_range', 'block', `Year ${input.year} implausible`)
  }

  if (typeof input.price_zar === 'number') {
    if (input.price_zar < PRICE_FLOOR) push('price_too_low', 'block', `Price R${input.price_zar} below floor`)
    if (input.price_zar > PRICE_CEILING) push('price_too_high', 'warn', `Price R${input.price_zar} above ceiling`)
  }

  if (typeof input.mileage_km === 'number' && typeof input.year === 'number') {
    const age = Math.max(1, CURRENT_YEAR - input.year)
    const expected = age * 15_000
    if (input.mileage_km < 1000 && age > 2) push('mileage_implausibly_low', 'warn', 'Sub-1k km on a non-new car')
    if (input.mileage_km > expected * 3) push('mileage_implausibly_high', 'warn', 'Mileage 3x expected for age')
  }

  if (input.fuel && !VALID_FUELS.has(String(input.fuel).toLowerCase()))
    push('invalid_fuel', 'warn', `Unknown fuel type: ${String(input.fuel)}`)

  if (input.province && !SA_PROVINCES.has(String(input.province)))
    push('invalid_province', 'warn', `Not a SA province: ${String(input.province)}`)

  if (input.vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(String(input.vin).toUpperCase()))
    push('invalid_vin', 'warn', 'VIN not 17-char ISO format')

  return { passed: !flags.some(f => f.severity === 'block'), flags }
}

export function runLayer1Lead(input: Record<string, unknown>): RuleResult {
  const flags: RuleFlag[] = []
  const push = (r: string, s: 'block' | 'warn', m: string) =>
    flags.push({ rule: r, severity: s, msg: m })

  const email = input.email ? String(input.email) : undefined
  const phone = input.phone ? String(input.phone) : undefined
  const fullName = input.full_name ? String(input.full_name) : undefined

  if (!email && !phone) push('no_contact', 'block', 'Lead has neither email nor phone')

  if (email) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      push('invalid_email', 'block', 'Email format invalid')
    if (/test|example|fake|asdf|noreply/i.test(email))
      push('junk_email', 'warn', 'Looks like test/junk email')
  }

  if (phone) {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 9 || digits.length > 13) push('invalid_phone', 'block', 'SA phone should be 9-13 digits')
    if (/^(0+|1+|9+)$/.test(digits)) push('garbage_phone', 'block', 'Phone is repeated digits')
  }

  if (fullName && /^.{1,2}$/.test(fullName.trim()))
    push('name_too_short', 'warn', 'Name suspiciously short')

  return { passed: !flags.some(f => f.severity === 'block'), flags }
}

export interface FunnelLeadResult {
  grade: Grade
  flags: RuleFlag[]
  passed: boolean
}

export function runFunnelLead(input: Record<string, unknown>): FunnelLeadResult {
  const l1 = runLayer1Lead(input)
  if (!l1.passed) {
    return { grade: 'D', flags: l1.flags, passed: false }
  }

  const warnCount = l1.flags.filter(f => f.severity === 'warn').length
  let grade: Grade
  if (warnCount === 0) grade = 'A'
  else if (warnCount <= 2) grade = 'B'
  else if (warnCount <= 4) grade = 'C'
  else grade = 'D'

  return { grade, flags: l1.flags, passed: true }
}
