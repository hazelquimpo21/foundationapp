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

  // Protected routes check
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/signup')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                           request.nextUrl.pathname.startsWith('/onboard')

  // Redirect logic
  if (!user && isProtectedRoute) {
    // Not logged in, trying to access protected route → redirect to login
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isAuthPage) {
    // Logged in, trying to access auth page → redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}
