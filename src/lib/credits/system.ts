/**
 * Credits System — Visio Auto
 *
 * Everything costs credits. Agent teases free value, then locks deeper insights.
 * Users buy credit packs via Yoco. Credits never expire.
 *
 * The hook: show 20% free → "Want more? 5 credits to unlock the full report."
 */

import { TIER_AMOUNTS } from '@/lib/payments/yoco'

// ---------------------------------------------------------------------------
// Credit costs per action
// ---------------------------------------------------------------------------

export const CREDIT_COSTS: Record<string, { cost: number; label: string; freePreview: boolean }> = {
  // Free actions (always available)
  view_dashboard: { cost: 0, label: 'View dashboard', freePreview: false },
  view_market_terminal: { cost: 0, label: 'View market terminal', freePreview: false },
  view_signals_summary: { cost: 0, label: 'View signal summary (top 3)', freePreview: true },
  chat_basic: { cost: 0, label: 'Chat with AI agent', freePreview: false },

  // Teaser actions (show partial free, full costs credits)
  view_lead_detail: { cost: 1, label: 'View full lead details', freePreview: true },
  view_signal_detail: { cost: 1, label: 'View full signal with contact info', freePreview: true },
  export_leads_csv: { cost: 5, label: 'Export leads to CSV', freePreview: false },
  view_all_signals: { cost: 3, label: 'View all signals (beyond top 3)', freePreview: true },

  // Intelligence reports (high value, costs credits)
  generate_market_report: { cost: 10, label: 'Generate full market intelligence report', freePreview: true },
  generate_dealer_brief: { cost: 5, label: 'Generate AI dealer intelligence brief', freePreview: true },
  generate_roi_report: { cost: 5, label: 'Generate ROI report', freePreview: true },
  generate_competitor_analysis: { cost: 15, label: 'Generate competitor analysis', freePreview: true },
  generate_area_deep_dive: { cost: 10, label: 'Deep dive: your area\'s buying patterns', freePreview: true },

  // Lead actions
  unlock_lead_phone: { cost: 2, label: 'Unlock lead phone number', freePreview: true },
  unlock_lead_email: { cost: 1, label: 'Unlock lead email', freePreview: true },
  enrich_lead: { cost: 3, label: 'AI-enrich lead (company, revenue, decision makers)', freePreview: true },
  score_lead: { cost: 1, label: 'Score a lead', freePreview: false },
  convert_signal_to_lead: { cost: 2, label: 'Convert signal to qualified lead', freePreview: false },

  // Outreach
  generate_cold_email: { cost: 3, label: 'Generate personalized outreach email', freePreview: true },
  generate_whatsapp_campaign: { cost: 5, label: 'Generate 4-message WhatsApp sequence', freePreview: true },
  generate_linkedin_dm: { cost: 2, label: 'Generate LinkedIn DM', freePreview: true },
  generate_pitch_deck: { cost: 10, label: 'Generate AI pitch deck', freePreview: true },
  send_whatsapp: { cost: 1, label: 'Send WhatsApp message', freePreview: false },

  // Bulk operations
  buy_lead_pack_10: { cost: 0, label: 'Buy 10-lead pack (R1,500)', freePreview: false },
  buy_lead_pack_100: { cost: 0, label: 'Buy 100-lead pack (R10,000)', freePreview: false },
}

// ---------------------------------------------------------------------------
// Credit packs (what dealers buy)
// ---------------------------------------------------------------------------

export const CREDIT_PACKS = [
  { id: 'credits_50', credits: 50, price: 50000, label: '50 Credits — R500', perCredit: 'R10/credit', popular: false },
  { id: 'credits_150', credits: 150, price: 100000, label: '150 Credits — R1,000', perCredit: 'R6.67/credit', popular: false },
  { id: 'credits_500', credits: 500, price: 250000, label: '500 Credits — R2,500', perCredit: 'R5/credit', popular: true },
  { id: 'credits_1200', credits: 1200, price: 500000, label: '1,200 Credits — R5,000', perCredit: 'R4.17/credit', popular: false },
  { id: 'credits_3000', credits: 3000, price: 1000000, label: '3,000 Credits — R10,000', perCredit: 'R3.33/credit', popular: false },
]

