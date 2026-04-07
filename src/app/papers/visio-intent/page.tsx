import PaperLayout from "@/components/papers/PaperLayout";

export const metadata = {
  title: "Visio Intent — VRL-AUTO-007 | Visio Research Labs",
  description:
    "A k-anonymity-protected buying intent index for the SA automotive market. The fourth data layer above NaTIS, Lightstone, and TransUnion — forward-looking, not historical.",
};

export default function VisioIntentPaperPage() {
  return (
    <PaperLayout
      paperNumber="VRL-AUTO-007"
      category="Visio Intent"
      title="A k-anonymity-protected buying intent index for the SA automotive market."
      subtitle="The fourth data layer above NaTIS, Lightstone, and TransUnion — forward-looking, methodologically transparent, and sold to the OEM marketing teams and banks that need it most."
      publishDate="April 2026"
      authors="Dr. David Hampton, VRL"
    >
      <div className="callout">
        <span className="callout-label">Abstract</span>
        <p className="text-[15px] leading-relaxed text-white/65 italic m-0">
          Three organisations control the meaningful automotive data layer in South Africa:{" "}
          <strong>Lightstone Auto</strong> (built on 2.8 million bank-recorded vehicle
          transactions), <strong>TransUnion Auto Information Solutions</strong> (eNaTIS-linked,
          daily refresh from SAPS, NAAMSA, RMI, BASA), and <strong>NAAMSA</strong> itself (monthly
          OEM sales aggregates). All three are sell-out and historical-record providers &mdash;
          they tell you what was sold, when, and at what price, after the fact. None of them
          publish forward-looking buying intent data. This paper introduces{" "}
          <strong>Visio Intent</strong>, a subscription data product that aggregates the 38
          buying-intent signals from the Visio Auto platform into a composite Index, enforces
          k-anonymity at minimum cell size 5 to satisfy POPIA, and sells the resulting view to
          OEM marketing teams and bank credit ops teams. Target:{" "}
          <strong>R7.2M ARR from 30 subscribers at blended R20K/month</strong>.
        </p>
      </div>

      <h2>1. The data monopoly map</h2>

      <p>
        The SA automotive data market is not a competitive free-for-all. It is three monopolies
        layered on each other:
      </p>

      <ul>
        <li><strong>NaTIS / eNaTIS</strong> &mdash; run by the Road Traffic Management Corporation. The sole national vehicle registration database. Not directly accessible to third parties.</li>
        <li><strong>Lightstone Auto</strong> &mdash; ~2.8 million bank-recorded vehicle transactions. Produces AutoMSA, vehicle valuations, dealer pricing tools. Customers include every major dealer group, every insurer, and most banks.</li>
        <li><strong>TransUnion Auto Information Solutions</strong> &mdash; Auto Vehicle Verifications + quarterly Vehicle Pricing Index + Mobility Insights Report. Refreshed daily from SAPS, NAAMSA, RMI, BASA.</li>
      </ul>

      <p>
        These three organisations own everything that has <em>already happened</em>:
        registrations, valuations, sales prices, accident records, finance defaults. They do not
        own &mdash; and have shown no interest in building &mdash; the data layer covering what
        is <em>about to happen</em>:
      </p>

      <ul>
        <li>Which buyers are downloading brochures right now?</li>
        <li>Which models have rising search velocity in which provinces this week?</li>
        <li>Which financing thresholds are buyers hitting in their pre-approval calculators?</li>
        <li>Which signals indicate a buyer is 2-4 weeks from a decision?</li>
      </ul>

      <p>This is the gap. None of the three incumbents publishes any of it. Visio Intent does.</p>

      <h2>2. The signal feed</h2>

      <p>
        Every signal that fires across the Visio Auto suite is k-anonymised, aggregated, and
        stored in <code>vint_signals_aggregate</code>:
      </p>

      <pre><code>{`period_start, period_end,
region        text,   -- 9 SA provinces
brand         text,   -- normalised brand name
segment       text,   -- hatch | sedan | bakkie | suv | luxury
signal_type   text,   -- one of 38
count         int,    -- count of signal occurrences
is_demo       boolean -- Honesty Protocol flag`}</code></pre>

      <p>
        Crucially, no individual record ever appears in this table. The minimum cell size is 5:
        any aggregation that would produce a cell with fewer than 5 records is hidden from the
        output, replaced with <code>null</code> and a &ldquo;k-anonymity suppressed&rdquo;
        indicator. Even an attacker with access to the entire database cannot identify any
        individual buyer or any individual dealer&apos;s exclusive activity.
      </p>

      <h2>3. The Index calculation</h2>

      <p>
        The headline <strong>Visio Intent Index</strong> is a single number 0-100 representing
        aggregated buying intent across SA:
      </p>

      <pre><code>{`function intentIndex(rows: AggregateRow[]): number {
  const visible = rows.filter(r => r.count >= MIN_CELL); // k-anonymity
  const total = visible.reduce((s, r) => s + r.count, 0);
  return Math.min(100, Math.round(Math.log10(total + 1) * 30));
}`}</code></pre>

      <p>
        A deliberately simple log-scale normalisation, not a complex composite. We chose
        simplicity for two reasons:
      </p>

      <ol>
        <li><strong>Methodological transparency.</strong> Every chart on the public Index page links to <code>/methodology</code>. A reader can reproduce every number from the published constants.</li>
        <li><strong>Resistance to gaming.</strong> Complex composite scores are vulnerable to a single high-velocity signal type inflating the headline. A log-scale on total volume is hard to manipulate without detectable spikes in the underlying distribution.</li>
      </ol>

      <p>
        The Index is published <strong>weekly (Monday 06:00 SAST)</strong> for the public free
        version. Subscribers receive daily aggregations (Growth tier) or real-time access
        (Enterprise tier).
      </p>

      <h2>4. Pricing and the marketing flywheel</h2>

      <table>
        <thead>
          <tr><th>Tier</th><th>Price</th><th>Access</th></tr>
        </thead>
        <tbody>
          <tr><td>Starter</td><td><strong>R5,000/mo</strong></td><td>Brand-level data, weekly resolution, 4-week history, PDF reports</td></tr>
          <tr><td>Growth</td><td><strong>R15,000/mo</strong></td><td>+ Region × Segment, daily resolution, 12-week history, CSV export, REST API</td></tr>
          <tr><td>Enterprise</td><td><strong>R50,000/mo</strong></td><td>+ Raw signal-type drilldown, real-time access, custom queries, dedicated CSM</td></tr>
        </tbody>
      </table>

      <p>
        Above this paid tier sits a <strong>free public Index page</strong> at <code>/live</code>{" "}
        that anyone can view. This is the marketing flywheel: it gets quoted in BusinessTech,
        Daily Maverick, Moneyweb every time Toyota&apos;s intent score spikes or Chery&apos;s
        overtakes GWM&apos;s. Each citation drives subscription enquiries from OEMs and banks
        who want the underlying drilldowns.
      </p>

      <p>
        Target: <strong>30 subscribers across the three tiers, blended ARPU R20K/month,
        generating R7.2M ARR.</strong>
      </p>

      <h2>5. The OEM use case</h2>

      <p>
        A SA OEM marketing team &mdash; say, Toyota SA &mdash; currently allocates roughly
        R500M-R1B/year to dealer co-op marketing across their network. The decisions about{" "}
        <em>where</em> this money goes are made on lagging indicators: last quarter&apos;s sales
        by region, last year&apos;s brand surveys. Toyota does not have a real-time view of
        which provinces are seeing rising Hilux intent vs falling Hilux intent this week.
      </p>

      <p>Visio Intent&apos;s Enterprise tier (R50K/mo) gives Toyota that view:</p>

      <ul>
        <li>Hilux intent up 14% week-over-week in KwaZulu-Natal, down 8% in Gauteng</li>
        <li>Fortuner intent rising in the Eastern Cape, where Toyota has only 3 dealerships</li>
        <li>Corolla Cross intent being captured by Chery Tiggo 4 Pro searches, suggesting cross-shopping</li>
      </ul>

      <p>
        These insights inform a R50K/month subscription paying for itself by reallocating
        R5-10M of co-op marketing per quarter. <strong>The ROI is approximately 20×.</strong>
      </p>

      <h2>6. The bank use case</h2>

      <p>
        WesBank currently buys leads from comparison sites at R200-R500 per qualified
        application. Lead quality varies wildly because comparison sites optimise for volume,
        not intent maturity.
      </p>

      <p>
        Visio Intent&apos;s Growth tier (R15K/mo) gives WesBank a feed of which postcodes and
        brands are seeing the highest application-stage intent (signal:{" "}
        <code>finance_app_started</code>). WesBank can then bid more aggressively on Google Ads
        for those exact postcodes and brands, reducing cost-per-qualified-lead by an estimated
        30-40%. At WesBank&apos;s January 2026 volume of 215,050 applications, even a 5%
        improvement justifies the subscription.
      </p>

      <h2>7. The Honesty Protocol in a data product</h2>

      <p>
        Selling data is the highest-trust business in any market. A single fabricated number,
        exposed publicly, kills the entire product. Visio Intent enforces honesty in three ways:
      </p>

      <ul>
        <li><strong>Demo flag.</strong> Until the live signal feed is wired from the visio-workspace <code>signals</code> table into <code>vint_signals_aggregate</code>, every data point is flagged <code>is_demo: true</code> at the database level and surfaced in a banner on every page.</li>
        <li><strong>K-anonymity at the database level, not the application level.</strong> The <code>vint_signals_aggregate</code> table itself enforces minimum cell size 5 via a CHECK constraint.</li>
        <li><strong>Methodology page everywhere.</strong> Every chart, table, and API response includes a link to <code>/methodology</code>. A subscriber can reproduce any number we publish from the published constants.</li>
      </ul>

      <h2>8. Comparison to incumbents</h2>

      <table>
        <thead>
          <tr><th></th><th>Lightstone Auto</th><th>TransUnion AIS</th><th>Visio Intent</th></tr>
        </thead>
        <tbody>
          <tr><td>Data type</td><td>Sell-out (transactions)</td><td>Sell-out (registrations)</td><td><strong>Buying intent (forward-looking)</strong></td></tr>
          <tr><td>Update cadence</td><td>Monthly/quarterly</td><td>Daily</td><td>Daily/real-time</td></tr>
          <tr><td>Pricing</td><td>Enterprise contracts</td><td>Enterprise contracts</td><td><strong>R5K-R50K/mo, transparent</strong></td></tr>
          <tr><td>Public layer</td><td>None</td><td>Quarterly VPI release</td><td><strong>Free weekly Index</strong></td></tr>
          <tr><td>Methodology</td><td>Proprietary</td><td>Proprietary</td><td><strong>Published, reproducible</strong></td></tr>
        </tbody>
      </table>

      <p>
        We are not competing with Lightstone or TransUnion. They own the historical record. We
        own the forward-looking signal. The two layers are complementary: an OEM subscribing to
        both gets a complete picture.
      </p>

      <h2>9. Conclusion</h2>

      <p>
        Visio Intent is the missing fourth layer of the South African automotive data market.
        The first three layers (NaTIS, Lightstone, TransUnion) are mature, well-funded, and own
        the historical record. The fourth layer &mdash; real-time, k-anonymity-protected,
        methodologically transparent buying intent &mdash; does not exist anywhere in SA today.
        We build it as a side-effect of running the Visio Auto suite, and sell it back to the
        OEMs and banks that need it most.
      </p>

      <hr />

      <p className="footnote">
        <strong>References:</strong> Lightstone Auto product page (2.8M bank transactions);
        TransUnion Q4 2025 Mobility Insights; TransUnion SA Vehicle Pricing Index Q4 2025;
        NAAMSA December 2025 sales release; Eighty20 Credit Stress Report (k-anonymity model
        precedent); POPIA Act 4 of 2013, Section 18 (de-identification standards). Repository:{" "}
        <a href="https://github.com/Iamhamptom/visio-intent">github.com/Iamhamptom/visio-intent</a>,
        commit <code>bf5d950</code>. Live deploy:{" "}
        <a href="https://visio-intent.vercel.app">visio-intent.vercel.app</a>. Public Index at{" "}
        <a href="https://visio-intent.vercel.app/live">/live</a>.
      </p>

      <p className="footnote">
        Cite as: Hampton, D. (2026). &ldquo;Visio Intent: A K-Anonymity-Protected Buying Intent
        Index for the South African Automotive Market&rdquo;. Visio Research Labs, VRL-AUTO-007.
      </p>
    </PaperLayout>
  );
}
