import Link from "next/link";
import { ArrowLeft, Car } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <nav className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-4 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
              <Car className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">Visio Auto</span>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: 29 March 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By accessing or using the Visio Auto platform ("Service"), operated by VisioCorp (Pty) Ltd, you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. Service Description</h2>
            <p className="mt-2">
              Visio Auto is an AI-powered dealership intelligence platform that detects car-buying intent signals and delivers qualified leads to subscribed motor dealerships in South Africa.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. Subscription Plans</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong className="text-zinc-200">Starter:</strong> R1,999/month -- up to 50 leads/month.</li>
              <li><strong className="text-zinc-200">Growth:</strong> R4,999/month -- up to 200 leads/month, Signal Engine, WhatsApp integration.</li>
              <li><strong className="text-zinc-200">Pro:</strong> R9,999/month -- unlimited leads, full API access, priority support.</li>
            </ul>
            <p className="mt-2">All plans are billed monthly. You may cancel at any time with 30 days notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. Lead Quality Guarantee</h2>
            <p className="mt-2">
              We guarantee that at least 70% of delivered leads will have a valid phone number and a verified buying intent signal. If we fall below this threshold in any calendar month, we will credit the difference to your next billing cycle.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. Service Level Agreement</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Platform uptime target: 99.5% monthly.</li>
              <li>Lead delivery: within 30 seconds of signal detection.</li>
              <li>Support response time: within 4 business hours for Growth/Pro plans.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">6. Acceptable Use</h2>
            <p className="mt-2">
              You agree not to: (a) resell or redistribute lead data to third parties, (b) use the platform for spam or unsolicited bulk messaging, (c) attempt to reverse-engineer our AI models, or (d) share your API keys.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">7. Intellectual Property</h2>
            <p className="mt-2">
              All AI models, algorithms, and platform code are the intellectual property of VisioCorp (Pty) Ltd. The lead data delivered to you may be used solely for your dealership operations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">8. Limitation of Liability</h2>
            <p className="mt-2">
              Visio Auto provides leads on an "as-is" basis. We are not liable for the outcome of any sales interaction. Our total liability is limited to the fees paid in the preceding 3 months.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">9. Governing Law</h2>
            <p className="mt-2">
              These terms are governed by the laws of the Republic of South Africa. Disputes will be resolved through arbitration in Johannesburg.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">10. Contact</h2>
            <p className="mt-2">
              For questions about these terms, contact <a href="mailto:legal@visiocorp.co" className="text-emerald-400 hover:underline">legal@visiocorp.co</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
