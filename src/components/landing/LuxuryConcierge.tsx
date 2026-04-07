"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Crown, Globe, Plane, Shield } from "lucide-react";
import { JessAvatar } from "./JessAvatar";
import LanguageAdapter from "./LanguageAdapter";
import CrossBorderLogistics from "./CrossBorderLogistics";

const targetMarkets = [
  {
    city: "Lagos",
    country: "Nigeria",
    code: "NG",
    population: "9,800+ HNW",
    note: "Africa's largest HNW concentration. English/Pidgin/Yoruba/Igbo.",
    routes: "Apapa Port via Höegh RoRo · 12-14 day transit",
    flag: "🇳🇬",
  },
  {
    city: "Lubumbashi",
    country: "DR Congo",
    code: "CD",
    population: "Mining wealth hub",
    note: "Katanga copper & cobalt elite. French / Lingala / Swahili.",
    routes: "Walvis Bay → Kasumbalesa overland · 10-14 days",
    flag: "🇨🇩",
  },
  {
    city: "Luanda",
    country: "Angola",
    code: "AO",
    population: "6,400+ HNW",
    note: "Oil and diamond wealth. Portuguese essential.",
    routes: "Luanda Port direct · 14-18 day transit",
    flag: "🇦🇴",
  },
  {
    city: "Nairobi",
    country: "Kenya",
    code: "KE",
    population: "8,500+ HNW",
    note: "East Africa's financial centre. English/Swahili.",
    routes: "Mombasa Port → Nairobi · 18-21 days",
    flag: "🇰🇪",
  },
  {
    city: "Accra",
    country: "Ghana",
    code: "GH",
    population: "3,200+ HNW",
    note: "Stable democracy, growing fintech wealth. English/Twi.",
    routes: "Tema Port direct · 14-16 day transit",
    flag: "🇬🇭",
  },
  {
    city: "Abidjan",
    country: "Côte d'Ivoire",
    code: "CI",
    population: "2,800+ HNW",
    note: "Francophone West Africa hub. French essential.",
    routes: "Abidjan Port direct · 14-18 day transit",
    flag: "🇨🇮",
  },
];

const trustPillars = [
  {
    icon: Shield,
    title: "Bonded Escrow",
    body: "Every payment routed through a SA bonded escrow account. Zero direct dealer wires. Buyer protected at every stage.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    body: "Jess speaks 7 languages including French, Portuguese, Swahili, Lingala, Pidgin, Arabic. Native-speaker handover team for every region.",
  },
  {
    icon: Crown,
    title: "Premium SA Network",
    body: "Direct relationships with Daytona, Pharoah, Crown Cars, Sandown, Naked Performance, and the rest of SA's premium dealer network.",
  },
  {
    icon: Plane,
    title: "Door-to-Door",
    body: "From Sandton showroom inspection to handover at your residence in Lagos, Lubumbashi, or Luanda. End-to-end concierge.",
  },
];

