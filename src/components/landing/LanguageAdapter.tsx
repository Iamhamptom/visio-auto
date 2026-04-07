"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Language adapter component — cycles through Jess's supported languages
 * showing how she greets buyers in their mother tongue.
 *
 * Used in LuxuryConcierge section to demonstrate multi-language capability.
 */

const greetings = [
  {
    lang: "English",
    code: "EN",
    greeting: "Hello, I'm Jess. How can I help you find your next car?",
    region: "Nigeria, Kenya, Ghana, SA",
  },
  {
    lang: "Français",
    code: "FR",
    greeting: "Bonjour, je suis Jess. Comment puis-je vous aider à trouver votre prochaine voiture?",
    region: "DRC, Côte d'Ivoire, Senegal, Cameroon",
  },
  {
    lang: "Português",
    code: "PT",
    greeting: "Olá, sou a Jess. Como posso ajudá-lo a encontrar o seu próximo carro?",
    region: "Angola, Mozambique",
  },
  {
    lang: "Kiswahili",
    code: "SW",
    greeting: "Habari, mimi ni Jess. Ninawezaje kukusaidia kupata gari lako lijalo?",
    region: "Kenya, Tanzania, DRC East",
  },
  {
    lang: "العربية",
    code: "AR",
    greeting: "مرحبا، أنا جيس. كيف يمكنني مساعدتك في العثور على سيارتك القادمة؟",
    region: "Egypt, Morocco, Tunisia",
    rtl: true,
  },
  {
    lang: "Pidgin",
    code: "NG",
    greeting: "How far, I be Jess. Wetin you wan find for motor?",
    region: "Nigeria",
  },
  {
    lang: "Lingala",
    code: "CD",
    greeting: "Mbote, nazali Jess. Nakoki kosalisa yo ndenge nini mpo na kozwa motuka na yo?",
    region: "DRC, Republic of Congo",
  },
];

export default function LanguageAdapter() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % greetings.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const current = greetings[index];

  return (
    <div className="border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* Header bar — language tabs */}
      <div className="flex items-center gap-px border-b border-white/[0.06] bg-white/[0.02] overflow-x-auto">
        {greetings.map((g, i) => (
          <button
            key={g.code}
            onClick={() => setIndex(i)}
            className={`shrink-0 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] transition-all ${
              i === index
                ? "bg-emerald-500/[0.08] text-emerald-400 border-b-[2px] border-emerald-500/40"
                : "text-white/30 hover:text-white/60 border-b-[2px] border-transparent"
            }`}
          >
            {g.code}
          </button>
        ))}
      </div>

      {/* Greeting content */}
      <div className="p-8 min-h-[180px]">
        <motion.div
          key={current.code}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-baseline justify-between mb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/70">
              {current.lang}
            </span>
            <span className="font-mono text-[9px] text-white/25">
              {current.region}
            </span>
          </div>

          <p
            className={`text-xl md:text-2xl font-extralight text-white/80 leading-relaxed ${
              current.rtl ? "text-right" : ""
            }`}
            dir={current.rtl ? "rtl" : "ltr"}
          >
            &ldquo;{current.greeting}&rdquo;
          </p>

          <div className="mt-6 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/50">
              Jess speaks 7 languages &middot; voice + text
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
