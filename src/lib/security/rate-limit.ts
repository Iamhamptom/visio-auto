/**
 * In-memory token-bucket rate limiter.
 *
 * For SA dealer scale (hundreds of dealers, thousands of public form
 * submissions/day), an in-memory limiter on a single Vercel Function instance
 * is enough. Cold-start drift is acceptable. Move to Upstash Redis only if we
 * see real abuse beyond this.
 */

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 10_000;

function gc() {
  if (buckets.size < MAX_BUCKETS) return;
  const cutoff = Date.now() - 60 * 60 * 1000; // drop buckets idle for 1h
  for (const [k, v] of buckets.entries()) {
    if (v.lastRefill < cutoff) buckets.delete(k);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retry_after_seconds: number;
}

export interface RateLimitOptions {
  /** Max requests in the window. */
  limit: number;
  /** Window in seconds. */
  window: number;
}

/**
 * Check + decrement a rate limit bucket.
 * @param key Bucket key — typically `${route}:${ip}` or `${route}:${dealer_id}`.
 */
export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  gc();

  const now = Date.now();
  const refillRate = opts.limit / opts.window; // tokens per second
  const bucket = buckets.get(key) ?? { tokens: opts.limit, lastRefill: now };

  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(opts.limit, bucket.tokens + elapsed * refillRate);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    const retry = Math.ceil((1 - bucket.tokens) / refillRate);
    buckets.set(key, bucket);
    return { allowed: false, remaining: 0, retry_after_seconds: retry };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return {
    allowed: true,
    remaining: Math.floor(bucket.tokens),
    retry_after_seconds: 0,
  };
}

/** Extract a stable IP from a Next.js request. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Build standard 429 response with Retry-After. */
export function rateLimitedResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      retry_after_seconds: result.retry_after_seconds,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.retry_after_seconds),
        "X-RateLimit-Remaining": String(result.remaining),
      },
    }
  );
}
