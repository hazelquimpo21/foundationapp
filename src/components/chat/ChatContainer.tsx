/**
 * 💬 Chat Container Component
 *
 * Main chat interface that displays messages and handles input.
 * This is the primary conversation UI component.
 */

'use client';

import { useEffect, useRef } from 'react';
import { useChatStore, useIsWaiting } from '@/store';
import { MessageBubble, TypingIndicator } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { cn } from '@/lib/utils';

// ============================================
// 📦 Props
// ============================================

interface ChatContainerProps {
  sessionId: string;
  className?: string;
}

// ============================================
// 🎨 Component
// ============================================

export function ChatContainer({ sessionId, className }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Store state
  const messages = useChatStore((s) => s.messages);
  const isTyping = useChatStore((s) => s.isTyping);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const loadMessages = useChatStore((s) => s.loadMessages);
  const isWaiting = useIsWaiting();

  // Load messages on mount
  useEffect(() => {
    loadMessages(sessionId);
  }, [sessionId, loadMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /**
   * Handle sending a message.
   */
  const handleSend = (content: string) => {
    sendMessage(sessionId, content);
  };

  return (
    <div className={cn('flex flex-col h-full bg-gray-50', className)}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Welcome message if no messages */}
          {messages.length === 0 && !isTyping && (
            <WelcomeMessage />
          )}

          {/* Messages */}
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLatest={index === messages.length - 1}
            />
          ))}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0">
        <ChatInput
          onSend={handleSend}
          isLoading={isWaiting}
          placeholder="Tell me about your business..."
        />
      </div>
    </div>
  );
}

// ============================================
// 👋 Welcome Message
// ============================================

function WelcomeMessage() {
  return (
    <div className="text-center py-12 animate-fade-in">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
        <span className="text-2xl">🎯</span>
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Let's build your brand foundation
      </h2>
      <p className="text-gray-600 max-w-md mx-auto">
        I'll ask you questions about your business, and together we'll create
        clarity on who you are, who you serve, and what makes you different.
      </p>
      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-600">
        <span>💡</span>
        <span>Start by telling me about your business</span>
      </div>
    </div>
  );
}
