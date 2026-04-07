import PaperLayout from "@/components/papers/PaperLayout";

export const metadata = {
  title: "Visio Inspect — VRL-AUTO-005 | Visio Research Labs",
  description:
    "Smartphone-grade AI vehicle inspection for South Africa's unorganised used-car market. 12 photos, Gemini 2.5 Vision, confidence-gated grading. The minimum viable trust layer for the R160B SA used market.",
};

export default function VisioInspectPaperPage() {
  return (
    <PaperLayout
      paperNumber="VRL-AUTO-005"
      category="Visio Inspect"
      title="Smartphone-grade AI vehicle inspection for SA's unorganised used-car market."
      subtitle="12 phone photos, Gemini 2.5 Vision, confidence-gated grading. The minimum viable trust layer for the 55.71% of the R160B SA used-car market served by private sellers and micro-dealers."
      publishDate="April 2026"
      authors="Dr. David Hampton, VRL"
    >
      <div className="callout">
        <span className="callout-label">Abstract</span>
        <p className="text-[15px] leading-relaxed text-white/65 italic m-0">
          The South African used-car market is valued at approximately{" "}
          <strong>R160 billion annually</strong>, of which <strong>55.71%</strong> flows through{" "}
          <em>unorganised sellers</em> &mdash; private individuals, micro-dealers, and informal
          traders outside organised dealership networks. The dominant friction is condition
          uncertainty. Hardware-based AI inspection (UVeye, $380.5M raised) solves this at
          organised dealerships at $100K-$250K per installation &mdash; economically impossible
          for the SA long tail. <strong>Visio Inspect</strong> is a smartphone-grade equivalent
          that produces a structured AI-graded condition report from twelve phone photos using
          Gemini 2.5 Vision in approximately five minutes. The system enforces an Honesty
          Protocol: if AI confidence on any panel falls below 0.5, that panel is excluded from
          the aggregate; if overall confidence falls below 0.7, the &ldquo;Verified by
          Visio&rdquo; badge is withheld. We argue this is the minimum viable trust
          infrastructure for the 55% of the SA used-car market that no incumbent serves.
        </p>
      </div>

      <h2>1. The market gap</h2>

      <p>South Africa&apos;s used-car market is bimodal:</p>

      <ul>
        <li><strong>Organised retail</strong> &mdash; Motus (R112.6bn revenue, 933 outlets), WeBuyCars (R26.4bn, 15,000 vehicles/month), AutoTrader.co.za, Cars.co.za. Offers roadworthy certification, dealer warranties, structured financing.</li>
        <li><strong>Unorganised retail</strong> &mdash; private sellers on Gumtree, Facebook Marketplace, OLX; micro-dealers in townships and small towns; informal traders. <strong>55.71% of transactions occur here</strong> (Mordor Intelligence, 2025). This is where buyers face the highest uncertainty and the lowest legal recourse.</li>
      </ul>

      <p>
        Globally, the response to this problem has been hardware: drive-through scanning bays
        from UVeye ($380.5M raised, latest $191M January 2025), Ravin AI, ProovStation, DeGould,
        Spinframe, Monk AI. Typical capex: $100K-$250K per location + monthly software fees.
      </p>

      <p>
        This is economically impossible in SA. There are roughly 2,000 independent dealers
        outside the major groups, plus an unknowable number of private sellers; the average SA
        used vehicle transacts at R416,082 (AutoTrader, January 2026). No UVeye ROI math works.
      </p>

      <p>
        Visio Inspect attacks the same problem with the only piece of hardware every SA used-car
        seller already owns: a smartphone.
      </p>

      <h2>2. The system</h2>

      <p>Visio Inspect captures twelve photos in a guided wizard:</p>

      <ul>
        <li>Front 3/4 left, Front straight, Front 3/4 right</li>
        <li>Right side, Rear 3/4 right, Rear straight, Rear 3/4 left, Left side</li>
        <li>Interior (driver side), Dashboard, Odometer close-up, VIN plate close-up</li>
      </ul>

      <p>
        Each photo is compressed client-side to under 500KB before upload (typical 4-6x
        compression via canvas JPEG re-encoding). On the server, each photo is sent to Gemini
        2.5 Flash via the Vercel AI SDK 6 <code>generateObject</code> function with a Zod v4
        schema constraining the response to four fields per panel:
      </p>

      <pre><code>{`{
  damage: "none" | "minor" | "moderate" | "severe",
  issues: string[],
  conditionScore: 1-10,
  confidence: 0-1,
}`}</code></pre>

      <p>
        The prompt explicitly instructs the model to set confidence below 0.6 if photo quality is
        poor or the panel is not visible. <strong>This is the central honesty mechanism.</strong>
      </p>

      <p>The aggregator then computes:</p>

      <ul>
        <li><strong>Overall grade A/B/C/D</strong>, derived only from panels with confidence ≥ 0.5</li>
        <li><strong>Recon cost band</strong> R0-5K / R5K-20K / R20K-50K / R50K+</li>
        <li><strong>&ldquo;Verified by Visio&rdquo; badge</strong> &mdash; granted only if average condition ≥ 7.0 AND every panel has confidence ≥ 0.7</li>
        <li><strong>VIN extraction</strong> via Gemini OCR with ISO 3779 check-digit validation</li>
        <li><strong>Odometer reading</strong> via Gemini OCR, sanity-checked against vehicle year</li>
      </ul>

      <h2>3. The Honesty Protocol (three layers)</h2>

      <ol>
        <li><strong>Schema constraint.</strong> Every panel requires a <code>confidence</code> field. The model cannot return a finding without committing to its uncertainty.</li>
        <li><strong>Aggregation gate.</strong> Panels with confidence below 0.5 are excluded from the average. A vehicle with four blurry photos cannot accidentally receive a Grade A.</li>
        <li><strong>Badge gate.</strong> The Verified by Visio badge requires <em>every</em> panel at confidence ≥ 0.7. A single uncertain panel withholds the badge for the entire vehicle. This pushes sellers to retake bad photos rather than gaming the system.</li>
      </ol>

      <p>
        When confidence is insufficient, the report displays{" "}
        <em>&ldquo;Insufficient data to verify this panel &mdash; manual inspection
        recommended&rdquo;</em> rather than guessing. This is consistent with the broader
        VisioCorp Honesty Protocol which forbids fabricating data even when refusing to fabricate
        produces a worse user experience.
      </p>

      <h2>4. Pricing and market access</h2>

      <p>
        Visio Inspect is free for the first report. Subsequent reports cost{" "}
        <strong>R49 each for private sellers</strong>, dealerships can subscribe for unlimited
        reports at <strong>R299/month</strong>. At the SA used-car median transaction price of
        R416,082, R49 is <strong>0.012% of the transaction value</strong> &mdash; well below any
        other source of friction in the deal.
      </p>

      <h2>5. Comparison to UVeye and global incumbents</h2>

      <table>
        <thead>
          <tr>
            <th></th>
            <th>UVeye / hardware AI</th>
            <th>Visio Inspect</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Capex per location</td>
            <td>$100K-$250K</td>
            <td><strong>R0</strong> (uses seller&apos;s phone)</td>
          </tr>
          <tr>
            <td>Inspection time</td>
            <td>~30 seconds drive-through</td>
            <td>~5 minutes guided wizard</td>
          </tr>
          <tr>
            <td>Confidence reporting</td>
            <td>Vendor-defined</td>
            <td>Per-panel, transparent</td>
          </tr>
          <tr>
            <td>Suitable for private sellers</td>
            <td>No</td>
            <td><strong>Yes</strong></td>
          </tr>
          <tr>
            <td>Suitable for micro-dealers</td>
            <td>No</td>
            <td><strong>Yes</strong></td>
          </tr>
          <tr>
            <td>Recurring cost to seller</td>
            <td>High (subscription + capex)</td>
            <td>R49 per report or R299/mo unlimited</td>
          </tr>
        </tbody>
      </table>

      <p>
        Visio Inspect is not trying to compete with UVeye at premium organised dealerships.
        It is trying to bring the bottom 80% of the trust pyramid into existence at all, in a
        market where the alternative is no inspection and no trust whatsoever.
      </p>

      <h2>6. Integration with the Visio Auto Suite</h2>

      <p>
        Visio Inspect&apos;s primary value to VisioCorp is not the standalone R49 reports. It is
        the <strong>trust layer</strong> that makes Visio Trust transactions possible. When a
        buyer clicks &ldquo;Buy with Visio Trust&rdquo; on a dealer listing, the first thing they
        see is the Visio Inspect grade and Verified by Visio badge for that specific vehicle.
        Without Inspect, Visio Trust is a payment processor; with Inspect, it is a Carvana-grade
        purchase experience.
      </p>

      <p>
        The integration is loose-coupled: <code>vt_transactions.inspect_report_id</code>{" "}
        references <code>vi_inspections.id</code>. If Inspect is offline, Visio Trust degrades
        gracefully to &ldquo;condition report unavailable&rdquo; &mdash; which is itself an
        honesty signal to the buyer.
      </p>

      <h2>7. Limitations</h2>

      <ul>
        <li>Smartphone constraint: undercarriage, frame straightness, and engine compartment internals are out of scope. Every report carries a disclaimer.</li>
        <li>Gemini Vision is not infallible; confidence scores are themselves estimates. We bias conservative and surface uncertainty rather than masking it.</li>
        <li>Network conditions in rural SA can make the upload slow. Client-side compression mitigates but does not eliminate this.</li>
      </ul>

      <h2>8. Conclusion</h2>

      <p>
        Visio Inspect is a deliberately small, deliberately honest tool. Its goal is not to
        replace a workshop inspection or to compete with hardware AI. Its goal is to give the
        55% of the South African used-car market that has no trust infrastructure at all the
        cheapest possible upgrade from &ldquo;no information&rdquo; to &ldquo;AI-graded structured
        report with explicit confidence&rdquo;. At R0 marginal cost to deploy and R49 per report
        to use, it is the minimum viable trust layer for the SA used-car long tail &mdash; and
        the foundation on which Visio Trust&apos;s escrow + delivery experience is built.
      </p>

      <hr />

      <p className="footnote">
        <strong>References:</strong> AutoTrader 2025/2026 Industry Report; Mordor Intelligence SA
        Used Car Market 2025; UVeye funding (PRNewswire Jan 2025); ISO 3779 VIN standard; Vercel
        AI SDK 6 <code>generateObject</code> documentation. Repository:{" "}
        <a href="https://github.com/Iamhamptom/visio-inspect">github.com/Iamhamptom/visio-inspect</a>,
        commit <code>f7edbe4</code>. Live deploy:{" "}
        <a href="https://visio-inspect.vercel.app">visio-inspect.vercel.app</a>.
      </p>

      <p className="footnote">
        Cite as: Hampton, D. (2026). &ldquo;Visio Inspect: Smartphone-Grade AI Vehicle Inspection
        for South Africa&apos;s Unorganised Used-Car Market&rdquo;. Visio Research Labs,
        VRL-AUTO-005.
      </p>
    </PaperLayout>
  );
}
