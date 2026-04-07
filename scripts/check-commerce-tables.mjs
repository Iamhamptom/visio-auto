#!/usr/bin/env node
/**
 * Checks whether the va_commerce_* tables exist in the Supabase project.
 * Uses the service role key to bypass RLS.
 * Exits 0 if all 5 tables exist, 1 otherwise.
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const TABLES = [
  'va_commerce_orders',
  'va_commerce_order_items',
  'va_commerce_subscriptions',
  'va_commerce_payments',
  'va_commerce_entitlements',
];

console.log(`🔍 Checking ${TABLES.length} commerce tables on ${SUPABASE_URL}`);
console.log();

let ok = 0;
let missing = 0;

for (const table of TABLES) {
  // Use a real SELECT (not HEAD) to reliably detect missing tables.
  // PostgREST `head:true` can return misleading results when the schema
  // cache is in an unusual state.
  const { data, error } = await supabase.from(table).select('id').limit(1);
  const count = data ? data.length : 0;

  if (error) {
    if (
      error.code === 'PGRST205' ||
      /not found|not exist|relation/i.test(error.message)
    ) {
      console.log(`❌ ${table.padEnd(35)} — MISSING`);
      missing++;
    } else {
      console.log(`⚠️  ${table.padEnd(35)} — ERROR: ${error.message}`);
      missing++;
    }
  } else {
    console.log(`✅ ${table.padEnd(35)} — exists (${count ?? 0} rows)`);
    ok++;
  }
}

console.log();
console.log(`Summary: ${ok} present, ${missing} missing`);

if (missing === 0) {
  console.log('\n✨ Commerce migration already applied — no action needed.');
  process.exit(0);
} else {
  console.log(
    '\n🔴 Commerce migration NOT applied. Run scripts/apply-commerce-migration.mjs'
  );
  process.exit(1);
}
