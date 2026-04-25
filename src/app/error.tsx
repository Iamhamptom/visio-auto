"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Best-effort log to Sentry if it's wired (no-op otherwise).
    if (typeof window !== "undefined") {
      const w = window as unknown as { Sentry?: { captureException: (e: Error) => void } };
      w.Sentry?.captureException(error);
    }
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#020c07] text-white/80 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/60 mb-6">
            Something went wrong
          </p>
          <h1 className="text-3xl font-extralight tracking-tight text-white mb-4">
            We hit an error.
          </h1>
          <p className="text-sm text-white/55 leading-relaxed mb-8">
            The team has been notified. You can try again, or head back to the homepage.
          </p>
          {error.digest && (
            <p className="font-mono text-[10px] text-white/30 mb-8">
              Reference: {error.digest}
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-md"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/30 text-sm rounded-md text-white/70 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
