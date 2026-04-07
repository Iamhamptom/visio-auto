#!/usr/bin/env node
/**
 * Apply the commerce migration to Supabase via the Management API.
 *
 * Uses SUPABASE_ACCESS_TOKEN (personal access token from
 * https://supabase.com/dashboard/account/tokens) to execute raw SQL
 * on the xquzbgaenmohruluyhgv project.
 *
 * Idempotent — the migration SQL itself uses `if not exists` / `create
 * or replace` throughout, so it can be re-run safely.
 */
import { config } from 'dotenv';
import { readFile } from 'node:fs/promises';

config({ path: '.env.local' });

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!ACCESS_TOKEN) {
  console.error('❌ Missing SUPABASE_ACCESS_TOKEN env var.');
  console.error('   Get one at https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}
if (!SUPABASE_URL) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
  process.exit(1);
}

// Extract project ref from URL: https://xquzbgaenmohruluyhgv.supabase.co
const projectRef = new URL(SUPABASE_URL).host.split('.')[0];

console.log(`📦 Reading migration file...`);
const sql = await readFile('supabase/migrations/20260407_commerce.sql', 'utf8');
console.log(`   ${sql.length.toLocaleString()} characters, ${sql.split('\n').length} lines`);

console.log(`\n🚀 Applying to project ${projectRef}...`);

const res = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  }
);

const text = await res.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = text;
}

if (!res.ok) {
  console.error(`\n❌ Migration failed (HTTP ${res.status})`);
  console.error(body);
  process.exit(1);
}

console.log(`\n✅ Migration applied successfully`);
console.log(`   HTTP ${res.status}`);
if (Array.isArray(body) && body.length > 0) {
  console.log(`   Response rows: ${body.length}`);
}

console.log(`\nNext step: node scripts/verify-commerce-schema.mjs`);
