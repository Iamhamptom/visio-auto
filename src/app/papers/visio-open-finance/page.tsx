import PaperLayout from "@/components/papers/PaperLayout";

export const metadata = {
  title: "Visio Open Finance — VRL-AUTO-008 | Visio Research Labs",
  description:
    "Bank-statement-driven affordability for SA thin-file car buyers. Gemini 2.5 Vision parses statements, NCA Section 81 engine, audit-grade reports. Unlocks the 25% rejection-rate cohort.",
};

export default function VisioOpenFinancePaperPage() {
  return (
    <PaperLayout
      paperNumber="VRL-AUTO-008"
      category="Visio Open Finance"
      title="Bank-statement-driven affordability for SA thin-file car buyers."
      subtitle="Gemini 2.5 Vision parses every transaction, classifies into 46 SA expense categories, runs NCA Section 81 + Reg 23A — producing audit-grade affordability reports banks can trust."
      publishDate="April 2026"
      authors="Dr. David Hampton, VRL"
    >
      <div className="callout">
        <span className="callout-label">Abstract</span>
        <p className="text-[15px] leading-relaxed text-white/65 italic m-0">
          South Africa&apos;s vehicle finance approval system has a structural blind spot: it
          relies almost exclusively on credit bureau scores from TransUnion, Experian, XDS or
          Compuscan. This excludes gig workers, informal traders, freelancers, and contract
          employees whose income and expense patterns are real and stable but invisible to the
          bureaus. The result is a <strong>25%+ rejection rate</strong> (NCR, 2023), with
          first-time buyers and informal-income earners hit hardest. Globally, Upstart analyses
          2,500+ variables and Lendbuzz analyses 1,600+, both proving AI-driven underwriting can
          automate 90%+ of approval decisions while improving approval accuracy by ~17 percentage
          points. <strong>Visio Open Finance</strong> is a consumer-facing bank-statement parser
          that uses Gemini 2.5 Vision to extract every transaction from a 3-month statement,
          classify each into 46 SA expense categories, detect recurring debt obligations, run the
          NCA Section 81 + Reg 23A affordability formula, and produce an audit-grade report a
          buyer can hand to a bank. Target: <strong>~R17M ARR</strong>.
        </p>
      </div>

      <h2>1. The thin-file problem</h2>

      <p>
        The four SA credit bureaus produce credit scores from data they receive from registered
        credit providers: banks, retailers, microlenders, telcos. Buyers who do not consume
        formal credit do not appear. Buyers whose primary income is informal do not generate
        the consistent payment history the bureaus weight most heavily.
      </p>

      <ul>
        <li><strong>&gt;25% of vehicle finance applications are rejected</strong> (NCR 2023 baseline; likely worse post-2024 tightening)</li>
        <li><strong>34% of vehicle finance accounts ended in arrears in 2023</strong> — banks have responded by tightening further</li>
        <li><strong>Loan terms creeping above 90 months</strong> (Eighty20 Q4 2025) as the only mechanism left to make instalments fit</li>
        <li><strong>Gen Z purchase intent is the highest of any cohort at 25%</strong> (TransUnion Q4 2025) — but also the cohort least likely to have a bureau record long enough to score well</li>
      </ul>

      <p>
        The buyer who suffers most is the gig worker doing R30,000/month of consistent Uber,
        Bolt and SweepSouth income, with R8,000/month stable rent, R3,000/month grocery spend,
        zero existing credit &mdash; and therefore declined for a R250,000 vehicle finance
        application despite being objectively able to afford the R5,500 monthly instalment.{" "}
        <strong>The bureau cannot see what the bank statement shows.</strong>
      </p>

      <h2>2. The truID precedent and the gap</h2>

      <p>
        South Africa has one mature open-finance platform: <strong>truID</strong>, which
        provides bank statement data via consumer-consented API integration, ~2 million users,
        40+ expense categories. It is the closest existing analogue.
      </p>

      <p>
        However, truID is a <strong>B2B infrastructure layer</strong>. It sells API access to
        banks and lenders who build their own consumer experiences on top. There is no
        consumer-facing, vehicle-vertical, audit-grade affordability product built on
        open-finance plumbing. Visio Open Finance is that product.
      </p>

      <p>
        The architectural difference: truID requires authentication into the bank + API consent
        flow. Visio Open Finance accepts uploaded PDF or CSV statements directly: drag, drop,
        done. Psychologically lower friction, reaches users not yet comfortable with bank-API
        consent flows.
      </p>

      <h2>3. The six computational stages</h2>

      <p>
        <strong>Stage 1 — Upload.</strong> Buyer drops 3 months of statements (PDF or CSV).
        POPIA consent captured before the file is touched, audit trail with hash of buyer&apos;s
        IP and versioned consent string.
      </p>

      <p>
        <strong>Stage 2 — Parse.</strong> Gemini 2.5 Flash multimodal handles PDFs natively (it
        can read PDF binary input and return structured data). For CSV files, PapaParse with
        format heuristics for the major SA banks (FNB, Standard Bank, Absa, Nedbank, Capitec,
        Investec).
      </p>

      <p>
        <strong>Stage 3 — Classify (two-pass).</strong>
      </p>

      <ul>
        <li><strong>Pass 1 (deterministic)</strong> &mdash; match against ~40 high-confidence SA merchant patterns: WOOLWORTHS, CHECKERS, PNP, SPAR, SHOPRITE, UBER, BOLT, SHELL, BP, ENGEN, CALTEX, SASOL, WESBANK, MFC, SANTAM, OUTSURANCE, MIWAY, KING PRICE, DSTV, MULTICHOICE, NETFLIX, VODACOM, MTN, TELKOM, ESKOM, etc. Each rule maps to one of 46 expense categories.</li>
        <li><strong>Pass 2 (AI fallback)</strong> &mdash; anything Pass 1 didn&apos;t classify is batched and sent to Gemini. Confidence scores recorded for each.</li>
      </ul>

      <p>
        <strong>Stage 4 — Recurring detection.</strong> Cluster transactions by similar
        description and ±10% amount tolerance. Any cluster with monthly cadence becomes a{" "}
        <code>recurring obligation</code>. This is the critical input to NCA Section 81 &mdash;
        the law cares about recurring debt obligations specifically, not aggregate spending.
      </p>

      <p>
        <strong>Stage 5 — Section 81 + Reg 23A engine.</strong> The same engine as Visio
        Approve, now fed with <strong>verified income</strong> (sum of credit transactions
        classified as income) and <strong>verified obligations</strong> (sum of detected
        recurring debt obligations) instead of self-reported numbers.
      </p>

      <p>
        <strong>Stage 6 — Audit-grade output.</strong> Buyer receives a branded PDF report with
        verified income, every detected recurring obligation with source transaction IDs,
        discretionary income calculation, and a Visio Open Finance assessment ID.{" "}
        <strong>Banks can hit a public verify endpoint</strong> at <code>/api/verify/[id]</code>{" "}
        to confirm the report&apos;s authenticity.
      </p>

      <h2>4. Why the legal positioning works</h2>

      <ul>
        <li><strong>Not a credit provider.</strong> Visio Open Finance does not extend credit. It produces an affordability estimate and hands off to a registered credit provider.</li>
        <li><strong>Not a credit bureau.</strong> Uses only the buyer&apos;s own bank statements, supplied with explicit consent.</li>
        <li><strong>Not financial advice.</strong> FAIS Section 1 explicitly excludes credit agreements from &ldquo;financial product&rdquo; definition.</li>
        <li><strong>POPIA-compliant.</strong> Explicit consent before upload, encryption at rest, 90-day retention maximum (enforced by cron), audit trail with IP hash, no third-party sharing without explicit handoff request.</li>
      </ul>

      <h2>5. Comparison to global comparables</h2>

      <table>
        <thead>
          <tr><th></th><th>Upstart</th><th>Lendbuzz</th><th>truID (SA)</th><th>Visio Open Finance</th></tr>
        </thead>
        <tbody>
          <tr><td>Business model</td><td>Direct lender</td><td>Direct lender</td><td>B2B API platform</td><td><strong>Consumer estimator + lead generator</strong></td></tr>
          <tr><td>Variables analysed</td><td>2,500+</td><td>1,600+</td><td>Open Banking categories</td><td>46 expense categories + recurring detection</td></tr>
          <tr><td>2025 originations</td><td>$2.8B (Q2)</td><td>$2.2B annual</td><td>n/a</td><td>n/a</td></tr>
          <tr><td>Vehicle vertical specific</td><td>Yes (2024+)</td><td>Yes</td><td>No</td><td><strong>Yes</strong></td></tr>
          <tr><td>Consumer-facing</td><td>Yes</td><td>Yes</td><td>No</td><td><strong>Yes</strong></td></tr>
        </tbody>
      </table>

      <p>
        Upstart and Lendbuzz are direct lenders taking credit risk. Visio Open Finance does not
        take credit risk and does not earn interest. We earn lead-fees (R300-R800 per audit-grade
        affordability report referred to a participating lender). Structurally similar to
        ClearScore SA&apos;s model, applied to the vehicle vertical with a much deeper input
        data set.
      </p>

      <h2>6. Revenue model</h2>

      <ol>
        <li><strong>Per-assessment fee.</strong> Free for the first assessment. R99 for the premium audit-grade PDF on subsequent assessments. At 12,000 assessments/month × 30% premium conversion ≈ <strong>R4.3M ARR</strong>.</li>
        <li><strong>Bank handoff lead-fee.</strong> R300-R800 per audit-grade report. At 12,000 monthly × 30% handoff rate ≈ <strong>R12.9M ARR</strong>.</li>
      </ol>

      <p>Combined steady-state: <strong>~R17M ARR</strong>.</p>

      <h2>7. Honesty Protocol enforcement</h2>

      <ul>
        <li><strong>Confidence flagging.</strong> Any transaction with Gemini classification confidence below 0.6 is flagged for manual review rather than silently included.</li>
        <li><strong>Statement period warning.</strong> If uploaded statements cover less than 90 days, the user receives a warning that the assessment is provisional.</li>
        <li><strong>No fabrication on parse failure.</strong> If Gemini cannot parse a statement, the system reports failure honestly and asks for a different format. We do not generate plausible-looking transactions to fill gaps.</li>
        <li><strong>Public verify endpoint.</strong> Banks can confirm any assessment ID exists, was completed, and matches the PDF hash without needing to trust Visio Open Finance&apos;s word for it.</li>
        <li><strong>90-day retention.</strong> Bank statements deleted from Supabase Storage automatically after 90 days via cron. No exceptions.</li>
      </ul>

      <h2>8. Integration with the Visio Auto Suite</h2>

      <p>
        Visio Open Finance is the <strong>deep approval layer</strong>. Visio Approve handles the
        90-second self-reported pre-approval; Visio Open Finance handles the verified,
        audit-grade upgrade for buyers who need it. Same Section 81 + Reg 23A engine &mdash; the
        only difference is the quality of the inputs.
      </p>

      <p>The flow in a Visio Trust transaction:</p>

      <ol>
        <li>Buyer runs Visio Approve → Amber result</li>
        <li>System suggests &ldquo;Upgrade to a verified affordability assessment&rdquo;</li>
        <li>Buyer uploads statements to Visio Open Finance → flips to Green</li>
        <li>Audit-grade PDF attached to <code>vt_transactions.open_finance_assessment_id</code></li>
        <li>Bank receives PDF + verify URL with lead handoff</li>
        <li>Bank approves in hours instead of days</li>
      </ol>

      <p>
        This loop unlocks the 25% of buyers currently rejected by the bureau-only system but
        objectively affordable when their bank statements are read directly.
      </p>

      <h2>9. Conclusion</h2>

      <p>
        Visio Open Finance is the bank-statement-grade upgrade to Visio Approve. It uses the
        open-finance era&apos;s most useful tool &mdash; multimodal AI on PDF documents &mdash;
        to make every gig worker, freelancer, and contract employee in South Africa visible to
        vehicle finance lenders. Regulated by POPIA, not FAIS or NCA, because it does not extend
        credit and does not hold bureau data.
      </p>

      <hr />

      <p className="footnote">
        <strong>References:</strong> NCA 34 of 2005 (Sections 40, 70, 81 and Regulation 23A);
        FAIS Act 37 of 2002 Section 1; TransUnion Q4 2025 Mobility Insights; Eighty20 Q4 2025
        Credit Stress Report; Upstart Q2 2025 earnings; Lendbuzz $266M ABS issuance July 2025;
        truID company profile (2M+ users, Open Finance platform). Repository:{" "}
        <a href="https://github.com/Iamhamptom/visio-open-finance">github.com/Iamhamptom/visio-open-finance</a>,
        commit <code>f9c6cd9</code>. Live deploy:{" "}
        <a href="https://visio-open-finance.vercel.app">visio-open-finance.vercel.app</a>.
      </p>

      <p className="footnote">
        Cite as: Hampton, D. (2026). &ldquo;Visio Open Finance: Bank-Statement-Driven
        Affordability for South Africa&apos;s Thin-File Car Buyers&rdquo;. Visio Research Labs,
        VRL-AUTO-008.
      </p>
    </PaperLayout>
  );
}
