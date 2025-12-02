/**
 * 💬 Chat Store
 *
 * Manages chat messages and conversation state.
 * Handles sending messages and displaying responses.
 * 
 * ARCHITECTURE NOTES:
 * - Messages are loaded from the database via loadMessages()
 * - The welcome message is added by the chat page (not this store)
 * - Call reset() when switching sessions to clear old messages
 * - sendMessage() handles optimistic updates and API calls
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ChatMessage, ChatInteraction, MessageType, InteractionData } from '@/lib/types';
import { getSessionMessages, saveMessage } from '@/lib/supabase/queries';
import { log, generateId } from '@/lib/utils';

// ============================================
// 📦 Store Types
// ============================================

interface ChatState {
  // Data
  messages: ChatMessage[];
  pendingInteraction: ChatInteraction | null;

  // UI State
  isTyping: boolean;
  isSending: boolean;
  error: string | null;
  
  // Loading State - tracks if initial DB load completed
  // Used to coordinate welcome message (only add after load)
  messagesLoaded: boolean;

  // Actions
  loadMessages: (sessionId: string) => Promise<void>;
  sendMessage: (
    sessionId: string,
    content: string,
    type?: MessageType,
    interactionData?: InteractionData
  ) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  addAssistantMessage: (content: string, interaction?: ChatInteraction) => void;
  setTyping: (isTyping: boolean) => void;
  setPendingInteraction: (interaction: ChatInteraction | null) => void;
  clearInteraction: () => void;
  reset: () => void;
}

// ============================================
// 🏗️ Store Implementation
// ============================================

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      // Initial state
      messages: [],
      pendingInteraction: null,
      isTyping: false,
      isSending: false,
      error: null,
      messagesLoaded: false,

      /**
       * Load existing messages from the database.
       * 
       * IMPORTANT: This is idempotent with double-check protection:
       * 1. Check before fetch (quick rejection)
       * 2. Check after fetch (race condition protection)
       * 
       * This prevents the welcome message from being overwritten by
       * React StrictMode's double-invocation or other race conditions.
       */
      loadMessages: async (sessionId: string) => {
        // Check #1: Skip if already loaded (fast path)
        if (get().messagesLoaded) {
          log.debug('📂 Messages already loaded, skipping', { sessionId });
          return;
        }

        log.info('📂 Loading messages from database', { sessionId });

        try {
          const dbMessages = await getSessionMessages(sessionId);

          // Check #2: After fetch, verify we should still set messages
          // This handles race conditions where another load completed
          // or welcome message was added while we were fetching
          if (get().messagesLoaded) {
            log.debug('📂 Messages loaded by another call while fetching, skipping set', { sessionId });
            return;
          }

          // Convert database messages to chat messages
          const messages: ChatMessage[] = dbMessages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            type: msg.message_type,
            interaction: msg.interaction_data as ChatInteraction | undefined,
            timestamp: new Date(msg.created_at),
          }));

          // Set both messages and the loaded flag atomically
          set({ messages, messagesLoaded: true });
          log.info('✅ Messages loaded from database', { count: messages.length });
        } catch (error) {
          log.error('❌ Failed to load messages', { error });
          // Still mark as loaded so welcome can be added
          set({ error: 'Failed to load conversation history', messagesLoaded: true });
        }
      },

      /**
       * Send a user message and get a response.
       */
      sendMessage: async (
        sessionId: string,
        content: string,
        type: MessageType = 'text',
        interactionData?: InteractionData
      ) => {
        const { addMessage, setTyping, clearInteraction } = get();

        log.info('📤 Sending message', { sessionId, type, contentLength: content.length });
        set({ isSending: true, error: null });

        // Clear any pending interaction
        clearInteraction();

        // Add optimistic user message
        const userMessage: ChatMessage = {
          id: generateId(),
          role: 'user',
          content,
          type,
          timestamp: new Date(),
        };
        addMessage(userMessage);

        // Show typing indicator
        setTyping(true);

        try {
          // Save user message to database
          await saveMessage(sessionId, {
            role: 'user',
            content,
            message_type: type,
            interaction_data: interactionData || null,
            buckets_touched: [],
          });

          // Call chat API
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              message: content,
              messageType: type,
              interactionData,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to get response');
          }

          const data = await response.json();

          // Add assistant response
          const assistantMessage: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: data.message,
            type: 'text',
            interaction: data.interaction,
            timestamp: new Date(),
          };
          addMessage(assistantMessage);

          // Set any pending interaction
          if (data.interaction) {
            set({ pendingInteraction: data.interaction });
          }

          log.info('✅ Response received', {
            hasInteraction: !!data.interaction,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to send message';
          log.error('❌ Send failed', { error });
          set({ error: message });

          // Add error message to chat
          addMessage({
            id: generateId(),
            role: 'assistant',
            content: "Sorry, I had trouble processing that. Could you try again?",
            type: 'text',
            timestamp: new Date(),
          });
        } finally {
          set({ isSending: false });
          setTyping(false);
        }
      },

      /**
       * Add a message to the chat.
       */
      addMessage: (message: ChatMessage) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      /**
       * Add an assistant message (convenience method).
       */
      addAssistantMessage: (content: string, interaction?: ChatInteraction) => {
        const { addMessage } = get();
        addMessage({
          id: generateId(),
          role: 'assistant',
          content,
          type: 'text',
          interaction,
          timestamp: new Date(),
        });

        if (interaction) {
          set({ pendingInteraction: interaction });
        }
      },

      /**
       * Set typing indicator.
       */
      setTyping: (isTyping: boolean) => {
        set({ isTyping });
      },

      /**
       * Set a pending interaction.
       */
      setPendingInteraction: (interaction: ChatInteraction | null) => {
        set({ pendingInteraction: interaction });
      },

      /**
       * Clear the pending interaction.
       */
      clearInteraction: () => {
        set({ pendingInteraction: null });
      },

      /**
       * Reset the store to initial state.
       * Called when switching sessions to ensure clean slate.
       */
      reset: () => {
        log.info('🔄 Resetting chat store');
        set({
          messages: [],
          pendingInteraction: null,
          isTyping: false,
          isSending: false,
          error: null,
          messagesLoaded: false,
        });
      },
    }),
    { name: 'chat-store' }
  )
);

// ============================================
// 🎣 Selector Hooks
// ============================================

/** Get the latest message */
export const useLatestMessage = () =>
  useChatStore((s) => s.messages[s.messages.length - 1]);

/** Get message count */
export const useMessageCount = () => useChatStore((s) => s.messages.length);

/** Check if there's a pending interaction */
export const useHasInteraction = () => useChatStore((s) => !!s.pendingInteraction);

/** Check if we're waiting for a response */
export const useIsWaiting = () =>
  useChatStore((s) => s.isTyping || s.isSending);

/** Check if messages have been loaded from DB (used to gate welcome message) */
export const useMessagesLoaded = () => useChatStore((s) => s.messagesLoaded);
