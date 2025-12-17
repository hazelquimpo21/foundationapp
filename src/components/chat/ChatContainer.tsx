/**
 * 💬 CHAT CONTAINER COMPONENT
 * ===========================
 * Main chat interface with message list and input.
 * Handles auto-scroll and message rendering.
 *
 * Usage:
 *   <ChatContainer
 *     messages={messages}
 *     onSend={handleSend}
 *     loading={isLoading}
 *   />
 */

'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { MessageBubble, TypingIndicator } from './MessageBubble'
import { ChatInput } from './ChatInput'
import type { ConversationMessage } from '@/lib/types'

export interface ChatContainerProps {
  /** Array of messages to display */
  messages: ConversationMessage[]
  /** Callback when user sends a message */
  onSend: (message: string) => void
  /** Show typing indicator */
  isTyping?: boolean
  /** Disable input */
  disabled?: boolean
  /** Show loading state on input */
  loading?: boolean
  /** Input placeholder */
  placeholder?: string
  /** Additional class names */
  className?: string
  /** Header content */
  header?: React.ReactNode
  /** Content to show when no messages */
  emptyState?: React.ReactNode
  /** Footer content (above input) */
  footer?: React.ReactNode
}

export function ChatContainer({
  messages,
  onSend,
  isTyping = false,
  disabled = false,
  loading = false,
  placeholder = 'Type your message...',
  className,
  header,
  emptyState,
  footer,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Check if user has scrolled up (to prevent auto-scroll interruption)
  const isNearBottom = () => {
    if (!containerRef.current) return true
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    return scrollHeight - scrollTop - clientHeight < 100
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      {header && (
        <div className="flex-shrink-0 border-b border-gray-200 p-4">
          {header}
        </div>
      )}

      {/* Messages area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && emptyState ? (
          emptyState
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.created_at}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer (optional - for interactive elements) */}
      {footer && (
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          {footer}
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-gray-50">
        <ChatInput
          onSend={onSend}
          disabled={disabled}
          loading={loading}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

/**
 * 🎉 Welcome Message Component
 * Default empty state for chat
 */
export function WelcomeMessage({
  title = "Let's get started!",
  description = "Tell me about your business idea and I'll help you shape it.",
  suggestions,
  onSuggestionClick,
}: {
  title?: string
  description?: string
  suggestions?: string[]
  onSuggestionClick?: (suggestion: string) => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      {/* Icon */}
      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">🚀</span>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>

      {/* Description */}
      <p className="text-gray-500 mb-6 max-w-md">{description}</p>

      {/* Suggestion chips */}
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 max-w-lg">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick?.(suggestion)}
              className={cn(
                'px-4 py-2 rounded-full text-sm',
                'bg-white border border-gray-300 text-gray-700',
                'hover:border-primary-500 hover:text-primary-700',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
