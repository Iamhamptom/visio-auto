import Link from "next/link";
import { ArrowLeft, Car } from "lucide-react";

export default function PopiaCompliancePage() {
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

        <h1 className="mt-4 text-3xl font-bold text-white">POPIA Compliance</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: 29 March 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white">Our Commitment</h2>
            <p className="mt-2">
              VisioCorp (Pty) Ltd is fully committed to compliance with the Protection of Personal Information Act, 2013 (POPIA). We process personal information lawfully, minimally, and transparently in the course of delivering our AI-powered lead generation service to motor dealerships across South Africa.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Lawful Basis for Processing</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong className="text-zinc-200">Legitimate interest:</strong> We detect publicly available buying intent signals (job changes, business registrations, social media posts) to match potential car buyers with dealerships.</li>
              <li><strong className="text-zinc-200">Consent:</strong> When we engage individuals via WhatsApp or SMS, we obtain opt-in consent before continuing communication.</li>
              <li><strong className="text-zinc-200">Contractual necessity:</strong> Dealer data is processed to fulfil our subscription agreement.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Data Minimisation</h2>
            <p className="mt-2">
              We collect only the data necessary for lead qualification: name, phone number, area, vehicle interest, budget range, and the specific buying signal detected. We do not collect ID numbers, financial account details, or sensitive personal information as defined by POPIA.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Data Subject Rights</h2>
            <p className="mt-2">Under POPIA, data subjects have the right to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Be notified that their personal information is being collected.</li>
              <li>Request access to their personal information held by us.</li>
              <li>Request correction or deletion of their personal information.</li>
              <li>Object to the processing of their personal information.</li>
              <li>Lodge a complaint with the Information Regulator.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Opt-Out Mechanism</h2>
            <p className="mt-2">
              Any individual can opt out of our lead database by replying "STOP" to any WhatsApp or SMS message, or by emailing <a href="mailto:optout@visiocorp.co" className="text-emerald-400 hover:underline">optout@visiocorp.co</a>. We process opt-out requests within 48 hours.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Security Measures</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>AES-256 encryption at rest for all personal data.</li>
              <li>TLS 1.3 encryption for all data in transit.</li>
              <li>Role-based access control for dealer and staff accounts.</li>
              <li>Regular security audits and penetration testing.</li>
              <li>SOC 2 compliant infrastructure hosting.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Cross-Border Transfers</h2>
            <p className="mt-2">
              Our primary data hosting is within the EU (Supabase, eu-west-1). Where data is processed outside South Africa, we ensure the receiving jurisdiction provides adequate protection as required by Section 72 of POPIA.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Information Officer</h2>
            <p className="mt-2">
              Our designated Information Officer can be reached at <a href="mailto:privacy@visiocorp.co" className="text-emerald-400 hover:underline">privacy@visiocorp.co</a> for any POPIA-related enquiries or requests.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Information Regulator</h2>
            <p className="mt-2">
              Complaints may be lodged with the Information Regulator of South Africa at <a href="https://inforegulator.org.za" className="text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer">inforegulator.org.za</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
