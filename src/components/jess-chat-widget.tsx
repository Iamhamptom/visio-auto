'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { MessageCircle, X, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'Find me a bakkie under R450k',
  "How's the bakkie market doing?",
  "I'm a dealer — show me my leads",
  'What makes Visio Auto different?',
]

function extractText(msg: { content?: unknown; parts?: Array<{ type?: string; text?: string }> }): string {
  if (typeof msg.content === 'string') return msg.content
  if (Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p) => p && p.type === 'text' && typeof p.text === 'string')
      .map((p) => p.text as string)
      .join('')
  }
  if (Array.isArray(msg.content)) {
    return (msg.content as Array<{ type?: string; text?: string }>)
      .filter((p) => p && p.type === 'text' && typeof p.text === 'string')
      .map((p) => p.text as string)
      .join('')
  }
  return ''
}

export function JessChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const chat = useChat({
    transport: new DefaultChatTransport({ api: '/api/jess/chat' }),
  }) as unknown as {
    messages: Array<{ id: string; role: string; content?: unknown; parts?: Array<{ type?: string; text?: string }> }>
    sendMessage?: (msg: { text: string }) => void
    append?: (msg: { role: string; content: string }) => void
    status?: string
    isLoading?: boolean
  }

  const messages = chat.messages ?? []
  const isStreaming = chat.status === 'streaming' || chat.status === 'submitted' || chat.isLoading === true

  const send = (text: string) => {
    const t = text.trim()
    if (!t) return
    if (chat.sendMessage) chat.sendMessage({ text: t })
    else if (chat.append) chat.append({ role: 'user', content: t })
    setInput('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    send(input)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 24 * 4 + 16)}px`
  }, [input])

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Chat with Jess"
          className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-full bg-emerald-400 px-5 py-4 text-emerald-950 font-semibold text-sm shadow-2xl shadow-emerald-400/40 transition-all hover:scale-105 hover:shadow-emerald-400/60 ring-2 ring-emerald-300/40 ring-offset-2 ring-offset-background"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-emerald-950/90 text-emerald-300">
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-300 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-300" />
          </span>
          <span className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-[11px] uppercase tracking-wider opacity-70">Ask</span>
            <span className="text-base font-bold">Jess</span>
          </span>
        </button>
      )}

      {open && (
        <div
          className={cn(
            'fixed z-[60] flex flex-col border border-emerald-500/20 bg-background/95 backdrop-blur-xl shadow-2xl shadow-emerald-500/10',
            'inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[640px] sm:w-[400px] sm:rounded-2xl'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-transparent px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-emerald-950 font-bold text-base">
                J
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-background" />
              </div>
              <div>
                <div className="text-sm font-bold">Jess</div>
                <div className="text-[11px] text-emerald-400/80 font-mono uppercase tracking-wider">SA car expert · online</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-foreground">
                  Howzit. I&apos;m Jess — your AI car expert for SA. Ask me about any car, dealer, or the market. I can find you wheels, qualify leads, book test drives, the lot.
                </p>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-left text-xs text-foreground hover:bg-muted"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((m) => {
                  const text = extractText(m)
                  if (!text) return null
                  const isUser = m.role === 'user'
                  return (
                    <div
                      key={m.id}
                      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap',
                          isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        )}
                      >
                        {text}
                      </div>
                    </div>
                  )
                })}
                {isStreaming && (
                  <div className="text-xs text-muted-foreground">Jess is typing…</div>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                placeholder="Ask Jess anything…"
                className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
