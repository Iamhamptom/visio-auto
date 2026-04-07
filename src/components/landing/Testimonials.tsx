"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    quote:
      "We closed 12 deals in our first month. The AI scoring is incredibly accurate — it knows who is ready to buy before they even walk in.",
    name: "Johan van der Merwe",
    role: "Dealer Principal",
    dealership: "Sandton Motor Group",
    metric: "12 deals in month 1",
  },
  {
    quote:
      "Leads arrive on WhatsApp before we even finish our morning coffee. Game changer for our sales team's productivity and morale.",
    name: "Priya Naidoo",
    role: "Sales Manager",
    dealership: "AutoBay Menlyn",
    metric: "4.2x ROI in 90 days",
  },
  {
    quote:
      "4.2x ROI in 90 days. We've tripled our sales team's conversion rate. The VIN matching means every lead gets the right car suggestion.",
    name: "Thabo Mokoena",
    role: "CEO",
    dealership: "Mzansi Motors",
    metric: "3x conversion rate",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const paginate = useCallback((dir: number) => {
    setDirection(dir);
    setCurrent(
      (prev) => (prev + dir + testimonials.length) % testimonials.length
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 6000);
    return () => clearInterval(timer);
  }, [paginate]);

  return (
    <section className="relative py-32 bg-[#020c07]">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span className="section-label">Testimonials</span>
          <h2 className="mt-4 heading-xl">
            Trusted by <span className="text-emerald-400">SA&apos;s best</span>.
          </h2>
        </motion.div>

        {/* Carousel */}
        <div className="relative mt-16 mx-auto max-w-3xl">
          <div className="overflow-hidden border border-white/[0.06] bg-white/[0.02] min-h-[260px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="p-10 md:p-12"
              >
                {/* Quote */}
                <p className="text-lg font-extralight leading-relaxed text-white/70 md:text-xl">
                  &ldquo;{testimonials[current].quote}&rdquo;
                </p>

                {/* Attribution */}
                <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-6">
                  <div>
                    <p className="text-[14px] font-medium text-white/80">
                      {testimonials[current].name}
                    </p>
                    <p className="text-[12px] text-white/30 mt-0.5 font-mono">
                      {testimonials[current].role} &middot; {testimonials[current].dealership}
                    </p>
                  </div>
                  <div className="border border-emerald-500/20 bg-emerald-500/[0.05] px-3 py-1.5">
                    <span className="font-mono text-[11px] text-emerald-400/70">
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
              className="flex h-8 w-8 items-center justify-center border border-white/[0.06] bg-white/[0.02] text-white/30 hover:text-white/70 hover:border-white/[0.12] transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  className={`h-1 transition-all ${
                    i === current
                      ? "w-8 bg-emerald-500/60"
                      : "w-4 bg-white/[0.08] hover:bg-white/[0.15]"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => paginate(1)}
              className="flex h-8 w-8 items-center justify-center border border-white/[0.06] bg-white/[0.02] text-white/30 hover:text-white/70 hover:border-white/[0.12] transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
