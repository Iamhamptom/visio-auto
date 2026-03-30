// =============================================================================
// Visio Auto — Order System Types
// The monetization engine: packs + subscriptions
// =============================================================================

export interface LeadOrder {
  id: string
  dealer_id: string
  dealer_name: string
  package: string
  quantity: number
  price_per_lead: number // in cents
  total_amount: number // in cents
  status: 'pending_payment' | 'paid' | 'in_progress' | 'delivered' | 'partial' | 'cancelled'
  leads_delivered: number
  payment_id?: string
  yoco_checkout_id?: string
  created_at: string
  paid_at?: string
  delivered_at?: string
  notes?: string
}

export type LeadPackage = keyof typeof LEAD_PRICING

export const LEAD_PRICING = {
  // Per-lead pricing (one-time packs)
  pack_10:  { quantity: 10,  price_per_lead: 15000, total: 150000,   label: '10 Leads — R1,500' },
  pack_25:  { quantity: 25,  price_per_lead: 14000, total: 350000,   label: '25 Leads — R3,500' },
  pack_50:  { quantity: 50,  price_per_lead: 12000, total: 600000,   label: '50 Leads — R6,000' },
  pack_100: { quantity: 100, price_per_lead: 10000, total: 1000000,  label: '100 Leads — R10,000' },
  pack_250: { quantity: 250, price_per_lead: 8000,  total: 2000000,  label: '250 Leads — R20,000' },
  pack_500: { quantity: 500, price_per_lead: 6000,  total: 3000000,  label: '500 Leads — R30,000' },
  // Monthly subscriptions (existing tiers)
  starter:  { quantity: 25,  price_per_lead: 20000, total: 500000,   label: 'Starter Monthly — R5,000' },
  growth:   { quantity: 100, price_per_lead: 15000, total: 1500000,  label: 'Growth Monthly — R15,000' },
  pro:      { quantity: 500, price_per_lead: 10000, total: 5000000,  label: 'Pro Monthly — R50,000' },
} as const

/**
 * Map a requested quantity to the best matching package.
 * Picks the smallest pack that covers the requested amount.
 */
export function bestPackageForQuantity(qty: number): LeadPackage {
  const packs: { key: LeadPackage; q: number }[] = [
    { key: 'pack_10', q: 10 },
    { key: 'pack_25', q: 25 },
    { key: 'pack_50', q: 50 },
    { key: 'pack_100', q: 100 },
    { key: 'pack_250', q: 250 },
    { key: 'pack_500', q: 500 },
  ]
  for (const p of packs) {
    if (qty <= p.q) return p.key
  }
  return 'pack_500'
}

/**
 * Format cents to South African Rand display string.
 */
export function formatRand(cents: number): string {
  const rands = cents / 100
  return `R${rands.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`
}
