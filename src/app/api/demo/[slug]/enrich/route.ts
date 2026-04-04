import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// POST /api/demo/[slug]/enrich — Create lead enrichment order
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let body: { package: string; amount: number; leads_count: number; cars: unknown[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { amount, leads_count, cars } = body;
  const pkg = body.package;
  if (!pkg || !amount || !leads_count) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const dealerName = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  // Look up dealer email from leads table
  let dealerEmail = "";
  let contactName = "";
  const { data: lead } = await supabase
    .from("leads")
    .select("name, email")
    .ilike("company", `%${dealerName.replace(/ /g, "%")}%`)
    .limit(1)
    .single();
  if (lead) {
    dealerEmail = (lead.email as string) ?? "";
    contactName = (lead.name as string) ?? "";
  }

  // Insert order
  const { data: order, error } = await supabase
    .from("va_demo_orders")
    .insert({
      dealer_slug: slug,
      dealer_email: dealerEmail,
      dealer_name: contactName,
      dealer_company: dealerName,
      package: pkg,
      amount,
      leads_count,
      cars,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Try Yoco checkout
  const yocoKey = process.env.YOCO_SECRET_KEY;
  if (yocoKey && amount > 0) {
    try {
      const res = await fetch("https://payments.yoco.com/api/checkouts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${yocoKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "ZAR",
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://visio-auto.vercel.app"}/demo/${slug}?payment=success&order=${order?.id}`,
          cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://visio-auto.vercel.app"}/demo/${slug}?payment=cancelled`,
          metadata: {
            order_id: order?.id,
            dealer_slug: slug,
            package: pkg,
            leads_count,
          },
        }),
      });

      if (res.ok) {
        const checkout = await res.json();
        if (checkout.redirectUrl) {
          return NextResponse.json({ redirectUrl: checkout.redirectUrl, order_id: order?.id });
        }
      }
    } catch {
      // Yoco failed — fall through to direct confirmation
    }
  }

  // If no Yoco or Yoco failed, confirm directly (for testing / manual payment)
  // Send notification email
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Visio Auto <david@visiocorp.co>",
          to: "davidhampton@visiocorp.co",
          subject: `🔥 New Lead Order: ${dealerName} — R${(amount / 100).toLocaleString()} (${leads_count} leads)`,
          html: `<div style="font-family:sans-serif;">
            <h2 style="color:#10b981;">New Lead Enrichment Order</h2>
            <table>
              <tr><td style="padding:4px 12px 4px 0;color:#666;">Dealer</td><td><strong>${dealerName}</strong></td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#666;">Contact</td><td>${contactName}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#666;">Email</td><td>${dealerEmail}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#666;">Package</td><td>${pkg} — ${leads_count} leads</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#666;">Amount</td><td>R${(amount / 100).toLocaleString()}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#666;">Cars</td><td>${JSON.stringify(cars).slice(0, 200)}</td></tr>
            </table>
            <p style="margin-top:16px;">Order ID: ${order?.id}</p>
          </div>`,
        }),
      });
    } catch { /* non-critical */ }
  }

  return NextResponse.json({ success: true, order_id: order?.id });
}
