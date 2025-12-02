/**
 * 💬 Chat Container Component
 *
 * Main chat interface that displays messages and handles input.
 * This is the primary conversation UI component.
 * 
 * NOTE: Welcome message is added via the chat page's useEffect hook,
 * not rendered here as a separate component. This ensures the welcome
 * message is part of the actual conversation history.
 */

'use client';

import { useEffect, useRef } from 'react';
import { useChatStore, useIsWaiting } from '@/store';
import { MessageBubble, TypingIndicator } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { cn, log } from '@/lib/utils';

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
    log.info('💬 ChatContainer mounted, loading messages', { sessionId });
    loadMessages(sessionId);
  }, [sessionId, loadMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /**
   * Handle sending a message from user input.
   */
  const handleSend = (content: string) => {
    log.info('📤 User sending message', { 
      sessionId, 
      contentLength: content.length 
    });
    sendMessage(sessionId, content);
  };

  return (
    <div className={cn('flex flex-col h-full bg-gray-50', className)}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Messages - welcome message comes from the store, not a separate component */}
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLatest={index === messages.length - 1}
            />
          ))}

          {/* Typing indicator - shows when AI is generating response */}
          {isTyping && <TypingIndicator />}

          {/* Scroll anchor - invisible element at bottom for auto-scroll */}
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
