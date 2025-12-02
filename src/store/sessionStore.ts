/**
 * 💬 Session Store
 *
 * Manages the current onboarding session state.
 * Handles session lifecycle (start, pause, resume, complete).
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { OnboardingSession, Business, SessionStatus } from '@/lib/types';
import {
  createBusiness,
  createSession,
  getActiveSession,
  getBusiness,
  getSession,
  updateSessionStatus,
} from '@/lib/supabase/queries';
import { log } from '@/lib/utils';

// ============================================
// 📦 Store Types
// ============================================

interface SessionState {
  // Data
  business: Business | null;
  session: OnboardingSession | null;
  currentBucket: string;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeSession: (userId: string, businessName?: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  resumeOrCreateSession: (businessId: string) => Promise<void>;
  updateBucket: (bucketId: string) => void;
  pauseSession: () => Promise<void>;
  completeSession: () => Promise<void>;
  reset: () => void;
}

// ============================================
// 🏗️ Store Implementation
// ============================================

export const useSessionStore = create<SessionState>()(
  devtools(
    (set, get) => ({
      // Initial state
      business: null,
      session: null,
      currentBucket: 'basics',
      isLoading: false,
      error: null,

      /**
       * Initialize a new session with a new business.
       * Used when starting fresh.
       */
      initializeSession: async (userId: string, businessName?: string) => {
        log.info('🚀 Initializing new session', { userId });
        set({ isLoading: true, error: null });

        try {
          // Create a new business
          const business = await createBusiness(userId, businessName);
          log.info('🏢 Business created', { businessId: business.id });

          // Create a new session for this business
          const session = await createSession(business.id);
          log.info('💬 Session created', { sessionId: session.id });

          set({
            business,
            session,
            currentBucket: 'basics',
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to initialize session';
          log.error('❌ Session initialization failed', { error });
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      /**
       * Load an existing session by ID.
       */
      loadSession: async (sessionId: string) => {
        log.info('📂 Loading session', { sessionId });
        set({ isLoading: true, error: null });

        try {
          // Fetch the session
          const session = await getSession(sessionId);
          if (!session) {
            throw new Error('Session not found');
          }

          // Fetch the business
          const business = await getBusiness(session.business_id);
          if (!business) {
            throw new Error('Business not found');
          }

          set({
            session,
            business,
            currentBucket: session.current_focus_bucket || 'basics',
            isLoading: false,
          });

          log.info('✅ Session loaded', {
            sessionId: session.id,
            status: session.status,
            bucket: session.current_focus_bucket,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load session';
          log.error('❌ Session load failed', { error });
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      /**
       * Resume an existing session or create a new one for a business.
       */
      resumeOrCreateSession: async (businessId: string) => {
        log.info('🔄 Resuming or creating session', { businessId });
        set({ isLoading: true, error: null });

        try {
          // Fetch the business
          const business = await getBusiness(businessId);
          if (!business) {
            throw new Error('Business not found');
          }

          // Try to find an active session
          let session = await getActiveSession(businessId);

          if (session) {
            log.info('♻️ Resuming existing session', { sessionId: session.id });
          } else {
            // Create a new session
            session = await createSession(businessId);
            log.info('✨ Created new session', { sessionId: session.id });
          }

          set({
            session,
            business,
            currentBucket: session.current_focus_bucket || 'basics',
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load session';
          log.error('❌ Session resume failed', { error });
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      /**
       * Update the current focus bucket.
       */
      updateBucket: (bucketId: string) => {
        const { session } = get();
        log.info('📦 Bucket updated', { from: get().currentBucket, to: bucketId });
        set({ currentBucket: bucketId });

        // Also update the session in the database (fire and forget)
        if (session) {
          updateSessionStatus(session.id, session.status, {
            current_focus_bucket: bucketId,
          }).catch((error) => {
            log.warn('Failed to save bucket update', { error });
          });
        }
      },

      /**
       * Pause the current session.
       */
      pauseSession: async () => {
        const { session } = get();
        if (!session) {
          log.warn('No session to pause');
          return;
        }

        log.info('⏸️ Pausing session', { sessionId: session.id });

        try {
          await updateSessionStatus(session.id, 'paused');
          set({
            session: { ...session, status: 'paused' },
          });
        } catch (error) {
          log.error('❌ Failed to pause session', { error });
          throw error;
        }
      },

      /**
       * Mark the session as complete.
       */
      completeSession: async () => {
        const { session } = get();
        if (!session) {
          log.warn('No session to complete');
          return;
        }

        log.info('✅ Completing session', { sessionId: session.id });

        try {
          await updateSessionStatus(session.id, 'completed', {
            completed_at: new Date().toISOString(),
          });
          set({
            session: { ...session, status: 'completed' },
          });
        } catch (error) {
          log.error('❌ Failed to complete session', { error });
          throw error;
        }
      },

      /**
       * Reset the store to initial state.
       */
      reset: () => {
        log.info('🔄 Resetting session store');
        set({
          business: null,
          session: null,
          currentBucket: 'basics',
          isLoading: false,
          error: null,
        });
      },
    }),
    { name: 'session-store' }
  )
);

// ============================================
// 🎣 Selector Hooks
// ============================================

/** Get just the session ID */
export const useSessionId = () => useSessionStore((s) => s.session?.id);

/** Get just the business ID */
export const useBusinessId = () => useSessionStore((s) => s.business?.id);

/** Get the business name */
export const useBusinessName = () =>
  useSessionStore((s) => s.business?.name || 'Your Business');

/** Check if session is active */
export const useIsSessionActive = () =>
  useSessionStore((s) => s.session?.status === 'active');
