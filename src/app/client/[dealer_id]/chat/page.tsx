"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DealerInfo {
  id: string;
  name: string;
  brands: string[];
  area: string;
  tier: string;
}

// ---------------------------------------------------------------------------
// Quick Actions (dealer-scoped)
// ---------------------------------------------------------------------------

const dealerQuickActions = [
  { label: "Show my latest leads", icon: "👥" },
  { label: "Market insights for my brands", icon: "📈" },
  { label: "Generate this week's brief", icon: "📋" },
  { label: "What signals are in my area?", icon: "📡" },
];

// ---------------------------------------------------------------------------
// Inline text rendering (safe React elements)
// ---------------------------------------------------------------------------

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const m = match[0];
    if (m.startsWith("**") && m.endsWith("**"))
      parts.push(<strong key={match.index} className="font-semibold text-white">{m.slice(2, -2)}</strong>);
    else if (m.startsWith("*") && m.endsWith("*"))
      parts.push(<em key={match.index}>{m.slice(1, -1)}</em>);
    else if (m.startsWith("`") && m.endsWith("`"))
      parts.push(<code key={match.index} className="rounded bg-zinc-800 px-1 py-0.5 text-xs text-emerald-400">{m.slice(1, -1)}</code>);
    lastIndex = match.index + m.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function TextBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed">
      {lines.map((line, li) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("### "))
          return <h3 key={li} className="mt-3 mb-1 text-base font-semibold text-white">{renderInline(trimmed.slice(4))}</h3>;
        if (trimmed.startsWith("## "))
          return <h2 key={li} className="mt-4 mb-1 text-lg font-semibold text-white">{renderInline(trimmed.slice(3))}</h2>;
        if (trimmed.startsWith("# "))
          return <h1 key={li} className="mt-4 mb-2 text-xl font-bold text-white">{renderInline(trimmed.slice(2))}</h1>;
        if (trimmed.startsWith("- "))
          return <div key={li} className="ml-1 flex gap-2"><span className="text-emerald-500">&#x2022;</span><span>{renderInline(trimmed.slice(2))}</span></div>;
        if (!trimmed) return <br key={li} />;
        return <p key={li}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function MessageContent({ parts }: { parts: Array<{ type: string; text?: string; state?: string; [key: string]: unknown }> }) {
  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (part.type === "text" && part.text) {
          return <TextBlock key={i} text={part.text} />;
        }
        if (part.type.startsWith("tool-")) {
          const toolName = part.type.replace("tool-", "").replace(/_/g, " ");
          const state = part.state as string | undefined;
          const isRunning = state === "call" || state === "input-streaming" || state === "partial-call";
          return (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs">
              {isRunning ? (
                <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
              ) : (
                <span className="text-emerald-400">&#x2714;</span>
              )}
              <span className="text-zinc-400">{isRunning ? "Running" : "Used"}: </span>
              <span className="text-zinc-300">{toolName}</span>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function DealerChatPage({
  params,
}: {
  params: Promise<{ dealer_id: string }>;
}) {
  const { dealer_id } = use(params);
  const [dealer, setDealer] = useState<DealerInfo | null>(null);

  // Fetch dealer info
  useEffect(() => {
    fetch(`/api/dealers?id=${dealer_id}`)
      .then((r) => r.json())
      .then((data) => {
        const d = Array.isArray(data) ? data[0] : data;
        if (d) setDealer(d);
      })
      .catch(() => {});
  }, [dealer_id]);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat/dealer",
      body: { dealer_id },
    }),
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status !== "ready";

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      if (isNearBottom) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  function handleSubmit(text?: string) {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    sendMessage({ text: msg });
    setInput("");
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800/50 px-4 py-3">
        <Link
          href={`/client/${dealer_id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
          <Bot className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">
            {dealer?.name ? `${dealer.name} AI Assistant` : "AI Assistant"}
          </h1>
          <p className="text-[11px] text-zinc-500">
            {dealer?.brands?.join(", ") || "Loading..."} &middot;{" "}
            {dealer?.area || ""}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="mx-auto flex max-w-lg flex-col items-center py-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20"
            >
              <Bot className="h-7 w-7 text-emerald-400" />
            </motion.div>
            <h2 className="mb-2 text-base font-semibold text-white">
              {dealer?.name ? `Welcome, ${dealer.name}` : "AI Assistant"}
            </h2>
            <p className="mb-6 text-center text-sm text-zinc-500">
              Ask me anything about your leads, market insights, or dealership
              performance.
            </p>
            <div className="grid w-full gap-2">
              {dealerQuickActions.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => handleSubmit(action.label)}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-left text-sm text-zinc-400 transition-colors hover:border-emerald-500/30 hover:text-zinc-200"
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
                      <Bot className="h-4 w-4 text-emerald-400" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-4 py-3",
                      message.role === "user"
                        ? "bg-zinc-800 text-zinc-100"
                        : "bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800/50"
                    )}
                  >
                    <MessageContent parts={message.parts as Array<{ type: string; text?: string; state?: string; [key: string]: unknown }>} />
                  </div>
                  {message.role === "user" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-zinc-700/50">
                      <User className="h-4 w-4 text-zinc-400" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
                  <Bot className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-3 ring-1 ring-zinc-800/50">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                  <span className="text-xs text-zinc-500">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800/50 px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="mx-auto flex max-w-2xl items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask about your leads, market, or performance..."
            disabled={isLoading}
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-11 w-11 shrink-0 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-30"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
