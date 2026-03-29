'use client'

import { useState } from 'react'
import {
  Presentation,
  Loader2,
  Download,
  Copy,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileText,
  Code,
  Globe,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { PitchSlide } from '@/lib/agents/pitch-builder'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEALERS = [
  { id: 'sandton_motors', name: 'Sandton Motor Group', brands: 'BMW, Mercedes, Audi' },
  { id: 'cape_town_toyota', name: 'Cape Town Toyota', brands: 'Toyota' },
  { id: 'durban_vw', name: 'Durban Volkswagen', brands: 'Volkswagen' },
  { id: 'pretoria_multi', name: 'Pretoria Auto Hub', brands: 'Toyota, Ford, Hyundai, Suzuki, Haval, GWM' },
]

const TEMPLATES = [
  { id: 'standard', label: 'Standard' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'volume', label: 'Volume' },
  { id: 'fleet', label: 'Fleet' },
]

const SLIDE_COLORS: Record<string, string> = {
  hero: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  problem: 'bg-red-500/10 text-red-400 ring-red-500/20',
  solution: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
  stats: 'bg-purple-500/10 text-purple-400 ring-purple-500/20',
  roi: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  features: 'bg-cyan-500/10 text-cyan-400 ring-cyan-500/20',
  market: 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20',
  pricing: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  testimonial: 'bg-pink-500/10 text-pink-400 ring-pink-500/20',
  cta: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PitchBuilderPage() {
  const [dealerId, setDealerId] = useState('')
  const [template, setTemplate] = useState('standard')
  const [customPrompt, setCustomPrompt] = useState('')
  const [slides, setSlides] = useState<PitchSlide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [dealerName, setDealerName] = useState('')
  const [tab, setTab] = useState('generate')

  // Edit state
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editing, setEditing] = useState(false)

  async function generatePitch() {
    if (!dealerId) {
      setError('Select a dealer first')
      return
    }
    setGenerating(true)
    setError('')
    setSlides([])
    try {
      const body: Record<string, string> = { dealer_id: dealerId, template }
      if (customPrompt.trim()) body.custom_prompt = customPrompt.trim()

      const res = await fetch('/api/pitch/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Generation failed')
      setSlides(json.data.slides)
      setDealerName(json.data.dealer_name)
      setCurrentSlide(0)
      setTab('preview')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setGenerating(false)
    }
  }

  async function exportPitch(format: 'json' | 'html' | 'markdown') {
    if (!slides.length) return
    setExporting(true)
    try {
      const res = await fetch('/api/pitch/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides, format, dealer_name: dealerName }),
      })
      if (format === 'json') {
        const json = await res.json()
        await navigator.clipboard.writeText(JSON.stringify(json.data, null, 2))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = format === 'html' ? `pitch-${dealerName.toLowerCase().replace(/\s+/g, '-')}.html` : `pitch-${dealerName.toLowerCase().replace(/\s+/g, '-')}.md`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      setError('Export failed')
    } finally {
      setExporting(false)
    }
  }

  function startEdit() {
    if (!slides[currentSlide]) return
    setEditTitle(slides[currentSlide].title)
    setEditContent(slides[currentSlide].content)
    setEditing(true)
  }

  function saveEdit() {
    setSlides((prev) => {
      const next = [...prev]
      next[currentSlide] = { ...next[currentSlide], title: editTitle, content: editContent }
      return next
    })
    setEditing(false)
  }

  const slide = slides[currentSlide]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Presentation className="h-6 w-6 text-emerald-400" />
            Pitch Builder
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Generate AI-powered pitch decks for dealership sales
          </p>
        </div>
        {slides.length > 0 && (
          <Badge className="bg-emerald-500/10 text-emerald-400 ring-emerald-500/20">
            {slides.length} slides
          </Badge>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-zinc-900 border border-zinc-800/50">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="preview" disabled={!slides.length}>Preview</TabsTrigger>
          <TabsTrigger value="edit" disabled={!slides.length}>Edit</TabsTrigger>
          <TabsTrigger value="export" disabled={!slides.length}>Export</TabsTrigger>
        </TabsList>

        {/* ---- GENERATE TAB ---- */}
        <TabsContent value="generate">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Quick Generate */}
            <Card className="border-zinc-800/50 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  Quick Generate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Select Dealer
                  </label>
                  <Select value={dealerId} onValueChange={(v) => setDealerId(v ?? '')}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-200">
                      <SelectValue placeholder="Choose a dealership..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {DEALERS.map((d) => (
                        <SelectItem key={d.id} value={d.id} className="text-zinc-200">
                          <span className="font-medium">{d.name}</span>
                          <span className="ml-2 text-zinc-500 text-xs">{d.brands}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Template
                  </label>
                  <Select value={template} onValueChange={(v) => setTemplate(v ?? 'standard')}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {TEMPLATES.map((t) => (
                        <SelectItem key={t.id} value={t.id} className="text-zinc-200">
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Custom Instructions (optional)
                  </label>
                  <Textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g., Focus on fleet sales opportunities for this dealer..."
                    className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 min-h-[80px]"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <Button
                  onClick={generatePitch}
                  disabled={generating || !dealerId}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating with Claude...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Pitch Deck
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="border-zinc-800/50 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-white">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { step: '1', title: 'Select a dealer', desc: 'Choose from your dealer database' },
                    { step: '2', title: 'AI generates 9 slides', desc: 'Claude builds a personalised pitch with market data, signals, and ROI' },
                    { step: '3', title: 'Edit and refine', desc: 'Tweak individual slides, titles, and content' },
                    { step: '4', title: 'Export and share', desc: 'Download as HTML presentation, Markdown, or JSON for VisioPitch' },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-400">
                        {item.step}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{item.title}</p>
                        <p className="text-xs text-zinc-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- PREVIEW TAB ---- */}
        <TabsContent value="preview">
          {slide && (
            <div className="space-y-4">
              {/* Slide Navigator */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {slides.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      i === currentSlide
                        ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                        : 'bg-zinc-800/50 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {i + 1}. {s.type}
                  </button>
                ))}
              </div>

              {/* Slide Preview */}
              <Card className="border-zinc-800/50 bg-zinc-900/50 min-h-[400px]">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${
                        SLIDE_COLORS[slide.type] ?? SLIDE_COLORS.hero
                      }`}
                    >
                      {slide.type}
                    </span>
                    <h2 className="text-3xl font-bold text-white">{slide.title}</h2>
                    <p className="text-lg text-zinc-400">{slide.subtitle}</p>
                    <div className="prose prose-invert prose-sm max-w-none mt-4">
                      <div
                        className="text-zinc-300 leading-relaxed whitespace-pre-wrap"
                        style={{ lineHeight: '1.8' }}
                      >
                        {slide.content}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="border-zinc-800 text-zinc-400 hover:text-white"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-xs text-zinc-500 font-mono">
                  {currentSlide + 1} / {slides.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                  disabled={currentSlide === slides.length - 1}
                  className="border-zinc-800 text-zinc-400 hover:text-white"
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ---- EDIT TAB ---- */}
        <TabsContent value="edit">
          {slide && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Slide List */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-400 mb-2">Slides</p>
                {slides.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentSlide(i); setEditing(false) }}
                    className={`w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      i === currentSlide
                        ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                        : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-[10px] uppercase text-zinc-600 block">{s.type}</span>
                    <span className="truncate block">{s.title}</span>
                  </button>
                ))}
              </div>

              {/* Editor */}
              <div className="lg:col-span-2">
                <Card className="border-zinc-800/50 bg-zinc-900/50">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-white text-sm">
                      Slide {currentSlide + 1}: {slide.type}
                    </CardTitle>
                    {!editing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={startEdit}
                        className="border-zinc-800 text-zinc-400 hover:text-white"
                      >
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(false)}
                          className="text-zinc-500"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={saveEdit}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Save
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editing ? (
                      <>
                        <div>
                          <label className="mb-1 block text-xs text-zinc-500">Title</label>
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-zinc-500">Content (Markdown)</label>
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="bg-zinc-950 border-zinc-800 text-zinc-200 min-h-[250px] font-mono text-xs"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold text-white">{slide.title}</h3>
                        <p className="text-zinc-400">{slide.subtitle}</p>
                        <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                          {slide.content}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ---- EXPORT TAB ---- */}
        <TabsContent value="export">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-zinc-800/50 bg-zinc-900/50 hover:border-emerald-500/30 transition-colors cursor-pointer group">
              <CardContent className="pt-6 text-center space-y-3" onClick={() => exportPitch('html')}>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                  <Globe className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white">HTML Presentation</h3>
                <p className="text-xs text-zinc-500">
                  Self-contained HTML file. Open in any browser. Keyboard navigation included.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={exporting}
                  className="border-zinc-800 text-zinc-400 hover:text-white"
                >
                  <Download className="mr-1.5 h-3 w-3" />
                  Download .html
                </Button>
              </CardContent>
            </Card>

            <Card className="border-zinc-800/50 bg-zinc-900/50 hover:border-blue-500/30 transition-colors cursor-pointer group">
              <CardContent className="pt-6 text-center space-y-3" onClick={() => exportPitch('markdown')}>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white">Markdown</h3>
                <p className="text-xs text-zinc-500">
                  For email, documents, or pasting into proposals.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={exporting}
                  className="border-zinc-800 text-zinc-400 hover:text-white"
                >
                  <Download className="mr-1.5 h-3 w-3" />
                  Download .md
                </Button>
              </CardContent>
            </Card>

            <Card className="border-zinc-800/50 bg-zinc-900/50 hover:border-purple-500/30 transition-colors cursor-pointer group">
              <CardContent className="pt-6 text-center space-y-3" onClick={() => exportPitch('json')}>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <Code className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white">JSON (VisioPitch)</h3>
                <p className="text-xs text-zinc-500">
                  Copy structured data for rendering in VisioPitch.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={exporting}
                  className="border-zinc-800 text-zinc-400 hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3 w-3" />
                      Copy JSON
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
