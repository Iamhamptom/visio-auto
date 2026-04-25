"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-[#020c07] text-white/80 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/70 mb-8"
        >
          <ArrowLeft className="h-3 w-3" /> Visio Auto
        </Link>

        <Card className="border-white/[0.06] bg-white/[0.02]">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-extralight tracking-tight text-white">
              Sign in to your dashboard
            </CardTitle>
            <p className="text-xs text-white/50 mt-2">
              Enter the email address you signed up with. We&apos;ll send a one-time link.
            </p>
          </CardHeader>
          <CardContent>
            {status === "sent" ? (
              <div className="space-y-3 py-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">Check your inbox for {email}.</span>
                </div>
                <p className="text-xs text-white/45">
                  The link expires in 15 minutes. Didn&apos;t receive it?{" "}
                  <button
                    onClick={() => setStatus("idle")}
                    className="text-emerald-400 underline underline-offset-4"
                  >
                    Try again
                  </button>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={send} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="dealer@example.co.za"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <Button
                  type="submit"
                  disabled={status === "sending" || !email.includes("@")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> Sending…
                    </>
                  ) : (
                    "Send sign-in link"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-white/40">
          New here?{" "}
          <Link href="/get-started" className="text-emerald-400 hover:text-emerald-300">
            Set up your dealership
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function DashboardLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020c07]" />}>
      <LoginForm />
    </Suspense>
  );
}
