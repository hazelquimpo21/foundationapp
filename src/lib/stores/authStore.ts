/**
 * 🔐 AUTH STORE
 * =============
 * Manages authentication state with Zustand.
 * 
 * Supports magic link (passwordless) authentication via Supabase OTP.
 * The magic link flow:
 *   1. User enters email → signInWithMagicLink sends OTP email
 *   2. User clicks link → /auth/callback handles the redirect
 *   3. Callback exchanges code for session & creates member profile if needed
 *
 * Usage:
 *   const { member, signInWithMagicLink, signOut } = useAuthStore()
 */

import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { log } from '@/lib/utils/logger'
import type { Member } from '@/lib/types'

/* ─────────────────────────────────────────────────────────────────────────────
 * 📋 TYPE DEFINITIONS
 * ───────────────────────────────────────────────────────────────────────────── */

interface AuthState {
  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 STATE
  // ═══════════════════════════════════════════════════════════════════════════
  member: Member | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  /** Tracks if magic link was sent (for UI feedback) */
  magicLinkSent: boolean

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎬 ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  initialize: () => Promise<void>
  /** 🪄 Send magic link to email (passwordless login) */
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>
  /** 📧 Legacy: Sign in with email/password (kept for future use) */
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  /** 📝 Legacy: Sign up with email/password (kept for future use) */
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  clearError: () => void
  /** Reset magic link sent state */
  resetMagicLinkSent: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  /* ═══════════════════════════════════════════════════════════════════════════
   * 📊 INITIAL STATE
   * ═══════════════════════════════════════════════════════════════════════════ */
  member: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  magicLinkSent: false,

  /* ═══════════════════════════════════════════════════════════════════════════
   * 🚀 INITIALIZE
   * Check for existing session on app mount
   * ═══════════════════════════════════════════════════════════════════════════ */
  initialize: async () => {
    if (get().isInitialized) return

    log.info('🔐 Initializing auth...')
    set({ isLoading: true })

    try {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        // Fetch member profile
        const { data: member, error } = await supabase
          .from('members')
          .select('*')
          .eq('auth_id', session.user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (member) {
          log.success('🔐 Session restored', { email: member.email })
          set({ member, isInitialized: true, isLoading: false })
        } else {
          // User exists in auth but not in members table
          // This shouldn't happen normally, but handle gracefully
          log.warn('🔐 Auth user without member profile')
          set({ isInitialized: true, isLoading: false })
        }
      } else {
        log.info('🔐 No existing session')
        set({ isInitialized: true, isLoading: false })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        log.debug('🔐 Auth state changed', { event })

        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch member profile
          const { data: member } = await supabase
            .from('members')
            .select('*')
            .eq('auth_id', session.user.id)
            .single()

          if (member) {
            set({ member })
          }
        } else if (event === 'SIGNED_OUT') {
          set({ member: null })
        }
      })
    } catch (error) {
      log.error('🔐 Auth initialization failed', error)
      set({ isInitialized: true, isLoading: false, error: 'Failed to initialize auth' })
    }
  },

  /* ═══════════════════════════════════════════════════════════════════════════
   * 🪄 MAGIC LINK SIGN IN (Primary auth method)
   * Sends a one-time password link to the user's email.
   * User clicks the link → /auth/callback handles session creation.
   * ═══════════════════════════════════════════════════════════════════════════ */
  signInWithMagicLink: async (email) => {
    log.info('🔐 [Magic Link] Sending login link...', { email })
    set({ isLoading: true, error: null, magicLinkSent: false })

    try {
      // ─────────────────────────────────────────────────────────────────────────
      // 📧 Send magic link via Supabase OTP
      // The redirectTo URL is where user lands after clicking the email link
      // ─────────────────────────────────────────────────────────────────────────
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Redirect to our callback handler which will exchange code for session
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        log.error('🔐 [Magic Link] Failed to send', error, { email })
        throw error
      }

      log.success('🔐 [Magic Link] Sent successfully', { email })
      set({ isLoading: false, magicLinkSent: true })
      return { success: true }

    } catch (error) {
      // ─────────────────────────────────────────────────────────────────────────
      // ❌ Handle errors gracefully with user-friendly messages
      // ─────────────────────────────────────────────────────────────────────────
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to send login link. Please try again.'
      
      log.error('🔐 [Magic Link] Error', error, { email })
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  /* ═══════════════════════════════════════════════════════════════════════════
   * 📧 PASSWORD SIGN IN (Legacy - kept for future use)
   * Traditional email/password authentication
   * ═══════════════════════════════════════════════════════════════════════════ */
  signIn: async (email, password) => {
    log.info('🔐 [Password] Signing in...', { email })
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Fetch member profile
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('auth_id', data.user.id)
          .single()

        if (memberError) throw memberError

        log.success('🔐 Signed in successfully', { email })
        set({ member, isLoading: false })
        return { success: true }
      }

      throw new Error('No user returned from sign in')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed'
      log.error('🔐 Sign in failed', error)
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  /* ═══════════════════════════════════════════════════════════════════════════
   * 📝 PASSWORD SIGN UP (Legacy - kept for future use)
   * Traditional email/password registration
   * Note: Magic link flow auto-creates accounts, so this is secondary
   * ═══════════════════════════════════════════════════════════════════════════ */
  signUp: async (email, password, name) => {
    log.info('🔐 Signing up...', { email })
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Create member profile
        const { data: member, error: memberError } = await supabase
          .from('members')
          .insert({
            auth_id: data.user.id,
            email: data.user.email!,
            name: name || null,
          })
          .select()
          .single()

        if (memberError) throw memberError

        log.success('🔐 Signed up successfully', { email })
        set({ member, isLoading: false })
        return { success: true }
      }

      throw new Error('No user returned from sign up')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed'
      log.error('🔐 Sign up failed', error)
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  /* ═══════════════════════════════════════════════════════════════════════════
   * 🚪 SIGN OUT
   * Clear session and reset state
   * ═══════════════════════════════════════════════════════════════════════════ */
  signOut: async () => {
    log.info('🔐 Signing out...')
    set({ isLoading: true })

    try {
      await supabase.auth.signOut()
      log.success('🔐 Signed out successfully')
      set({ member: null, isLoading: false, magicLinkSent: false })
    } catch (error) {
      log.error('🔐 Sign out failed', error)
      set({ isLoading: false })
    }
  },

  /* ═══════════════════════════════════════════════════════════════════════════
   * 🧹 UTILITY ACTIONS
   * ═══════════════════════════════════════════════════════════════════════════ */
  
  /** Clear error message */
  clearError: () => set({ error: null }),
  
  /** Reset magic link sent state (for trying again or changing email) */
  resetMagicLinkSent: () => set({ magicLinkSent: false, error: null }),
}))
