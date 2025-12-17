/**
 * 🔐 AUTH STORE
 * =============
 * Manages authentication state with Zustand.
 *
 * Usage:
 *   const { member, signIn, signOut } = useAuthStore()
 */

import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { log } from '@/lib/utils/logger'
import type { Member } from '@/lib/types'

interface AuthState {
  // State
  member: Member | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null

  // Actions
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  member: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  /**
   * 🚀 Initialize auth state
   * Called on app mount to check existing session
   */
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

  /**
   * 📧 Sign in with email/password
   */
  signIn: async (email, password) => {
    log.info('🔐 Signing in...', { email })
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

  /**
   * 📝 Sign up with email/password
   */
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

  /**
   * 🚪 Sign out
   */
  signOut: async () => {
    log.info('🔐 Signing out...')
    set({ isLoading: true })

    try {
      await supabase.auth.signOut()
      log.success('🔐 Signed out')
      set({ member: null, isLoading: false })
    } catch (error) {
      log.error('🔐 Sign out failed', error)
      set({ isLoading: false })
    }
  },

  /**
   * 🧹 Clear error message
   */
  clearError: () => set({ error: null }),
}))
