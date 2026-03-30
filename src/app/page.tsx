import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustBar from "@/components/landing/TrustBar";
import HowItWorks from "@/components/landing/HowItWorks";
import ForDealers from "@/components/landing/ForDealers";
import SignalShowcase from "@/components/landing/SignalShowcase";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <ForDealers />
      <SignalShowcase />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
