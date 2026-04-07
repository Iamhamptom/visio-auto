import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import HowItWorks from "@/components/home/HowItWorks";
import CoreOfferings from "@/components/home/CoreOfferings";
import SuiteGrid from "@/components/home/SuiteGrid";
import PricingTeaser from "@/components/home/PricingTeaser";
import IntelligenceCTA from "@/components/home/IntelligenceCTA";
import Numbers from "@/components/home/Numbers";
import ResearchTeaser from "@/components/home/ResearchTeaser";
import FinalCTA from "@/components/home/FinalCTA";
import Footer from "@/components/home/Footer";
import ClickPop from "@/components/landing/ClickPop";

/**
 * Visio Auto — the home page.
 *
 * World-class B2B SaaS landing structure. 11 sections (including nav + footer),
 * single clear message, one CTA repeated three times, zero engineering jargon.
 *
 * The brand promise leads, not the agent persona. Jess is the chat widget
 * in the layout, available on every page, but she is a feature — not the hero.
 *
 * Section order:
 *   01  Navbar                  (sticky)
 *   02  Hero                    — the brand promise + CTAs
 *   03  TrustBar                — verified facts, no fake logos
 *   04  HowItWorks              — 4-step flow (signal → qualify → match → deliver)
 *   05  CoreOfferings           — the 3 things we sell (leads / intel / suite)
 *   06  SuiteGrid               — 6 sibling products, clean
 *   07  PricingTeaser           — 3 anchor tiers, full at /pricing
 *   08  IntelligenceCTA         — OEM + bank audience branching
 *   09  Numbers                 — by-the-numbers, verified only
 *   10  ResearchTeaser          — 3 featured papers, full at /research
 *   11  FinalCTA                — last conversion push
 *   12  Footer                  — clean 4-column info architecture
 *
 * Deep content lives at:
 *   /research        (papers + architecture + signal taxonomy)
 *   /intelligence    (live Q1 2026 dashboard)
 *   /concierge       (UHNW African luxury)
 *   /about/jess      (persona page + voice demo)
 *   /pricing         (full 18-SKU catalogue)
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#030f0a]">
      <ClickPop />
      <Navbar />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <CoreOfferings />
      <SuiteGrid />
      <PricingTeaser />
      <IntelligenceCTA />
      <Numbers />
      <ResearchTeaser />
      <FinalCTA />
      <Footer />
    </div>
  );
}
