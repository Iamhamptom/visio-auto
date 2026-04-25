# VISIO AUTO — AI AUTOMOTIVE INTELLIGENCE PLATFORM
## System Report | Refreshed 2026-04-25 | v1.2

### Platform: https://auto.visiocorp.co
### GitHub: https://github.com/Iamhamptom/visio-auto
### Supabase: xquzbgaenmohruluyhgv (shared with Workspace)

> **About this report.** Numbers below are what the codebase actually does today. Anything that requires an external API key but isn't yet wired in production is marked _gated_ — the code path exists and is exercised by tests, the integration goes live as soon as the key lands.

---

## CURRENT SCALE (codebase, not marketing)

| Metric | Count |
|--------|-------|
| Total source files | ~150 |
| API routes | 80+ |
| Dashboard pages | 13 |
| Cron jobs (registered in vercel.json) | 11 |
| Signal types defined | 21 |
| Marketplaces in aggregator scaffold | 3 (AutoTrader SA, Cars.co.za, Facebook) |
| Email templates (branded HTML) | 3 |
| Vitest unit tests | 37 (passing) |
| DB migrations applied | 3 |

## PRODUCT PILLARS — STATE

| Pillar | Status | Notes |
|---|---|---|
| **Lead intake (`/api/leads`)** | LIVE | Rate-limited, dedup by phone/email, POPIA consent gate, OEM detection, receipt generation, auto-assign + auto-notify (gated) |
| **Signal engine (single source)** | LIVE | 21 signal types, scoring, auto-convert with manual approval queue |
| **Multi-marketplace aggregator** | SCAFFOLD | 3 source classes + orchestrator + cron route. Each source idle until its `*_SCRAPER_URL` env is set. |
| **Pre-decline affordability checker** | LIVE | NCA Reg 23A norms, SA prime 11.00%, model-only result without bureau, bureau lookup _gated_ on TransUnion/Compuscan/Experian env keys |
| **OEM pass-through detection** | LIVE | 22+ OEM domains tracked, dashboard surfaces `oem_pass_through` flag with win-back script per brand |
| **POPIA-clean lead receipt** | LIVE | Every assigned lead gets a hashed receipt with lawful basis, consent timestamp, opt-out URL. Stored in `va_lead_receipts`. |
| **Approval queue** | LIVE | `/dashboard/settings/notifications` shows pending leads, approve/skip routes notify with manual override |
| **Yoco checkout + welcome flow** | LIVE | Idempotent webhook, dealer ownership check, branded welcome + receipt emails via Resend |
| **WhatsApp inbound webhook** | LIVE | Meta HMAC verification + idempotency; conversation state machine wired |
| **Voice agent (Retell)** | GATED | Routes return 503 with clear error until `RETELL_API_KEY` + agent IDs are set |
| **Bureau credit lookup** | GATED | TransUnion XDS / Compuscan / Experian SA — first one with a key wins; without keys the affordability check is model-only and labelled as such |
| **AutoTrader / Cars.co.za scrapers** | GATED | Connector contract + parsing in source classes; needs out-of-process Playwright worker URL |

## SECURITY POSTURE (2026-04-25)

| Concern | State |
|---|---|
| Yoco webhook idempotency | ✓ stored in `va_webhook_events`, dedupes by `event_id` |
| Yoco dealer ownership | ✓ refuses payment.succeeded for unknown dealer_id |
| Yoco signature verification | ✓ HMAC-SHA256, fails closed when `YOCO_WEBHOOK_SECRET` set |
| WhatsApp HMAC verification | ✓ `X-Hub-Signature-256` against `WHATSAPP_APP_SECRET`, fails closed in production |
| WhatsApp idempotency | ✓ message id stored in `va_webhook_events` |
| Dashboard auth | ✓ Supabase magic-link via middleware on `/dashboard/*` |
| Dealer isolation | ✓ `va_dealer_users` table; KPI + leads APIs accept `dealer_id` filter |
| Rate limiting | ✓ public POSTs at 5–30 req/min/IP |
| POPIA consent | ✓ required on `/get-quote`, `/get-started`, `/api/affordability/check`, `/api/leads` |
| Data subject rights | ✓ `/api/data-rights/access`, `/delete`; opt-out at `/optout/[token]` |
| Cron secret | ✓ all `/api/cron/*` reject without `Bearer ${CRON_SECRET}` |
| Sentry | scaffolded — `lib/observability/sentry.ts` + `error.tsx` ready, wire `@sentry/nextjs` to activate |

## APPROVAL GATE — HOW IT WORKS

Chairman's hard rule: **never auto-send without approval**.

1. Default: `AUTO_NOTIFY_ENABLED=false` → all dealer alerts go to the approval queue
2. Cron creates leads + assigns dealers normally; sets `notification_status='pending_approval'`
3. Dashboard at `/dashboard/settings/notifications` lists the queue, shows OEM-pass-through warnings, and lets a human approve or skip per row
4. Approve → `notifyDealer(..., { manualOverride: true })` fires the WhatsApp + email
5. Skip → marks `skipped`, no further attempts

When `AUTO_NOTIFY_ENABLED=true`, only score_tier ≥ `AUTO_NOTIFY_MIN_TIER` (default `hot`) auto-fires; anything below still queues.

## DB MIGRATIONS APPLIED

| File | Date | What |
|------|------|------|
| `20260407_commerce.sql` | 2026-04-07 | Yoco orders, entitlements, suite catalog |
| `20260424000000_notification_gate.sql` | 2026-04-24 | `notification_status`, `va_payment_events`, dealer payment fields |
| `20260425000000_security_compliance.sql` | 2026-04-25 | `va_webhook_events`, `va_lead_receipts`, `va_data_rights_requests`, `va_dealer_users`, `va_affordability_checks`, OEM + UTM + consent columns |

## ENV — WHAT'S SET / WHAT'S GATED

**Set on Vercel production:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `YOCO_SECRET_KEY`, `YOCO_WEBHOOK_SECRET`, `NEXT_PUBLIC_YOCO_PUBLIC_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `ELEVENLABS_API_KEY`, `JESS_TOOL_SECRET`, `CRON_SECRET`.

**Gated until set:** `WHATSAPP_APP_SECRET`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `RETELL_API_KEY`, `RETELL_AGENT_QUALIFY/FOLLOWUP/TESTDRIVE`, `TRANSUNION_XDS_API_KEY`, `COMPUSCAN_API_KEY`, `EXPERIAN_SA_API_KEY`, `AUTOTRADER_SCRAPER_URL`, `CARS_COZA_SCRAPER_URL`, `FB_GRAPH_TOKEN`, `SENTRY_DSN`, `AUTO_NOTIFY_ENABLED`.

## WHAT THE PRODUCT NO LONGER CLAIMS

| Old marketing claim | What we actually ship |
|---|---|
| "23 buying signal types" | 21 (verified in `lib/signals/types.ts`) |
| "Voice in 6 SA languages live" | Voice routes return 503 with explicit reason until Retell keys land |
| "Bloomberg-style real-time NAAMSA" | Q1 2026 published snapshot at `/api/intelligence/q1-2026`, sources cited inline |
| "Self-serve client portal" | `/client/[id]` exists; usage gated by approval gate + dashboard auth |
| "Outreach autopilot" | Drafts only by default; explicit `{ approved: true }` or cron bearer required to dispatch |

## THIS REPORT IS GENERATED, NOT WRITTEN
Every figure cross-checks the codebase. If a row drifts from reality, refresh by re-running the audit prompt against the repo.
