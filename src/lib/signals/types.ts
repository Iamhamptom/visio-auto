import type { SignalType } from '@/lib/types'

export interface SignalCategory {
  key: string
  label: string
  types: SignalTypeDefinition[]
}

export interface SignalTypeDefinition {
  type: SignalType
  label: string
  icon: string
  color: string
  description: string
}

export const SIGNAL_CATEGORIES: SignalCategory[] = [
  {
    key: 'life_events',
    label: 'Life Events',
    types: [
      {
        type: 'new_baby',
        label: 'New Baby',
        icon: 'Baby',
        color: 'text-pink-400',
        description: 'New parent — likely upgrading to a bigger, safer vehicle',
      },
      {
        type: 'wedding',
        label: 'Wedding',
        icon: 'Heart',
        color: 'text-rose-400',
        description: 'Recently married — couple may need a second vehicle or upgrade',
      },
      {
        type: 'graduation',
        label: 'Graduation',
        icon: 'GraduationCap',
        color: 'text-blue-400',
        description: 'Graduate entering workforce — first car buyer or parent gift',
      },
      {
        type: 'birthday_milestone',
        label: 'Birthday Milestone',
        icon: 'Cake',
        color: 'text-amber-400',
        description: 'Milestone birthday (30/40/50) — self-reward vehicle upgrade',
      },
      {
        type: 'new_driver_age',
        label: 'New Driver Age',
        icon: 'KeyRound',
        color: 'text-emerald-400',
        description: 'Teenager turning 18 — parent likely purchasing first car',
      },
    ],
  },
  {
    key: 'career',
    label: 'Career',
    types: [
      {
        type: 'job_change',
        label: 'Job Change',
        icon: 'UserPlus',
        color: 'text-sky-400',
        description: 'New job — relocation or status vehicle upgrade likely',
      },
      {
        type: 'promotion',
        label: 'Promotion',
        icon: 'TrendingUp',
        color: 'text-emerald-400',
        description: 'Career advancement — disposable income increase, upgrade signal',
      },
      {
        type: 'hiring',
        label: 'Hiring',
        icon: 'Users',
        color: 'text-violet-400',
        description: 'Company hiring — growing team may need fleet vehicles',
      },
      {
        type: 'position_filled',
        label: 'Position Filled',
        icon: 'UserCheck',
        color: 'text-zinc-400',
        description: 'New hire at target company — potential individual buyer',
      },
    ],
  },
  {
    key: 'business',
    label: 'Business',
    types: [
      {
        type: 'new_business',
        label: 'New Business',
        icon: 'Briefcase',
        color: 'text-emerald-400',
        description: 'New CIPC registration — business vehicle or fleet needed',
      },
      {
        type: 'funding_round',
        label: 'Funding Round',
        icon: 'Banknote',
        color: 'text-green-400',
        description: 'Startup raised capital — fleet expansion or exec vehicles',
      },
      {
        type: 'contract_won',
        label: 'Contract Won',
        icon: 'FileCheck',
        color: 'text-teal-400',
        description: 'Major contract secured — cash flow enables vehicle purchase',
      },
      {
        type: 'fleet_expansion',
        label: 'Fleet Expansion',
        icon: 'Truck',
        color: 'text-orange-400',
        description: 'Company expanding fleet — high-value multi-vehicle deal',
      },
    ],
  },
  {
    key: 'relocation',
    label: 'Relocation',
    types: [
      {
        type: 'relocation',
        label: 'Relocation',
        icon: 'MapPin',
        color: 'text-blue-400',
        description: 'Moving to a new area — may need transport in new location',
      },
      {
        type: 'expat_arrival',
        label: 'Expat Arrival',
        icon: 'Plane',
        color: 'text-cyan-400',
        description: 'Expat arriving in SA — needs vehicle immediately, high urgency',
      },
      {
        type: 'new_apartment',
        label: 'New Apartment',
        icon: 'Home',
        color: 'text-indigo-400',
        description: 'New property purchase — lifestyle upgrade often includes vehicle',
      },
      {
        type: 'housing_development',
        label: 'Housing Development',
        icon: 'Building',
        color: 'text-slate-400',
        description: 'New estate/complex — batch of incoming residents needing vehicles',
      },
    ],
  },
  {
    key: 'market',
    label: 'Market',
    types: [
      {
        type: 'lease_expiring',
        label: 'Lease Expiring',
        icon: 'Clock',
        color: 'text-red-400',
        description: 'Vehicle lease ending — must decide to buy out, renew, or switch',
      },
      {
        type: 'insurance_claim',
        label: 'Insurance Claim',
        icon: 'Shield',
        color: 'text-amber-400',
        description: 'Vehicle written off or damaged — replacement purchase imminent',
      },
      {
        type: 'interest_rate_change',
        label: 'Interest Rate Change',
        icon: 'Percent',
        color: 'text-zinc-400',
        description: 'SARB rate cut — financing becomes cheaper, buying increases',
      },
      {
        type: 'salary_season',
        label: 'Salary Season',
        icon: 'Wallet',
        color: 'text-yellow-400',
        description: 'Bonus season or 13th cheque — spike in big-ticket purchases',
      },
      {
        type: 'competitor_closing',
        label: 'Competitor Closing',
        icon: 'Store',
        color: 'text-red-400',
        description: 'Nearby dealership closing — orphaned customers looking for service',
      },
    ],
  },
  {
    key: 'social',
    label: 'Social',
    types: [
      {
        type: 'social_intent',
        label: 'Social Intent',
        icon: 'MessageCircle',
        color: 'text-purple-400',
        description: 'Social media buying intent detected — comments, searches, likes',
      },
    ],
  },
]

export const SIGNAL_TYPE_MAP: Record<string, SignalTypeDefinition> = {}
for (const cat of SIGNAL_CATEGORIES) {
  for (const t of cat.types) {
    SIGNAL_TYPE_MAP[t.type] = t
  }
}

export function getSignalDef(type: string): SignalTypeDefinition {
  return (
    SIGNAL_TYPE_MAP[type] ?? {
      type: type as SignalType,
      label: type.replace(/_/g, ' '),
      icon: 'Zap',
      color: 'text-zinc-400',
      description: 'Unknown signal type',
    }
  )
}
