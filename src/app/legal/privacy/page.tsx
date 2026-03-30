import Link from "next/link";
import { ArrowLeft, Car } from "lucide-react";

export default function PrivacyPolicyPage() {
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

        <h1 className="mt-4 text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: 29 March 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white">1. Introduction</h2>
            <p className="mt-2">
              VisioCorp (Pty) Ltd ("Visio Auto", "we", "us") is committed to protecting your personal information in compliance with the Protection of Personal Information Act, 2013 (POPIA) and all applicable South African data protection legislation. This Privacy Policy describes how we collect, use, store, and protect your data when you use our AI-powered dealership intelligence platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. Information We Collect</h2>
            <p className="mt-2">We collect information in the following categories:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong className="text-zinc-200">Dealer Information:</strong> Business name, contact details, location, inventory data, and staff details provided during onboarding.</li>
              <li><strong className="text-zinc-200">Lead Data:</strong> Names, phone numbers, email addresses, location (suburb/city), vehicle preferences, budget ranges, and buying intent signals sourced from publicly available data and licensed data providers.</li>
              <li><strong className="text-zinc-200">Usage Data:</strong> Platform interaction data, analytics events, and feature usage patterns to improve our service.</li>
              <li><strong className="text-zinc-200">Communication Data:</strong> WhatsApp messages sent through our platform on behalf of dealers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. How We Use Your Data</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>To deliver AI-qualified leads to subscribed dealerships.</li>
              <li>To match potential car buyers with relevant dealer inventory.</li>
              <li>To send WhatsApp and SMS communications on behalf of dealers.</li>
              <li>To generate analytics and performance reports.</li>
              <li>To improve our AI scoring models and signal detection algorithms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. Data Sharing</h2>
            <p className="mt-2">
              We share lead data only with the dealerships subscribed to our platform. We do not sell personal information to third parties. We may share anonymised, aggregated analytics data for industry reporting purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. Data Retention</h2>
            <p className="mt-2">
              Lead data is retained for a maximum of 12 months from the date of collection, after which it is anonymised or deleted. Dealer account data is retained for the duration of the subscription and 90 days thereafter.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">6. Your Rights</h2>
            <p className="mt-2">
              Under POPIA, you have the right to access, correct, or request deletion of your personal information. To exercise these rights, contact us at <a href="mailto:privacy@visiocorp.co" className="text-emerald-400 hover:underline">privacy@visiocorp.co</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">7. Security</h2>
            <p className="mt-2">
              We use industry-standard encryption, access controls, and secure infrastructure to protect your data. All data is hosted on SOC 2 compliant servers with AES-256 encryption at rest and TLS 1.3 in transit.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">8. Contact</h2>
            <p className="mt-2">
              For privacy-related enquiries, contact our Information Officer at <a href="mailto:privacy@visiocorp.co" className="text-emerald-400 hover:underline">privacy@visiocorp.co</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