// Free credits on signup
export const FREE_SIGNUP_CREDITS = 25

// ---------------------------------------------------------------------------
// Credit balance functions
// ---------------------------------------------------------------------------

export async function getBalance(dealerId: string): Promise<number> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data } = await supabase
      .from('va_dealers')
      .select('credits_balance')
      .eq('id', dealerId)
      .single()
    return data?.credits_balance ?? FREE_SIGNUP_CREDITS
  } catch {
    return FREE_SIGNUP_CREDITS
  }
}

export async function deductCredits(dealerId: string, amount: number, action: string): Promise<{ success: boolean; remaining: number; error?: string }> {
  try {
    const balance = await getBalance(dealerId)
    if (balance < amount) {
      return { success: false, remaining: balance, error: `Not enough credits. You have ${balance}, this costs ${amount}. Buy more credits to continue.` }
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const newBalance = balance - amount
    await supabase
      .from('va_dealers')
      .update({ credits_balance: newBalance })
      .eq('id', dealerId)

    // Log the transaction
    await supabase.from('va_credit_log').insert({
      dealer_id: dealerId,
      action,
      credits_used: amount,
      balance_after: newBalance,
    })

    return { success: true, remaining: newBalance }
  } catch {
    return { success: false, remaining: 0, error: 'Failed to process credits' }
  }
}

export async function addCredits(dealerId: string, amount: number, source: string): Promise<number> {
  try {
    const balance = await getBalance(dealerId)
    const newBalance = balance + amount

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    await supabase
      .from('va_dealers')
      .update({ credits_balance: newBalance })
      .eq('id', dealerId)

    try {
      await supabase.from('va_credit_log').insert({
        dealer_id: dealerId,
        action: `purchase:${source}`,
        credits_used: -amount,
        balance_after: newBalance,
      })
    } catch { /* log error is non-critical */ }

    return newBalance
  } catch {
    return 0
  }
}

// ---------------------------------------------------------------------------
// Teaser generation — show partial value, lock the rest
// ---------------------------------------------------------------------------

export function generateTeaser(action: string, fullContent: string): { preview: string; locked: string; cost: number; cta: string } {
  const config = CREDIT_COSTS[action]
  if (!config) return { preview: fullContent, locked: '', cost: 0, cta: '' }
  if (config.cost === 0) return { preview: fullContent, locked: '', cost: 0, cta: '' }

  // Show ~20-30% of content free, lock the rest
  const lines = fullContent.split('\n').filter(l => l.trim())
  const freeLines = Math.max(2, Math.ceil(lines.length * 0.25))
  const preview = lines.slice(0, freeLines).join('\n')
  const locked = lines.slice(freeLines).join('\n')

  return {
    preview,
    locked,
    cost: config.cost,
    cta: `🔒 **Want more?** This full ${config.label.toLowerCase()} costs **${config.cost} credits**. You'll get ${lines.length - freeLines} more insights.\n\n💳 [Buy Credits](/get-started?tab=credits) | Type "buy credits" to top up.`,
  }
}

// ---------------------------------------------------------------------------
// Agent credit check — used by the AI agent before performing actions
// ---------------------------------------------------------------------------

export function getCreditCost(action: string): number {
  return CREDIT_COSTS[action]?.cost ?? 0
}

export function formatCreditPrompt(action: string, balance: number): string {
  const config = CREDIT_COSTS[action]
  if (!config || config.cost === 0) return ''

  if (balance >= config.cost) {
    return `This will use ${config.cost} credits (you have ${balance}). Proceeding...`
  }

  return `⚠️ **You need ${config.cost} credits** for this action but only have **${balance}**.\n\n` +
    `Top up your credits to unlock:\n` +
    CREDIT_PACKS.slice(0, 3).map(p => `• ${p.label} (${p.perCredit})`).join('\n') +
    `\n\nType "buy 500 credits" or visit [Credits Store](/get-started?tab=credits).`
}
