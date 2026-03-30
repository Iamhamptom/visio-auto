"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    quote:
      "We closed 12 deals in our first month. The AI scoring is incredibly accurate — it knows who is ready to buy before they even walk in.",
    name: "Johan van der Merwe",
    role: "Dealer Principal",
    dealership: "Sandton Motor Group",
    stars: 5,
    metric: "12 deals in month 1",
  },
  {
    quote:
      "Leads arrive on WhatsApp before we even finish our morning coffee. Game changer for our sales team's productivity and morale.",
    name: "Priya Naidoo",
    role: "Sales Manager",
    dealership: "AutoBay Menlyn",
    stars: 5,
    metric: "4.2x ROI in 90 days",
  },
  {
    quote:
      "4.2x ROI in 90 days. We've tripled our sales team's conversion rate. The VIN matching means every lead gets the right car suggestion.",
    name: "Thabo Mokoena",
    role: "CEO",
    dealership: "Mzansi Motors",
    stars: 5,
    metric: "3x conversion rate",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const paginate = useCallback(
    (dir: number) => {
      setDirection(dir);
      setCurrent(
        (prev) => (prev + dir + testimonials.length) % testimonials.length
      );
    },
    []
  );

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 6000);
    return () => clearInterval(timer);
  }, [paginate]);

  return (
    <section className="relative border-t border-zinc-800/50 bg-zinc-900/20 py-28">
      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Badge className="mb-4 border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800">
            Testimonials
          </Badge>
          <h2 className="text-3xl font-bold text-white md:text-5xl tracking-tight">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              SA&apos;s best dealers
            </span>
          </h2>
        </motion.div>

        {/* Carousel */}
        <div className="relative mt-16 mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/60 backdrop-blur-sm min-h-[280px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
                className="p-10 md:p-12"
              >
                {/* Stars */}
                <div className="mb-5 flex gap-1">
                  {Array.from({ length: testimonials[current].stars }).map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-amber-400 text-amber-400"
                      />
                    )
                  )}
                </div>

                {/* Quote */}
                <p className="text-lg leading-relaxed text-zinc-200 md:text-xl">
                  &ldquo;{testimonials[current].quote}&rdquo;
                </p>

                {/* Attribution */}
                <div className="mt-8 flex items-center justify-between border-t border-zinc-800 pt-6">
                  <div>
                    <p className="font-semibold text-white">
                      {testimonials[current].name}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {testimonials[current].role},{" "}
                      {testimonials[current].dealership}
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
                    <span className="text-sm font-mono font-semibold text-emerald-400">
                      {testimonials[current].metric}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => paginate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    i === current
                      ? "w-8 bg-emerald-500"
                      : "w-2 bg-zinc-700 hover:bg-zinc-600"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => paginate(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
