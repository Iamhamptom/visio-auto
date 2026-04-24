import type { Dealer, Lead, Language } from "@/lib/types";

const BRAND = {
  name: "Visio Auto",
  domain: "auto.visiocorp.co",
  support: "david@visiocorp.co",
  accent: "#10b981",
  bg: "#030f0a",
};

function wrapEmail(content: string, title: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;color:#e4e4e7;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="padding:12px 0 32px;border-bottom:1px solid rgba(255,255,255,0.06);">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${BRAND.accent};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">
        ${BRAND.name}
      </div>
    </div>
    <div style="padding:40px 0;">
      ${content}
    </div>
    <div style="padding-top:32px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.35);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">
      ${BRAND.name} · ${BRAND.domain}<br>
      Reply to <a href="mailto:${BRAND.support}" style="color:${BRAND.accent};">${BRAND.support}</a> — a human reads every message.
    </div>
  </div>
</body>
</html>`;
}

function button(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 24px;background:${BRAND.accent};color:${BRAND.bg};text-decoration:none;font-weight:500;font-size:14px;letter-spacing:0.3px;">${label}</a>`;
}

export function welcomeEmail(dealerName: string, tier: string, dashboardUrl: string) {
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
  const html = wrapEmail(
    `
    <h1 style="margin:0 0 16px;font-size:28px;font-weight:300;color:#fff;letter-spacing:-0.5px;">
      Welcome, ${dealerName}.
    </h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.75);">
      Your ${tierLabel} plan is active. Leads will start landing in your dashboard and WhatsApp as the signal engine finds matches in your area.
    </p>
    <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.75);">
      What to do in the next 24 hours:
    </p>
    <ol style="margin:0 0 32px;padding-left:20px;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.65);">
      <li>Add your inventory — even 5 cars is enough for the matcher to start working.</li>
      <li>Set your preferred brands, areas, and lead thresholds in Settings.</li>
      <li>Confirm your WhatsApp number so alerts reach you in under 60 seconds.</li>
    </ol>
    <div style="margin:40px 0;">
      ${button("Open dashboard", dashboardUrl)}
    </div>
    <p style="margin:32px 0 0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.45);">
      Questions? Just reply to this email. Jess will answer the common ones in seconds, and anything she can't handle comes straight to me.
    </p>
    <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.45);">
      — David Hampton, CEO
    </p>
  `,
    `Welcome to ${BRAND.name}`
  );
  return {
    subject: `${dealerName} — your ${tierLabel} plan is live`,
    html,
    text: `Welcome, ${dealerName}. Your ${tierLabel} plan is active. Open the dashboard: ${dashboardUrl}`,
  };
}

export function dealerLeadNotificationEmail(
  dealer: Pick<Dealer, "name">,
  lead: Pick<Lead, "id" | "name" | "phone" | "ai_score" | "score_tier" | "budget_min" | "budget_max" | "preferred_brand" | "timeline" | "area">,
  dashboardUrl: string
) {
  const budget = lead.budget_min || lead.budget_max
    ? `R${((lead.budget_min ?? 0) / 1000).toFixed(0)}K – R${((lead.budget_max ?? 0) / 1000).toFixed(0)}K`
    : "Not specified";

  const timelineMap: Record<string, string> = {
    this_week: "This week",
    this_month: "This month",
    three_months: "Within 3 months",
    just_browsing: "Just browsing",
  };

  const rows = [
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["AI Score", `${lead.ai_score}/100 · ${lead.score_tier.toUpperCase()}`],
    ["Budget", budget],
    ["Brand", lead.preferred_brand ?? "Any"],
    ["Timeline", timelineMap[lead.timeline] ?? lead.timeline],
    ["Area", lead.area ?? "Not specified"],
  ]
    .map(
      ([k, v]) => `
    <tr>
      <td style="padding:10px 16px 10px 0;font-size:12px;color:rgba(255,255,255,0.45);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:1px;width:100px;">${k}</td>
      <td style="padding:10px 0;font-size:14px;color:#fff;">${v}</td>
    </tr>`
    )
    .join("");

  const html = wrapEmail(
    `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:300;color:#fff;letter-spacing:-0.3px;">
      New ${lead.score_tier} lead for ${dealer.name}
    </h1>
    <p style="margin:0 0 32px;font-size:14px;color:rgba(255,255,255,0.55);">
      Score ${lead.ai_score}/100 · respond within 60s for best conversion.
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
      ${rows}
    </table>
    <div style="margin:32px 0;">
      ${button("Open lead", dashboardUrl)}
    </div>
  `,
    `New lead — ${lead.name}`
  );

  return {
    subject: `New ${lead.score_tier.toUpperCase()} lead — ${lead.name}`,
    html,
    text: `New ${lead.score_tier} lead: ${lead.name} · ${budget} · ${lead.preferred_brand ?? "any brand"} · ${lead.phone}. Open: ${dashboardUrl}`,
  };
}

export function paymentReceiptEmail(
  dealerName: string,
  amountCents: number,
  tier: string,
  receiptUrl: string
) {
  const rands = (amountCents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 });
  const html = wrapEmail(
    `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:300;color:#fff;letter-spacing:-0.3px;">
      Payment received — R${rands}
    </h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.75);">
      Thank you, ${dealerName}. Your payment for the ${tier} plan has been received.
    </p>
    <div style="margin:32px 0;">
      ${button("View receipt", receiptUrl)}
    </div>
  `,
    `Payment received — Visio Auto`
  );
  return {
    subject: `Payment received — Visio Auto ${tier} plan`,
    html,
    text: `Payment of R${rands} received for ${tier} plan. Receipt: ${receiptUrl}`,
  };
}
