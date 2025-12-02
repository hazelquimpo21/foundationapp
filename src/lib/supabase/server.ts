/**
 * 🗄️ Supabase Server Client
 *
 * Use this client in Server Components, API routes, and server actions.
 * Handles cookies for authentication automatically.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { log } from '@/lib/utils';

// ============================================
// 🔧 Environment Variables
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ============================================
// 📦 Server Client (with cookies)
// ============================================

/**
 * Create a Supabase client for server-side usage.
 *
 * This client:
 * - Reads/writes auth cookies
 * - Respects Row Level Security
 * - Should be used in Server Components, API routes, server actions
 *
 * @example
 * // In an API route
 * export async function GET() {
 *   const supabase = createServerSupabase();
 *   const { data } = await supabase.from('businesses').select('*');
 * }
 */
export async function createServerSupabase() {
  log.debug('Creating Supabase server client');

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  });
}

// ============================================
// 🔑 Admin Client (bypasses RLS)
// ============================================

/**
 * Create an admin Supabase client that bypasses RLS.
 *
 * ⚠️ WARNING: Only use this for:
 * - Background jobs
 * - Admin operations
 * - Server-to-server calls
 *
 * NEVER expose this client to the browser!
 *
 * @example
 * // In an API route for admin operations
 * const supabase = createAdminSupabase();
 * await supabase.from('users').update({ ... });
 */
export function createAdminSupabase() {
  if (!supabaseServiceKey) {
    throw new Error(
      '❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable.\n' +
      '   This is required for admin operations.\n' +
      '   Get it from: Supabase Dashboard > Settings > API'
    );
  }

  log.debug('Creating Supabase admin client (bypasses RLS)');

  // Use the service role key directly
  return createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // No cookies for admin client
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
