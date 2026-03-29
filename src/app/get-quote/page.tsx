'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormData {
  vehicleType: string
  newOrUsed: string
  budgetRange: string
  brand: string
  timeline: string
  hasTradeIn: boolean | null
  tradeInBrand: string
  tradeInModel: string
  tradeInYear: string
  name: string
  phone: string
  email: string
  area: string
  language: string
}

const INITIAL: FormData = {
  vehicleType: '',
  newOrUsed: '',
  budgetRange: '',
  brand: '',
  timeline: '',
  hasTradeIn: null,
  tradeInBrand: '',
  tradeInModel: '',
  tradeInYear: '',
  name: '',
  phone: '',
  email: '',
  area: '',
  language: 'en',
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VEHICLE_TYPES = [
  { value: 'suv', label: 'SUV', icon: '\u{1F697}' },
  { value: 'sedan', label: 'Sedan', icon: '\u{1F698}' },
  { value: 'bakkie', label: 'Bakkie', icon: '\u{1F6FB}' },
  { value: 'hatch', label: 'Hatch', icon: '\u{1F3CE}\uFE0F' },
  { value: 'coupe', label: 'Coupe', icon: '\u{1F3CE}\uFE0F' },
  { value: 'van', label: 'Van', icon: '\u{1F690}' },
]

const BUDGET_RANGES = [
  { value: 'under_200k', label: 'Under R200K', min: 0, max: 200_000 },
  { value: '200_350k', label: 'R200 - R350K', min: 200_000, max: 350_000 },
  { value: '350_500k', label: 'R350 - R500K', min: 350_000, max: 500_000 },
  { value: '500_750k', label: 'R500 - R750K', min: 500_000, max: 750_000 },
  { value: '750k_1m', label: 'R750K - R1M', min: 750_000, max: 1_000_000 },
  { value: '1m_plus', label: 'R1M+', min: 1_000_000, max: 5_000_000 },
]

const BRANDS = [
  { value: 'Toyota', logo: 'Toyota' },
  { value: 'BMW', logo: 'BMW' },
  { value: 'Volkswagen', logo: 'VW' },
  { value: 'Mercedes-Benz', logo: 'Merc' },
  { value: 'Audi', logo: 'Audi' },
  { value: 'Ford', logo: 'Ford' },
  { value: 'Hyundai', logo: 'Hyundai' },
  { value: 'Kia', logo: 'Kia' },
  { value: 'Suzuki', logo: 'Suzuki' },
  { value: 'Haval', logo: 'Haval' },
  { value: 'Chery', logo: 'Chery' },
  { value: 'GWM', logo: 'GWM' },
  { value: 'Other', logo: 'Other' },
  { value: 'No Preference', logo: 'Any' },
]

const TIMELINES = [
  { value: 'this_week', label: 'This week', sub: 'Ready to buy now' },
  { value: 'this_month', label: 'This month', sub: 'Actively shopping' },
  { value: 'three_months', label: 'Next 3 months', sub: 'Planning ahead' },
  { value: 'just_browsing', label: 'Just browsing', sub: 'Exploring options' },
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'af', label: 'Afrikaans' },
  { value: 'zu', label: 'isiZulu' },
  { value: 'st', label: 'Sesotho' },
  { value: 'ts', label: 'Xitsonga' },
  { value: 'xh', label: 'isiXhosa' },
]

const TRADE_IN_YEARS = Array.from({ length: 20 }, (_, i) => String(2026 - i))

