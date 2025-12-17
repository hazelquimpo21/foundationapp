/**
 * 💬 CHAT STORE
 * =============
 * Manages chat/conversation state with Zustand.
 *
 * Usage:
 *   const { messages, sendMessage, isTyping } = useChatStore()
 */

import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { log } from '@/lib/utils/logger'
import { generateId } from '@/lib/utils/helpers'
import type {
  ConversationMessage,
  OnboardingSession,
  MessageType,
} from '@/lib/types'

interface ChatState {
  // State
  session: OnboardingSession | null
  messages: ConversationMessage[]
  isLoading: boolean
  isTyping: boolean
  error: string | null

  // Actions
  loadSession: (projectId: string) => Promise<void>
  createSession: (projectId: string) => Promise<OnboardingSession | null>
  sendMessage: (
    content: string,
    messageType?: MessageType,
    metadata?: Record<string, unknown>
  ) => Promise<ConversationMessage | null>
  addAssistantMessage: (
    content: string,
    messageType?: MessageType,
    metadata?: Record<string, unknown>
  ) => void
  setTyping: (isTyping: boolean) => void
  clearMessages: () => void
  clearError: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  session: null,
  messages: [],
  isLoading: false,
  isTyping: false,
  error: null,

  /**
   * 📥 Load or create session for a project
   */
  loadSession: async (projectId) => {
    log.info('💬 Loading session...', { projectId })
    set({ isLoading: true, error: null })

    try {
      // Try to find existing active session
      const { data: existingSession } = await supabase
        .from('onboarding_sessions')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (existingSession) {
        // Load messages for this session
        const { data: messages, error: messagesError } = await supabase
          .from('conversation_messages')
          .select('*')
          .eq('session_id', existingSession.id)
          .order('created_at', { ascending: true })

        if (messagesError) throw messagesError

        log.success('💬 Session loaded', { messageCount: messages.length })
        set({
          session: existingSession,
          messages: messages || [],
          isLoading: false,
        })
      } else {
        // Create new session
        const newSession = await get().createSession(projectId)
        if (newSession) {
          set({ isLoading: false })
        }
      }
    } catch (error) {
      // If no session found, create one
      if ((error as { code?: string })?.code === 'PGRST116') {
        const newSession = await get().createSession(projectId)
        if (newSession) {
          set({ isLoading: false })
          return
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to load session'
      log.error('💬 Failed to load session', error)
      set({ isLoading: false, error: message })
    }
  },

  /**
   * ➕ Create a new session
   */
  createSession: async (projectId) => {
    log.info('💬 Creating session...', { projectId })

    try {
      const { data: session, error } = await supabase
        .from('onboarding_sessions')
        .insert({
          project_id: projectId,
          status: 'active',
          current_bucket: 'core_idea',
        })
        .select()
        .single()

      if (error) throw error

      log.success('💬 Session created', { sessionId: session.id })

      // Add welcome message
      const welcomeMessage: ConversationMessage = {
        id: generateId(),
        session_id: session.id,
        role: 'assistant',
        content: "Hey! 👋 I'm here to help you shape your business idea. Let's start with the basics - what's the name of your idea or project?",
        message_type: 'text',
        metadata: {},
        related_fields: ['idea_name'],
        created_at: new Date().toISOString(),
      }

      // Save welcome message
      await supabase.from('conversation_messages').insert({
        session_id: session.id,
        role: welcomeMessage.role,
        content: welcomeMessage.content,
        message_type: welcomeMessage.message_type,
        metadata: welcomeMessage.metadata,
        related_fields: welcomeMessage.related_fields,
      })

      set({ session, messages: [welcomeMessage] })
      return session
    } catch (error) {
      log.error('💬 Failed to create session', error)
      return null
    }
  },

  /**
   * 📤 Send a user message
   */
  sendMessage: async (content, messageType = 'text', metadata = {}) => {
    const { session } = get()
    if (!session) {
      log.warn('💬 No active session')
      return null
    }

    log.debug('💬 Sending message', { content: content.slice(0, 50) })

    // Create optimistic message
    const userMessage: ConversationMessage = {
      id: generateId(),
      session_id: session.id,
      role: 'user',
      content,
      message_type: messageType,
      metadata,
      related_fields: null,
      created_at: new Date().toISOString(),
    }

    // Add to local state immediately
    set((state) => ({
      messages: [...state.messages, userMessage],
    }))

    try {
      // Save to database
      const { data, error } = await supabase
        .from('conversation_messages')
        .insert({
          session_id: session.id,
          role: 'user',
          content,
          message_type: messageType,
          metadata,
        })
        .select()
        .single()

      if (error) throw error

      // Update with real ID
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === userMessage.id ? { ...m, id: data.id } : m
        ),
      }))

      return data
    } catch (error) {
      log.error('💬 Failed to send message', error)
      // Remove optimistic message on failure
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== userMessage.id),
        error: 'Failed to send message',
      }))
      return null
    }
  },

  /**
   * 🤖 Add assistant message (called after API response)
   */
  addAssistantMessage: (content, messageType = 'text', metadata = {}) => {
    const { session } = get()
    if (!session) return

    const assistantMessage: ConversationMessage = {
      id: generateId(),
      session_id: session.id,
      role: 'assistant',
      content,
      message_type: messageType,
      metadata,
      related_fields: null,
      created_at: new Date().toISOString(),
    }

    set((state) => ({
      messages: [...state.messages, assistantMessage],
      isTyping: false,
    }))

    // Save to database (fire and forget)
    supabase.from('conversation_messages').insert({
      session_id: session.id,
      role: 'assistant',
      content,
      message_type: messageType,
      metadata,
    }).then(({ error }) => {
      if (error) log.error('💬 Failed to save assistant message', error)
    })
  },

  /**
   * ⏳ Set typing indicator
   */
  setTyping: (isTyping) => set({ isTyping }),

  /**
   * 🧹 Clear messages
   */
  clearMessages: () => set({ session: null, messages: [] }),

  /**
   * 🧹 Clear error
   */
  clearError: () => set({ error: null }),
}))
