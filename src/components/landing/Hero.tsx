"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
} from "framer-motion";
import { Gauge, ArrowRight, CarFront, Globe, Zap, Settings, ShieldAlert, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const swapWords = [
  "Predict the Next Buyer.",
  "Shift the Metal.",
  "Dominate the Market.",
  "Beat the Competition."
];

const stats = [
  { label: "Dealerships Wired In", value: "329+", icon: CarFront },
  { label: "Predictive Signals", value: "23", icon: Crosshair },
  { label: "Regional Dialects", value: "6", icon: Globe },
  { label: "Lead Delivery Time", value: "< 30s", icon: Zap },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, 150]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % swapWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    },
    [mouseX, mouseY]
  );

  return (
    <section
      className="relative min-h-screen overflow-hidden pt-32 pb-20 bg-black"
      onMouseMove={handleMouseMove}
    >
      {/* Hyper-realistic Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/hero-car-green.png" 
          alt="Luxury Green Hypercar emerging from shadows" 
          fill
          priority
          className="object-cover object-center opacity-60 mix-blend-lighten pointer-events-none"
        />
        {/* Vignette & Bottom Fade */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
      </div>

      {/* Mouse-following telemetry scanner line */}
      <motion.div
        className="pointer-events-none absolute h-[2px] w-[800px] bg-emerald-500/40 blur-[2px] z-10"
        style={{
          y: springY,
          left: "50%",
          translateX: "-50%",
        }}
      />

      <motion.div
        style={{ y: parallaxY }}
        className="relative mx-auto max-w-7xl px-6 text-center"
      >
        {/* Badge */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <Badge className="mb-8 border-emerald-500/30 bg-black/60 backdrop-blur-md text-emerald-500 hover:bg-emerald-500/10 px-4 py-1.5 text-sm uppercase tracking-[0.2em] font-mono rounded-none border-l-2">
            <Gauge className="mr-2 h-4 w-4" />
            AUTOMOTIVE INTELLIGENCE TERMINAL
          </Badge>
        </motion.div>

        {/* Headline with word swap */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-5xl text-5xl font-black uppercase leading-[1.0] tracking-tighter text-white sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ textShadow: "0 10px 40px rgba(0,0,0,0.8)" }}
        >
          <span className="relative inline-block min-h-[1.2em]">
            <span className="sr-only">{swapWords[wordIndex]}</span>
            <span
              key={wordIndex}
              className="bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent inline-block animate-[fadeSwap_0.4s_cubic-bezier(0.87,0,0.13,1)]"
            >
              {swapWords[wordIndex]}
            </span>
          </span>
          <br />
          <span className="text-zinc-600">Before They Enter The Showroom.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-zinc-300 md:text-xl font-mono uppercase tracking-wider bg-black/40 backdrop-blur-sm p-4 border border-white/5"
        >
          We intercept highly qualified car buyers moments before they make a decision. Scored, verified, and pushed directly to your sales floor in <span className="text-emerald-500 font-bold">30 seconds</span>.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link href="/get-started">
            <Button
              size="lg"
              className="h-14 gap-2.5 bg-emerald-600 px-10 rounded-none text-base font-bold uppercase tracking-widest text-white hover:bg-emerald-500 shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] transition-all hover:scale-[1.03]"
            >
              Engage Terminal
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/why-visio-auto">
            <Button
              variant="outline"
              size="lg"
              className="h-14 gap-2.5 border-zinc-700 bg-black/50 backdrop-blur-md rounded-none px-10 text-base font-bold uppercase tracking-widest text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all"
            >
              <Settings className="h-4 w-4" />
              View Specifications
            </Button>
          </Link>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-24 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4 relative z-20"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex flex-col items-start gap-2 border-l-2 border-emerald-500/30 bg-black/60 px-5 py-6 backdrop-blur-xl hover:border-emerald-500 transition-colors shadow-2xl"
            >
              <stat.icon className="mb-2 h-6 w-6 text-emerald-500" />
              <span className="font-mono text-3xl font-black text-white tracking-tighter">
                {stat.value}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <style jsx global>{`
        @keyframes fadeSwap {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
