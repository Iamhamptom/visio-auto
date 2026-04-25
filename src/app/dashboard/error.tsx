"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const w = window as unknown as { Sentry?: { captureException: (e: Error) => void } };
      w.Sentry?.captureException(error);
    }
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="space-y-4 max-w-md py-12">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-400/70">
        Dashboard error
      </p>
      <h1 className="text-2xl font-extralight tracking-tight text-white">
        Couldn&apos;t render this view.
      </h1>
      <p className="text-sm text-white/55 leading-relaxed">
        This page failed to load. The team has been notified.
      </p>
      {error.digest && (
        <p className="font-mono text-[10px] text-white/30">Reference: {error.digest}</p>
      )}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-md"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
        <Link href="/dashboard" className="text-xs text-white/50 hover:text-white/80">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