export default function LuxuryConcierge() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.05 });

  return (
    <section id="concierge" className="relative py-32 bg-[#020c07] overflow-hidden">
      {/* Africa map glow background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/generated/africa-map-glow.png"
          alt=""
          fill
          className="object-cover opacity-25 mix-blend-screen pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020c07] via-transparent to-[#020c07]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020c07] via-transparent to-[#020c07]" />
      </div>
      <div className="absolute inset-0 bg-grid opacity-15 z-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="section-label">African Luxury Concierge</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-400/80 border border-amber-500/30 bg-amber-500/[0.06] px-2 py-0.5">
              UHNW TIER
            </span>
          </div>
          <h2 className="mt-4 heading-xl max-w-4xl">
            Sandton inventory.
            <br />
            <span className="text-emerald-400">African doorstep.</span>
          </h2>
          <div className="mt-6 flex items-start gap-3 max-w-2xl">
            <div className="mt-1.5 h-px w-8 bg-emerald-500/40 shrink-0" />
            <p className="text-[15px] leading-relaxed text-white/50">
              <span className="text-emerald-400/80 font-medium">South Africans supplying Africans.</span>{" "}
              South Africa is the gateway to luxury automotive on the African continent. We
              connect SA&apos;s premium dealer network with high-net-worth buyers across Lagos,
              Lubumbashi, Luanda, Nairobi, Accra, and Abidjan &mdash; multilingual concierge,
              bonded escrow, end-to-end logistics, white-glove handover at your residence.
              No matter where you are. No matter what language you speak.
            </p>
          </div>

          <div className="mt-4 max-w-2xl pl-11">
            <p className="text-[13px] leading-relaxed text-white/35">
              Knight Frank Wealth Report 2025 forecasts <span className="text-emerald-400/70">UHNWI growth +119% in Côte d&apos;Ivoire, +90% in Nigeria, +40% in Zambia</span> over the next 5 years. The wealth is exploding in exactly the markets that lack premium dealer infrastructure. SA dealers can serve them &mdash; if they can speak the language and ship the vehicle. Visio Concierge does both.
            </p>
          </div>
        </motion.div>

        {/* The hero story — multilingual greeting + Jess */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16 grid lg:grid-cols-[auto_1fr] gap-8 items-start"
        >
          {/* Jess + capabilities */}
          <div className="space-y-6">
            <div className="border border-white/[0.06] bg-white/[0.02] p-6 flex items-center gap-4">
              <JessAvatar size={64} />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/70">
                  Jess &middot; Concierge Agent
                </div>
                <p className="text-[13px] text-white/60 mt-1">
                  Speaks 7 languages.
                  <br />
                  Knows every dealer in SA.
                </p>
              </div>
            </div>

            <div className="border border-white/[0.06] bg-white/[0.02] p-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/60">
                Currencies Accepted
              </span>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {["USD", "EUR", "ZAR", "NGN", "XOF", "AOA"].map((c) => (
                  <div
                    key={c}
                    className="font-mono text-[10px] text-white/50 border border-white/[0.06] py-2 text-center"
                  >
                    {c}
                  </div>
                ))}
              </div>
              <p className="font-mono text-[9px] text-white/25 mt-3 leading-relaxed">
                Quoted in your preferred currency. Settled via bonded escrow.
              </p>
            </div>
          </div>

          {/* Language adapter */}
          <LanguageAdapter />
        </motion.div>

        {/* Cross-border logistics flow */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-12"
        >
          <CrossBorderLogistics />
        </motion.div>

        {/* Target markets grid */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-20"
        >
          <div className="text-center mb-10">
            <span className="section-label">Active Markets</span>
            <h3 className="mt-3 heading-md">
              Where we deliver.
            </h3>
          </div>

          <div className="grid gap-px md:grid-cols-2 lg:grid-cols-3 bg-white/[0.04] border border-white/[0.06]">
            {targetMarkets.map((m, i) => (
              <motion.div
                key={m.city}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const }}
                className="bg-[#020c07] p-7 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-2xl">{m.flag}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-500/40">
                    {m.code}
                  </span>
                </div>
                <h4 className="text-xl font-extralight text-white">
                  {m.city}
                  <span className="text-white/40 text-sm font-mono ml-2">{m.country}</span>
                </h4>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/60 mt-2">
                  {m.population}
                </p>
                <p className="text-[12px] text-white/40 mt-3 leading-relaxed">
                  {m.note}
                </p>
                <div className="mt-4 pt-4 border-t border-white/[0.04]">
                  <p className="font-mono text-[10px] text-white/30 leading-relaxed">
                    {m.routes}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust pillars + luxury car gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-20 grid lg:grid-cols-2 gap-12 items-start"
        >
          {/* Left — trust pillars */}
          <div>
            <span className="section-label">Why Visio Concierge</span>
            <h3 className="mt-3 heading-md max-w-md">
              Trust earned in <span className="text-emerald-400">every detail</span>.
            </h3>
            <div className="mt-8 space-y-px bg-white/[0.04] border border-white/[0.06]">
              {trustPillars.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-[#020c07] p-6 flex items-start gap-4"
                >
                  <p.icon className="h-5 w-5 text-emerald-500/50 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="text-[14px] font-medium text-white/80">{p.title}</h5>
                    <p className="text-[12px] leading-relaxed text-white/35 mt-1">
                      {p.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right — luxury car gallery */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { src: "/generated/concierge-rangerover.png", label: "Range Rover" },
              { src: "/generated/concierge-gwagon.png", label: "G-Class" },
              { src: "/generated/concierge-bentley.png", label: "Bentley" },
              { src: "/generated/concierge-rolls.png", label: "Rolls-Royce" },
            ].map((car, i) => (
              <motion.div
                key={car.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1] as const,
                }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="relative aspect-[4/3] overflow-hidden border border-white/[0.06] bg-white/[0.02] cursor-pointer group"
              >
                <Image
                  src={car.src}
                  alt={car.label}
                  fill
                  className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020c07] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">
                    {car.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Logistics & port imagery + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-20"
        >
          <div className="relative h-[280px] overflow-hidden border border-white/[0.06]">
            <Image
              src="/generated/roro-ship.png"
              alt="RoRo car carrier at port"
              fill
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#020c07] via-[#020c07]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020c07] to-transparent" />

            <div className="absolute inset-0 flex items-center px-10 md:px-16">
              <div className="max-w-xl">
                <span className="section-label">Concierge Direct Line</span>
                <h3 className="mt-3 text-2xl md:text-3xl font-extralight tracking-tight text-white">
                  Speak to a concierge in your language.
                </h3>
                <p className="mt-3 text-[14px] text-white/50 max-w-md">
                  WhatsApp the Visio Auto Concierge desk. Available 24/7 in EN, FR, PT, SW, AR.
                  Initial inventory match within 60 minutes.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href="https://wa.me/27000000000?text=Hi%20Jess%20—%20I%27m%20interested%20in%20the%20Visio%20Concierge%20service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-emerald-500/40 bg-emerald-500/[0.08] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400 hover:bg-emerald-500/[0.15] transition-colors"
                  >
                    WhatsApp Concierge →
                  </a>
                  <a
                    href="/papers/african-luxury-mobility"
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors border-b border-white/20 pb-1"
                  >
                    Read the African Luxury Mobility Report
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
