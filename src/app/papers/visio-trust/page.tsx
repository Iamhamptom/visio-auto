import PaperLayout from "@/components/papers/PaperLayout";

export const metadata = {
  title: "Visio Trust — VRL-AUTO-009 | Visio Research Labs",
  description:
    "An asset-light stock velocity operating system for SA car dealers. Escrow + delivery + 7-day return + unified ledger. The Carvana experience without the Carvana balance sheet. R128M ARR target.",
};

export default function VisioTrustPaperPage() {
  return (
    <PaperLayout
      paperNumber="VRL-AUTO-009"
      category="Visio Trust"
      title="An asset-light stock velocity OS for South African car dealers."
      subtitle="Escrow + delivery + 7-day return + unified ledger. The Carvana experience on SA's R160 billion used-car market — without owning a single vehicle. R128M ARR target."
      publishDate="April 2026"
      authors="Dr. David Hampton, VRL"
    >
      <div className="callout">
        <span className="callout-label">Abstract</span>
        <p className="text-[15px] leading-relaxed text-white/65 italic m-0">
          Carvana built a $20.3 billion vertically integrated used-car retailer in the US.
          WeBuyCars built a R26.4 billion version in SA. Both required massive capital,
          warehouses, logistics fleets, and inventory risk. Both nearly died (Carvana down 99%
          from peak in 2022; Cazoo, the UK copy, dead in May 2024 with £260M in debt; Kavak,
          Mexico, lost 75% of valuation between 2021 and 2025). The capital-intensive vertical
          retail model is structurally fragile in any market not already at scale.{" "}
          <strong>Visio Trust</strong> is an asset-light coordination layer that achieves the
          Carvana experience &mdash; verified condition, pre-approved finance, escrow-held
          payment, delivery, 7-day return &mdash; <strong>without owning inventory, extending
          credit, or operating delivery vehicles.</strong> Built on top of the other five Visio
          Auto products (Inspect, Approve, Open Finance, BDC, Intent) with three new layers:
          escrow integration (via Stitch EscrowPay), delivery orchestration, and the unified{" "}
          <code>vt_transactions</code> ledger. Target: <strong>R128M ARR</strong> from R48M
          subscriptions + R80M GMV fees on 5% of the R160B SA used market.
        </p>
      </div>

      <h2>1. The Carvana model and why it does not transplant</h2>

      <p>Carvana&apos;s 2025 financials are remarkable:</p>

      <ul>
        <li><strong>$20.3 billion revenue</strong></li>
        <li><strong>$1.9 billion net income</strong></li>
        <li><strong>596,641 retail units</strong></li>
        <li><strong>4.7% net margin</strong> (2× industry average)</li>
        <li>Recovery from near-bankruptcy in 2022 to most profitable used-car retailer in US history by 2025</li>
      </ul>

      <p>The model has three pillars:</p>

      <ol>
        <li><strong>Standardised reconditioning.</strong> Every Carvana car through a 150-point inspection, reconditioned to Carvana&apos;s published standard.</li>
        <li><strong>Finance attached at browse step.</strong> Carvana originates its own auto loans, packages them into ABS, earns finance income.</li>
        <li><strong>Logistics orchestration.</strong> Carvana operates its own delivery fleet, vending machines, inspection centres.</li>
      </ol>

      <p>This is a beautiful business when it works. It has also nearly killed everyone who tried to copy it:</p>

      <ul>
        <li><strong>Cazoo (UK)</strong> &mdash; $8B SPAC 2021, administration May 2024, £260M debt</li>
        <li><strong>Vroom (US)</strong> &mdash; exited used-car retail January 2024 after years of losses</li>
        <li><strong>Kavak (Mexico)</strong> &mdash; $8.7B 2021, $2.2B March 2025 (-75%), exited Peru and Colombia</li>
        <li><strong>Shift Technologies (US)</strong> &mdash; bankrupt 2023</li>
      </ul>

      <p>
        WeBuyCars works <em>because</em> it is owned by SA&apos;s largest dealer conglomerate
        with deep capital reserves, two decades of refinement, and physical advantages (60+
        buying branches) no startup could replicate.
      </p>

      <h2>2. The asset-light alternative</h2>

      <p>
        Visio Trust attacks the same problem from the opposite direction. Instead of owning the
        cars, the warehouses, the loans, and the trucks, we own the{" "}
        <strong>coordination layer</strong> above the existing SA used-car ecosystem.
      </p>

      <ol>
        <li><strong>Verified condition</strong> &mdash; Visio Inspect</li>
        <li><strong>Pre-approved finance</strong> &mdash; Visio Approve + Visio Open Finance</li>
        <li><strong>Escrow-held payment</strong> &mdash; Stitch EscrowPay or attorney trust</li>
        <li><strong>Delivery orchestration</strong> &mdash; Loop / Picup / WeBuyCars-as-carrier</li>
        <li><strong>7-day return guarantee</strong> &mdash; via escrow state machine</li>
      </ol>

      <p>What Visio Trust does <em>not</em> do:</p>

      <ul>
        <li>We do not own a single car</li>
        <li>We do not extend a single Rand of credit</li>
        <li>We do not operate a single delivery vehicle</li>
        <li>We do not store a single vehicle in inventory</li>
        <li>We do not take title to anything</li>
      </ul>

      <p>
        We are the <strong>trust + intent + finance + verification + transaction</strong> layer
        that makes the existing R160B SA used-car market behave like Carvana behaves in the US.
        The dealer keeps owning their stock. The bank keeps owning the credit risk. The
        logistics partner keeps owning the trucks. We own the coordination &mdash; and the data
        flywheel that comes with it.
      </p>

      <h2>3. The stock velocity insight</h2>

      <p>
        The economic case for Visio Trust to a SA car dealer is not the consumer-trust
        experience. It is <strong>stock velocity</strong>. Per 2025 AutoTrader Industry Report:
      </p>

      <ul>
        <li>Appropriately priced SUVs sell within 33-35 days</li>
        <li>Appropriately priced compact hatches sell within 28-30 days</li>
        <li><strong>Typical unoptimised SA dealer holds stock at ~47 days average</strong></li>
      </ul>

      <p>
        Every extra day on the lot is floorplan interest the dealer pays to a bank. At a typical
        floorplan rate of 12.75% annual on a R416,082 average vehicle:
      </p>

      <pre><code>{`floorplan_interest_per_day = R416,082 × (0.1275 / 365) = R145.40 per car per day`}</code></pre>

      <p>A dealer doing 40 cars per month who can shave 18 days off their average days-on-lot saves:</p>

      <pre><code>{`40 cars × 18 days × R145.40/day × 12 months = R1,254,490 per year`}</code></pre>

      <p>
        <strong>R1.25M of pure margin recovered</strong> for the cost of a R8,000/month Velocity
        subscription = R96,000/year. The ROI is <strong>approximately 13×</strong> before you
        count any other benefits (improved F&amp;I attach rates, fewer fall-through deals, better
        lead quality from BDC routing, cheaper marketing because Intent tells you when
        you&apos;re above market).
      </p>

      <p>
        This is the entire sales pitch. It is research-grounded, math-obvious, and aligned with
        what dealers already care about.
      </p>

      <h2>4. The unified transaction ledger</h2>

      <p>
        Visio Trust&apos;s central technical artefact is the <code>vt_transactions</code> table
        &mdash; the <strong>single source of truth for any car transaction flowing through the
        Visio Auto suite</strong>:
      </p>

      <pre><code>{`vt_transactions:
  id                          uuid PK
  dealer_id                   → vt_dealers.id
  vin                         text
  vehicle_description         text
  price_zar                   numeric
  buyer_email                 text

  -- Foreign refs into the 5 sibling products
  inspect_report_id           text
  approve_simulation_id       text
  open_finance_assessment_id  text
  bdc_lead_id                 uuid
  intent_price_check          jsonb

  -- Visio Trust's own state machine
  escrow_account_id           text
  escrow_status               text   -- pending|held|released|refunded|disputed
  delivery_status             text
  return_deadline             timestamptz
  status                      text   -- pending|held|delivered|returnable|completed|disputed`}</code></pre>

      <p>
        Every other product writes its primary key into this table. This is the layer that makes
        &ldquo;Visio Auto Suite&rdquo; a coherent product line rather than five separate apps. A
        dealer&apos;s history of stock velocity, F&amp;I attach rates, customer touchpoints, and
        escrow throughput all live in <code>vt_transactions</code> joined to the sibling tables.
        Leaving the suite means losing the entire historical view &mdash; which is the central
        switching cost.
      </p>

      <h2>5. The escrow architecture</h2>

      <p>
        Escrow is the most legally sensitive component. We deliberately do not hold buyer funds
        ourselves. Instead, funds flow into a regulated third-party escrow facility under one of
        three patterns:
      </p>

      <ol>
        <li><strong>Stitch EscrowPay (preferred).</strong> Registered SA payments fintech with an EscrowPay product designed for marketplace use cases. API-driven, programmatic, full state machine.</li>
        <li><strong>Attorney trust account (backup).</strong> Traditional, well-understood, irrefutably legal in SA. Slower and more manual but always available.</li>
        <li><strong>Direct bank holding account (cheapest).</strong> Ozow + dedicated holding account with strict reconciliation. Slight legal ambiguity until tested.</li>
      </ol>

      <p>
        Visio Trust ships with the Stitch path as primary, attorney trust as backup, and a{" "}
        <strong>stub mode</strong> that flags every escrow event with <code>is_stub: true</code>{" "}
        until the Stitch partnership is signed. The product is fully runnable today and
        transitions to live escrow without code changes.
      </p>

      <h2>6. The 7-day return mechanism</h2>

      <pre><code>{`T0:         Buyer pays into escrow → status = pending
T0:         Visio Trust opens escrow account → status = held
T+0 to T+5: Delivery scheduled and executed
T+5:        Vehicle delivered → return_deadline = delivered_at + 7 days
T+5 to T+12: Buyer can request return at no cost
T+12:       Auto-release to dealer minus 1% GMV fee → status = completed`}</code></pre>

      <p>
        If the buyer requests a return inside the 7-day window, the escrow refunds and the
        carrier picks up the vehicle. The dealer never had the money in their account, so the
        refund is friction-free. <strong>This is the structural advantage of escrow over
        post-payment-with-refund: there is nothing to claw back.</strong>
      </p>

      <h2>7. Pricing and revenue</h2>

      <table>
        <thead>
          <tr><th>Tier</th><th>Price</th><th>Included</th></tr>
        </thead>
        <tbody>
          <tr><td>Starter</td><td><strong>R3,000/mo</strong></td><td>Up to 50 listings, basic Inspect reports, Approve widget</td></tr>
          <tr><td>Velocity (anchor)</td><td><strong>R8,000/mo</strong></td><td>Unlimited listings, Inspect + Approve on every car, signal routing, stock velocity dashboard</td></tr>
          <tr><td>Complete</td><td><strong>R15,000/mo + 1% GMV</strong></td><td>Everything + Open Finance + Escrow + Delivery + 7-day return + Intent data + dedicated CSM</td></tr>
        </tbody>
      </table>

      <p>
        Target: <strong>500 dealers × blended R8K/month = R48M ARR from subscriptions</strong>,
        plus <strong>1% GMV on 5% of the R160B SA used market = R80M ARR from transaction
        fees</strong>. Combined: <strong>~R128M ARR</strong>.
      </p>

      <h2>8. Three structural moats</h2>

      <ol>
        <li><strong>Network effects within the suite.</strong> Each product makes the others more valuable. The full suite is structurally more valuable than any individual product.</li>
        <li><strong>The unified ledger as switching cost.</strong> A dealer with six months of stock velocity + F&amp;I + touchpoint + escrow history in <code>vt_transactions</code> cannot leave without losing the entire view.</li>
        <li><strong>Data flywheel feeding Visio Intent.</strong> Every Visio Trust transaction adds k-anonymised signal data to the Intent index. The more dealers use Trust, the more valuable Intent becomes to OEMs and banks. Competitors cannot replicate without first building the upstream signal capture across hundreds of dealers &mdash; which takes years.</li>
      </ol>

      <h2>9. What can go wrong</h2>

      <ul>
        <li><strong>Stitch EscrowPay partnership delays.</strong> Mitigation: ship with stub mode + attorney trust as backup.</li>
        <li><strong>WeBuyCars retaliates.</strong> Vertically integrated; building dealer-facing SaaS would cannibalise their own funnel. Expect them to ignore us until scale.</li>
        <li><strong>A major dealer group builds in-house.</strong> Motus or Super Group could theoretically build their own. They probably won&apos;t because (a) they prefer specialists and (b) network effects favour a neutral cross-dealer layer.</li>
        <li><strong>Honesty Protocol violation.</strong> The existential risk. A single fabricated stock velocity number, a single fake testimonial, a single inflated revenue claim &mdash; and the entire suite&apos;s credibility collapses. Mitigation: demo flags everywhere, source-cited benchmarks, explicit <code>is_stub: true</code> markers in the database itself.</li>
      </ul>

      <h2>10. Conclusion</h2>

      <p>
        Visio Trust is the asset-light answer to a question Carvana, Cazoo, Vroom and Kavak all
        answered the wrong way. The Carvana experience is the right experience. The Carvana
        balance sheet is the wrong balance sheet. By owning only the coordination layer &mdash;
        escrow, inspection-as-a-trust-signal, finance pre-approval, delivery orchestration, and
        a 7-day return guarantee &mdash; Visio Trust delivers the Carvana buyer experience to
        the South African used-car market without any of the capital intensity that has killed
        every other attempt.
      </p>

      <p>
        The R128M ARR target is the floor; the ceiling is whatever fraction of the R160B SA
        used-car market we can convince dealers to route through us. The economic case to the
        dealer is stock velocity, not consumer trust. The economic case to the buyer is
        Carvana-grade purchase experience on any car. The legal case to regulators is that we
        are a coordination layer, not a credit provider, not a bureau, and not a vehicle owner.
        All three cases are structurally correct.
      </p>

      <p><strong>This is the business.</strong></p>

      <hr />

      <p className="footnote">
        <strong>References:</strong> Carvana Q4 and full-year 2025 earnings (investors.carvana.com,
        2026-02-18); Cazoo bankruptcy (Fortune, May 2024); Kavak valuation collapse (Bloomberg,
        April 2025); AutoTrader 2025 Industry Report (stock velocity benchmarks); TransUnion Q4
        2025 Mobility Insights; Mordor Intelligence SA Used Car Market 2025 (R160B annual
        market); Stitch EscrowPay product documentation. Repository:{" "}
        <a href="https://github.com/Iamhamptom/visio-trust">github.com/Iamhamptom/visio-trust</a>,
        commit <code>3ddb300</code>. Live deploy:{" "}
        <a href="https://visio-trust.vercel.app">visio-trust.vercel.app</a>.
      </p>

      <p className="footnote">
        Cite as: Hampton, D. (2026). &ldquo;Visio Trust: An Asset-Light Stock Velocity Operating
        System for South African Car Dealers&rdquo;. Visio Research Labs, VRL-AUTO-009.
      </p>
    </PaperLayout>
  );
}
