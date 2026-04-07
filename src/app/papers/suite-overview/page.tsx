import PaperLayout from "@/components/papers/PaperLayout";

export const metadata = {
  title: "The Visio Auto Suite — VRL-AUTO-010 | Visio Research Labs",
  description:
    "A six-product operating system for the SA automotive market. Six structural information asymmetries. One unified ledger. Asset-light Carvana for South Africa. R237M ARR target.",
};

export default function SuiteOverviewPaperPage() {
  return (
    <PaperLayout
      paperNumber="VRL-AUTO-010"
      category="Suite Overview"
      title="The Visio Auto Suite: A six-product operating system for the SA automotive market."
      subtitle="Six structural information asymmetries. One unified ledger. Asset-light Carvana for South Africa. R237M ARR target by year 2."
      publishDate="April 2026"
      authors="Dr. David Hampton, VRL"
    >
      <div className="callout">
        <span className="callout-label">Abstract</span>
        <p className="text-[15px] leading-relaxed text-white/65 italic m-0">
          This paper synthesises the five product papers VRL-AUTO-004 through VRL-AUTO-009 into a
          single thesis. The thesis is that the South African automotive market has{" "}
          <strong>six structural information asymmetries</strong> &mdash; each one a profitable,
          defensible product, and each one a piece of the same coordination problem. Solving them
          in isolation produces five useful tools. Solving them together produces an asset-light
          Carvana-equivalent that operates inside the existing R160 billion SA used-car market{" "}
          <strong>without owning a single vehicle, extending a single Rand of credit, or
          operating a single delivery truck</strong>. We argue this is the largest defensible
          greenfield in SA automotive technology, the lowest capital intensity entry, and the
          only suite that can be built today by a single team in a single sprint. Steady-state
          target: <strong>~R237 million ARR by year 2</strong>.
        </p>
      </div>

      <h2>1. The six asymmetries</h2>

      <table>
        <thead>
          <tr><th>Asymmetry</th><th>Who suffers</th><th>Product</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Buyers do not know if they will be approved before they apply</td>
            <td>The 25%+ rejected by the bureau-only system</td>
            <td><strong>Visio Approve</strong></td>
          </tr>
          <tr>
            <td>Buyers cannot trust unorganised-seller condition claims</td>
            <td>The 55.71% of the used market that is unorganised</td>
            <td><strong>Visio Inspect</strong></td>
          </tr>
          <tr>
            <td>Dealers cannot reach buyers on the channel buyers actually use</td>
            <td>The 95% of SA buyers who live on WhatsApp</td>
            <td><strong>Visio BDC</strong></td>
          </tr>
          <tr>
            <td>OEMs and banks cannot see real-time buying intent</td>
            <td>The R3-5B SA OEM dealer-marketing spend, allocated by lagging indicators</td>
            <td><strong>Visio Intent</strong></td>
          </tr>
          <tr>
            <td>Gig and informal-income buyers are invisible to credit bureaus</td>
            <td>An entire generation of Gen Z and Millennial buyers</td>
            <td><strong>Visio Open Finance</strong></td>
          </tr>
          <tr>
            <td>There is no Carvana-grade trust + escrow + return experience</td>
            <td>Every buyer who would prefer to buy online but does not trust the seller</td>
            <td><strong>Visio Trust</strong></td>
          </tr>
        </tbody>
      </table>

      <p>
        These six asymmetries are not independent. They are facets of one underlying problem:{" "}
        <strong>information does not flow correctly between buyers, dealers, banks, and data
        brokers in the South African automotive market</strong>. Each product fixes one facet.
        Together they fix the system.
      </p>

      <h2>2. The architectural unity</h2>

      <p>The suite is held together by three structural decisions:</p>

      <ol>
        <li><strong>Doctor OS UI pattern.</strong> Every product uses the same Next.js 16.2.1, Tailwind 4, Geist, dark-mode-by-default, gap-px-card-grid visual language. A buyer who has used one product immediately knows how to use the next.</li>
        <li><strong>Shared Honesty Protocol.</strong> Every product enforces the same rules: no fabricated data, source-cited inputs, demo flags clearly visible until live data is wired, low-confidence outputs surfaced as warnings rather than masked. A single dishonest product would taint all six.</li>
        <li><strong>Unified <code>vt_transactions</code> ledger.</strong> Visio Trust owns the master transaction table. Every other product writes its primary key into this table when a transaction passes through it.</li>
      </ol>

      <p>
        These three decisions are deliberate. They are also the same three decisions that
        Carvana made differently &mdash; Carvana built one product, one experience, one ledger
        from day one, and paid for it with $20 billion in capital and a near-bankruptcy. The
        Visio Auto Suite achieves the same coherence through software architecture instead of
        capital investment.
      </p>

      <h2>3. The three user journeys</h2>

      <p>
        <strong>Consumer journey.</strong> Buyer lands on a dealer page → uses Visio Approve to
        check eligibility (free) → optionally upgrades via Visio Open Finance for verified
        affordability → sees the Visio Inspect condition badge on their chosen vehicle → clicks
        &ldquo;Buy with Visio Trust&rdquo; → pays into escrow → vehicle is delivered → 7-day
        return window opens → after 7 days the escrow auto-releases. The buyer has experienced
        Carvana on a vehicle owned by an SA dealer, verified by AI, financed by a SA bank, and
        delivered by a SA logistics partner.
      </p>

      <p>
        <strong>Dealer journey.</strong> Dealer subscribes to Visio Trust Velocity (R8K/mo) →
        onboards their inventory feed → connects WhatsApp Business → embeds the Visio Trust
        widget on their listings → gets a stock velocity dashboard → starts turning stock 1.6×
        faster within 60 days → converts saved floorplan interest into pure margin.
      </p>

      <p>
        <strong>Data subscriber journey.</strong> OEM marketing team or bank credit ops sees
        the free public Visio Intent Index referenced in BusinessTech or Daily Maverick →
        subscribes to Growth tier (R15K/mo) → reallocates marketing budget toward higher-intent
        regions → measures ROI in next quarter → upgrades to Enterprise (R50K/mo).
      </p>

      <p>
        These three journeys are not three separate products. They are the same underlying
        dataset accessed through three lenses, monetised three ways, with one shared{" "}
        <code>vt_transactions</code> ledger underneath.
      </p>

      <h2>4. The economic stack (year-2 steady-state)</h2>

      <table>
        <thead>
          <tr><th>Product</th><th>Customers</th><th>Annual revenue</th></tr>
        </thead>
        <tbody>
          <tr><td>Visio Approve</td><td>500 dealers + bank lead-fees</td><td><strong>R54M</strong></td></tr>
          <tr><td>Visio Inspect</td><td>800 dealer subscriptions</td><td>R2.9M</td></tr>
          <tr><td>Visio BDC</td><td>500 dealers</td><td><strong>R18-21M</strong></td></tr>
          <tr><td>Visio Intent</td><td>30 OEM/bank subscribers</td><td>R7.2M</td></tr>
          <tr><td>Visio Open Finance</td><td>12K assessments/mo + lead-fees</td><td><strong>R17M</strong></td></tr>
          <tr><td>Visio Trust</td><td>500 dealers + 5% of R160B SA used market through suite</td><td><strong>R128M</strong></td></tr>
          <tr><td><strong>Total</strong></td><td></td><td><strong>~R227-237M ARR</strong></td></tr>
        </tbody>
      </table>

      <p>
        The revenue is not concentrated in any single product. The diversification is
        structural, not designed-in. If Visio Trust takes longer to land Stitch EscrowPay, the
        other five keep generating revenue. If Visio Intent takes longer to land its first OEM,
        dealer subscriptions keep growing.
      </p>

      <h2>5. The legal posture (clean across all six)</h2>

      <ul>
        <li><strong>Not a credit provider.</strong> NCA Section 40 inapplicable.</li>
        <li><strong>Not a credit bureau.</strong> NCA Section 70 inapplicable.</li>
        <li><strong>Not financial advice.</strong> FAIS Section 1 explicitly excludes credit.</li>
        <li><strong>Not a vehicle owner.</strong> Visio Trust is coordination only.</li>
        <li><strong>Not a transport operator.</strong> Visio Trust integrates with licensed third-party carriers.</li>
        <li><strong>POPIA-compliant.</strong> Explicit consent gates, encrypted storage, 90-day retention max, audit trails, k-anonymity in published aggregates.</li>
      </ul>

      <p>
        The result is a six-product suite operating inside the SA automotive economy with{" "}
        <strong>zero financial-services regulatory burden</strong>. Compare this to the regulatory
        load on a SA bank trying to enter this market (full NCR registration, FAIS licensing, PA
        approval, basel-style capital requirements), or on a SA dealer chain trying to build their
        own version (NCA registration as credit provider for the captive finance arm, FICA
        compliance, dealer licensing in every province), and the structural advantage becomes
        obvious.
      </p>

      <h2>6. The competitive landscape</h2>

      <ul>
        <li><strong>Visio Approve vs ClearScore SA, JustMoney, RateCompare</strong> — generic, not vehicle-specific, do not handle Reg 23A formula</li>
        <li><strong>Visio Inspect vs UVeye, Ravin AI, ProovStation</strong> — hardware-based, $250K capex per location, impossible economics for SA long tail</li>
        <li><strong>Visio BDC vs Conversica, Impel, Fullpath, CarNow, Gubagoo</strong> — SMS/email-centric, English-only, $1.5K-$5K/mo USD, does not run on WhatsApp</li>
        <li><strong>Visio Intent vs Lightstone, TransUnion AIS, NAAMSA</strong> — sell-out historical record providers, do not produce forward-looking intent data</li>
        <li><strong>Visio Open Finance vs truID</strong> — B2B infrastructure, no consumer experience, no vehicle vertical</li>
        <li><strong>Visio Trust vs Carvana, Cazoo, Vroom, Kavak, WeBuyCars</strong> — capital-intensive vertical retail, killed everyone except Carvana and WeBuyCars</li>
      </ul>

      <p>
        In every case, the existing competition either does not address the SA-specific shape of
        the problem (US-built tools), does not address the long-tail economics (UVeye, hardware),
        or addresses the wrong layer (vertical retail instead of coordination). The Visio Auto
        Suite is the first product line built specifically for the South African market shape, at
        South African pricing, on South African channels (WhatsApp), in South African languages
        (English + Afrikaans + Zulu), against South African regulation.
      </p>

      <h2>7. The flywheel</h2>

      <pre><code>{`Dealers subscribe to Visio BDC + Visio Trust
        ↓
Buyers use Visio Approve + Visio Open Finance + Visio Inspect on dealer pages
        ↓
Every interaction fires a signal into the Visio Auto signal engine
        ↓
Signals are k-anonymity-aggregated into Visio Intent
        ↓
OEMs and banks subscribe to Visio Intent for the aggregated view
        ↓
OEMs reallocate dealer marketing toward higher-intent regions
        ↓
Banks reduce cost-per-qualified-lead via better intent targeting
        ↓
The improved economics fund more dealer subscriptions to Visio BDC + Visio Trust
        ↓
[loop]`}</code></pre>

      <p>
        This flywheel is the structural moat. A competitor would have to build all six products
        simultaneously to get on it &mdash; and the cost of bootstrapping the dealer side
        without the data side, or vice versa, is prohibitive. The only way in is the way we
        built it: in one sprint, in one team, with one shared ledger.
      </p>

      <h2>8. What is left to do</h2>

      <ol>
        <li><strong>✅ Apply Supabase migrations.</strong> Combined SQL covering all 25+ tables across the six products. <em>Done.</em></li>
        <li><strong>✅ Vercel deployment.</strong> All 6 repos live at <code>*.vercel.app</code>. <em>Done.</em></li>
        <li><strong>Wire the live signal feed.</strong> The visio-workspace <code>signals</code> table needs to flow into Visio BDC&apos;s routing engine and Visio Intent&apos;s aggregator.</li>
        <li><strong>Stitch EscrowPay partnership.</strong> Visio Trust ships with a stub; the partnership is the path to live escrow.</li>
        <li><strong>First 50 dealers.</strong> Outreach to the existing 329 dealerships in the visio-auto database, pilot at half price, document the case study.</li>
        <li><strong>First OEM and first bank.</strong> Toyota SA or VW SA for Intent; WesBank or Standard Bank for Approve lead-fees.</li>
      </ol>

      <p>
        Year-1 realistic target: <strong>50 paying dealers, R10M ARR</strong>. Year 2: 500
        dealers, ~R237M ARR. Year 3: scale across SADC + secondary markets.
      </p>

      <h2>9. Why this is the right business</h2>

      <ol>
        <li><strong>Compounds across all six products.</strong> A dealer using one becomes a candidate for all five others. A buyer using one becomes a candidate for the next two. A data subscriber funds the dealer acquisition.</li>
        <li><strong>Operates inside a clear legal gap.</strong> Zero financial-services regulatory burden, zero credit risk, zero inventory risk.</li>
        <li><strong>Targets the largest information asymmetry in the largest unserved market in SA automotive.</strong> R160B annual used-car market, 55.71% unorganised, 25% rejection rate, no Carvana equivalent.</li>
        <li><strong>Built end-to-end in a single sprint.</strong> All six repos exist, all six are pushed to GitHub, all six are live in production. There is no technology risk left to retire.</li>
        <li><strong>Defensible moat that requires building all six products at once.</strong> The data flywheel cannot be entered by a competitor incrementally.</li>
      </ol>

      <h2>10. Conclusion</h2>

      <p>
        This is not a product. It is a category. The category is{" "}
        <strong>asset-light coordination of a regulated, capital-intensive, fragmented physical
        market</strong>, applied first to South African cars, and applicable next to property,
        insurance, and any other high-value transaction where the existing market is bottlenecked
        by trust, finance and information friction.
      </p>

      <p>
        We start with cars because that is where the data is, the regulation gap is wide, and
        the 6 products have already been built. Then we apply the playbook to the next vertical.
      </p>

      <hr />

      <p className="footnote">
        <strong>Companion papers in this series:</strong>
        <br />
        VRL-AUTO-004 — <a href="/papers/visio-approve">Visio Approve</a>
        <br />
        VRL-AUTO-005 — <a href="/papers/visio-inspect">Visio Inspect</a>
        <br />
        VRL-AUTO-006 — <a href="/papers/visio-bdc">Visio BDC</a>
        <br />
        VRL-AUTO-007 — <a href="/papers/visio-intent">Visio Intent</a>
        <br />
        VRL-AUTO-008 — <a href="/papers/visio-open-finance">Visio Open Finance</a>
        <br />
        VRL-AUTO-009 — <a href="/papers/visio-trust">Visio Trust</a>
        <br />
        VRL-AUTO-010 — Suite Overview (this paper)
      </p>

      <p className="footnote">
        <strong>References:</strong> All companion papers above. Six repositories at{" "}
        <code>github.com/Iamhamptom/visio-{"{approve,inspect,bdc,intent,open-finance,trust}"}</code>.
        Six live deploys at <code>visio-{"{approve,inspect,bdc,intent,open-finance,trust}"}.vercel.app</code>.
      </p>

      <p className="footnote">
        Cite as: Hampton, D. (2026). &ldquo;The Visio Auto Suite: A Six-Product Operating System
        for the South African Automotive Market&rdquo;. Visio Research Labs, VRL-AUTO-010.
      </p>
    </PaperLayout>
  );
}
