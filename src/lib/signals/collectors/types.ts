import type { SignalType } from '@/lib/types'

/** Raw signal from a collector before DB insertion */
export interface CollectedSignal {
  signal_type: SignalType
  title: string
  description: string
  person_name?: string | null
  person_email?: string | null
  person_phone?: string | null
  person_linkedin?: string | null
  company_name?: string | null
  area?: string | null
  city?: string | null
  province?: string | null
  data_source: string
  source_url?: string | null
  signal_strength: 'strong' | 'medium' | 'weak'
  buying_probability: number
  estimated_budget_min?: number | null
  estimated_budget_max?: number | null
  vehicle_type_likely?: string | null
}

export interface CollectorResult {
  collector: string
  signals: CollectedSignal[]
  errors: string[]
  duration_ms: number
}

export type CollectorFn = () => Promise<CollectedSignal[]>
