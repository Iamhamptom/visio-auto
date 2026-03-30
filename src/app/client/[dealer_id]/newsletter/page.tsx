"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  Mail,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Loader2,
  FileText,
  Eye,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NewsletterEntry {
  id: string
  type: string
  subject: string
  generated_at: string
  sent_at: string | null
  email_sent: boolean
  whatsapp_sent: boolean
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function NewsletterArchivePage({
  params,
}: {
  params: Promise<{ dealer_id: string }>
}) {
  const { dealer_id } = use(params)
  const [newsletters, setNewsletters] = useState<NewsletterEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedHtml, setSelectedHtml] = useState<string | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  useEffect(() => {
    async function fetchNewsletters() {
      try {
        const res = await fetch(
          `/api/newsletter/generate?dealer_id=${dealer_id}&list=true`
        )
        if (res.ok) {
          const data = await res.json()
          setNewsletters(data.newsletters || [])
        }
      } catch (err) {
        console.error("Failed to fetch newsletters:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchNewsletters()
  }, [dealer_id])

  const viewNewsletter = async (id: string) => {
    setSelectedId(id)
    setViewLoading(true)
    try {
      const res = await fetch(`/api/newsletter/generate?id=${id}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedHtml(data.html || null)
      }
    } catch (err) {
      console.error("Failed to fetch newsletter:", err)
    } finally {
      setViewLoading(false)
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

  const latestNewsletter = newsletters[0]

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-emerald-900/40 bg-[#09090b]/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/client/${dealer_id}`}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-500" />
              <h1 className="font-mono text-sm font-bold tracking-wider text-emerald-400 uppercase">
                Intelligence Briefs
              </h1>
            </div>
          </div>
          <span className="font-mono text-[11px] text-zinc-600">
            {newsletters.length} briefs
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : selectedHtml ? (
          /* Newsletter viewer */
          <div>
            <button
              onClick={() => {
                setSelectedHtml(null)
                setSelectedId(null)
              }}
              className="mb-3 flex items-center gap-1.5 font-mono text-xs text-emerald-500 hover:text-emerald-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to archive
            </button>
            <div
              className="overflow-hidden rounded border border-zinc-800"
              dangerouslySetInnerHTML={{ __html: selectedHtml }}
            />
          </div>
        ) : (
          <>
            {/* Latest Brief Banner */}
            {latestNewsletter && (
              <div className="overflow-hidden rounded-lg border border-emerald-900/40 bg-gradient-to-r from-emerald-950/40 to-[#0d1117]">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                        Latest Brief
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                      {latestNewsletter.subject}
                    </h2>
                    <p className="mt-1 font-mono text-xs text-zinc-500">
                      {formatDate(latestNewsletter.generated_at)}
                      {latestNewsletter.email_sent && " | Emailed"}
                      {latestNewsletter.whatsapp_sent && " | WhatsApp"}
                    </p>
                  </div>
                  <button
                    onClick={() => viewNewsletter(latestNewsletter.id)}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-mono text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
                  >
                    <Eye className="h-4 w-4" />
                    View Brief
                  </button>
                </div>
              </div>
            )}

            {/* Archive List */}
            <div className="space-y-1.5">
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                All Briefs
              </h3>
              {newsletters.length > 0 ? (
                newsletters.map((nl) => (
                  <button
                    key={nl.id}
                    onClick={() => viewNewsletter(nl.id)}
                    className="flex w-full items-center gap-3 rounded border border-zinc-800/50 bg-[#0d1117] px-4 py-3 text-left transition-colors hover:border-emerald-900/40"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-zinc-600" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-200">
                        {nl.subject}
                      </p>
                      <div className="mt-0.5 flex items-center gap-3 font-mono text-[11px] text-zinc-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(nl.generated_at)}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] ${
                            nl.type === "weekly"
                              ? "bg-emerald-900/30 text-emerald-500"
                              : "bg-amber-900/30 text-amber-500"
                          }`}
                        >
                          {nl.type === "weekly" ? "Weekly Brief" : "Alert"}
                        </span>
                        {nl.email_sent && (
                          <span className="text-zinc-600">
                            <Mail className="inline h-3 w-3" /> Emailed
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-zinc-700" />
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center gap-2 rounded border border-zinc-800/50 bg-[#0d1117] py-12">
                  <Mail className="h-8 w-8 text-zinc-700" />
                  <p className="text-sm text-zinc-500">
                    No intelligence briefs yet
                  </p>
                  <p className="text-xs text-zinc-600">
                    Weekly briefs are generated every Monday at 7am
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {viewLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          </div>
        )}
      </main>
    </div>
  )
}
