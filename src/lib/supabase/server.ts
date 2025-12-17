/**
 * 🖥️ SUPABASE SERVER CLIENT
 * =========================
 * Server-side Supabase instance for API routes and server components.
 * Handles cookies properly for SSR authentication.
 *
 * Usage:
 *   import { createServerClient } from '@/lib/supabase/server'
 *   const supabase = createServerClient()
 */

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { log } from '@/lib/utils/logger'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * 🖥️ Create a server-side Supabase client
 * Use this in Server Components and API routes
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // This can happen during static rendering
            // Safe to ignore as the user won't be logged in during static render
            log.debug('Could not set cookies during static render')
          }
        },
      },
    }
  )
}

/**
 * 🔐 Create a server client with service role (admin) access
 * Use this ONLY in secure server-side code (API routes, edge functions)
 * This bypasses Row Level Security!
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    log.error('Missing SUPABASE_SERVICE_ROLE_KEY!')
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }

  return createSupabaseServerClient(
    supabaseUrl || '',
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Admin client doesn't need cookies
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
