/**
 * 🔐 AUTH CALLBACK ROUTE
 * ======================
 * Handles the redirect from Supabase magic link emails.
 * 
 * Flow:
 *   1. User clicks magic link in email
 *   2. Supabase redirects to: /auth/callback?code=xxx
 *   3. This route exchanges the code for a session
 *   4. Creates member profile if user is new
 *   5. Redirects to dashboard (or original destination)
 * 
 * Error Handling:
 *   - Invalid/expired codes redirect to login with error message
 *   - Database errors are logged but don't block login
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/* ─────────────────────────────────────────────────────────────────────────────
 * 🔧 ENVIRONMENT CONFIG
 * ───────────────────────────────────────────────────────────────────────────── */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/* ─────────────────────────────────────────────────────────────────────────────
 * 📝 LOGGING UTILITIES
 * Formatted console output for debugging auth flow
 * ───────────────────────────────────────────────────────────────────────────── */

const log = {
  info: (msg: string, data?: Record<string, unknown>) => {
    console.log(`\n🔐 [Auth Callback] ${msg}`, data ? JSON.stringify(data, null, 2) : '')
  },
  success: (msg: string, data?: Record<string, unknown>) => {
    console.log(`\n✅ [Auth Callback] ${msg}`, data ? JSON.stringify(data, null, 2) : '')
  },
  error: (msg: string, error?: unknown, data?: Record<string, unknown>) => {
    console.error(`\n❌ [Auth Callback] ${msg}`, {
      error: error instanceof Error ? error.message : error,
      ...data,
    })
  },
  warn: (msg: string, data?: Record<string, unknown>) => {
    console.warn(`\n⚠️ [Auth Callback] ${msg}`, data ? JSON.stringify(data, null, 2) : '')
  },
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 🎯 GET HANDLER
 * Processes the magic link callback
 * ───────────────────────────────────────────────────────────────────────────── */

export async function GET(request: NextRequest) {
  log.info('Processing magic link callback...')
  
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 🔍 VALIDATE: Check for auth code
  // ═══════════════════════════════════════════════════════════════════════════
  
  if (!code) {
    log.error('No auth code provided in callback URL')
    // Redirect to login with error
    const loginUrl = new URL('/login', requestUrl.origin)
    loginUrl.searchParams.set('error', 'missing_code')
    loginUrl.searchParams.set('error_description', 'No authentication code was provided. Please try logging in again.')
    return NextResponse.redirect(loginUrl)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🍪 CREATE: Server-side Supabase client with cookie handling
  // ═══════════════════════════════════════════════════════════════════════════
  
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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
            // Logging but not throwing - cookies might fail in edge cases
            log.warn('Failed to set some cookies', { error })
          }
        },
      },
    }
  )

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔄 EXCHANGE: Convert auth code to session
  // ═══════════════════════════════════════════════════════════════════════════
  
  log.info('Exchanging code for session...')
  
  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

  if (sessionError) {
    log.error('Failed to exchange code for session', sessionError)
    // Redirect to login with error
    const loginUrl = new URL('/login', requestUrl.origin)
    loginUrl.searchParams.set('error', 'exchange_failed')
    loginUrl.searchParams.set('error_description', 'Your login link may have expired. Please try again.')
    return NextResponse.redirect(loginUrl)
  }

  if (!sessionData.user) {
    log.error('No user returned from session exchange')
    const loginUrl = new URL('/login', requestUrl.origin)
    loginUrl.searchParams.set('error', 'no_user')
    return NextResponse.redirect(loginUrl)
  }

  log.success('Session established', { 
    userId: sessionData.user.id,
    email: sessionData.user.email,
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 👤 PROFILE: Check/create member profile
  // Magic link handles both login & signup, so we create profile for new users
  // ═══════════════════════════════════════════════════════════════════════════
  
  log.info('Checking for existing member profile...')
  
  const { data: existingMember, error: memberFetchError } = await supabase
    .from('members')
    .select('id')
    .eq('auth_id', sessionData.user.id)
    .single()

  if (memberFetchError && memberFetchError.code !== 'PGRST116') {
    // PGRST116 = "no rows returned" (expected for new users)
    // Any other error is unexpected
    log.error('Error checking for member profile', memberFetchError)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🆕 NEW USER: Create member profile if doesn't exist
  // ─────────────────────────────────────────────────────────────────────────────
  
  if (!existingMember) {
    log.info('Creating new member profile for first-time user...', {
      email: sessionData.user.email,
    })

    const { data: newMember, error: createError } = await supabase
      .from('members')
      .insert({
        auth_id: sessionData.user.id,
        email: sessionData.user.email!,
        name: sessionData.user.user_metadata?.name || null,
      })
      .select()
      .single()

    if (createError) {
      // Don't block login for profile creation failure - user can still access app
      // The profile can be created later or on next login attempt
      log.error('Failed to create member profile', createError, {
        userId: sessionData.user.id,
        email: sessionData.user.email,
      })
    } else {
      log.success('Member profile created', { 
        memberId: newMember.id,
        email: newMember.email,
      })
    }
  } else {
    log.info('Existing member found', { memberId: existingMember.id })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🚀 REDIRECT: Send user to their destination
  // ═══════════════════════════════════════════════════════════════════════════
  
  log.success('Auth callback complete, redirecting to:', { destination: next })
  
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}

