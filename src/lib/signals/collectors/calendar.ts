/**
 * Birthday / Calendar Signal Collector
 *
 * Generates buying signals from birthday milestones and anniversaries.
 * Milestone birthdays (18, 21, 30, 40, 50, 60) are strong purchase triggers:
 * - 18th = new driver, parents buying first car
 * - 21st = career start, first "real" car
 * - 30th/40th/50th = self-reward, lifestyle upgrade
 * - 60th = retirement vehicle, comfort upgrade
 *
 * Data sources (future): LinkedIn via PhantomBuster, Facebook birthday alerts,
 * manual entry in dashboard. For now, queries existing leads/signals for
 * person records with birthdate metadata.
 */

import type { SignalType } from '@/lib/types'
import type { CollectedSignal } from './types'
import { createServiceClient } from '@/lib/supabase/service'

// ---------------------------------------------------------------------------
// Milestone config
// ---------------------------------------------------------------------------

interface MilestoneConfig {
  age: number
  signalType: SignalType
  vehicleType: string
  budgetMin: number
  budgetMax: number
  probability: number
  strength: 'strong' | 'medium' | 'weak'
  description: string
}

const MILESTONES: MilestoneConfig[] = [
  {
    age: 18,
    signalType: 'new_driver_age',
    vehicleType: 'hatch',
    budgetMin: 100_000,
    budgetMax: 250_000,
    probability: 0.65,
    strength: 'strong',
    description: 'Turning 18 — new driver, parents likely purchasing first car',
  },
  {
    age: 21,
    signalType: 'birthday_milestone',
    vehicleType: 'hatch',
    budgetMin: 150_000,
    budgetMax: 350_000,
    probability: 0.45,
    strength: 'medium',
    description: 'Turning 21 — entering workforce, upgrading from first car',
  },
  {
    age: 30,
    signalType: 'birthday_milestone',
    vehicleType: 'sedan',
    budgetMin: 300_000,
    budgetMax: 600_000,
    probability: 0.55,
    strength: 'medium',
    description: 'Turning 30 — career established, self-reward vehicle upgrade',
  },
  {
    age: 40,
    signalType: 'birthday_milestone',
    vehicleType: 'suv',
    budgetMin: 450_000,
    budgetMax: 900_000,
    probability: 0.6,
    strength: 'strong',
    description: 'Turning 40 — peak earning years, premium vehicle upgrade',
  },
  {
    age: 50,
    signalType: 'birthday_milestone',
    vehicleType: 'suv',
    budgetMin: 500_000,
    budgetMax: 1_200_000,
    probability: 0.55,
    strength: 'medium',
    description: 'Turning 50 — luxury/comfort vehicle, self-reward purchase',
  },
  {
    age: 60,
    signalType: 'birthday_milestone',
    vehicleType: 'sedan',
    budgetMin: 400_000,
    budgetMax: 800_000,
    probability: 0.4,
    strength: 'medium',
    description: 'Turning 60 — retirement vehicle, comfort and safety priority',
  },
]

// ---------------------------------------------------------------------------
// Anniversary types
// ---------------------------------------------------------------------------

interface AnniversaryCheck {
  years: number[]
  signalType: SignalType
  vehicleType: string
  budgetMin: number
  budgetMax: number
  probability: number
  strength: 'strong' | 'medium' | 'weak'
}

const WEDDING_ANNIVERSARIES: AnniversaryCheck = {
  years: [1, 5, 10, 25],
  signalType: 'wedding',
  vehicleType: 'sedan',
  budgetMin: 300_000,
  budgetMax: 700_000,
  probability: 0.35,
  strength: 'medium',
}

