'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Car,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PitchSlide } from '@/lib/agents/pitch-builder'

// ---------------------------------------------------------------------------
// Slide type styling
// ---------------------------------------------------------------------------

const SLIDE_ACCENT: Record<string, { bg: string; text: string; glow: string }> = {
  hero: { bg: 'from-emerald-950/40', text: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
  problem: { bg: 'from-red-950/30', text: 'text-red-400', glow: 'shadow-red-500/10' },
  solution: { bg: 'from-blue-950/30', text: 'text-blue-400', glow: 'shadow-blue-500/10' },
  stats: { bg: 'from-purple-950/30', text: 'text-purple-400', glow: 'shadow-purple-500/10' },
  roi: { bg: 'from-amber-950/30', text: 'text-amber-400', glow: 'shadow-amber-500/10' },
  features: { bg: 'from-cyan-950/30', text: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
  market: { bg: 'from-indigo-950/30', text: 'text-indigo-400', glow: 'shadow-indigo-500/10' },
  pricing: { bg: 'from-emerald-950/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
  testimonial: { bg: 'from-pink-950/30', text: 'text-pink-400', glow: 'shadow-pink-500/10' },
  cta: { bg: 'from-emerald-950/40', text: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
}

// ---------------------------------------------------------------------------
// Demo pitch data (used when no API pitch found)
// ---------------------------------------------------------------------------

const DEMO_SLIDES: PitchSlide[] = [
  {
    type: 'hero',
    title: 'AI-Powered Leads for Your Dealership',
    subtitle: 'Stop chasing. Start closing.',
    content: 'Visio Auto delivers **AI-qualified buyers** directly to your sales team\'s WhatsApp -- in under 60 seconds.\n\nWe detect buying signals before your competitors even know someone is looking.',
    data: {},
  },
  {
    type: 'problem',
    title: 'The Dealership Lead Problem',
    subtitle: 'Sound familiar?',
    content: '- **AutoTrader leads cost R800+** each -- and most never pick up the phone\n- **67% of leads** go cold within 5 minutes of first contact\n- Sales teams waste **3 hours/day** chasing unqualified browsers\n- Generic lead forms don\'t tell you who\'s actually ready to buy',
    data: {},
  },
  {
    type: 'solution',
    title: 'Visio Auto\'s 7-Layer Intelligence Stack',
    subtitle: 'From signal to sale -- fully automated',
    content: '1. **Signal Engine** -- detects 23 life-event buying triggers\n2. **AI Scoring** -- 100-point qualification (budget, timeline, intent)\n3. **VIN Matching** -- matches buyers to your actual inventory\n4. **WhatsApp Delivery** -- hot leads in <60 seconds\n5. **Voice AI** -- automated warm-lead follow-up\n6. **Market Terminal** -- real-time NAAMSA data & competitor tracking\n7. **Analytics Dashboard** -- full pipeline visibility',
    data: {},
  },
  {
    type: 'roi',
    title: 'Your Personalised ROI',
    subtitle: 'Conservative estimates based on SA dealer data',
    content: '| Metric | Value |\n|---|---|\n| Monthly investment | R15,000 |\n| AI-qualified leads | 100/month |\n| Conversion rate | 10% |\n| Expected sales | 10/month |\n| Profit per sale | R35K - R51K |\n| **Monthly profit** | **R350,000 - R510,000** |\n| **ROI** | **23x - 34x** |',
    data: {},
  },
  {
    type: 'cta',
    title: 'See Signals in Your Area Within 24 Hours',
    subtitle: 'Start your free trial today',
    content: '1. **Sign up** -- takes 2 minutes\n2. **We scan your area** -- our Signal Engine activates immediately\n3. **Receive your first leads** -- AI-qualified buyers, delivered to WhatsApp\n\nNo lock-in contract. Cancel anytime.',
    data: {},
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PitchViewerPage() {
  const params = useParams()
  const pitchId = params.id as string

  const [slides, setSlides] = useState<PitchSlide[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dealerName, setDealerName] = useState('')

  useEffect(() => {
    // Try to load pitch from localStorage (set by dashboard) or use demo
    const stored = typeof window !== 'undefined' ? localStorage.getItem(`pitch_${pitchId}`) : null
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSlides(parsed.slides ?? DEMO_SLIDES)
        setDealerName(parsed.dealer_name ?? '')
      } catch {
        setSlides(DEMO_SLIDES)
      }
    } else {
      setSlides(DEMO_SLIDES)
      setDealerName('Demo Dealership')
    }
    setLoading(false)
  }, [pitchId])

  const next = useCallback(() => {
    setCurrent((c) => Math.min(c + 1, slides.length - 1))
  }, [slides.length])

  const prev = useCallback(() => {
    setCurrent((c) => Math.max(c - 1, 0))
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  const slide = slides[current]
  if (!slide) return null

  const accent = SLIDE_ACCENT[slide.type] ?? SLIDE_ACCENT.hero
  const isLast = current === slides.length - 1

  return (
    <div className={cn('relative flex min-h-screen flex-col bg-zinc-950 overflow-hidden')}>
      {/* Background gradient */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent opacity-60 transition-all duration-700',
          accent.bg
        )}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500">
            <Car className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-400">VISIO AUTO</span>
        </div>
        {dealerName && (
          <span className="text-xs text-zinc-600">{dealerName}</span>
        )}
        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
          <span className="font-mono">{current + 1}</span>
          <span>/</span>
          <span className="font-mono">{slides.length}</span>
        </div>
      </header>

      {/* Slide content */}
      <main className="relative z-10 flex flex-1 flex-col justify-center px-8 py-12 lg:px-20">
        <div className="max-w-3xl space-y-6">
          <span
            className={cn(
              'inline-block rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ring-1 ring-inset',
              accent.text,
              accent.text.replace('text-', 'ring-').replace('400', '500/20'),
              accent.text.replace('text-', 'bg-').replace('400', '500/10')
            )}
          >
            {slide.type}
          </span>

          <h1 className="text-4xl font-bold leading-tight text-white lg:text-5xl">
            {slide.title}
          </h1>

          <p className="text-lg text-zinc-400 lg:text-xl">
            {slide.subtitle}
          </p>

          <div className="text-base leading-relaxed text-zinc-300 whitespace-pre-wrap lg:text-lg">
            {slide.content}
          </div>

          {/* CTA button on last slide */}
          {isLast && (
            <div className="pt-6">
              <Link
                href="/get-quote"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/30"
              >
                Get Started
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Progress bar */}
      <div className="relative z-10 px-8 lg:px-20">
        <div className="h-0.5 w-full rounded-full bg-zinc-800/50">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${((current + 1) / slides.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Navigation */}
      <footer className="relative z-10 flex items-center justify-between px-8 py-6 lg:px-20">
        <button
          onClick={prev}
          disabled={current === 0}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            current === 0
              ? 'text-zinc-700 cursor-not-allowed'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        {/* Slide dots */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === current
                  ? 'w-6 bg-emerald-400'
                  : i < current
                    ? 'w-1.5 bg-emerald-400/40'
                    : 'w-1.5 bg-zinc-700'
              )}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={isLast}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            isLast
              ? 'text-zinc-700 cursor-not-allowed'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          )}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </footer>
    </div>
  )
}
