import type { NextConfig } from "next";

/**
 * Enterprise-grade HTTP security headers.
 * Covers OWASP top picks for SaaS dashboards: HSTS, frame-busting, MIME sniffing,
 * referrer policy, permissions policy, and a Content-Security-Policy that
 * allows our own assets + Supabase + Yoco + Resend + ElevenLabs without `unsafe-eval`.
 */
const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), geolocation=(), payment=(self), usb=(), interest-cohort=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin-allow-popups",
  },
];

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.yoco.com https://payments.yoco.com https://*.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com https://payments.yoco.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://api.yoco.com https://payments.yoco.com https://api.elevenlabs.io https://api.retellai.com https://generativelanguage.googleapis.com https://api.anthropic.com https://auto.visiocorp.co https://*.visiocorp.co",
  "frame-src 'self' https://payments.yoco.com",
  "media-src 'self' blob: data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://payments.yoco.com",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...SECURITY_HEADERS,
          {
            key: "Content-Security-Policy",
            value: CSP_DIRECTIVES.join("; "),
          },
        ],
      },
      {
        // API routes get extra: no caching by intermediaries.
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/pricing",
        permanent: true,
      },
      {
        source: "/shop/:path*",
        destination: "/pricing/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