const BUSINESS_ANNIVERSARIES: AnniversaryCheck = {
  years: [1, 5, 10],
  signalType: 'new_business',
  vehicleType: 'bakkie',
  budgetMin: 350_000,
  budgetMax: 800_000,
  probability: 0.4,
  strength: 'medium',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getUpcomingInDays(birthdate: string, daysAhead: number = 30): number | null {
  const now = new Date()
  const bd = new Date(birthdate)
  if (isNaN(bd.getTime())) return null

  // Calculate age if birthday falls within the next N days
  const thisYearBirthday = new Date(now.getFullYear(), bd.getMonth(), bd.getDate())
  const diff = thisYearBirthday.getTime() - now.getTime()
  const daysUntil = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (daysUntil >= 0 && daysUntil <= daysAhead) {
    return now.getFullYear() - bd.getFullYear()
  }

  // Check next year too (for December → January window)
  const nextYearBirthday = new Date(now.getFullYear() + 1, bd.getMonth(), bd.getDate())
  const diff2 = nextYearBirthday.getTime() - now.getTime()
  const daysUntil2 = Math.ceil(diff2 / (1000 * 60 * 60 * 24))

  if (daysUntil2 >= 0 && daysUntil2 <= daysAhead) {
    return now.getFullYear() + 1 - bd.getFullYear()
  }

  return null
}

function getAnniversaryYears(dateStr: string, daysAhead: number = 30): number | null {
  const now = new Date()
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null

  const thisYearAnniv = new Date(now.getFullYear(), d.getMonth(), d.getDate())
  const diff = thisYearAnniv.getTime() - now.getTime()
  const daysUntil = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (daysUntil >= 0 && daysUntil <= daysAhead) {
    return now.getFullYear() - d.getFullYear()
  }

  return null
}

// ---------------------------------------------------------------------------
// Main collector
// ---------------------------------------------------------------------------

export async function collectCalendarSignals(): Promise<CollectedSignal[]> {
  console.log('[calendar] Starting calendar/birthday signal collection...')
  const signals: CollectedSignal[] = []
  const supabase = createServiceClient()

  // 1. Check va_leads for birthdate in metadata
  // Leads may have birthdate stored in a metadata/notes field or dedicated column
  const { data: leadsWithBirthday, error: leadsErr } = await supabase
    .from('va_leads')
    .select('id, name, phone, email, area, city, province, metadata')
    .not('metadata', 'is', null)

  if (leadsErr) {
    console.error('[calendar] Failed to query leads:', leadsErr.message)
  }

  const leads = leadsWithBirthday || []
  let birthdaySignals = 0

  for (const lead of leads) {
    const meta = lead.metadata as Record<string, unknown> | null
    if (!meta) continue

    // Check for birthdate in metadata
    const birthdate = (meta.birthdate || meta.birthday || meta.date_of_birth) as string | undefined
    if (!birthdate) continue

    const upcomingAge = getUpcomingInDays(birthdate, 30)
    if (upcomingAge === null) continue

    // Check if this is a milestone
    const milestone = MILESTONES.find((m) => m.age === upcomingAge)
    if (!milestone) continue

    signals.push({
      signal_type: milestone.signalType,
      title: `${lead.name} turning ${upcomingAge} — ${milestone.description.split(' — ')[1] || 'milestone birthday'}`,
      description: milestone.description,
      person_name: lead.name,
      person_phone: lead.phone,
      person_email: lead.email,
      area: lead.area,
      city: lead.city || 'Johannesburg',
      province: lead.province || 'Gauteng',
      data_source: 'calendar_birthday_milestone',
      signal_strength: milestone.strength,
      buying_probability: milestone.probability,
      estimated_budget_min: milestone.budgetMin,
      estimated_budget_max: milestone.budgetMax,
      vehicle_type_likely: milestone.vehicleType,
    })
    birthdaySignals++
  }

  // 2. Check for wedding anniversaries (from leads with wedding_date in metadata)
  let anniversarySignals = 0

  for (const lead of leads) {
    const meta = lead.metadata as Record<string, unknown> | null
    if (!meta) continue

    const weddingDate = (meta.wedding_date || meta.anniversary_date) as string | undefined
    if (weddingDate) {
      const years = getAnniversaryYears(weddingDate, 30)
      if (years !== null && WEDDING_ANNIVERSARIES.years.includes(years)) {
        signals.push({
          signal_type: WEDDING_ANNIVERSARIES.signalType,
          title: `${lead.name} — ${years}${years === 1 ? 'st' : years === 5 ? 'th' : 'th'} wedding anniversary`,
          description: `Wedding anniversary milestone (${years} years) — couples often celebrate with major purchases`,
          person_name: lead.name,
          person_phone: lead.phone,
          person_email: lead.email,
          area: lead.area,
          city: lead.city || 'Johannesburg',
          province: lead.province || 'Gauteng',
          data_source: 'calendar_wedding_anniversary',
          signal_strength: WEDDING_ANNIVERSARIES.strength,
          buying_probability: WEDDING_ANNIVERSARIES.probability,
          estimated_budget_min: WEDDING_ANNIVERSARIES.budgetMin,
          estimated_budget_max: WEDDING_ANNIVERSARIES.budgetMax,
          vehicle_type_likely: WEDDING_ANNIVERSARIES.vehicleType,
        })
        anniversarySignals++
      }
    }

    // 3. Check for business anniversaries (company registration date)
    const companyRegDate = (meta.company_reg_date || meta.business_start_date) as string | undefined
    if (companyRegDate) {
      const years = getAnniversaryYears(companyRegDate, 30)
      if (years !== null && BUSINESS_ANNIVERSARIES.years.includes(years)) {
        signals.push({
          signal_type: BUSINESS_ANNIVERSARIES.signalType,
          title: `${meta.company_name || lead.name}'s business — ${years} year anniversary`,
          description: `Business anniversary (${years} years) — established companies often upgrade fleet or exec vehicles`,
          person_name: lead.name,
          company_name: (meta.company_name as string) || null,
          person_phone: lead.phone,
          person_email: lead.email,
          area: lead.area,
          city: lead.city || 'Johannesburg',
          province: lead.province || 'Gauteng',
          data_source: 'calendar_business_anniversary',
          signal_strength: BUSINESS_ANNIVERSARIES.strength,
          buying_probability: BUSINESS_ANNIVERSARIES.probability,
          estimated_budget_min: BUSINESS_ANNIVERSARIES.budgetMin,
          estimated_budget_max: BUSINESS_ANNIVERSARIES.budgetMax,
          vehicle_type_likely: BUSINESS_ANNIVERSARIES.vehicleType,
        })
        anniversarySignals++
      }
    }
  }

  console.log(
    `[calendar] Collected ${signals.length} calendar signals (${birthdaySignals} birthdays, ${anniversarySignals} anniversaries)`
  )
  return signals
}
