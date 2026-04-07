import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustBar from "@/components/landing/TrustBar";
import AgentPlatform from "@/components/landing/AgentPlatform";
import VisioAutoSuite from "@/components/landing/VisioAutoSuite";
import HowItWorks from "@/components/landing/HowItWorks";
import SignalDepth from "@/components/landing/SignalDepth";
import SignalUniverse from "@/components/landing/SignalUniverse";
import VisioIntel from "@/components/landing/VisioIntel";
import DealerIntelFeed from "@/components/landing/DealerIntelFeed";
import StrategyAgent from "@/components/landing/StrategyAgent";
import LuxuryConcierge from "@/components/landing/LuxuryConcierge";
import CarMarquee from "@/components/landing/CarMarquee";
import CarsCharts from "@/components/landing/CarsCharts";
import SecurityCompliance from "@/components/landing/SecurityCompliance";
import ForDealers from "@/components/landing/ForDealers";
import SocialProof from "@/components/landing/SocialProof";
import Pricing from "@/components/landing/Pricing";
import PricingShop from "@/components/landing/PricingShop";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import ClickPop from "@/components/landing/ClickPop";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030f0a] cursor-xp">
      <ClickPop />
      <Navbar />
      <Hero />
      <TrustBar />
      <AgentPlatform />
      <VisioAutoSuite />
      <SignalDepth />
      <SignalUniverse />
      <VisioIntel />
      <DealerIntelFeed />
      <StrategyAgent />
      <HowItWorks />
      <ForDealers />
      <LuxuryConcierge />
      <CarMarquee />
      <CarsCharts />
      <SecurityCompliance />
      <SocialProof />
      <PricingShop />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
