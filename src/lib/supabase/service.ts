import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client for server-side operations
 * that don't have a user context (cron jobs, webhooks, etc.)
 *
 * WARNING: This bypasses RLS — only use in trusted server contexts.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
