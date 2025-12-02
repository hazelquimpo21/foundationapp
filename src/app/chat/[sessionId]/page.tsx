/**
 * 💬 Chat Page
 *
 * Main conversation interface for brand onboarding.
 * Two-column layout with chat and progress panel.
 * 
 * ARCHITECTURE NOTES:
 * - Session and foundation data are loaded on mount
 * - Welcome message is added once per session (guarded by ref to prevent duplicates)
 * - Messages are managed by chatStore, not local state
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatContainer } from '@/components/chat';
import { ProgressPanel } from '@/components/progress';
import { useSessionStore, useChatStore, useFoundationStore, useMessagesLoaded } from '@/store';
import { cn, log } from '@/lib/utils';
import { ArrowLeft, Menu, X, Loader2 } from 'lucide-react';

// ============================================
// 🎯 Constants
// ============================================

/**
 * Initial welcome message shown when starting a new conversation.
 * This is added to the chatStore so it persists in message history.
 */
const WELCOME_MESSAGE = `Let's build your brand foundation together! 🎯

By the end of our conversation, you'll have clarity on who you are, who you serve, and how to talk about it.

First—what's your business called, and what does it do? Don't worry about being polished. Just tell me like you'd tell a friend.`;

// ============================================
// 🎨 Page Component
// ============================================

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  // Ref to prevent duplicate welcome message (React StrictMode protection)
  const welcomeAddedRef = useRef(false);

  // Store state
  const loadSession = useSessionStore((s) => s.loadSession);
  const session = useSessionStore((s) => s.session);
  const business = useSessionStore((s) => s.business);
  const currentBucket = useSessionStore((s) => s.currentBucket);
  const updateBucket = useSessionStore((s) => s.updateBucket);
  const isLoading = useSessionStore((s) => s.isLoading);
  const sessionError = useSessionStore((s) => s.error);

  const loadFoundation = useFoundationStore((s) => s.loadFoundation);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);
  const messages = useChatStore((s) => s.messages);
  const resetChat = useChatStore((s) => s.reset);
  
  // Track if DB messages have been loaded (prevents welcome from being overwritten)
  const messagesLoaded = useMessagesLoaded();

  // UI state
  const [showProgress, setShowProgress] = useState(false);

  // ============================================
  // 🔄 Reset stores when sessionId changes
  // This ensures clean state when navigating between sessions
  // ============================================
  useEffect(() => {
    log.info('🔄 Session ID changed, resetting state', { sessionId });
    
    // Reset the welcome message guard for the new session
    welcomeAddedRef.current = false;
    
    // Reset chat store to clear old messages and reset messagesLoaded flag
    resetChat();
  }, [sessionId, resetChat]);

  // ============================================
  // 📂 Load session on mount
  // ============================================
  useEffect(() => {
    const initialize = async () => {
      log.info('📂 Initializing chat page', { sessionId });

      try {
        await loadSession(sessionId);
        log.info('✅ Chat page initialized', { sessionId });
      } catch (err) {
        log.error('❌ Failed to load session', { sessionId, error: err });
      }
    };

    initialize();
  }, [sessionId, loadSession]);

  // ============================================
  // 📚 Load foundation once we have business ID
  // ============================================
  useEffect(() => {
    if (business?.id) {
      log.info('📚 Loading foundation for business', { businessId: business.id });
      loadFoundation(business.id);
    }
  }, [business?.id, loadFoundation]);

  // ============================================
  // 👋 Add welcome message (once per session)
  // 
  // IMPORTANT: Only adds welcome AFTER messagesLoaded is true!
  // This prevents the welcome from being overwritten by loadMessages.
  // 
  // Guards against duplicate messages from:
  // - React StrictMode (dev only, runs effects twice)
  // - Component re-renders
  // - Fast Refresh during development
  // - Race conditions with loadMessages
  // ============================================
  useEffect(() => {
    // Guard: Only proceed if:
    // 1. Session is loaded
    // 2. Messages have been loaded from DB (prevents overwrite)
    // 3. No messages exist in the database
    // 4. We haven't already added the welcome message
    const shouldAddWelcome = 
      session && 
      messagesLoaded &&
      messages.length === 0 && 
      !welcomeAddedRef.current;

    if (!shouldAddWelcome) {
      log.debug('👋 Welcome message conditions not met', { 
        hasSession: !!session, 
        messagesLoaded, 
        messageCount: messages.length, 
        welcomeAdded: welcomeAddedRef.current 
      });
      return;
    }

    // Mark as added IMMEDIATELY to prevent race conditions
    welcomeAddedRef.current = true;
    
    log.info('👋 Adding welcome message', { sessionId: session.id });

    // Add immediately - no delay needed since we're waiting for messagesLoaded
    addAssistantMessage(WELCOME_MESSAGE);
    log.info('✅ Welcome message added', { sessionId: session.id });
  }, [session, messagesLoaded, messages.length, addAssistantMessage]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your session...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">😕</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Session not found
          </h1>
          <p className="text-gray-600 mb-6">
            This session may have expired or doesn't exist.
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-4">
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Business name */}
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-800 truncate">
            {business?.name || 'Your Business'}
          </h1>
          <p className="text-xs text-gray-500">Building your foundation</p>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setShowProgress(!showProgress)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {showProgress ? (
            <X className="w-5 h-5 text-gray-600" />
          ) : (
            <Menu className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatContainer sessionId={sessionId} className="flex-1" />
        </div>

        {/* Progress panel - Desktop */}
        <aside className="hidden lg:block w-80 flex-shrink-0 border-l border-gray-100 bg-gray-50 p-4 overflow-y-auto">
          <ProgressPanel
            currentBucket={currentBucket}
            onBucketClick={updateBucket}
          />
        </aside>

        {/* Progress panel - Mobile overlay */}
        {showProgress && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowProgress(false)}>
            <aside
              className="absolute right-0 top-0 bottom-0 w-80 bg-gray-50 p-4 overflow-y-auto animate-in"
              onClick={(e) => e.stopPropagation()}
            >
              <ProgressPanel
                currentBucket={currentBucket}
                onBucketClick={(bucket) => {
                  updateBucket(bucket);
                  setShowProgress(false);
                }}
              />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
