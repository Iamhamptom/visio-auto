import PaperLayout from "@/components/papers/PaperLayout";

export const metadata = {
  title: "Visio Approve — VRL-AUTO-004 | Visio Research Labs",
  description:
    "A neutral multi-bank vehicle finance pre-approval layer for South Africa. 90-second Green/Amber/Red traffic light. No credit pull. No regulatory burden. R54M ARR opportunity.",
};

export default function VisioApprovePaperPage() {
  return (
    <PaperLayout
      paperNumber="VRL-AUTO-004"
      category="Visio Approve"
      title="A neutral multi-bank vehicle finance pre-approval layer for South Africa."
      subtitle="90-second affordability estimate without a credit pull — built inside the NCA Section 40 + FAIS Section 1 legal gap. R54M ARR opportunity from dealer embeds and bank lead-fees."
      publishDate="April 2026"
      authors="Dr. David Hampton, VRL"
    >
      <div className="callout">
        <span className="callout-label">Abstract</span>
        <p className="text-[15px] leading-relaxed text-white/65 italic m-0">
          The South African vehicle finance market is intermediated by four dominant lenders
          (WesBank, Standard Bank VAF, Nedbank MFC, Absa VAF) and constrained by NCA Section 81
          + Regulation 23A affordability rules. In 2023 over 25% of vehicle finance applications
          were rejected, and 34% of accounts ended in arrears. This paper introduces{" "}
          <strong>Visio Approve</strong>, the first neutral pre-approval simulator that exposes
          the banks&apos; affordability formulas to the consumer in 90 seconds, without a credit
          bureau pull, and without crossing the regulatory thresholds that would require NCR or
          FAIS registration. The legal opportunity was created by an asymmetry: FAIS explicitly
          excludes credit from &ldquo;financial advice&rdquo;, while NCA defines a credit provider
          by the act of <em>extending</em> credit, not by estimating eligibility. Visio Approve
          operates entirely inside this gap. Steady-state target: <strong>R54M ARR</strong>.
        </p>
      </div>

      <h2>1. The problem</h2>

      <p>
        South African car buyers approach the dealer F&amp;I desk almost completely blind. The four
        major lenders publish calculators on their own websites, but each is bank-branded and hides
        the actual approval likelihood behind opaque &ldquo;subject to assessment&rdquo; language.
        Consumers learn whether they qualify only after submitting a full application &mdash; at
        which point a hard credit pull is recorded against their bureau record and a decline
        becomes a permanent friction.
      </p>

      <p>The data on this friction is severe:</p>

      <ul>
        <li>TransUnion Q4 2025 reports a <strong>25%+ vehicle finance application rejection rate</strong>.</li>
        <li>WesBank received <strong>78,983 new + 136,067 used finance applications in January 2026 alone</strong>.</li>
        <li>The Eighty20 Q4 2025 Credit Stress Report found a <strong>R3.7B single-quarter increase in vehicle finance overdue balances</strong>.</li>
        <li>Loan terms are creeping above 90 months as affordability tightens.</li>
      </ul>

      <p>
        The result: a market in which the buyer cannot judge their own eligibility, the bank
        cannot price their risk without a hard pull, and the dealer cannot accurately forecast
        which leads will close. Every actor is operating with bad information.
      </p>

      <h2>2. The legal opening</h2>

      <p>
        A common assumption in the South African fintech community is that any tool offering an
        opinion on vehicle finance approval must be registered as either a credit provider (under
        the NCA) or a financial services provider (under the FAIS Act). This is incorrect.
      </p>

      <ul>
        <li><strong>NCA Section 40(1)</strong> defines a credit provider by the <em>act of extending credit</em>. A simulator that does not extend credit is not a credit provider and does not require NCR registration.</li>
        <li><strong>NCA Section 70</strong> defines a credit bureau by the <em>act of holding consumer credit information</em>. A simulator that uses only self-reported data and never queries a registered bureau is not a credit bureau.</li>
        <li><strong>FAIS Act Section 1</strong> defines &ldquo;financial product&rdquo; as investments, insurance, deposits, and similar instruments. <strong>Credit agreements are explicitly excluded.</strong> A car finance estimator is therefore not regulated by FAIS and does not require an FSP licence.</li>
      </ul>

      <p>
        What remains is <strong>POPIA</strong>, which governs the storage of any user-supplied
        data. Visio Approve handles this with explicit consent gates, an Information Officer
        registration, and a 90-day retention rule for any persisted simulation.
      </p>

      <p>
        Inside this gap, Visio Approve operates as a{" "}
        <strong>lead generator + comparison tool</strong>, structurally identical to ClearScore SA,
        JustMoney, and RateCompare &mdash; but vehicle-specific and dealer-page native.
      </p>

      <h2>3. The affordability engine</h2>

      <p>The calculation has four ingredients:</p>

      <ol>
        <li><strong>Reg 23A minimum expense norms table.</strong> Published by National Treasury, it defines the minimum monthly living expenses a credit provider <em>must</em> assume for a borrower at any given gross income band. Encoded as a constant in <code>lib/engine/affordability.ts</code>.</li>
        <li><strong>Statutory deductions.</strong> PAYE + UIF approximation (banded by income).</li>
        <li><strong>User-supplied obligations.</strong> Rent, total monthly debt repayments, dependents.</li>
        <li><strong>Self-selected credit health.</strong> Excellent / Good / Fair / Poor / Don&apos;t Know — five buckets, mapped to the published rate margins of each of the four banks.</li>
      </ol>

      <p>From these four inputs we compute:</p>

      <ul>
        <li><strong>Net income</strong> = gross − statutory − Reg 23A min living</li>
        <li><strong>Discretionary income</strong> = net − rent − other obligations</li>
        <li><strong>Maximum sustainable instalment</strong> = discretionary × 0.65 (conservative buffer below the bank&apos;s own 80%-of-discretionary cap)</li>
        <li><strong>Debt-to-income ratio</strong> at the proposed instalment</li>
        <li><strong>Loan-to-value ratio</strong> for the specific vehicle and deposit</li>
        <li><strong>Approval likelihood</strong> = weighted combination mapped onto Green / Amber / Red</li>
      </ul>

      <p>
        Crucially, the rates returned to the consumer are <strong>not invented</strong>. They are
        pulled from a <code>lib/banks/rates.ts</code> constant containing the actual published rate
        cards of WesBank, Standard Bank VAF, Nedbank MFC and Absa VAF, indexed by SARB prime
        (10.25% as of January 2026). Each entry is timestamped with a <code>verifiedAt</code> date
        and a public source URL &mdash; no fabricated numbers.
      </p>

      <h2>4. Why this matters for the buyer</h2>

      <p>
        A buyer using Visio Approve learns three things in 90 seconds that they would otherwise
        need three weeks and multiple branch visits to discover:
      </p>

      <ol>
        <li>Whether they would <em>probably</em> be approved at this car&apos;s price point &mdash; not as advice, but as an estimate based on the same Reg 23A formula the banks themselves use.</li>
        <li>What four banks would charge them at their self-reported credit band &mdash; and which is cheapest for their specific risk profile.</li>
        <li>What the maximum vehicle price they can afford actually is &mdash; and how much extra deposit would flip an Amber estimate to Green.</li>
      </ol>

      <p>
        This eliminates the most common failure mode in the SA used-car funnel: a buyer falls in
        love with a car that is structurally beyond their affordability, applies anyway, gets
        rejected, takes a hard credit hit, and disengages from the market for months. With Visio
        Approve, the same buyer is redirected to a vehicle they can afford <em>before</em> any
        bureau pull, and arrives at the dealership pre-qualified.
      </p>

      <h2>5. Why this matters for the dealer</h2>

      <p>
        The dealer F&amp;I desk&apos;s central problem is <strong>wasted credit applications</strong>.
        Every rejected application costs roughly 30 minutes of an F&amp;I manager&apos;s time, plus
        the opportunity cost of a lead that fails to convert. At a 25% rejection rate, a dealer
        doing 40 deals per month is wasting roughly 5 hours per week on applications that will
        never close.
      </p>

      <p>
        Visio Approve embedded on a dealer&apos;s listing page filters this out. By the time a lead
        arrives at the F&amp;I desk, they have already self-disclosed their income and obligations
        and seen the four bank rates side by side. The dealer can prioritise Green leads, reroute
        Amber leads to a deposit-coaching workflow, and decline Red leads with a simple
        &ldquo;let&apos;s revisit when your DTI improves&rdquo; &mdash; without ever burning a hard
        credit pull.
      </p>

      <h2>6. Revenue model</h2>

      <ol>
        <li><strong>Bank lead-fees.</strong> Each of the four major lenders pays R150–R500 per qualified, pre-approved application. At 12,000 monthly completions × 30% handoff = <strong>~R36M ARR</strong>.</li>
        <li><strong>Dealer subscription.</strong> R3,000/month for the integration, lead capture, and analytics. At 500 dealers = <strong>R18M ARR</strong>.</li>
      </ol>

      <p>Combined steady-state: <strong>R54M ARR</strong>, 90%+ gross margin.</p>

      <h2>7. Limitations and ethical considerations</h2>

      <p>
        Visio Approve is an estimator, not a credit decision. Every screen carries:{" "}
        <em>&ldquo;This is an educational estimate. It is not a credit application, not financial
        advice, and does not guarantee approval. Final approval is subject to a credit assessment
        by the lender.&rdquo;</em>
      </p>

      <p>
        We deliberately use a conservative buffer (65% of discretionary income vs the 80% banks
        themselves accept) to bias toward false negatives rather than false positives. A buyer
        told Amber who is then approved is delighted; a buyer told Green who is then declined is
        angry and loses trust. The asymmetry is reflected in the engine.
      </p>

      <p>
        We do not store any bureau data and we do not call any bureau API. The user&apos;s
        self-reported credit band is treated as a hint, not a fact, and the engine surfaces the
        uncertainty: an Amber result is honest about <em>why</em> it is Amber.
      </p>

      <h2>8. Conclusion</h2>

      <p>
        Visio Approve is a small product with a precise legal positioning and a large market. By
        exposing the published Reg 23A formula, the four major banks&apos; actual rate cards, and a
        conservative approval likelihood score to the consumer in 90 seconds, it removes the
        single largest information asymmetry in the South African vehicle finance market. It does
        this without becoming a credit provider, without becoming a credit bureau, and without
        crossing into FAIS-regulated advice &mdash; which is to say, without any of the regulatory
        burden that has prevented anyone else from building it.
      </p>

      <p>
        The R54M ARR opportunity is not the most interesting thing. The most interesting thing is
        that it converts a <strong>trust deficit</strong> in the SA used-car market into a{" "}
        <strong>distribution channel</strong> for the four major lenders &mdash; and that
        VisioCorp owns the layer that sits between them.
      </p>

      <hr />

      <p className="footnote">
        <strong>References:</strong> National Credit Act 34 of 2005 (Sections 40, 70, 81);
        Affordability Assessment Regulations 2015 (Reg 23A); FAIS Act 37 of 2002 Section 1;
        TransUnion Q4 2025 Mobility Insights; WesBank Vehicle Finance Barometer Jan 2026; Eighty20
        Q4 2025 Credit Stress Report; SARB Repo Rate Jan 2026; WesBank, Standard Bank VAF, Nedbank
        MFC, Absa VAF published rate cards (verified 2026-01-01). Repository:{" "}
        <a href="https://github.com/Iamhamptom/visio-approve">github.com/Iamhamptom/visio-approve</a>,
        commit <code>45c02d3</code>. Live deploy:{" "}
        <a href="https://visio-approve.vercel.app">visio-approve.vercel.app</a>.
      </p>

      <p className="footnote">
        Cite as: Hampton, D. (2026). &ldquo;Visio Approve: A Neutral Multi-Bank Vehicle Finance
        Pre-Approval Layer for South Africa&rdquo;. Visio Research Labs, VRL-AUTO-004.
      </p>
    </PaperLayout>
  );
}
