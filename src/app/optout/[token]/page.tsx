import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

async function processOptOut(token: string): Promise<{ ok: boolean; message: string }> {
  if (!token || token.length < 10) {
    return { ok: false, message: "Invalid opt-out link." };
  }

  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("va_leads")
      .update({ opted_out_at: new Date().toISOString(), status: "inactive" })
      .eq("opt_out_token", token)
      .select("id, name")
      .maybeSingle();

    if (error) {
      console.error("[optout] DB error:", error.message);
      return { ok: false, message: "Could not process. Reply STOP to any WhatsApp message and we'll handle it manually." };
    }
    if (!data) {
      return { ok: false, message: "This opt-out link is no longer valid." };
    }

    return {
      ok: true,
      message: `${data.name ?? "You"}, you have been removed from our list. No more messages from any Visio Auto dealer about this enquiry.`,
    };
  } catch (err) {
    console.error("[optout] error:", err);
    return { ok: false, message: "Service temporarily unavailable. Email david@visiocorp.co with your phone number." };
  }
}

export default async function OptOutPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await processOptOut(token);

  return (
    <div className="min-h-screen bg-[#020c07] text-white/80">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-3xl px-6 h-16 flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/70"
          >
            <ArrowLeft className="h-3 w-3" /> Visio Auto
          </Link>
        </div>
      </header>

      <main className="py-24 px-6">
        <div className="mx-auto max-w-2xl text-center">
          {result.ok ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-6" />
              <h1 className="text-3xl font-extralight tracking-tight text-white mb-4">
                You&apos;re unsubscribed.
              </h1>
              <p className="text-white/60 leading-relaxed">{result.message}</p>
            </>
          ) : (
            <>
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-6" />
              <h1 className="text-3xl font-extralight tracking-tight text-white mb-4">
                Couldn&apos;t process opt-out.
              </h1>
              <p className="text-white/60 leading-relaxed">{result.message}</p>
            </>
          )}

          <div className="mt-12 pt-8 border-t border-white/[0.06] text-xs text-white/40 space-y-2">
            <p>Visio Auto · POPIA-compliant lead intelligence</p>
            <p>
              Questions? Email{" "}
              <a href="mailto:david@visiocorp.co" className="text-emerald-400 hover:text-emerald-300">
                david@visiocorp.co
              </a>
              {" · "}
              <Link href="/legal/popia" className="text-emerald-400 hover:text-emerald-300">
                POPIA notice
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
