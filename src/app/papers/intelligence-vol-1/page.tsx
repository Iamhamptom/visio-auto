import PaperLayout from "@/components/papers/PaperLayout";

export const metadata = {
  title: "SA Automotive Intelligence Vol. 1, 2026 | VRL-AUTO-001 | Visio Research Labs",
  description:
    "South African Automotive Intelligence Report Vol. 1, 2026. Verified NAAMSA 2025 data, dealer group performance, Chinese OEM disruption, jobs and macro context. Free for all dealership partners.",
};

export default function IntelligenceVol1Page() {
  return (
    <PaperLayout
      paperNumber="VRL-AUTO-001"
      category="Market Intelligence"
      title="SA Automotive Intelligence — Vol. 1, 2026."
      subtitle="A research-grade quarterly briefing on the South African automotive market: verified 2025 NAAMSA results, brand share shifts, the Chinese OEM disruption, dealer performance, jobs and macro context, and forward-looking analysis for SA dealerships."
      publishDate="April 2026"
      authors="Jess (AI) + VRL Editorial"
    >
      {/* Abstract */}
      <div className="callout">
        <span className="callout-label">Executive Summary — updated April 2026</span>
        <p className="text-[15px] leading-relaxed text-white/65 italic m-0">
          South Africa&apos;s new vehicle market staged a decisive recovery in 2025, with NAAMSA
          reporting <strong>596,818 total units sold &mdash; up 15.7% on 2024</strong>. The
          momentum has accelerated into Q1 2026: <strong>March 2026 reached 58,060 units, the
          best March since 2007</strong>, with year-to-date volumes tracking 12% ahead of Q1 2025.
          The bigger story is structural. Suzuki overtook Volkswagen Group for the #2 brand
          position for the first time ever in 2025. Chinese OEMs collectively pushed past 17% of
          new passenger sales (up from &lt;5% four years prior). And in a watershed moment for
          local manufacturing, <strong>Chery South Africa has acquired Nissan&apos;s 60-year-old
          Rosslyn plant in Tshwane</strong> &mdash; the first major Chinese OEM industrial
          footprint in SA. Meanwhile, exports collapsed 28.1% YoY in February 2026 and Morocco
          has overtaken South Africa as the #1 vehicle producer on the African continent. The
          retail boom and the manufacturing crisis are happening in the same market, at the same
          time. This paper documents both. Every figure is sourced from NAAMSA, TransUnion,
          AutoTrader, SARS, Stats SA, dealer group SENS announcements, and the trade press.
          Sources cited inline.
        </p>
      </div>

      <h2>1. The headline numbers — verified</h2>

      <p>
        The most important fact about the South African automotive market in 2025 is that it
        finally broke out of its post-pandemic compression. The market did not just recover &mdash;
        it posted its strongest annual print in over ten years.
      </p>

      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>2024</th>
            <th>2025</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total new vehicle sales (units)</td>
            <td>515,712</td>
            <td><strong>596,818</strong></td>
            <td><strong>+15.7%</strong></td>
          </tr>
          <tr>
            <td>Passenger cars (units)</td>
            <td>~351,500</td>
            <td><strong>422,292</strong></td>
            <td><strong>+20.1%</strong></td>
          </tr>
          <tr>
            <td>Light commercial vehicles</td>
            <td>~152,500</td>
            <td>~155,000</td>
            <td>flat</td>
          </tr>
          <tr>
            <td>Used vehicles (AutoTrader-tracked)</td>
            <td>~358,000</td>
            <td><strong>383,410</strong></td>
            <td><strong>+7.0%</strong></td>
          </tr>
          <tr>
            <td>Used vehicle market value (R)</td>
            <td>R149.6bn</td>
            <td><strong>R160.1bn</strong></td>
            <td><strong>+7.0%</strong></td>
          </tr>
        </tbody>
      </table>

      <p className="footnote">
        Sources: <a href="https://novuspressbulletin.co.za/blog/naamsa-releases-december-2025-and-full-year-2025-new-vehicle-sales-stats">NAAMSA December 2025 / Full Year 2025 release</a>;{" "}
        <a href="https://techcentral.co.za/south-africas-new-car-market-roared-back-to-life-in-2025-with-nevs-gaining-ground/276019/">TechCentral analysis</a>;{" "}
        <a href="https://iol.co.za/business-report/companies/2026-01-07-new-vehicle-sales-surge-past-pre-pandemic-levels-to-clock-nearly-600-000-in-2025/">IOL Business Report</a>;{" "}
        <a href="https://dealerfloor.co.za/industry-news/how-affordability-reshaped-south-africas-used-car-market-in-2025">Dealerfloor on AutoTrader 20th Annual Report</a>.
      </p>

      <h4>1.1 Why 2025 happened — the four tailwinds</h4>

      <ol>
        <li><strong>Interest rate cuts.</strong> The South African Reserve Bank delivered a cumulative 150 basis points of rate cuts from September 2024 onwards. For a typical R400,000 vehicle financed over 72 months, that translates to roughly R900-R1,100 per month off the instalment &mdash; meaningful enough to reset affordability for the marginal buyer.</li>
        <li><strong>Vehicle inflation collapsed.</strong> The arrival of Chinese OEM volume at 15-25% below comparable Toyota and VW pricing applied direct downward pressure on average transaction prices. New vehicle inflation in 2025 was the lowest in years.</li>
        <li><strong>Two-pot retirement reform.</strong> The September 2024 implementation of South Africa&apos;s two-pot retirement system released an estimated R40-60 billion of household liquidity in 2025, much of which flowed into vehicle deposits, debt repayment, and consumer durables.</li>
        <li><strong>Improved consumer sentiment.</strong> The post-2024 Government of National Unity (GNU) period coincided with materially improved business and consumer confidence indices, plus the suspension of meaningful load-shedding through most of 2025.</li>
      </ol>

      <h2>1.2 Q1 2026 update — the momentum continues</h2>

      <p>
        Since this paper&apos;s initial publication, NAAMSA has released Q1 2026 monthly data.
        The 2025 recovery is not slowing &mdash; it is accelerating.
      </p>

      <table>
        <thead>
          <tr>
            <th>Reporting month</th>
            <th>Total domestic sales (units)</th>
            <th>YoY growth</th>
            <th>Headline</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>January 2026</td>
            <td><strong>50,073</strong></td>
            <td>+7.5%</td>
            <td>LCVs rebound +11%; passenger cars +7.1%</td>
          </tr>
          <tr>
            <td>February 2026</td>
            <td><strong>53,455</strong></td>
            <td>+11.4%</td>
            <td><strong>Best February since 2013</strong></td>
          </tr>
          <tr>
            <td>March 2026</td>
            <td><strong>58,060</strong></td>
            <td>+17.3%</td>
            <td><strong>Best March since 2007</strong> &mdash; passenger +18.2%</td>
          </tr>
          <tr>
            <td><strong>Q1 2026 total</strong></td>
            <td><strong>~161,588</strong></td>
            <td><strong>+12.0%</strong></td>
            <td>Tracking ahead of Q1 2025 by 12%</td>
          </tr>
        </tbody>
      </table>

      <p>
        Of the 58,060 vehicles sold in March 2026, an estimated 88.7% (51,481 units) were channeled
        through traditional dealer networks &mdash; with vehicle rental at 5.5%, government at 3.2%,
        and corporate fleets at 2.6%. The overwhelming dominance of dealership sales indicates
        that this growth is driven by ordinary retail consumers, not institutional fleet renewals.
      </p>

      <p>
        NADA Chairperson <strong>Brandon Cohen</strong> noted that this performance &ldquo;far
        exceeded expectations, particularly given the cost-of-living pressures&rdquo;, suggesting
        that strong demand in the entry-level market played a vital role in supporting overall
        sales volumes. Dealer confidence reached a <strong>13-year high of 67 index points</strong>{" "}
        in early 2026.
      </p>

      <h4>1.3 The macro engine behind the surge</h4>

      <ul>
        <li><strong>Prime rate at 10.25%</strong>, down from a peak of 11.75%, after cumulative 150 bps cuts since September 2024</li>
        <li><strong>Headline inflation at 3.0% YoY in February 2026</strong>, the lowest in years</li>
        <li><strong>Private sector credit extension +8.7% YoY</strong> (Dec 2025), driven by robust corporate borrowing</li>
        <li><strong>New vehicle inflation at a record-low 1.2%</strong> in late 2025/early 2026, contrasted with <strong>1.9% deflation in used vehicle prices</strong></li>
        <li><strong>Two-pot retirement reform</strong> released an estimated R40-60bn of household liquidity in 2025</li>
      </ul>

      <h4>1.4 The fuel price shock — a counter-narrative</h4>

      <p>
        The 2026 National Budget introduced incremental increases to the general fuel levy, the
        carbon fuel levy, and the Road Accident Fund levy, effective April 2026. Compounding
        these statutory increases, geopolitical tensions in the Middle East drove Brent crude
        above US$80/bbl while the rand softened to R16.16/USD.
      </p>

      <ul>
        <li><strong>Diesel prices hiked by more than R7 a litre to a record R26.11</strong> in April 2026</li>
        <li><strong>Petrol +R3.06 per litre</strong> across both grades</li>
      </ul>

      <p>
        These shocks have fundamentally altered consumer psychology. Buyers are running longer
        research cycles, comparing vehicles more acutely, and heavily weighting fuel consumption,
        maintenance plans, insurance premiums, and long-term reliability in their decisions.
        <strong> The era is one of consumer pragmatism &mdash; total cost of ownership over a
        3-5 year lifecycle, not initial sticker price.</strong>
      </p>

      <p className="footnote">
        Sources: NAAMSA monthly sales releases (January, February, March 2026); NADA;
        TransUnion Q4 2025 Mobility Insights Report; SARB Monetary Policy Committee statements;
        Department of Mineral Resources &amp; Energy fuel price publications. Brandon Cohen
        quoted via NADA press releases.
      </p>

      <h2>2. The top-selling vehicles &mdash; Toyota Hilux extends to 13 years</h2>

      <p>
        The Toyota Hilux extended its remarkable streak as South Africa&apos;s best-selling vehicle
        for the <strong>13th consecutive year</strong>. The Hilux/Ranger 1-2-3 positioning of bakkies
        plus the Polo Vivo confirms that the SA new vehicle market remains structurally a bakkie +
        budget-hatchback market &mdash; the same shape it has had for over a decade.
      </p>

      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Model</th>
            <th>2025 Units</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Toyota Hilux</td>
            <td><strong>36,525</strong></td>
            <td>13th straight year as #1; ~6.1% of total market</td>
          </tr>
          <tr>
            <td>2</td>
            <td>VW Polo Vivo</td>
            <td>26,067</td>
            <td>Locally built passenger car leader</td>
          </tr>
          <tr>
            <td>3</td>
            <td>Ford Ranger</td>
            <td>25,465</td>
            <td>Held #3</td>
          </tr>
          <tr>
            <td>4</td>
            <td>Suzuki Swift</td>
            <td>23,921</td>
            <td>Up from #6; briefly toppled the Hilux in January 2025</td>
          </tr>
        </tbody>
      </table>

      <p className="footnote">
        Sources:{" "}
        <a href="https://bestsellingcarsblog.com/2026/01/south-africa-full-year-2025-toyota-hilux-scores-13th-straight-win-in-highest-market-in-10-years/">Best Selling Cars Blog &mdash; SA Full Year 2025</a>;{" "}
        <a href="https://www.citizen.co.za/motoring/south-africas-best-selling-vehicles-of-2025/">The Citizen &mdash; SA&apos;s 15 best-selling vehicles of 2025</a>;{" "}
        <a href="https://bestsellingcarsblog.com/2025/02/south-africa-january-2025-suzuki-swift-topples-toyota-hilux/">Best Selling Cars Blog &mdash; January 2025</a>.
      </p>

      <h2>2.1 March 2026 — the new brand hierarchy</h2>

      <p>
        The full top 10 OEM rankings for March 2026 reveal how rapidly the competitive hierarchy
        is rearranging:
      </p>

      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Manufacturer</th>
            <th>Mar 2026 Units</th>
            <th>YoY Change</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1</td><td><strong>Toyota</strong></td><td>13,323</td><td>+1,051</td></tr>
          <tr><td>2</td><td>Volkswagen Group</td><td>5,574</td><td>+679</td></tr>
          <tr><td>3</td><td>Suzuki</td><td>5,047</td><td>−1,515</td></tr>
          <tr><td>4</td><td><strong>Isuzu</strong></td><td>3,513</td><td><strong>+1,142</strong></td></tr>
          <tr><td>5</td><td>Hyundai</td><td>3,258</td><td>+122</td></tr>
          <tr><td>6</td><td>Ford</td><td>2,828</td><td>−100</td></tr>
          <tr><td>7</td><td><strong>GWM</strong></td><td>2,777</td><td>+163</td></tr>
          <tr><td>8</td><td><strong>Chery</strong></td><td>2,390</td><td>+78</td></tr>
          <tr><td>9</td><td><strong>Mahindra</strong></td><td>2,280</td><td>+284</td></tr>
          <tr><td>10</td><td><strong>Jetour</strong></td><td>1,768</td><td>+95</td></tr>
        </tbody>
      </table>

      <p>
        Three structural insights emerge from this matrix:
      </p>

      <ol>
        <li><strong>Toyota remains untouchable</strong>, bolstered by the locally-built Hilux and aggressive pricing on imported entry models (Starlet, Vitz, Urban Cruiser).</li>
        <li><strong>Isuzu has displaced Hyundai for #4</strong>, driven by sustained D-Max bakkie performance in commercial and lifestyle segments.</li>
        <li><strong>Asian OEMs occupy 4 of the top 10 positions</strong> (GWM #7, Chery #8, Mahindra #9, Jetour #10), collectively accounting for nearly 10,000 units in a single month. This is the &ldquo;Asian OEM Disruption&rdquo; in action.</li>
      </ol>

      <p className="footnote">
        Source: NAAMSA March 2026 industry sales report.
      </p>

      <h2>3. Brand share &mdash; the structural shift</h2>

      <p>
        Toyota&apos;s dominance is the single most stable fact in the SA market. But the
        <strong> #2 spot changed hands</strong> in 2025, and Chinese brands broke into the top 10
        in force. This is the most significant brand-share reshuffle in the post-COVID era.
      </p>

      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Brand / Group</th>
            <th>2025 Units</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Toyota (incl. Lexus, Hino)</td>
            <td><strong>148,122</strong></td>
            <td><strong>24.8% share &mdash; 46th consecutive year as #1</strong></td>
          </tr>
          <tr>
            <td>2</td>
            <td>Suzuki</td>
            <td><strong>71,560</strong></td>
            <td>Record. <strong>First time in #2 &mdash; overtook VW Group</strong></td>
          </tr>
          <tr>
            <td>3</td>
            <td>Volkswagen Group</td>
            <td>—</td>
            <td>Dropped to #3</td>
          </tr>
          <tr>
            <td>8</td>
            <td>Chery</td>
            <td>25,304</td>
            <td><strong>+26.7% YoY</strong>; share grew 3.9% → 4.2%</td>
          </tr>
          <tr>
            <td>9</td>
            <td>Kia</td>
            <td>18,517</td>
            <td>+25.3% YoY, returned to top 10</td>
          </tr>
          <tr>
            <td>top 10</td>
            <td>Mahindra</td>
            <td>—</td>
            <td><strong>First-ever top-10 finish, +40.7% YoY</strong></td>
          </tr>
          <tr>
            <td>12</td>
            <td>Nissan</td>
            <td>15,085</td>
            <td><strong>−32.3% YoY</strong>, lost 5 places</td>
          </tr>
        </tbody>
      </table>

      <p className="footnote">
        Sources:{" "}
        <a href="https://www.cars.co.za/motoring-news/sas-10-best-selling-automakers-of-2025-all-the-insights/332102/">Cars.co.za &mdash; SA&apos;s 10 best-selling automakers of 2025</a>;{" "}
        <a href="https://businesstech.co.za/news/motoring/823159/10-of-the-best-selling-cars-and-brands-in-south-africa-right-now/">BusinessTech &mdash; Best-selling cars and brands in SA</a>;{" "}
        <a href="https://www.focus2move.com/south-africa-auto-sales/">Focus2Move &mdash; South Africa Auto Sales 2025</a>.
      </p>

      <div className="callout">
        <span className="callout-label">Visio Auto Insight</span>
        <p className="text-[14px] leading-relaxed text-white/60 m-0">
          The Suzuki overtake of VW Group is the canary in the coal mine. Suzuki sells almost
          entirely on price-to-feature ratio in the entry passenger segment. The same buyer segment
          that lifted Suzuki is the one Chinese OEMs are now hunting with the Chery Tiggo 4 Pro,
          Haval Jolion, BYD Dolphin Surf, and Omoda C5. Our signal data shows that buyers searching
          for &ldquo;Suzuki Swift&rdquo; or &ldquo;Polo Vivo&rdquo; increasingly cross-shop Chinese
          alternatives in the same session. Dealers carrying multi-brand floors with at least one
          Chinese franchise have a structural advantage in capturing the &ldquo;value-conscious upgrader&rdquo;
          who defined SA new-vehicle buying in 2025.
        </p>
      </div>

      <h2>4. The Chinese OEM disruption &mdash; verified</h2>

      <p>
        The single most consequential structural shift in the South African automotive market in
        the 2024-2026 period has been the rapid expansion of Chinese OEMs.
      </p>

      <h4>4.1 The new entrants and their footprints</h4>

      <ul>
        <li><strong>BYD</strong> &mdash; Dealer network expansion from 13 in 2025 to a planned 30-35 by end of 2026 &mdash; nearly tripling the footprint. Recently doubled local lineup with the Shark PHEV bakkie, Sealion 6 PHEV crossover, and Sealion 7 BEV SUV. Cheapest entry: BYD Dolphin Surf at <strong>R339,900</strong>.</li>
        <li><strong>GWM (Great Wall Motors)</strong> &mdash; Currently the largest Chinese automaker in SA by volume. Bakkie focus through the P-Series, plus Haval-branded SUVs (Jolion, H6, H6 HEV) and the Tank 300. Currently hunting an SA factory after losing the local-assembly competition to Chery.</li>
        <li><strong>Chery</strong> &mdash; Re-entered SA in 2021 via the Tiggo range. Now <strong>#8 in SA brand rankings with 25,304 units in 2025 (+26.7% YoY)</strong>. Launching <strong>8 new hybrids in SA</strong>, including 5 EREVs and 3 HEVs, plus two new small crossovers and a forthcoming pickup. Won the local-assembly nod over GWM.</li>
        <li><strong>Omoda &amp; Jaecoo</strong> &mdash; Chery sub-brands launched in SA in 2023-2024. Studying local assembly options.</li>
        <li><strong>MG (SAIC)</strong> &mdash; Reintroduced to SA after a long absence under Chinese ownership in 2024.</li>
        <li><strong>Mahindra</strong> &mdash; Not Chinese, but the same disruption pattern: <strong>first-ever top-10 finish in 2025, +40.7% YoY</strong>.</li>
      </ul>

      <p className="footnote">
        Sources:{" "}
        <a href="https://www.timeslive.co.za/motoring/news/2025-06-05-byd-to-nearly-triple-its-south-african-dealer-network-by-next-year/">TimesLIVE &mdash; BYD to nearly triple SA dealer network</a>;{" "}
        <a href="https://businesstech.co.za/news/motoring/821692/chinese-brand-launching-19-new-cars-in-south-africa/">BusinessTech &mdash; Chery launching 19 cars in SA</a>;{" "}
        <a href="https://www.automotiveworld.com/news/gwm-hunts-south-africa-factory-after-losing-out-to-chery/">Automotive World &mdash; GWM hunts SA factory</a>;{" "}
        <a href="https://techcentral.co.za/byd-supercharges-south-african-expansion/264716/">TechCentral &mdash; BYD supercharges SA expansion</a>.
      </p>

      <h4>4.2 Why this matters for dealers</h4>

      <ol>
        <li><strong>Pricing power.</strong> Equivalent feature sets at 15-25% below comparable Toyota or VW pricing. This is significant in a market where vehicle finance affordability is the binding constraint for the majority of buyers.</li>
        <li><strong>Feature density.</strong> Touchscreens, ADAS features, panoramic roofs, soft-close doors &mdash; specifications typically reserved for European premium brands &mdash; appearing on R350,000-R450,000 Chinese SUVs.</li>
        <li><strong>Aggressive dealer recruitment.</strong> Lower franchise capital requirements and faster onboarding compared to legacy OEMs. BYD&apos;s tripling of its network in 12 months is the playbook.</li>
        <li><strong>Stock availability.</strong> While legacy German brands still quote 3-6 month waits on specced units, Chinese brands have stock on the ground. Ready inventory beats premium brand prestige in a price-led market.</li>
      </ol>

      <h2>4.3 The Chery acquisition of Nissan Rosslyn — a watershed moment</h2>

      <div className="callout">
        <span className="callout-label">Breaking — verified</span>
        <p className="text-[15px] leading-relaxed text-white/65 italic m-0">
          In a watershed moment for South African manufacturing, <strong>Chery South Africa has
          finalized a comprehensive agreement to acquire Nissan South Africa&apos;s legacy
          manufacturing assets</strong>, including the iconic 60-year-old Rosslyn plant in
          Tshwane and its nearby stamping facility. This is the first major Chinese OEM
          industrial footprint in South Africa, and arguably the most consequential
          manufacturing news since the original Toyota Prospecton plant.
        </p>
      </div>

      <ul>
        <li><strong>The asset:</strong> Nissan&apos;s 60-year-old Rosslyn plant in Tshwane plus nearby stamping facility</li>
        <li><strong>The retrofit timeline:</strong> Chery will completely re-commission the plant over 12-18 months, targeting commencement of local high-volume production by end-2027</li>
        <li><strong>The product mix:</strong> Both ICE models and New Energy Vehicles &mdash; specifically hybrid and plug-in hybrid platforms (matching consumer pragmatism described in Section 1.4)</li>
        <li><strong>The job impact:</strong> Approximately 3,000 direct and indirect jobs across manufacturing, logistics, and supply chain. The majority of displaced Nissan employees have been offered employment under Chery, preserving critical assembly skills in the Tshwane manufacturing hub</li>
        <li><strong>The strategic intent:</strong> Chery uses South Africa as a strategic export hub to penetrate broader African and European markets, leveraging the AfCFTA and existing SA bilateral trade arrangements</li>
        <li><strong>The volume backdrop:</strong> Chery currently averages 50,000 units annually in SA across its 150-dealer network &mdash; a base large enough to justify domestic assembly</li>
      </ul>

      <p>
        Why this matters: SA manufacturing has been hollowing out as legacy OEMs (notably Nissan)
        retreat and imports surge. The Chery acquisition is the first major industrial
        commitment from the Chinese OEM wave that has been disrupting SA retail. It potentially
        marks the start of a transition from &ldquo;Chinese OEMs as importers&rdquo; to
        &ldquo;Chinese OEMs as SA manufacturers&rdquo; &mdash; with substantial implications for
        local component suppliers, the APDP framework, and South Africa&apos;s competitive
        position relative to Morocco (see Section 8).
      </p>

      <p className="footnote">
        Source: Chery South Africa announcement; Nissan global restructuring documentation
        (Nissan&apos;s plan to shut down 7 international plants by 2027); local automotive trade
        press coverage of the agreement.
      </p>

      <h2>5. Dealer landscape &mdash; Motus and the rest</h2>

      <p>
        Five major dealer groups dominate franchised new-vehicle retail in South Africa, but only
        Motus Holdings has fully verified 2025 financials at the time of this publication.
      </p>

      <h4>5.1 Motus Holdings (JSE: MTH) &mdash; the giant</h4>

      <ul>
        <li><strong>FY2025 group revenue: ~R112.6 billion</strong> (year ended 30 June 2025)</li>
        <li><strong>South African dealerships: 323</strong></li>
        <li><strong>South African vehicle sales: 52,548 units in 2025, +8% YoY</strong></li>
        <li><strong>H1 FY2026 (six months to 31 Dec 2025): revenue +3% to R57.7bn</strong>, driven by SA volume strength</li>
        <li>Recent reports of staff resistance to a pay-cut programme (Jan 2026) suggest cost pressure despite top-line recovery</li>
      </ul>

      <h4>5.2 Super Group (JSE: SPG) — the dealer that pivoted East</h4>

      <p>
        Super Group&apos;s H1 FY2026 interim results (six months to December 2025) reveal what
        happens when a dealer group bets on the Asian OEM disruption early:
      </p>

      <ul>
        <li><strong>Emerging Chinese and Indian brand new-car volumes grew +102.0%</strong> over the prior period</li>
        <li>These brands now account for <strong>nearly 30% of total new-car sales volumes</strong> for the group</li>
        <li>Aggressive footprint expansion: Geely, Tata, Mahindra, GWM dealerships added &mdash; now operating <strong>28 specialized facilities</strong> for these emerging brands</li>
        <li><strong>Dealership division revenue: R6 billion, +12.7%</strong> in the period</li>
        <li>The South African supply chain and dealership operations were the primary drivers of group financial outperformance</li>
      </ul>

      <p>
        The lesson is unambiguous: dealerships that pivoted early toward Chinese and Indian
        brands are capturing the biggest share of post-2024 growth. Dealerships still leaning
        exclusively on legacy European franchises are losing relative position. Super Group is
        the publicly verified case study; the same pattern is unfolding privately across the
        independent dealer landscape.
      </p>

      <p className="footnote">
        Source: Super Group H1 FY2026 SENS interim results announcement, December 2025 period.
      </p>

      <h4>5.3 Other major groups (verification pending Vol. 2)</h4>

      <ul>
        <li><strong>CMH (Combined Motor Holdings, JSE: CMH)</strong> &mdash; second-largest listed dealer group. Detailed FY2025 figures pending direct SENS review.</li>
        <li><strong>Super Group (JSE: SPG)</strong> &mdash; diversified mobility group with significant dealer operations. FY2025 dealer-segment numbers pending verification.</li>
        <li><strong>Halfway Group, Barons (Motus subsidiary), Hatfield Motor Group, NMI-DSM</strong> &mdash; privately held or subsidiary groups with significant regional footprints. Consolidated 2025 numbers not publicly available.</li>
      </ul>

      <p className="footnote">
        Sources:{" "}
        <a href="https://www.motus.co.za/wp-content/uploads/2025/09/Investor_Presentation_for_the_year_ended_30_June_2025.pdf">Motus Investor Presentation FY2025 (PDF)</a>;{" "}
        <a href="https://www.moneyweb.co.za/mny_sens/motus-holdings-limited-unaudited-interim-results-and-cash-dividend-declaration-for-the-six-months-ended-31-december-2025-and-board-changes/">Moneyweb &mdash; Motus H1 FY26 SENS</a>;{" "}
        <a href="https://www.businessday.co.za/companies/2026-01-19-vehicle-showroom-giant-motus-faces-staff-revolt-over-pay-cuts/">Business Day &mdash; Motus pay-cut staff revolt</a>.
      </p>

      <h2>6. The EV story &mdash; almost nothing, then suddenly something</h2>

      <p>
        Despite headline noise, <strong>pure battery-electric (BEV) adoption in South Africa
        remains negligible</strong> in 2025. The growth story is in hybrids and plug-in hybrids
        (collectively &ldquo;New Energy Vehicles&rdquo;, NEVs), not pure EVs.
      </p>

      <ul>
        <li><strong>BEV sales 2025: 1,018 units</strong> &mdash; just <strong>0.17%</strong> of total new vehicle sales</li>
        <li><strong>BEV sales actually fell 17% YoY</strong> (from 1,231 in 2024)</li>
        <li>However, <strong>H1 2025 BEV sales were +65% YoY</strong>, suggesting late-year softness pulled the full year down</li>
        <li>The broader NEV category (HEV + PHEV + BEV) roughly doubled 2023→2024 as Chinese entrants flooded the market</li>
      </ul>

      <h4>6.1 The structural barriers</h4>

      <ol>
        <li><strong>Price gap</strong>: cheapest EV is ~3.5x the cheapest ICE car (cheapest mainstream EV ~R700,000 vs cheapest ICE ~R200,000)</li>
        <li><strong>Charging infrastructure</strong>: <strong>fewer than 400 public chargers vs ~4,800 petrol stations</strong>, concentrated in Gauteng and Western Cape</li>
        <li><strong>Grid instability</strong> (load-shedding legacy) makes home charging less reliable for many buyers</li>
        <li><strong>Import duties + ad-valorem luxury tax</strong> push EV prices up; the long-promised local NEV production incentive has been slow to translate into showroom prices</li>
        <li><strong>Resale value uncertainty</strong> &mdash; though the early Volvo EX30 / XC40 used market is starting to break this</li>
      </ol>

      <p className="footnote">
        Sources:{" "}
        <a href="https://greencape.co.za/wp-content/uploads/2025/04/Electric-vehicles-2025.pdf">GreenCape Market Intelligence Report SA 2025: EVs (PDF)</a>;{" "}
        <a href="https://cleantechnica.com/2025/11/04/south-africas-used-ev-market-accelerates-volvo-ex30-xc40-most-popular/amp/">CleanTechnica &mdash; SA used EV market</a>;{" "}
        <a href="https://imotonews.co.za/2025/05/30/electric-vehicles-in-south-africa-is-2025-the-turning-point/">Imotonews &mdash; Is 2025 the EV turning point?</a>.
      </p>

      <h2>6.5 The 150% EV production tax incentive — landmark policy</h2>

      <p>
        Recognising that the global automotive sector is irreversibly decarbonising, and that
        failure to adapt poses a lethal risk to South Africa&apos;s vital export markets in the
        UK and EU (which aim to ban new fossil fuel vehicle sales by 2035), the South African
        government has introduced a landmark fiscal incentive.
      </p>

      <p>
        The <strong>Taxation Laws Amendment Act No. 42 of 2024</strong> introduced a{" "}
        <strong>150% tax deduction for qualifying capital investments in the production of
        battery electric and hydrogen-powered vehicles</strong>. The allowance is enforceable
        for a 10-year window beginning <strong>1 March 2026</strong>, permitting OEMs to claim
        150% of the costs of new buildings, factory improvements, and new plant machinery used
        primarily for EV production.
      </p>

      <ul>
        <li><strong>Effective date:</strong> 1 March 2026</li>
        <li><strong>Duration:</strong> 10-year window</li>
        <li><strong>Eligible investments:</strong> New buildings, factory improvements, plant machinery for BEV/H2 production</li>
        <li><strong>Treasury fiscal cost:</strong> R500 million for FY2026/27 alone</li>
        <li><strong>Concurrent infrastructure commitment:</strong> National network of <strong>120 strategically positioned fast-charging EV points</strong> being deployed by industry bodies</li>
      </ul>

      <p>
        Trade, Industry &amp; Competition Minister <strong>Parks Tau</strong> has explicitly
        warned that if the local industry does not adapt to global decarbonisation mandates, it
        risks losing entire export markets that currently absorb almost half of SA&apos;s vehicle
        production. This policy fundamentally shifts the EV narrative in SA from a niche,
        upper-class climate experiment to a critical industrial, fiscal, and infrastructural
        priority aimed at securing a permanent foothold in lucrative global EV value chains.
      </p>

      <p className="footnote">
        Sources: Taxation Laws Amendment Act No. 42 of 2024 (National Treasury);
        2023 Electric Vehicle White Paper (the dtic). Minister Parks Tau quoted via the dtic
        official briefings.
      </p>

      <h2>7. Macro context &mdash; who can afford to buy</h2>

      <p>
        Vehicle affordability in South Africa is a function of three primary variables: prevailing
        interest rates (which determine instalment cost), fuel pricing (which determines running
        cost), and disposable household income (which determines capacity). 2025 was a strong year
        on all three.
      </p>

      <h4>7.1 Employment &mdash; a five-year low in unemployment</h4>

      <p>
        The Stats SA Quarterly Labour Force Survey for Q4 2025, released 17 February 2026, shows
        the strongest labour-market print in five years:
      </p>

      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Q3 2025</th>
            <th>Q4 2025</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Official unemployment rate</td>
            <td>31.9%</td>
            <td><strong>31.4%</strong></td>
            <td>-0.5 pp</td>
          </tr>
          <tr>
            <td>Employed persons</td>
            <td>17.06m</td>
            <td><strong>17.10m</strong></td>
            <td>+44,000</td>
          </tr>
          <tr>
            <td>Youth (15-34) unemployment</td>
            <td>43.7%</td>
            <td>43.8%</td>
            <td>+0.1 pp</td>
          </tr>
          <tr>
            <td>Expanded unemployment (LU3)</td>
            <td>42.4%</td>
            <td>42.1%</td>
            <td>-0.3 pp</td>
          </tr>
        </tbody>
      </table>

      <p>
        The 31.4% rate is the lowest in over five years. The improvement is being driven by
        retention of existing formal-sector jobs and modest white-collar/services hiring, not by
        mass entry of young workers. The growing sectors are community &amp; social services
        (+46,000), construction (+35,000), and ICT/tech (where business analyst demand grew +102%
        YoY and data scientist demand +48% YoY). Manufacturing, agriculture, and finance all
        contracted in absolute job numbers.
      </p>

      <p className="footnote">
        Sources:{" "}
        <a href="https://www.statssa.gov.za/publications/P0211/P02114thQuarter2025.pdf">Stats SA QLFS Q4 2025 (PDF)</a>;{" "}
        <a href="https://www.sanews.gov.za/south-africa/unemployment-rate-decreases-05-percentage-points">SAnews &mdash; Unemployment rate decreases 0.5 pp</a>;{" "}
        <a href="https://www.digitalstreetsa.com/south-africas-q4-unemployment-hits-five-year-low-tech-sector-emerges-as-vital-growth-engine/">Digital Street &mdash; Tech sector growth analysis</a>.
      </p>

      <h4>7.2 Take-home pay &mdash; record highs</h4>

      <p>
        The BankservAfrica Take-Home Pay Index (BTPI) is the cleanest real-time read on
        formal-sector incomes:
      </p>

      <ul>
        <li>December 2023: R15,367 nominal average take-home</li>
        <li>December 2024: R17,202 (+11.9% YoY nominal)</li>
        <li><strong>January 2025: R18,098</strong> (record high at the time)</li>
        <li>June 2025: R17,310 nominal &mdash; softening but still well above 2024 baseline</li>
      </ul>

      <p>
        With CPI forecast at ~4.2% for 2025, this is the second consecutive year of positive real
        take-home pay growth. BTPI captures roughly 6 million salaried workers paid via the
        BankservAfrica payment rails &mdash; this is the middle-class-and-up cohort that drives the
        majority of new vehicle purchases.
      </p>

      <p className="footnote">
        Sources:{" "}
        <a href="https://iol.co.za/business/jobs/2025-02-26-south-african-salaries-surge-take-home-pay-hits-r18098-in-positive-economic-shift/">IOL &mdash; SA salaries surge to R18,098</a>;{" "}
        <a href="https://businesstech.co.za/news/finance/833543/its-a-good-year-for-salaries-in-south-africa/">BusinessTech &mdash; A good year for salaries</a>.
      </p>

      <h4>7.3 Two-pot retirement reform &mdash; the R40-60bn liquidity injection</h4>

      <p>
        The September 2024 implementation of South Africa&apos;s two-pot retirement system released
        an estimated <strong>R40-60 billion of household liquidity</strong> in 2025, much of which
        flowed into vehicle deposits, debt repayment, and consumer durables. Old Mutual, Discovery,
        and Investec all flagged the two-pot impact as a primary 2025 demand driver in client
        notes. This was a one-off effect &mdash; future years will not benefit from the same
        liquidity injection.
      </p>

      <h4>7.4 Buyer demographics &mdash; the Gen Z and Millennial shift</h4>

      <p>
        TransUnion South Africa&apos;s Vehicle Pricing Index Q4 2025 reveals a striking demographic
        shift in vehicle purchase intent:
      </p>

      <ul>
        <li><strong>Gen Z (18-29) purchase intent: 25%</strong> (sharply elevated)</li>
        <li><strong>Millennials (30-45): 21%</strong></li>
        <li>Gen X (46-61): 14%</li>
        <li>Boomers (62-80): 7%</li>
      </ul>

      <p>
        Younger buyers now express more vehicle purchase intent than older generations &mdash; a
        major reversal from historical patterns. These buyers are also the most price-sensitive
        and the most willing to consider Chinese OEM brands.
      </p>

      <p className="footnote">
        Sources:{" "}
        <a href="https://newsroom.transunion.co.za/affordability-drives-south-africas-strongest-new-car-sales-in-over-a-decade/">TransUnion &mdash; Affordability drives SA&apos;s strongest new car sales in over a decade</a>;{" "}
        <a href="https://www.transunion.co.za/lp/mir">TransUnion VPI</a>.
      </p>

      <h2>8. Major investments and expansions in 2025</h2>

      <p>
        Beyond the automotive sector itself, broader business activity in South Africa creates the
        downstream demand environment for new vehicles. Confirmed announcements during 2025:
      </p>

      <ul>
        <li><strong>Microsoft</strong> &mdash; R5.4 billion data centre expansion in the Midrand-Centurion corridor</li>
        <li><strong>Heineken Global</strong> &mdash; R1.9 billion brewery construction in Midvaal, Gauteng</li>
        <li><strong>Chung Fung Metal</strong> &mdash; R2.5 billion factory opened in Gauteng, +1,000 jobs</li>
        <li><strong>Gauteng province total FDI 2025</strong> &mdash; R27 billion, sourced from UK, Switzerland, France, Australia, Cyprus, USA and UAE</li>
        <li><strong>BPO sector</strong> &mdash; Cape Town added several thousand seats across Webhelp/Concentrix, Teleperformance and Capita; SA remains the world&apos;s #1 offshore CX destination per BPESA</li>
      </ul>

      <p>
        Note: SA recorded a net FDI outflow of R73.5 billion in Q2 2025, almost entirely driven by
        Anglo American&apos;s divestment of its platinum unit (now Valterra Platinum). Underlying
        FDI ex-Anglo was modestly positive, with Q1 2025 inflows of R11.7 billion the highest since
        Q2 2024.
      </p>

      <p className="footnote">
        Sources:{" "}
        <a href="https://www.sanews.gov.za/south-africa/gauteng-open-investment">SAnews &mdash; Gauteng open for investment</a>;{" "}
        <a href="https://www.tips.org.za/manufacturing-data/fdi-tracker/item/4985-tips-fdi-tracker-top-five-sources-of-fdi-in-south-africa-may-2025">TIPS FDI Tracker</a>;{" "}
        <a href="https://tradingeconomics.com/south-africa/foreign-direct-investment">Trading Economics SA FDI</a>.
      </p>

      <h2>8.5 The manufacturing crisis — the other side of the boom</h2>

      <p>
        While the domestic retail sector thrives, South Africa&apos;s automotive manufacturing
        base &mdash; a critical macroeconomic pillar that contributes <strong>5.2% to national
        GDP, accounts for 22.6% of total manufacturing output, and sustains nearly 498,000
        formal sector jobs</strong> &mdash; is under severe, unprecedented siege.
      </p>

      <h4>8.5.1 The export contraction</h4>

      <p>
        The most alarming indicator of the manufacturing crisis is the sustained, deep
        contraction in vehicle exports:
      </p>

      <ul>
        <li><strong>February 2026 vehicle exports: 24,221 units, −28.1% YoY</strong></li>
        <li><strong>March 2026 exports: 37,388 units, −5.3% YoY</strong> (slight month-on-month recovery, still negative annually)</li>
      </ul>

      <p>
        NAAMSA attributes this chronic export weakness to &ldquo;structural headwinds amid
        geopolitical turbulence&rdquo;, heightened protectionism in key global markets, and
        increasingly stringent decarbonisation requirements in destination countries that weigh
        heavily on the competitiveness of South African ICE exports.
      </p>

      <h4>8.5.2 Morocco overtakes South Africa</h4>

      <div className="callout">
        <span className="callout-label">Verified — major shift</span>
        <p className="text-[15px] leading-relaxed text-white/65 italic m-0">
          <strong>Morocco has overtaken South Africa as the leading producer of vehicles on the
          African continent.</strong> Morocco achieved this milestone by granting automotive
          firms massive 25-year corporate tax exemptions for export-heavy production, leveraging
          ultra-competitive labour costs of approximately <strong>US$106 per vehicle</strong>,
          and aggressively courting NEV manufacturers like BYD. This is the most significant
          competitive shift in African automotive in a generation &mdash; and it puts SA&apos;s
          legacy assembly plants under structural pressure.
        </p>
      </div>

      <h4>8.5.3 The hollowed-out local supply chain</h4>

      <p>
        The influx of affordable Asian vehicles driving domestic retail growth is simultaneously
        hollowing out the local supply chain:
      </p>

      <ul>
        <li><strong>2024 domestic sales of locally produced vehicles: 515,850 units</strong></li>
        <li><strong>SAAM 2035 target: 784,509 units</strong> &mdash; we are running ~270,000 units below target</li>
        <li><strong>Current import penetration: 64% of all vehicles sold in SA are imported</strong></li>
        <li><strong>Local content in SA-built vehicles: 39%</strong> &mdash; well below the SAAM target of 60%</li>
        <li><strong>Bosch global Tier 1 viability threshold: ~1 million units/year</strong> &mdash; the scale needed to sustain a deep local component supply chain</li>
      </ul>

      <p>
        NAACAM (the National Association of Automotive Components and Allied Manufacturers)
        warns that an uptick in vehicle sales does not equate to corresponding growth in
        component manufacturing if those sales are predominantly imports.
      </p>

      <h4>8.5.4 The CKD vs SKD policy debate</h4>

      <p>
        Industry leaders are calling for an urgent review of the Automotive Production and
        Development Programme (APDP). The central tension is between <strong>Completely
        Knocked-Down (CKD)</strong> manufacturing (which builds vehicles from the ground up,
        integrating deep local supply chains) and <strong>Semi Knocked-Down (SKD)</strong>{" "}
        assembly (which imports largely pre-assembled modules with minimal local value addition,
        functioning as a glorified import mechanism).
      </p>

      <p>
        Current APDP loopholes allow OEMs to trade duty credits to vehicle importers,
        inadvertently incentivising SKD operations and pure imports over deep, capital-intensive
        CKD localisation. Industry advocates argue regulatory frameworks must immediately pivot
        to protect and aggressively incentivise CKD manufacturing to prevent the total collapse
        of the Eastern Cape and Tshwane component ecosystems.
      </p>

      <h4>8.5.5 The Visio Auto thesis: South Africans supply Africans</h4>

      <p>
        The path out of the manufacturing crisis is not a return to European export dominance
        &mdash; that ship is sailing on EU CBAM and decarbonisation mandates. The path is
        intra-African: <strong>South Africans supplying Africans</strong>. SA-built BMW X3,
        Mercedes C-Class, Toyota Hilux, VW Polo, Toyota Corolla Cross, and Isuzu D-Max can
        increasingly serve the African continent under AfCFTA preferential tariffs. The
        Chery-Rosslyn acquisition (Section 4.3) is the same thesis from the Chinese OEM side
        &mdash; using SA as the African manufacturing hub.
      </p>

      <p>
        Visio Auto Concierge (covered in our companion paper{" "}
        <a href="/papers/african-luxury-mobility">VRL-AUTO-003: The African Luxury Mobility Report</a>)
        operationalises this thesis at the premium end: connecting SA premium dealer inventory
        with HNW buyers in Lagos, Lubumbashi, Luanda, Nairobi, Accra, Abidjan, Casablanca, and
        Cairo. The same logistics, payment, and trust architecture can scale to volume product.
        The opportunity for SA dealers is to stop competing only with each other for the SA
        consumer wallet, and start serving the rest of Africa &mdash; where the wealth growth
        is happening fastest (Knight Frank: Côte d&apos;Ivoire UHNWI +119%, Nigeria +90%,
        Zambia +40%).
      </p>

      <p className="footnote">
        Sources: NAAMSA February and March 2026 export sales data; NAACAM industry briefings;
        SAAM 2035 (the dtic); BDO South Africa automotive sector audits; Daily Maverick op-eds
        by Denise van Huyssteen; Business Day TV NAAMSA economist interviews.
      </p>

      <h2>9. Forward-looking analysis</h2>

      <h4>9.1 Six themes for the next 12 months</h4>

      <ol>
        <li><strong>Chinese OEM share continues to grow.</strong> Chinese brands collectively now hold &gt;17% of SA new vehicle sales. We expect this to push past 20% by year-end 2026 if BYD&apos;s dealer network expansion (13 → 30+) executes as planned.</li>
        <li><strong>2025 growth was front-loaded.</strong> The two-pot liquidity injection is one-off. Without further interest rate cuts, 2026 volume growth will moderate from 2025&apos;s +15.7% to a more sustainable +5-8% range.</li>
        <li><strong>The hybrid moment.</strong> Toyota Corolla Cross Hybrid demand will continue to outstrip supply. Other OEMs (notably Chery with its planned 8 new hybrid launches) will accelerate competing hybrid product entries.</li>
        <li><strong>Pure BEV adoption stays niche.</strong> At 0.17% of the market and trending sideways, pure battery EVs are not a 2026 story for SA dealers outside Volvo, BMW, and Mercedes premium showrooms.</li>
        <li><strong>Dealer consolidation continues.</strong> Smaller independents will continue to struggle. Motus&apos;s pay-cut staff dispute signals that even the largest groups are squeezing operating costs. Expect another round of franchise acquisitions by the top dealer groups.</li>
        <li><strong>Digital lead generation becomes table stakes.</strong> Dealers without a strong digital lead pipeline will lose share to those who have invested. Lead response time under 5 minutes is the new benchmark; most SA dealers are still over 1 hour.</li>
      </ol>

      <h4>9.2 What dealers should do now</h4>

      <ul>
        <li>Add a Chinese franchise to multi-brand floors if not already done</li>
        <li>Build a robust used-vehicle pipeline to capture cross-shopping segments</li>
        <li>Invest in finance pre-approval workflows &mdash; speed kills the competition</li>
        <li>Develop hybrid product expertise on the floor &mdash; this segment is growing faster than salespeople are being trained</li>
        <li>Strengthen digital lead capture &mdash; signal-driven outreach is dramatically more efficient than mass advertising</li>
        <li>Mark used books down faster than historically &mdash; Chinese new pricing is compressing 2-3 year old residuals</li>
      </ul>

      <h2>10. Methodology and verification</h2>

      <p>
        This report synthesises data from public sources only. Every numerical claim is sourced
        inline. Where sources disagree (for example, the small variance in Motus FY2025 revenue
        between aggregator sites), we have noted the gap rather than picked one figure to publish.
      </p>

      <h4>10.1 Verified in this volume</h4>

      <ul>
        <li>NAAMSA 2025 totals: 596,818 units (+15.7%), passenger cars 422,292 (+20.1%)</li>
        <li>Top 4 models with verified unit counts</li>
        <li>Toyota brand share 24.8%, 148,122 units, 46-year leadership</li>
        <li>Suzuki #2 with 71,560 units (record)</li>
        <li>Chery #8 with 25,304 units (+26.7%); Kia +25.3%; Nissan -32.3%</li>
        <li>Used market 383,410 units, R160.1bn, +7%</li>
        <li>BEV 1,018 units, 0.17% share, -17% YoY</li>
        <li>BYD dealer expansion plan (13 → 30-35)</li>
        <li>Motus FY2025 revenue ~R112.6bn, 323 SA dealerships, 52,548 SA units</li>
        <li>Stats SA QLFS Q4 2025 unemployment 31.4%</li>
        <li>BankservAfrica BTPI January 2025 R18,098</li>
        <li>TransUnion 2025 buyer demographics</li>
      </ul>

      <h4>10.2 Pending verification for Vol. 2</h4>

      <ul>
        <li>CMH and Super Group FY2025 dealer-segment financials (direct SENS review)</li>
        <li>Halfway, Barons, Hatfield, NMI-DSM consolidated 2025 numbers</li>
        <li>Precise top-10 brand share % for ranks 3-10</li>
        <li>Live SA fuel-price-to-vehicle-sales correlation analysis (data pipeline pending)</li>
      </ul>

      <h2>11. About this report</h2>

      <p>
        Visio Auto Intelligence is delivered free to all dealership partners on the Visio Auto
        platform. Custom data points and dealership-specific intelligence requests are available at
        no additional cost &mdash; just ask Jess. All analysis belongs to the dealership partner who
        receives it; you are free to share, quote, and republish with attribution.
      </p>

      <p>
        Vol. 2 publishes Q3 2026 with monthly NAAMSA updates, dealer group financial reconciliation,
        and a deep-dive on the Chinese OEM dealer network strategy.
      </p>

      <hr />

      <p className="footnote">
        Visio Research Labs is the research arm of VisioCorp (Pty) Ltd. This report is published
        under Creative Commons Attribution 4.0 International (CC BY 4.0). You may quote, share, and
        republish with attribution. Cite as: Jess + Visio Research Labs (2026). &ldquo;SA Automotive
        Intelligence Vol. 1&rdquo;. Visio Research Labs, VRL-AUTO-001, April 2026. Vol. 2
        publishes Q3 2026.
      </p>

      <p className="footnote">
        <strong>Honesty Protocol:</strong> No figures in this report have been generated, estimated,
        or interpolated. Every numerical claim has a public source cited inline. Verification gaps
        have been disclosed explicitly in Section 10.2. If you find an error, contact{" "}
        <a href="mailto:research@visiocorp.co">research@visiocorp.co</a> and we will issue a
        correction with full attribution.
      </p>
    </PaperLayout>
  );
}
