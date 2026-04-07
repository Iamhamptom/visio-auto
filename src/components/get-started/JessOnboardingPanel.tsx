"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles, Check, ChevronDown } from "lucide-react";
import { JessAvatar } from "@/components/landing/JessAvatar";

/**
 * JessOnboardingPanel — the conversational layer on /get-started.
 *
 * Sits ABOVE the existing static form. Jess greets the user, asks for the
 * key fields, fetches public intel about their dealership when she has a
 * name, summarises what she found, and pre-fills the form via onUpdateForm.
 *
 * The user can either:
 *   - Let Jess do it (default — recommended path)
 *   - Click "Skip and fill the form myself" → minimises the panel
 *
 * Both paths feed the same form state managed by the parent get-started
 * page. Jess pre-filling is just a value-add — the form still works
 * standalone.
 */

interface FormFields {
  dealership_name: string;
  principal_name: string;
  email: string;
  phone: string;
  brands_sold: string;
  area: string;
}

type Stage =
  | "greeting"
  | "asking"
  | "researching"
  | "summary"
  | "complete";

interface Message {
  role: "jess" | "user";
  content: string;
  stage?: Stage;
}

interface JessOnboardingPanelProps {
  currentForm: FormFields;
  onUpdateForm: (field: keyof FormFields, value: string) => void;
  onSuggestTier?: (tier: string) => void;
  onComplete?: () => void;
}

export default function JessOnboardingPanel({
  currentForm,
  onUpdateForm,
  onSuggestTier,
  onComplete,
}: JessOnboardingPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [intelFetched, setIntelFetched] = useState(false);
  const [stage, setStage] = useState<Stage>("greeting");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Send greeting on mount
  useEffect(() => {
    if (messages.length === 0) {
      void sendToJess(undefined, []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendToJess(
    userMessage: string | undefined,
    historyOverride?: Message[]
  ) {
    setError(null);
    setLoading(true);

    const history = historyOverride ?? messages;

    try {
      const res = await fetch("/api/jess/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: history.map((m) => ({ role: m.role, content: m.content })),
          last_user_message: userMessage,
          current_form: currentForm,
          intel_already_fetched: intelFetched,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(
          (j as { error?: string }).error ?? "Jess could not respond"
        );
      }

      const data = (await res.json()) as {
        reply: string;
        stage: Stage;
        form_updates?: Partial<FormFields>;
        suggested_tier?: string;
        intel?: {
          name: string;
          city: string | null;
          brands_sold: string[];
          year_founded: number | null;
          found_anything: boolean;
        };
      };

      // Apply form updates from this turn
      if (data.form_updates) {
        for (const [field, value] of Object.entries(data.form_updates)) {
          if (value && typeof value === "string") {
            onUpdateForm(field as keyof FormFields, value);
          }
        }
      }

      // If intel came back, mark fetched + populate brands/area from it
      if (data.intel) {
        setIntelFetched(true);
        if (data.intel.city && !currentForm.area) {
          onUpdateForm("area", data.intel.city);
        }
        if (
          data.intel.brands_sold.length > 0 &&
          !currentForm.brands_sold
        ) {
          onUpdateForm("brands_sold", data.intel.brands_sold.join(", "));
        }
      }

      // Suggested tier
      if (data.suggested_tier && onSuggestTier) {
        onSuggestTier(data.suggested_tier);
      }

      // Update stage + push Jess's reply into the chat
      setStage(data.stage);
      setMessages((prev) => [
        ...(userMessage
          ? [...prev, { role: "user" as const, content: userMessage }]
          : prev),
        { role: "jess", content: data.reply, stage: data.stage },
      ]);

      // If we just got intel, automatically tell Jess about it on the next turn
      if (data.intel && data.stage === "researching") {
        // Brief pause then send the intel back as a tagged message
        setTimeout(() => {
          void sendToJess(`[INTEL_RESULTS]${JSON.stringify(data.intel)}`);
        }, 800);
      }

      if (data.stage === "complete" && onComplete) {
        onComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);
    await sendToJess(userMessage, [
      ...messages,
      { role: "user", content: userMessage },
    ]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  if (minimized) {
    return (
      <motion.button
        type="button"
        onClick={() => setMinimized(false)}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 w-full border border-emerald-500/30 bg-emerald-500/[0.05] hover:bg-emerald-500/[0.1] transition-colors p-4 flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <JessAvatar size={28} />
          <span className="text-[13px] text-white/70">
            <span className="text-emerald-400">Jess</span> can fill this form for
            you in 30 seconds. Click to bring her back.
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-emerald-400/60 -rotate-90" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
      className="mb-10 border border-emerald-500/25 bg-[#020c07] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-emerald-500/[0.04]">
        <div className="flex items-center gap-3">
          <JessAvatar size={36} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-white">Jess</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-emerald-400/80 border border-emerald-500/30 bg-emerald-500/[0.06] px-1.5 py-0.5">
                AI Onboarding
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/60">
                {stage === "researching" ? "Researching your dealership..." : "Online · ready to help"}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMinimized(true)}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors"
        >
          Skip — fill myself
        </button>
      </div>

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="px-5 py-5 max-h-[360px] overflow-y-auto space-y-4 scrollbar-thin"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "jess" && (
                <div className="shrink-0 mr-3 mt-0.5">
                  <JessAvatar size={28} showBadge={false} />
                </div>
              )}
              <div
                className={`max-w-[85%] px-4 py-3 text-[13px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-white/[0.06] text-white/85 border border-white/[0.08]"
                    : "bg-emerald-500/[0.06] text-white/80 border border-emerald-500/20"
                }`}
              >
                {/* Show a marker if Jess is mid-research and the next msg is intel-driven */}
                {msg.content
                  .replace(/^\[INTEL_RESULTS\][\s\S]*$/, "(researching...)")}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Researching indicator */}
        {stage === "researching" && loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-emerald-400/70"
          >
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="font-mono text-[11px]">
              Looking up your dealership online...
            </span>
          </motion.div>
        )}

        {/* Generic loading dots */}
        {loading && stage !== "researching" && (
          <div className="flex items-center gap-2 text-white/30">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="font-mono text-[11px]">Jess is thinking...</span>
          </div>
        )}

        {error && (
          <div className="border-l-[2px] border-l-red-500/40 pl-3 py-1">
            <p className="text-[12px] text-red-400/80">{error}</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] px-4 py-3 bg-white/[0.01] flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            stage === "complete"
              ? "Continue to your details below ↓"
              : loading
                ? "Jess is replying..."
                : "Tell Jess about your dealership..."
          }
          disabled={loading || stage === "complete"}
          className="flex-1 bg-transparent border-none outline-none text-[14px] text-white/85 placeholder:text-white/25 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !input.trim() || stage === "complete"}
          className="flex items-center justify-center h-9 w-9 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/[0.06] disabled:text-white/30 text-[#030f0a] transition-colors"
          aria-label="Send"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Footer hint when complete */}
      {stage === "complete" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-white/[0.06] px-5 py-3 bg-emerald-500/[0.04] flex items-center gap-2"
        >
          <Check className="h-4 w-4 text-emerald-400" />
          <span className="text-[12px] text-emerald-400/80">
            Your details are pre-filled below — review and click Continue.
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