const TOTAL_STEPS = 7

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GetQuotePage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const next = useCallback(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS)), [])
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 1)), [])

  // Auto-advance for card-select steps
  const selectAndNext = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      set(key, value)
      // small delay so user sees their selection
      setTimeout(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS)), 200)
    },
    [set]
  )

  const canSubmit =
    form.name.trim().length >= 2 && /^(\+?27|0)\d{9}$/.test(form.phone.replace(/[\s-]/g, ''))

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)

    const budgetObj = BUDGET_RANGES.find((b) => b.value === form.budgetRange)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.replace(/[\s-]/g, ''),
          email: form.email.trim() || undefined,
          area: form.area.trim() || undefined,
          city: 'Johannesburg',
          province: 'Gauteng',
          preferred_type: form.vehicleType || undefined,
          new_or_used: form.newOrUsed || 'any',
          budget_min: budgetObj?.min ?? undefined,
          budget_max: budgetObj?.max ?? undefined,
          preferred_brand: form.brand && form.brand !== 'No Preference' ? form.brand : undefined,
          timeline: form.timeline || 'just_browsing',
          has_trade_in: form.hasTradeIn ?? false,
          trade_in_brand: form.hasTradeIn ? form.tradeInBrand || undefined : undefined,
          trade_in_model: form.hasTradeIn ? form.tradeInModel || undefined : undefined,
          trade_in_year: form.hasTradeIn && form.tradeInYear ? parseInt(form.tradeInYear) : undefined,
          language: form.language,
          source: 'get_quote_form',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Something went wrong')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ---- Success state ----
  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto size-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="size-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">You're all set!</h2>
          <p className="text-zinc-400 text-lg">
            We'll WhatsApp you matched vehicles in under <span className="text-emerald-400 font-semibold">60 seconds</span>.
          </p>
          <p className="text-zinc-500 text-sm">
            Check your WhatsApp on <span className="text-white">{form.phone}</span> for your AI-matched deals.
          </p>
          <div className="pt-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Visio Auto
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress bar */}
      <div className="px-4 sm:px-6 pt-2">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Hero — only on step 1 */}
      {step === 1 && (
        <div className="px-4 pt-8 pb-4 sm:pt-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Find Your Perfect Car in{' '}
            <span className="text-emerald-400">60 Seconds</span>
          </h1>
          <p className="mt-3 text-base sm:text-lg text-zinc-400 max-w-lg mx-auto">
            AI matches you with the best deals from top Gauteng dealerships
          </p>
        </div>
      )}

      {/* Form area */}
      <div className="flex-1 flex items-start justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-xl">

          {/* Step 1: Vehicle type */}
          {step === 1 && (
            <StepContainer title="What type of vehicle?">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {VEHICLE_TYPES.map((t) => (
                  <SelectCard
                    key={t.value}
                    selected={form.vehicleType === t.value}
                    onClick={() => selectAndNext('vehicleType', t.value)}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <span className="text-sm font-medium text-white">{t.label}</span>
                  </SelectCard>
                ))}
              </div>
            </StepContainer>
          )}

          {/* Step 2: New or Used */}
          {step === 2 && (
            <StepContainer title="New or Used?">
              <div className="grid grid-cols-2 gap-3">
                {(['new', 'used'] as const).map((v) => (
                  <SelectCard
                    key={v}
                    selected={form.newOrUsed === v}
                    onClick={() => selectAndNext('newOrUsed', v)}
                    large
                  >
                    <span className="text-2xl">{v === 'new' ? '\u2728' : '\u{1F504}'}</span>
                    <span className="text-base font-semibold text-white capitalize">{v}</span>
                    <span className="text-xs text-zinc-500">
                      {v === 'new' ? 'Factory fresh' : 'Pre-owned bargains'}
                    </span>
                  </SelectCard>
                ))}
              </div>
              <button
                type="button"
                onClick={() => selectAndNext('newOrUsed', 'any')}
                className="mt-3 w-full py-2.5 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Either is fine
              </button>
            </StepContainer>
          )}

          {/* Step 3: Budget */}
          {step === 3 && (
            <StepContainer title="Budget range?">
              <div className="grid grid-cols-2 gap-3">
                {BUDGET_RANGES.map((b) => (
                  <SelectCard
                    key={b.value}
                    selected={form.budgetRange === b.value}
                    onClick={() => selectAndNext('budgetRange', b.value)}
                  >
                    <span className="text-sm font-semibold text-white">{b.label}</span>
                  </SelectCard>
                ))}
              </div>
            </StepContainer>
          )}

          {/* Step 4: Brand preference */}
          {step === 4 && (
            <StepContainer title="Any brand preference?">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {BRANDS.map((b) => (
                  <SelectCard
                    key={b.value}
                    selected={form.brand === b.value}
                    onClick={() => selectAndNext('brand', b.value)}
                    compact
                  >
                    <span className="text-xs font-semibold text-white leading-tight text-center">{b.logo}</span>
                  </SelectCard>
                ))}
              </div>
            </StepContainer>
          )}

          {/* Step 5: Timeline */}
          {step === 5 && (
            <StepContainer title="When are you looking to buy?">
              <div className="space-y-2.5">
                {TIMELINES.map((t) => (
                  <SelectCard
                    key={t.value}
                    selected={form.timeline === t.value}
                    onClick={() => selectAndNext('timeline', t.value)}
                    row
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">{t.label}</span>
                      <span className="text-xs text-zinc-500">{t.sub}</span>
                    </div>
                    <div className={cn(
                      'size-5 rounded-full border-2 transition-colors flex items-center justify-center shrink-0',
                      form.timeline === t.value
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-zinc-600'
                    )}>
                      {form.timeline === t.value && (
                        <svg className="size-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </SelectCard>
                ))}
              </div>
            </StepContainer>
          )}

          {/* Step 6: Trade-in */}
          {step === 6 && (
            <StepContainer title="Do you have a trade-in?">
              <div className="grid grid-cols-2 gap-3">
                <SelectCard
                  selected={form.hasTradeIn === true}
                  onClick={() => set('hasTradeIn', true)}
                  large
                >
                  <span className="text-2xl">\u2705</span>
                  <span className="text-base font-semibold text-white">Yes</span>
                  <span className="text-xs text-zinc-500">I have a car to trade in</span>
                </SelectCard>
                <SelectCard
                  selected={form.hasTradeIn === false}
                  onClick={() => {
                    set('hasTradeIn', false)
                    setTimeout(() => setStep(7), 200)
                  }}
                  large
                >
                  <span className="text-2xl">\u274C</span>
                  <span className="text-base font-semibold text-white">No</span>
                  <span className="text-xs text-zinc-500">Starting fresh</span>
                </SelectCard>
              </div>

              {form.hasTradeIn === true && (
                <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Brand</label>
                    <select
                      value={form.tradeInBrand}
                      onChange={(e) => set('tradeInBrand', e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                    >
                      <option value="">Select brand</option>
                      {BRANDS.filter((b) => b.value !== 'No Preference' && b.value !== 'Other').map((b) => (
                        <option key={b.value} value={b.value}>{b.value}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Model</label>
                    <input
                      type="text"
                      placeholder="e.g. Hilux, Polo, X5"
                      value={form.tradeInModel}
                      onChange={(e) => set('tradeInModel', e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Year</label>
                    <select
                      value={form.tradeInYear}
                      onChange={(e) => set('tradeInYear', e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                    >
                      <option value="">Select year</option>
                      {TRADE_IN_YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={next}
                    className="w-full mt-2 py-3 rounded-lg bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 active:bg-emerald-600 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              )}
            </StepContainer>
          )}

          {/* Step 7: Contact details */}
          {step === 7 && (
            <StepContainer title="Your details">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Phone (WhatsApp) <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="082 123 4567"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                  />
                  <p className="mt-1 text-xs text-zinc-600">
                    We'll send your matched deals to this number
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Email <span className="text-zinc-600">(optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Area / Suburb <span className="text-zinc-600">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sandton, Centurion, Midrand"
                    value={form.area}
                    onChange={(e) => set('area', e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Preferred language
                  </label>
                  <select
                    value={form.language}
                    onChange={(e) => set('language', e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className={cn(
                    'w-full mt-2 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200',
                    canSubmit && !submitting
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400 active:bg-emerald-600 shadow-lg shadow-emerald-500/25'
                      : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                  )}
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Finding your matches...
                    </span>
                  ) : (
                    'Get My AI-Matched Deals \u2192'
                  )}
                </button>
              </div>
            </StepContainer>
          )}

          {/* Back button — not on step 1 */}
          {step > 1 && step <= TOTAL_STEPS && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={prev}
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                \u2190 Back
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trust badges */}
      <div className="px-4 pb-6">
        <div className="max-w-xl mx-auto flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-600">
          <span className="flex items-center gap-1">
            <svg className="size-3.5 text-emerald-500/60" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
            POPIA Compliant
          </span>
          <span className="flex items-center gap-1">
            <svg className="size-3.5 text-emerald-500/60" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            No spam, ever
          </span>
          <span className="flex items-center gap-1">
            <svg className="size-3.5 text-emerald-500/60" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            AI-powered matching
          </span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StepContainer({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">{title}</h2>
      {children}
    </div>
  )
}

function SelectCard({
  children,
  selected,
  onClick,
  large,
  compact,
  row,
}: {
  children: React.ReactNode
  selected: boolean
  onClick: () => void
  large?: boolean
  compact?: boolean
  row?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl border transition-all duration-150 text-left',
        'hover:border-emerald-500/50 hover:bg-emerald-500/5 active:scale-[0.97]',
        selected
          ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
          : 'border-zinc-700/60 bg-zinc-800/40',
        row
          ? 'flex items-center justify-between gap-3 px-4 py-3'
          : cn(
              'flex flex-col items-center justify-center gap-1.5',
              large ? 'py-6 px-4' : compact ? 'py-3 px-2' : 'py-5 px-3'
            )
      )}
    >
      {children}
    </button>
  )
}
