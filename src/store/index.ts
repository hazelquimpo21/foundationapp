/**
 * 📦 Store Exports
 *
 * Central export for all Zustand stores.
 * Import stores from here for cleaner imports.
 *
 * @example
 * import { useSessionStore, useChatStore, useFoundationStore } from '@/store';
 */

// Session management
export {
  useSessionStore,
  useSessionId,
  useBusinessId,
  useBusinessName,
  useIsSessionActive,
} from './sessionStore';

// Chat/conversation
export {
  useChatStore,
  useLatestMessage,
  useMessageCount,
  useHasInteraction,
  useIsWaiting,
} from './chatStore';

// Foundation data
export {
  useFoundationStore,
  useFieldValue,
  useFieldConfidence,
  useBucketProgress,
  useOverallProgress,
  useIsFoundationReady,
  usePendingInferenceCount,
} from './foundationStore';
