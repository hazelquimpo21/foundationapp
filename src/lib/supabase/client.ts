/**
 * 🌐 SUPABASE BROWSER CLIENT
 * ==========================
 * Client-side Supabase instance for browser use.
 * Use this in React components and client-side code.
 *
 * Usage:
 *   import { supabase } from '@/lib/supabase/client'
 *   const { data } = await supabase.from('business_projects').select()
 */

import { createBrowserClient } from '@supabase/ssr'
import { log } from '@/lib/utils/logger'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  log.error('Missing Supabase environment variables!', undefined, {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
  })
}

/**
 * 🌐 Browser Supabase client
 * Safe to use in React components
 */
export const supabase = createBrowserClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

/**
 * 🔧 Create a new browser client instance
 * Use this if you need a fresh client
 */
export function createClient() {
  return createBrowserClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
  )
}
