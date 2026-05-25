import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client.
 * Bypasses Row Level Security — use ONLY in server-side API routes.
 * Never import this in client components or expose to the browser.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in your environment variables.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.'
    )
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
