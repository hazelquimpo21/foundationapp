/**
 * 🗄️ Supabase Browser Client
 *
 * Use this client in React components (client-side).
 * It uses the anon key and respects RLS policies.
 */

import { createBrowserClient } from '@supabase/ssr';
import { log } from '@/lib/utils';

// ============================================
// 🔧 Environment Validation
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error(
    '❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable.\n' +
    '   Please add it to your .env.local file.\n' +
    '   Get it from: Supabase Dashboard > Settings > API'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    '❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.\n' +
    '   Please add it to your .env.local file.\n' +
    '   Get it from: Supabase Dashboard > Settings > API'
  );
}

// ============================================
// 📦 Client Creation
// ============================================

/**
 * Create a Supabase client for browser/client-side usage.
 *
 * This client:
 * - Uses the anon key (safe to expose)
 * - Respects Row Level Security (RLS)
 * - Handles auth state automatically
 *
 * @example
 * const supabase = createClient();
 * const { data } = await supabase.from('businesses').select('*');
 */
export function createClient() {
  log.debug('Creating Supabase browser client');

  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}

// ============================================
// 🔄 Singleton Instance (optional)
// ============================================

let browserClient: ReturnType<typeof createClient> | null = null;

/**
 * Get a singleton Supabase client for the browser.
 * Use this when you want to reuse the same client instance.
 *
 * @example
 * const supabase = getSupabase();
 */
export function getSupabase() {
  if (!browserClient) {
    browserClient = createClient();
    log.info('🗄️ Supabase browser client initialized');
  }
  return browserClient;
}
