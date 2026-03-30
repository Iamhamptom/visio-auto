"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  User,
  Loader2,
  Sparkles,
  Wrench,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Quick Actions
// ---------------------------------------------------------------------------

const quickActions = [
  { label: "Give me 100 leads", icon: "🛒" },
  { label: "Onboard a new dealer", icon: "🤝" },
  { label: "What's happening in Sandton?", icon: "📡" },
  { label: "Show me today's hot signals", icon: "🔥" },
  { label: "Generate a market brief", icon: "📊" },
  { label: "What's the market looking like?", icon: "📈" },
];

// ---------------------------------------------------------------------------
// Message Renderer
// ---------------------------------------------------------------------------

function TextBlock({ text }: { text: string }) {
  // Render markdown-like text safely without dangerouslySetInnerHTML
  const lines = text.split("\n");
  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed">
      {lines.map((line, li) => {
        const trimmed = line.trim();
        // Headings
        if (trimmed.startsWith("### "))
          return <h3 key={li} className="mt-3 mb-1 text-base font-semibold text-white">{renderInline(trimmed.slice(4))}</h3>;
        if (trimmed.startsWith("## "))
          return <h2 key={li} className="mt-4 mb-1 text-lg font-semibold text-white">{renderInline(trimmed.slice(3))}</h2>;
        if (trimmed.startsWith("# "))
          return <h1 key={li} className="mt-4 mb-2 text-xl font-bold text-white">{renderInline(trimmed.slice(2))}</h1>;
        // Bullet points
        if (trimmed.startsWith("- "))
          return <div key={li} className="ml-1 flex gap-2"><span className="text-emerald-500">&#x2022;</span><span>{renderInline(trimmed.slice(2))}</span></div>;
        // Empty line
        if (!trimmed) return <br key={li} />;
        // Normal text
        return <p key={li}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Split on bold, italic, and code patterns and render as React elements
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const m = match[0];
    if (m.startsWith("**") && m.endsWith("**")) {
      parts.push(<strong key={match.index} className="font-semibold text-white">{m.slice(2, -2)}</strong>);
    } else if (m.startsWith("*") && m.endsWith("*")) {
      parts.push(<em key={match.index}>{m.slice(1, -1)}</em>);
    } else if (m.startsWith("`") && m.endsWith("`")) {
      parts.push(<code key={match.index} className="rounded bg-zinc-800 px-1 py-0.5 text-xs text-emerald-400">{m.slice(1, -1)}</code>);
    }
    lastIndex = match.index + m.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function MessageContent({ parts }: { parts: Array<{ type: string; text?: string; toolName?: string; state?: string; [key: string]: unknown }> }) {
  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (part.type === "text" && part.text) {
          return <TextBlock key={i} text={part.text} />;
        }

        // Tool invocation parts (tool-xxx pattern)
        if (part.type.startsWith("tool-")) {
          const toolName = part.type.replace("tool-", "").replace(/_/g, " ");
          const state = part.state as string | undefined;
          const isRunning = state === "call" || state === "input-streaming" || state === "partial-call";

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs"
            >
              {isRunning ? (
                <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
              ) : (
                <Wrench className="h-3 w-3 text-emerald-400" />
              )}
              <span className="font-medium text-zinc-400">
                {isRunning ? "Running" : "Used"}:{" "}
              </span>
              <span className="text-zinc-300">{toolName}</span>
            </motion.div>
          );
        }

        return null;
      })}
    </div>
  );
}

// Markdown rendering handled by TextBlock + renderInline above (safe React elements, no innerHTML)

// ---------------------------------------------------------------------------
// Chat Page
// ---------------------------------------------------------------------------

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const isLoading = status !== "ready";

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const isNearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      if (isNearBottom) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }
    }
  }, [messages]);

  // Track scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setShowScrollButton(
        el.scrollHeight - el.scrollTop - el.clientHeight > 200
      );
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  function handleSubmit(text?: string) {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    sendMessage({ text: msg });
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function scrollToBottom() {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800/50 px-4 py-3 lg:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
          <Bot className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">
            Visio Auto AI Agent
          </h1>
          <p className="text-[11px] text-zinc-500">
            22 tools &middot; Claude Sonnet 4.6 &middot;{" "}
            {isLoading ? (
              <span className="text-emerald-400">Thinking...</span>
            ) : (
              <span className="text-zinc-500">Ready</span>
            )}
          </p>
        </div>
        <div className="ml-auto">
          <Sparkles className="h-4 w-4 text-emerald-500/40" />
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto px-4 py-4 lg:px-6"
      >
        {messages.length === 0 ? (
          <EmptyState onAction={handleSubmit} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
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
                    <MessageContent parts={message.parts as Array<{ type: string; text?: string; toolName?: string; state?: string; [key: string]: unknown }>} />
                  </div>

                  {message.role === "user" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-zinc-700/50">
                      <User className="h-4 w-4 text-zinc-400" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
                  <Bot className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-3 ring-1 ring-zinc-800/50">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                  />
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Scroll to bottom */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToBottom}
              className="fixed bottom-28 right-8 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 shadow-lg ring-1 ring-zinc-700 hover:text-white"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800/50 bg-zinc-950 px-4 py-3 lg:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="mx-auto flex max-w-3xl items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about leads, signals, market data, dealers..."
              disabled={isLoading}
              rows={1}
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 pr-12 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50"
            />
          </div>
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
        <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-zinc-600">
          Visio Auto AI uses Claude Sonnet 4.6. Responses are based on live
          platform data.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ onAction }: { onAction: (text: string) => void }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-16">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20"
      >
        <Bot className="h-8 w-8 text-emerald-400" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-2 text-lg font-semibold text-white"
      >
        Visio Auto AI Agent
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8 max-w-md text-center text-sm text-zinc-500"
      >
        Your AI-powered dealership intelligence assistant. Search leads, analyse
        signals, generate outreach, check market data, and more.
      </motion.p>

      <div className="grid w-full gap-2 sm:grid-cols-2">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            onClick={() => onAction(action.label)}
            className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-left text-sm text-zinc-400 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-zinc-200"
          >
            <span className="text-base">{action.icon}</span>
            <span>{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
