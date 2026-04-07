import PaperLayout from "@/components/papers/PaperLayout";

export const metadata = {
  title: "How We Find Buyers — Safely | VRL-AUTO-002 | Visio Research Labs",
  description:
    "Visio Auto's complete methodology for ethical signal mining, POPIA compliance, and people-first data practices. Published by Visio Research Labs.",
};

export default function SecurityPaperPage() {
  return (
    <PaperLayout
      paperNumber="VRL-AUTO-002"
      category="Security & Privacy"
      title="How We Find Buyers — Safely."
      subtitle="A complete methodology for ethical signal mining, POPIA compliance, and people-first data practices in the South African automotive industry."
      publishDate="April 2026"
      authors="Jess (AI) + VRL Editorial"
    >
      {/* Abstract */}
      <div className="callout">
        <span className="callout-label">Abstract</span>
        <p className="text-[15px] leading-relaxed text-white/65 italic m-0">
          Visio Auto operates an AI-powered lead generation platform for South African car dealerships.
          Our agents identify high-intent vehicle buyers by connecting publicly available signals
          across financial, corporate, lifecycle, behavioural, and social data sources. This paper
          documents our complete methodology, our POPIA compliance framework, our technical safeguards,
          and the principles that govern every signal we process. We publish this paper because we
          believe trust is built through transparency &mdash; not asserted through claims.
        </p>
      </div>

      <h2>1. Why this paper exists</h2>

      <p>
        When a dealership partner asks us &ldquo;how do you find these buyers?&rdquo; the wrong answer
        is &ldquo;trade secret.&rdquo; The right answer is to hand them this paper.
      </p>

      <p>
        Lead generation platforms have a reputation problem. Many operate as black boxes, scraping
        whatever they can find, buying breach data, and sending unsolicited messages without any
        legal grounding. We refuse to operate that way. South African dealerships are increasingly
        being held to account for the practices of their data suppliers &mdash; and rightly so.
      </p>

      <p>
        This paper exists so that any dealership partner, any dealership&apos;s legal counsel, any
        Information Officer, and any data subject can read exactly how we operate. Every claim in
        this document is verifiable. Every method is auditable. If any practice described here
        changes, this paper will be updated and version-controlled.
      </p>

      <h2>2. What we are, and what we are not</h2>

      <p>
        Visio Auto is an AI agent platform. We deploy autonomous agents that monitor public data
        sources for signals indicating that a person or business is likely to purchase a vehicle in
        the near future. When we identify a high-intent prospect, we deliver that prospect to a
        dealership partner along with full context, suggested approach, and the legal basis for the
        outreach.
      </p>

      <p><strong>We are:</strong></p>

      <ul>
        <li>An automated signal aggregator processing publicly available data</li>
        <li>A POPIA-registered Responsible Party with a designated Information Officer</li>
        <li>A research-driven platform publishing our methodology openly</li>
        <li>A people-first organisation that treats every data subject with the same care we&apos;d expect for ourselves</li>
      </ul>

      <p><strong>We are not:</strong></p>

      <ul>
        <li>A breach data buyer &mdash; we never purchase data from data leaks, dumps, or stolen sources</li>
        <li>An illegal scraper &mdash; we do not scrape sites in violation of their terms of service or robot exclusion protocols where applicable</li>
        <li>A spam house &mdash; we do not send unsolicited bulk communications outside POPIA Section 69 grounds</li>
        <li>A re-seller of personal data &mdash; we do not sell, transfer, or share data subject information outside our explicit dealership partner relationships</li>
      </ul>

      <h2>3. The legal framework</h2>

      <p>
        South Africa&apos;s primary data protection law is the <strong>Protection of Personal Information Act, 2013 (Act No. 4 of 2013)</strong>,
        commonly referred to as POPIA. POPIA came into full force on 1 July 2021 and is enforced by
        the Information Regulator of South Africa.
      </p>

      <p>
        POPIA applies to the processing of personal information by a Responsible Party in South Africa.
        Visio Auto is a Responsible Party. Our processing must therefore meet POPIA&apos;s eight
        conditions for lawful processing, plus the additional requirements for direct marketing,
        special personal information, and automated decision-making.
      </p>

      <h4>3.1 The Eight Conditions (Section 4)</h4>

      <p>
        POPIA requires every Responsible Party to comply with eight conditions when processing
        personal information. We address each in detail below:
      </p>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Condition</th>
            <th>How Visio Auto complies</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Accountability</td>
            <td>Designated Information Officer registered with the Regulator. Annual compliance audit. Public methodology paper.</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Processing Limitation</td>
            <td>Only data necessary for buyer identification. Lawful basis documented per signal type. Data minimisation enforced.</td>
          </tr>
          <tr>
            <td>3</td>
            <td>Purpose Specification</td>
            <td>Single explicit purpose: identifying potential vehicle buyers for dealership partners. Retention limited to active processing.</td>
          </tr>
          <tr>
            <td>4</td>
            <td>Further Processing Limitation</td>
            <td>No secondary use of data. No sale to third parties. Data shared only with the specific dealership partner the lead is matched to.</td>
          </tr>
          <tr>
            <td>5</td>
            <td>Information Quality</td>
            <td>All signal sources verified. Confidence scoring on every data point. Subjects can correct or update information about themselves.</td>
          </tr>
          <tr>
            <td>6</td>
            <td>Openness</td>
            <td>This paper. PAIA manual published. Information Officer contact details public. Data sources disclosed to subjects on request.</td>
          </tr>
          <tr>
            <td>7</td>
            <td>Security Safeguards</td>
            <td>AES-256 encryption at rest, TLS 1.3 in transit. EU-West datacentre. Access controls. Audit logs. See Section 5.</td>
          </tr>
          <tr>
            <td>8</td>
            <td>Data Subject Participation</td>
            <td>Public unsubscribe portal. Right to access, object, correct, and delete. 7-day response SLA.</td>
          </tr>
        </tbody>
      </table>

      <h4>3.2 Lawful basis under Section 11</h4>

      <p>
        POPIA Section 11 sets out the lawful bases for processing. Visio Auto&apos;s primary lawful
        basis is <strong>Section 11(1)(f) &mdash; the legitimate interests of the responsible party
        or of a third party to whom the information is supplied</strong>. This is the same lawful
        basis used by Bloomberg, Crunchbase, ZoomInfo, and other research-driven business
        intelligence platforms operating in POPIA-equivalent jurisdictions (GDPR Article 6(1)(f)).
      </p>

      <p>
        For each signal type we process, we conduct and document a three-part legitimate interest
        balancing test:
      </p>

      <ol>
        <li><strong>Purpose test:</strong> Is there a legitimate interest? (Yes &mdash; matching qualified buyers to legitimate dealerships serves both parties and the broader market.)</li>
        <li><strong>Necessity test:</strong> Is the processing necessary to achieve the purpose? (Yes &mdash; signal-based identification is significantly less intrusive than mass cold-calling.)</li>
        <li><strong>Balancing test:</strong> Does the data subject&apos;s interest in privacy override the legitimate interest? (Documented per signal &mdash; we exclude any signal where the answer is yes.)</li>
      </ol>

      <h4>3.3 Section 69 — Direct Marketing</h4>

      <p>
        POPIA Section 69 governs unsolicited electronic communications for direct marketing purposes.
        It requires either prior consent (opt-in) or, for existing customers, a clear opt-out
        mechanism. Visio Auto&apos;s practice is to operate under Section 69(3)(c) where the data
        subject is contacted by a dealership partner with whom they have a pre-existing or contextual
        relationship (e.g., a customer whose vehicle finance is expiring with the same dealership
        group), and to require explicit opt-in consent for all other outreach.
      </p>

      <p>
        Every outreach communication sent through our platform includes:
      </p>

      <ul>
        <li>A clear identification of the sender (the dealership)</li>
        <li>An explanation of how the recipient&apos;s data was identified (signal source disclosed)</li>
        <li>A one-click unsubscribe link routed to our central opt-out database</li>
        <li>Contact details for our Information Officer</li>
      </ul>

      <h2>4. The signal sources we use</h2>

      <p>
        Every signal Visio Auto processes comes from one of the following categories of public,
        legally accessible data. We disclose this in detail because transparency is the only way
        trust survives scrutiny.
      </p>

      <h4>4.1 Public regulatory data</h4>

      <ul>
        <li><strong>CIPC (Companies and Intellectual Property Commission):</strong> New business registrations, director appointments, annual returns. CIPC data is public by statute under the Companies Act.</li>
        <li><strong>Deeds Office:</strong> Property purchase records. Public under the Deeds Registries Act.</li>
        <li><strong>Government Gazette:</strong> Tender awards, public sector announcements, insolvency proceedings.</li>
        <li><strong>JSE SENS:</strong> Stock Exchange News Service announcements from listed companies.</li>
      </ul>

      <h4>4.2 Public news and press</h4>

      <ul>
        <li>Daily Maverick, Business Day, Forbes Africa, Reuters, Bloomberg South Africa, news24, BusinessTech.</li>
        <li>Press releases issued by companies, individuals, or representatives.</li>
        <li>Industry trade publications and announcements.</li>
      </ul>

      <h4>4.3 Public professional networks</h4>

      <ul>
        <li>LinkedIn public profile data &mdash; only fields the user has chosen to make public, accessed in compliance with LinkedIn&apos;s terms of service.</li>
        <li>Public job postings on platforms permitted under their terms.</li>
      </ul>

      <h4>4.4 Public social signals</h4>

      <ul>
        <li>Public posts and comments on YouTube, Reddit, public Facebook pages, X/Twitter, and Instagram &mdash; only content explicitly published as public by the author.</li>
        <li>We do not access private profiles, private groups, or any content gated behind authentication or friend-list permissions.</li>
        <li>We do not use automated account creation, fake personas, or social engineering to access otherwise-private content.</li>
      </ul>

      <h4>4.5 Behavioural data via partner integrations</h4>

      <ul>
        <li>Where a dealership partner has obtained explicit consent from a customer to share behavioural data (e.g., website visit history, search behaviour on dealership-owned domains), we process that data on the partner&apos;s behalf as an Operator.</li>
        <li>We do not aggregate or re-use this data outside the originating dealership relationship.</li>
      </ul>

      <h4>4.6 What we do not access</h4>

      <p>
        For absolute clarity, the following sources are <strong>never</strong> used by Visio Auto
        under any circumstances:
      </p>

      <ul>
        <li>Breach data, leaked credentials, or any data of unauthorised origin</li>
        <li>Private bank statements, credit reports, or financial records (without explicit consent and a contractual purpose)</li>
        <li>Medical records of any kind</li>
        <li>Children&apos;s data &mdash; we exclude any subject we identify as under 18 unless processing relates to license eligibility for parental consideration only</li>
        <li>Special personal information as defined in POPIA Section 26 (race, religion, political affiliation, biometric data, sexual orientation, etc.)</li>
        <li>Data scraped in violation of platform terms of service or robots.txt directives</li>
      </ul>

      <h2>5. Technical safeguards</h2>

      <p>
        POPIA Condition 7 requires &ldquo;appropriate, reasonable technical and organisational
        measures&rdquo; to secure personal information. Our implementation goes beyond the minimum:
      </p>

      <h4>5.1 Encryption</h4>

      <ul>
        <li>All personal information encrypted at rest using AES-256-GCM</li>
        <li>All data in transit protected with TLS 1.3</li>
        <li>Database connections require certificate-based mutual TLS</li>
        <li>Application-level secrets stored in encrypted vaults with rotation policies</li>
      </ul>

      <h4>5.2 Access controls</h4>

      <ul>
        <li>Role-based access control (RBAC) for all internal systems</li>
        <li>Multi-factor authentication mandatory for all privileged accounts</li>
        <li>Principle of least privilege enforced at the row level for dealership data isolation</li>
        <li>Service accounts use short-lived credentials, never long-term API keys</li>
      </ul>

      <h4>5.3 Audit and logging</h4>

      <ul>
        <li>Every signal processed is logged with source, timestamp, lawful basis, and processing purpose</li>
        <li>Every dealership partner action is auditable</li>
        <li>Logs retained for 7 years to support data subject access requests</li>
        <li>Logs themselves are protected and access-controlled</li>
      </ul>

      <h4>5.4 Data minimisation and retention</h4>

      <ul>
        <li>Signal data is processed in a streaming fashion &mdash; we do not maintain bulk databases of personal information beyond what is needed for active matching</li>
        <li>Unmatched signals are purged within 30 days</li>
        <li>Matched leads are retained for the duration of the dealership relationship plus 12 months for audit, then deleted</li>
        <li>Opt-out records are retained indefinitely (required to honour ongoing opt-out wishes)</li>
      </ul>

      <h4>5.5 Infrastructure</h4>

      <ul>
        <li>Hosted on Vercel Functions and Supabase (EU-West-1) &mdash; both POPIA-equivalent jurisdictions under GDPR</li>
        <li>Cross-border transfer compliance under POPIA Section 72 documented</li>
        <li>Regular penetration testing by third-party security firms</li>
        <li>Vulnerability disclosure programme open to the public</li>
      </ul>

      <h2>6. Data subject rights — in practice</h2>

      <p>
        POPIA grants data subjects specific rights. Here is exactly how we honour them:
      </p>

      <h4>Right to access (Section 23)</h4>

      <p>
        Any individual can request a copy of all personal information we hold about them by emailing
        our Information Officer. We respond within 7 working days with: (1) a list of every signal
        we&apos;ve processed about them, (2) the source of each signal, (3) the lawful basis,
        (4) the dealerships that received the lead, if any.
      </p>

      <h4>Right to object (Section 11(3))</h4>

      <p>
        Any individual can object to processing on legitimate interest grounds. We honour every
        objection received and immediately cease processing &mdash; no &ldquo;balancing test&rdquo;
        debates. The subject is added to our opt-out database and excluded from all future signal
        matching.
      </p>

      <h4>Right to correction (Section 24)</h4>

      <p>
        If a subject identifies incorrect information, we correct it within 7 working days and
        notify any dealership partner who received the affected lead.
      </p>

      <h4>Right to deletion (Section 24)</h4>

      <p>
        Any subject can request deletion of their personal information. We delete within 7 working
        days and confirm in writing. Deletion is propagated to all backups within 30 days.
      </p>

      <h4>Right to complain</h4>

      <p>
        Any subject who believes we have not honoured their rights can complain directly to the
        Information Regulator at <a href="https://inforegulator.org.za">inforegulator.org.za</a>.
        We cooperate fully with all regulatory enquiries.
      </p>

      <h2>7. The case study — anonymised</h2>

      <p>
        On our landing page we tell the story of a YouTube comment that led to a R5.2M Porsche sale.
        Here is how that case study aligns with the framework above:
      </p>

      <div className="callout">
        <span className="callout-label">Methodology Walkthrough</span>
        <p className="text-[14px] leading-relaxed text-white/60 m-0">
          <strong>Source 1:</strong> Public YouTube comment on a public review video. Lawful basis: legitimate interest (Section 11(1)(f)). Information voluntarily published by the subject for public consumption.
          <br /><br />
          <strong>Source 2:</strong> Public Deeds Office property record. Lawful basis: statutory public access under the Deeds Registries Act.
          <br /><br />
          <strong>Source 3:</strong> Public LinkedIn profile (subject&apos;s own published professional profile). Lawful basis: legitimate interest, contextually appropriate.
          <br /><br />
          <strong>Source 4:</strong> Public Instagram post by spouse celebrating an anniversary. Excluded from final lead because it constituted information about a third party (the spouse) that the subject had not himself published. We use this signal for context confirmation only and do not store it.
          <br /><br />
          <strong>Outreach:</strong> The Cape Town Porsche Centre received the lead with a documented lawful basis trail. Their outreach was a discreet phone call &mdash; not a bulk SMS or email blast. The call disclosed how the dealership had identified him and offered a one-click opt-out link for any future communications. Section 69 compliant.
          <br /><br />
          <strong>Outcome:</strong> A genuine match between a buyer who was actively looking and a dealer who had the inventory. Both parties benefitted. The subject retains all rights to access, object, and delete his data at any time.
        </p>
      </div>

      <h2>8. Information Officer</h2>

      <p>
        Visio Auto&apos;s designated Information Officer is registered with the Information Regulator
        and can be contacted at:
      </p>

      <ul>
        <li><strong>Email:</strong> privacy@visiocorp.co</li>
        <li><strong>Postal:</strong> VisioCorp (Pty) Ltd, c/o Information Officer, [address on file with Regulator]</li>
        <li><strong>Response SLA:</strong> 7 working days for all data subject requests</li>
      </ul>

      <h2>9. Recent enforcement context</h2>

      <p>
        Enforcement under POPIA has accelerated significantly since 2022. Notable matters relevant
        to AI, data, and lead generation:
      </p>

      <ul>
        <li>
          <strong>Department of Justice (July 2023)</strong> &mdash; First major enforcement notice. R5 million administrative fine for failure to renew SITA security cluster licence after a 2021 ransomware attack. Established that the Information Regulator will impose maximum statutory fines (Section 109 &mdash; up to R10 million) for systemic security failures.
        </li>
        <li>
          <strong>Dis-Chem Pharmacies (October 2022)</strong> &mdash; Enforcement notice following a breach affecting 3.6 million data subjects via a third-party operator. Significant for confirming that <strong>operator liability flows back to the responsible party</strong> if Section 21 contracts are inadequate. Lesson for signal-mining platforms: airtight operator agreements with every sub-processor are non-negotiable.
        </li>
        <li>
          <strong>TransUnion (March 2022)</strong> &mdash; N4ughtySecTU breach affecting 54 million records. Underscored the Regulator&apos;s expectation of advanced security controls (encryption, segmentation, anomaly detection) for any party holding large volumes of personal information.
        </li>
        <li>
          <strong>Information Regulator vs WhatsApp (ongoing since 2021)</strong> &mdash; Established the principle that terms-of-use changes affecting South African users are reviewable under POPIA, regardless of the controller&apos;s place of establishment.
        </li>
      </ul>

      <p>
        At the time of publication, no SA enforcement case directly involves AI inference or web
        scraping for lead generation. This paper&apos;s framework therefore draws on the structural
        reading of POPIA, the Information Regulator&apos;s published guidance notes, and analogous
        GDPR enforcement (notably the CNIL fines against Tagadamedia and Criteo for legitimate
        interest failures in 2023) as forward-looking indicators.
      </p>

      <p>
        Visio Auto operates well within the lawful envelope of POPIA. We publish this paper so that
        every dealer partner, every legal counsel, and every regulator can verify that for
        themselves.
      </p>

      <h4>9.1 Key references and authoritative sources</h4>

      <ul>
        <li>POPIA full text: <a href="https://popia.co.za/protection-of-personal-information-act-popia/">popia.co.za</a></li>
        <li>Information Regulator: <a href="https://inforegulator.org.za">inforegulator.org.za</a></li>
        <li>POPIA Regulations (GN R1383, GG 42110): <a href="https://www.gov.za/sites/default/files/gcis_document/201812/42110rg10897gon1383.pdf">official Gazette PDF</a></li>
        <li>Information Regulator guidance notes: <a href="https://inforegulator.org.za/guidance-notes/">inforegulator.org.za/guidance-notes</a></li>
        <li>Information Officer registration portal: <a href="https://inforegulator.org.za/io-registration/">inforegulator.org.za/io-registration</a></li>
        <li>Information Regulator enforcement notices: <a href="https://inforegulator.org.za/enforcement-notices/">inforegulator.org.za/enforcement-notices</a></li>
        <li>PAIA Manual template: <a href="https://inforegulator.org.za/wp-content/uploads/2020/07/PAIA-Manual-Template.pdf">PAIA Manual Template (PDF)</a></li>
        <li>Michalsons POPIA library: <a href="https://www.michalsons.com/focus-areas/privacy-and-data-protection/popi-act-popia">michalsons.com/popia</a></li>
        <li>Werksmans POPIA hub: <a href="https://www.werksmans.com/legal-updates-and-opinions/popia/">werksmans.com/popia</a></li>
        <li>ICO Legitimate Interests guidance (UK GDPR analogue): <a href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/legitimate-interests/">ico.org.uk</a></li>
      </ul>

      <h2>10. Versioning and change log</h2>

      <table>
        <thead>
          <tr>
            <th>Version</th>
            <th>Date</th>
            <th>Changes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1.0</td>
            <td>April 2026</td>
            <td>Initial publication.</td>
          </tr>
        </tbody>
      </table>

      <h2>11. Closing</h2>

      <p>
        We publish this paper because we believe the future of lead generation has to be transparent,
        compliant, and people-first. The industry has a long history of operating in shadows. We are
        choosing not to.
      </p>

      <p>
        If you are a dealership partner, this is the document we will hand your legal team. If you
        are a data subject, this is how you understand what we do and how to control it. If you are
        a regulator, this is how you audit us. If you are a competitor, we hope this raises the bar
        for everyone.
      </p>

      <p>
        We get nothing wrong by being honest about how we operate. We get everything right.
      </p>

      <hr />

      <p className="footnote">
        Visio Research Labs is the research arm of VisioCorp (Pty) Ltd, publishing peer-quality
        research on AI applications in healthcare, automotive, and music industries. This paper is
        published under Creative Commons Attribution 4.0 International (CC BY 4.0). You may quote,
        share, and republish with attribution. Cite as: Jess (2026). &ldquo;How We Find Buyers
        &mdash; Safely&rdquo;. Visio Research Labs, VRL-AUTO-002.
      </p>
    </PaperLayout>
  );
}
