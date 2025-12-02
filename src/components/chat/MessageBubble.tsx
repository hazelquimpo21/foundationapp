/**
 * 💬 Message Bubble Component
 *
 * Displays a single message in the chat.
 * Handles different roles (user vs assistant) with distinct styling.
 */

'use client';

import { cn, formatRelativeTime } from '@/lib/utils';
import { ChatMessage } from '@/lib/types';
import { User, Sparkles } from 'lucide-react';

// ============================================
// 📦 Props
// ============================================

interface MessageBubbleProps {
  message: ChatMessage;
  isLatest?: boolean;
}

// ============================================
// 🎨 Component
// ============================================

export function MessageBubble({ message, isLatest = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // Don't render system messages in the UI
  if (isSystem) return null;

  return (
    <div
      className={cn(
        'flex gap-3 animate-fade-in',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-primary-100 text-primary-600'
            : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex flex-col max-w-[80%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Role Label */}
        <span className="text-xs text-gray-500 mb-1 px-1">
          {isUser ? 'You' : 'Foundation'}
        </span>

        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-sm',
            isUser
              ? 'bg-primary-600 text-white rounded-tr-md'
              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-md'
          )}
        >
          {/* Message Text */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-400 mt-1 px-1">
          {formatRelativeTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

// ============================================
// 🔄 Loading Indicator
// ============================================

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center">
        <Sparkles className="w-4 h-4" />
      </div>

      {/* Typing Dots */}
      <div className="flex flex-col items-start">
        <span className="text-xs text-gray-500 mb-1 px-1">Foundation</span>
        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
