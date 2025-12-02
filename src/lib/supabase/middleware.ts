/**
 * 🗄️ Supabase Middleware Client
 *
 * Use this in Next.js middleware to refresh auth tokens.
 * This ensures users stay logged in across requests.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ============================================
// 🔄 Middleware Helper
// ============================================

/**
 * Update the Supabase session in middleware.
 *
 * This function:
 * - Refreshes the auth token if needed
 * - Handles the cookie updates
 * - Returns the response with updated cookies
 *
 * @example
 * // middleware.ts
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request);
 * }
 */
export async function updateSession(request: NextRequest) {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Create a Supabase client that can read/write cookies
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // This will refresh session if expired
  // IMPORTANT: Do NOT remove this line - it keeps users logged in
  await supabase.auth.getUser();

  return supabaseResponse;
}
