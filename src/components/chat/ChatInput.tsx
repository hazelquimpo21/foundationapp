/**
 * 📝 Chat Input Component
 *
 * Text input for sending messages in the chat.
 * Handles enter key submission and loading states.
 */

'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// 📦 Props
// ============================================

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

// ============================================
// 🎨 Component
// ============================================

export function ChatInput({
  onSend,
  isLoading = false,
  placeholder = 'Type your message...',
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [message]);

  // Focus input on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  /**
   * Handle form submission.
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  /**
   * Handle keyboard shortcuts.
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isDisabled = isLoading || disabled || !message.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 p-4 bg-white border-t border-gray-100"
    >
      {/* Text Input */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || disabled}
          rows={1}
          className={cn(
            'w-full resize-none rounded-xl border border-gray-200',
            'px-4 py-3 pr-12',
            'text-sm text-gray-800 placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:bg-gray-50 disabled:cursor-not-allowed',
            'transition-all duration-200'
          )}
          style={{ maxHeight: '150px' }}
        />

        {/* Character hint */}
        <span className="absolute right-3 bottom-3 text-xs text-gray-400">
          ⏎ to send
        </span>
      </div>

      {/* Send Button */}
      <button
        type="submit"
        disabled={isDisabled}
        className={cn(
          'flex-shrink-0 w-11 h-11 rounded-xl',
          'flex items-center justify-center',
          'transition-all duration-200',
          isDisabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </form>
  );
}
