"use client";

import { useEffect, useCallback, useRef } from "react";

/**
 * Windows XP-inspired click pop effect.
 * Creates an expanding burst animation at the cursor position on every click.
 * Renders purely with DOM manipulation for zero re-renders.
 */
export default function ClickPop() {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    // Create the pop burst
    const pop = document.createElement("div");
    pop.className = "click-pop";
    pop.style.left = `${e.clientX}px`;
    pop.style.top = `${e.clientY}px`;
    container.appendChild(pop);

    // Create 4 directional particles (XP selection corners feel)
    for (let i = 0; i < 4; i++) {
      const particle = document.createElement("div");
      particle.className = "click-particle";
      particle.style.left = `${e.clientX}px`;
      particle.style.top = `${e.clientY}px`;
      particle.style.setProperty("--angle", `${i * 90 + 45}deg`);
      container.appendChild(particle);

      particle.addEventListener("animationend", () => particle.remove(), { once: true });
    }

    // Create the ring
    const ring = document.createElement("div");
    ring.className = "click-ring";
    ring.style.left = `${e.clientX}px`;
    ring.style.top = `${e.clientY}px`;
    container.appendChild(ring);

    pop.addEventListener("animationend", () => pop.remove(), { once: true });
    ring.addEventListener("animationend", () => ring.remove(), { once: true });
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [handleClick]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      aria-hidden="true"
    />
  );
}
