import PaperLayout from "@/components/papers/PaperLayout";

export const metadata = {
  title: "Visio BDC — VRL-AUTO-006 | Visio Research Labs",
  description:
    "A WhatsApp-native Business Development Center for South African car dealers. 38 signals, 30 templates in EN/AF/ZU, R1.5K-R5K/mo — 5-10× cheaper than Conversica/Impel/Fullpath.",
};

export default function VisioBDCPaperPage() {
  return (
    <PaperLayout
      paperNumber="VRL-AUTO-006"
      category="Visio BDC"
      title="A WhatsApp-native Business Development Center for SA car dealers."
      subtitle="38 buying-intent signals, 30 SA templates (English + Afrikaans + Zulu), R1,500-R5,000/month — built for the 2,000+ SA independent dealers priced out of US tools."
      publishDate="April 2026"
      authors="Dr. David Hampton, VRL"
    >
      <div className="callout">
        <span className="callout-label">Abstract</span>
        <p className="text-[15px] leading-relaxed text-white/65 italic m-0">
          South Africa is the most WhatsApp-saturated automotive market in the world: penetration
          exceeds <strong>95% of smartphone users</strong>, and the messaging app is the de facto
          channel for buyer-dealer communication across the entire 596,818-unit new vehicle
          market and the R160B used vehicle market. Yet none of the global automotive BDC
          platforms &mdash; Conversica, Impel, Fullpath, CarNow, Gubagoo &mdash; operate WhatsApp
          Business as a first-class channel. They are SMS- and email-centric tools designed for
          the US dealer market, priced at $1,000-$5,000/month, which prices out roughly 95% of
          South Africa&apos;s 2,000+ independent dealerships.{" "}
          <strong>Visio BDC</strong> is a WhatsApp-native BDC SaaS built around 38 buying-intent
          signals and 30 SA-specific message templates (EN + AF + ZU), priced for the SA long
          tail at R1,500-R5,000/month. Target: <strong>R18-21M ARR</strong>.
        </p>
      </div>

      <h2>1. The market gap</h2>

      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Funding</th>
            <th>Customers</th>
            <th>Pricing</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Conversica</td><td>$50M+</td><td>84,000 dealerships, 220M VINs</td><td>~$2,000/mo per franchise</td></tr>
          <tr><td>Impel (ex-SpinCar)</td><td>$126M+</td><td>8,000 dealers in 51 countries</td><td>$1,500-$3,500/mo</td></tr>
          <tr><td>Fullpath (ex-AutoLeadStar)</td><td>$55.9M</td><td>~1,000 dealers</td><td>$2,000-$5,000/mo</td></tr>
          <tr><td>CarNow, Gubagoo</td><td>private</td><td>private</td><td>enterprise</td></tr>
        </tbody>
      </table>

      <p>
        <strong>None of these tools treats WhatsApp Business API as a first-class channel.</strong>{" "}
        They are built for the US dealer market where SMS and email dominate. South Africa is
        structurally different: our dealers run their day on WhatsApp, our buyers expect WhatsApp
        replies within minutes, and our consumer trust in SMS is approximately zero (ruined by
        years of phishing and promotional spam).
      </p>

      <p>
        At $2,000-$5,000/month (~R36,000-R90,000/month at current exchange rates), these tools
        exclude approximately <strong>95% of SA&apos;s 2,000+ independent dealerships</strong>{" "}
        outside Motus, Super Group, Bidvest, CMH, McCarthy. Visio BDC is built for this gap at{" "}
        <strong>R1,500-R5,000/month</strong> &mdash; 5-10× cheaper.
      </p>

      <h2>2. The 38-signal taxonomy</h2>

      <p>
        <strong>Intent signals (12)</strong> &mdash; direct buyer-website interactions:
        brochure_download, finance_calc_used, test_drive_requested, trade_in_request,
        finance_app_started, vehicle_back_in_stock, price_drop_alert, showroom_visit, long_dwell,
        comparison_view, abandoned_form, social_engagement.
      </p>

      <p>
        <strong>Lifecycle signals (10)</strong> &mdash; relationship-driven triggers from existing
        customers: birthday, purchase_anniversary, warranty_expiring, maintenance_plan_expiring,
        license_disc_due, lease_ending, kilometres_threshold, model_year_change, family_change,
        referral_signal.
      </p>

      <p>
        <strong>Service signals (5)</strong> &mdash; workshop and aftermarket triggers:
        service_due, service_completed, recall_notice, tyre_due, battery_warning.
      </p>

      <p>
        <strong>External signals (6)</strong> &mdash; macro and competitive triggers:
        competitor_price_drop, interest_rate_cut, new_oem_promotion, new_stock_arrival,
        weather_event, fuel_price_change.
      </p>

      <p>
        <strong>Risk signals (5)</strong> &mdash; credit and account-health triggers:
        low_credit_alert, repo_signal, negative_equity, insurance_lapsed, license_overdue.
      </p>

      <h2>3. The template library</h2>

      <p>
        Visio BDC ships with <strong>30 pre-built WhatsApp message templates</strong>. Each
        template has variables (<code>{"{{first_name}}"}</code>, <code>{"{{vehicle}}"}</code>,
        etc.) and is mapped to one of the 38 signal types. For the top five highest-volume
        signals (test_drive_requested, brochure_download, back_in_stock, price_drop,
        anniversary), templates exist in <strong>three SA languages: English, Afrikaans, Zulu</strong>.
      </p>

      <p>Example for <code>test_drive_requested</code>:</p>

      <blockquote>
        &ldquo;Hi {"{{first_name}}"}, your test drive of the {"{{vehicle}}"} is confirmed. Bring
        your driver&apos;s licence and proof of address. See you soon!&rdquo;
      </blockquote>

      <p>
        27 words. Friendly, specific, action-oriented, free of marketing jargon. SA WhatsApp
        culture rejects anything that feels like spam, and dealer reps that use overly
        promotional templates see their messages marked as spam by Meta within days, killing
        their phone number reputation.
      </p>

      <p>
        All templates must be approved by Meta under WhatsApp Business Cloud API policy. Visio
        BDC ships with a manual-approval workflow and a sandbox mode for testing before
        submission.
      </p>

      <h2>4. The routing engine</h2>

      <p>
        Each dealer configures one or more <strong>routing rules</strong>: <code>signal_type →
        template → SLA → escalate_to</code>. When a signal fires, a cron job (every 5 minutes)
        finds the first matching rule, renders the template with the lead&apos;s variables, and
        sends the message via the dealer&apos;s connected WhatsApp Business number.
      </p>

      <p>
        If no human responds to the buyer&apos;s reply within the SLA window (defaults: 15 min
        for hot signals like <code>test_drive_requested</code>, 60 min for warm signals, 1440 min
        for lifecycle signals), the conversation escalates to the dealer-defined fallback user.
      </p>

      <p>
        Conversations land in a unified inbox. The dealer&apos;s team picks them up, replies in
        WhatsApp threads, and updates the lead&apos;s stage in a Kanban view (New → Contacted →
        Test Drive → Negotiating → Won/Lost).
      </p>

      <h2>5. Multi-tenant architecture</h2>

      <p>
        Visio BDC uses Postgres row-level security (RLS) on every table. Each table is prefixed{" "}
        <code>vbdc_</code> and includes a <code>dealer_id</code> column referenced by an RLS
        policy restricting access to rows where{" "}
        <code>dealer_id = current_setting(&apos;app.dealer_id&apos;)</code>. Dealers in the same
        town are direct competitors; RLS isolation is critical and enforced at the database
        layer, not the application layer.
      </p>

      <h2>6. Pricing</h2>

      <table>
        <thead>
          <tr><th>Tier</th><th>Price</th><th>Target customer</th></tr>
        </thead>
        <tbody>
          <tr><td>Starter</td><td><strong>R1,500/mo</strong></td><td>Solo dealer or small lot, 1 user, 50 leads/mo, 10 signals</td></tr>
          <tr><td>Pro (anchor)</td><td><strong>R3,000/mo</strong></td><td>5-user dealership, 500 leads/mo, all 38 signals, WhatsApp routing</td></tr>
          <tr><td>Scale</td><td><strong>R5,000/mo</strong></td><td>Multi-rooftop dealer group, unlimited users + leads, white-label</td></tr>
        </tbody>
      </table>

      <p>
        At Pro pricing, a dealership doing 40 deals/month at the SA average of R416,082
        generates R16.6M in monthly GMV. Visio BDC at R3,000/mo is <strong>0.018% of monthly
        GMV</strong> &mdash; below noise-level for an F&amp;I manager&apos;s procurement
        decision. Target: 500 dealerships on Pro = <strong>R18M ARR</strong>. Blended ARPU
        across the three tiers: R3,500/mo, so 500 dealerships ≈ <strong>R21M ARR</strong>.
      </p>

      <h2>7. The differences from US incumbents</h2>

      <ol>
        <li><strong>Channel.</strong> WhatsApp first, not SMS first.</li>
        <li><strong>Language.</strong> Afrikaans + Zulu variants, not English-only.</li>
        <li><strong>Price.</strong> R1,500-R5,000/month, not $1,500-$5,000/month.</li>
        <li><strong>Market.</strong> Built for the SA long tail of independent dealers, not the US franchise rooftop ecosystem.</li>
      </ol>

      <p>
        These four differences are not improvements; they are translations. Visio BDC actually{" "}
        <em>runs</em> on the channel SA buyers use, in the languages they speak, at the price SA
        dealers can afford.
      </p>

      <h2>8. Integration with the Visio Auto Suite</h2>

      <ul>
        <li><strong>Inbound</strong> &mdash; fed by the visio-auto signal engine (<code>signals</code> table)</li>
        <li><strong>Outbound</strong> &mdash; sends WhatsApp messages via Meta Cloud API</li>
        <li><strong>Cross-product</strong> &mdash; every lead in <code>vbdc_leads</code> can reference a <code>vt_transactions.id</code> once a Visio Trust transaction is created</li>
      </ul>

      <p>The automatic flow for a dealer using the full suite:</p>

      <ol>
        <li>Buyer downloads a brochure on the dealer&apos;s site</li>
        <li>Visio BDC fires the <code>lead_brochure_download</code> signal</li>
        <li>Matching template auto-sends via WhatsApp within 30 minutes</li>
        <li>Buyer replies asking about finance</li>
        <li>Dealer rep sends them a Visio Approve link</li>
        <li>Buyer runs the 7-step pre-approval, gets Green, clicks &ldquo;Buy with Visio Trust&rdquo;</li>
        <li>Transaction created in <code>vt_transactions</code>, linked back to <code>vbdc_leads.id</code></li>
      </ol>

      <p>
        This loop is not assembled from five separate vendors with five separate dashboards. It
        is one suite, with one ledger, one Honesty Protocol, and one bill.
      </p>

      <h2>9. Conclusion</h2>

      <p>
        Visio BDC is the WhatsApp-native, SA-priced, SA-language version of the BDC category
        that the US incumbents have not built and probably will not build. The opportunity is
        not technical novelty &mdash; it is correct localisation of a proven category to the
        largest unserved market in the world for it.
      </p>

      <hr />

      <p className="footnote">
        <strong>References:</strong> TransUnion Q4 2025 Mobility Insights (SA new vehicle market
        596,818 units); AutoTrader 2025/2026 Industry Report (R160B used market); Crunchbase
        Conversica/Impel/Fullpath/CarNow funding histories (verified 2026-04); Meta WhatsApp
        Business Cloud API documentation v22.0. Repository:{" "}
        <a href="https://github.com/Iamhamptom/visio-bdc">github.com/Iamhamptom/visio-bdc</a>,
        commit <code>9382520</code>. Live deploy:{" "}
        <a href="https://visio-bdc.vercel.app">visio-bdc.vercel.app</a>.
      </p>

      <p className="footnote">
        Cite as: Hampton, D. (2026). &ldquo;Visio BDC: A WhatsApp-Native Business Development
        Center for South African Car Dealers&rdquo;. Visio Research Labs, VRL-AUTO-006.
      </p>
    </PaperLayout>
  );
}
