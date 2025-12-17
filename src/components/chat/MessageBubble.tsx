/**
 * 💬 MESSAGE BUBBLE COMPONENT
 * ===========================
 * Individual chat message with role-based styling.
 *
 * Usage:
 *   <MessageBubble role="user" content="Hello!" />
 *   <MessageBubble role="assistant" content="Hi there!" timestamp={new Date()} />
 */

'use client'

import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils/helpers'
import { Bot, User } from 'lucide-react'
import type { MessageRole } from '@/lib/types'

export interface MessageBubbleProps {
  /** Who sent the message */
  role: MessageRole
  /** Message content */
  content: string
  /** When the message was sent */
  timestamp?: Date | string
  /** Is this message still being typed? */
  isTyping?: boolean
  /** Additional class names */
  className?: string
  /** Custom avatar */
  avatar?: React.ReactNode
}

export function MessageBubble({
  role,
  content,
  timestamp,
  isTyping = false,
  className,
  avatar,
}: MessageBubbleProps) {
  const isUser = role === 'user'
  const isSystem = role === 'system'

  // System messages are centered and styled differently
  if (isSystem) {
    return (
      <div className={cn('flex justify-center my-4', className)}>
        <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex gap-3 animate-fade-in',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
        )}
      >
        {avatar || (isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        ))}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'max-w-[80%] md:max-w-[70%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Bubble */}
        <div
          className={cn(
            'px-4 py-3 rounded-2xl',
            isUser
              ? 'bg-primary-500 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          )}
        >
          {isTyping ? (
            <TypingDots />
          ) : (
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
              {content}
            </p>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && !isTyping && (
          <p
            className={cn(
              'text-xs text-gray-400 mt-1',
              isUser ? 'text-right' : 'text-left'
            )}
          >
            {formatRelativeTime(timestamp)}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * ⏳ Typing dots animation
 */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  )
}

/**
 * ⏳ TYPING INDICATOR COMPONENT
 * Standalone typing indicator for showing AI is thinking
 */
export function TypingIndicator({ className }: { className?: string }) {
  return (
    <MessageBubble
      role="assistant"
      content=""
      isTyping
      className={className}
    />
  )
}
