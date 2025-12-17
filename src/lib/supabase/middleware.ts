/**
 * 🛡️ SUPABASE MIDDLEWARE CLIENT
 * =============================
 * Special client for Next.js middleware.
 * Handles auth state during route transitions.
 *
 * Usage in middleware.ts:
 *   import { updateSession } from '@/lib/supabase/middleware'
 *   export async function middleware(request) {
 *     return await updateSession(request)
 *   }
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * 🔄 Update the user session during middleware
 * This refreshes expired tokens automatically
 */
export async function updateSession(request: NextRequest) {
  // Create an initial response
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // First set on request (for server)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Then on response (for browser)
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  // This is important for keeping users logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ═══════════════════════════════════════════════════════════════════════════
  // 🛣️ ROUTE CLASSIFICATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  const pathname = request.nextUrl.pathname
  
  // Auth pages (login/signup) - redirect to dashboard if logged in
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')
  
  // Auth callback - special handling for magic link redirects (always allow)
  const isAuthCallback = pathname.startsWith('/auth/callback')
  
  // Protected routes - require authentication
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/onboard')

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔀 REDIRECT LOGIC
  // ═══════════════════════════════════════════════════════════════════════════

  // Skip auth checks for callback route - it handles its own auth
  if (isAuthCallback) {
    return supabaseResponse
  }

  if (!user && isProtectedRoute) {
    // Not logged in, trying to access protected route → redirect to login
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isAuthPage) {
    // Logged in, trying to access auth page → redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}
