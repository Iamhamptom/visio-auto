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
import { Zap, ArrowRight, Car, Globe, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const swapWords = [
  "car buyers",
  "buying signals",
  "qualified leads",
  "test drive bookings",
];

const stats = [
  { label: "Dealerships", value: "329+", icon: Car },
  { label: "Signal Types", value: "23", icon: Zap },
  { label: "Languages", value: "6", icon: Globe },
  { label: "Response Time", value: "30s", icon: Clock },
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
      className="relative min-h-screen overflow-hidden pt-32 pb-20"
      onMouseMove={handleMouseMove}
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Mouse-following gradient glow */}
      <motion.div
        className="pointer-events-none absolute h-[600px] w-[600px] rounded-full bg-emerald-500/8 blur-[150px]"
        style={{
          x: springX,
          y: springY,
          left: "50%",
          top: "30%",
          translateX: "-50%",
          translateY: "-50%",
        }}
      />

      {/* Static ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-emerald-500/5 blur-[120px]" />

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
          <Badge className="mb-8 border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 px-4 py-1.5 text-sm">
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            South Africa&#39;s First AI-Powered Dealership Intelligence Platform
          </Badge>
        </motion.div>

        {/* Headline with word swap */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-5xl text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
        >
          We find{" "}
          <span className="relative inline-block">
            <span className="sr-only">{swapWords[wordIndex]}</span>
            <span
              key={wordIndex}
              className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent inline-block animate-[fadeSwap_0.5s_ease-in-out]"
            >
              {swapWords[wordIndex]}
            </span>
          </span>
          <br />
          before anyone else
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl"
        >
          We find car buyers before they walk into any dealership. AI-qualified,
          scored, and delivered to your WhatsApp in{" "}
          <span className="text-white font-semibold">30 seconds</span>.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link href="/get-started">
            <Button
              size="lg"
              className="h-14 gap-2.5 bg-emerald-600 px-10 text-base font-semibold text-white hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 hover:scale-[1.02]"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="h-14 gap-2.5 border-zinc-700 px-10 text-base text-zinc-300 hover:bg-zinc-800/80 hover:text-white hover:border-zinc-600"
          >
            <Play className="h-4 w-4" />
            Watch Demo
          </Button>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-800/50 bg-zinc-900/50 px-4 py-6 backdrop-blur-sm hover:border-emerald-500/20 transition-colors"
            >
              <stat.icon className="mb-1 h-5 w-5 text-emerald-400" />
              <span className="font-mono text-2xl font-bold text-white">
                {stat.value}
              </span>
              <span className="text-xs text-zinc-500">{stat.label}</span>
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
