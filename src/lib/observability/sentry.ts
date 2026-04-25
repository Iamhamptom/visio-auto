/**
 * Sentry façade.
 *
 * We don't import @sentry/nextjs directly here — that package can balloon the
 * Edge bundle. Instead, this module is a thin wrapper that:
 *   - resolves the global Sentry handle if the SDK is loaded at runtime
 *   - logs to console as the always-on fallback
 *
 * To enable Sentry properly:
 *   npm i @sentry/nextjs
 *   npx @sentry/wizard@latest -i nextjs
 *   set SENTRY_DSN, SENTRY_ORG=hga-eo, SENTRY_PROJECT=visio-auto
 */

interface SentryLike {
  captureException: (err: unknown, ctx?: Record<string, unknown>) => void;
  captureMessage: (msg: string, ctx?: Record<string, unknown>) => void;
  setTag?: (key: string, value: string) => void;
}

function resolve(): SentryLike | null {
  if (typeof window !== "undefined") {
    const w = window as unknown as { Sentry?: SentryLike };
    if (w.Sentry) return w.Sentry;
  }
  if (typeof globalThis !== "undefined") {
    const g = globalThis as unknown as { Sentry?: SentryLike };
    if (g.Sentry) return g.Sentry;
  }
  return null;
}

export function captureException(err: unknown, ctx?: Record<string, unknown>): void {
  const s = resolve();
  if (s) {
    s.captureException(err, ctx);
  } else {
    console.error("[capture]", err, ctx ?? "");
  }
}

export function captureMessage(msg: string, ctx?: Record<string, unknown>): void {
  const s = resolve();
  if (s) s.captureMessage(msg, ctx);
  else console.warn("[capture]", msg, ctx ?? "");
}
