/**
 * ⌨️ CHAT INPUT COMPONENT
 * =======================
 * Message input with send button and keyboard shortcuts.
 *
 * Usage:
 *   <ChatInput onSend={(msg) => handleSend(msg)} placeholder="Type here..." />
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Send, Loader2 } from 'lucide-react'

export interface ChatInputProps {
  /** Callback when message is sent */
  onSend: (message: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Disable input */
  disabled?: boolean
  /** Show loading state */
  loading?: boolean
  /** Auto-focus on mount */
  autoFocus?: boolean
  /** Additional class names */
  className?: string
  /** Maximum character length */
  maxLength?: number
}

export function ChatInput({
  onSend,
  placeholder = 'Type your message...',
  disabled = false,
  loading = false,
  autoFocus = true,
  className,
  maxLength = 2000,
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const maxHeight = 150 // Max height in pixels
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)
    textarea.style.height = `${newHeight}px`
  }, [message])

  const handleSend = () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || disabled || loading) return

    onSend(trimmedMessage)
    setMessage('')

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isDisabled = disabled || loading
  const canSend = message.trim().length > 0 && !isDisabled

  return (
    <div className={cn('relative', className)}>
      {/* Input container */}
      <div
        className={cn(
          'flex items-end gap-2 p-3 rounded-2xl border-2',
          'bg-white transition-all duration-200',
          isDisabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10'
        )}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          maxLength={maxLength}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent',
            'text-gray-900 placeholder-gray-400',
            'focus:outline-none',
            'disabled:text-gray-500 disabled:cursor-not-allowed',
            'text-[15px] leading-relaxed',
            'max-h-[150px] overflow-y-auto'
          )}
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'flex-shrink-0 p-2 rounded-xl',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            canSend
              ? 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
          aria-label="Send message"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Character count (shown when approaching limit) */}
      {message.length > maxLength * 0.8 && (
        <p
          className={cn(
            'absolute -bottom-5 right-0 text-xs',
            message.length >= maxLength ? 'text-error' : 'text-gray-400'
          )}
        >
          {message.length}/{maxLength}
        </p>
      )}

      {/* Keyboard hint */}
      <p className="text-xs text-gray-400 mt-2 text-center">
        Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Enter</kbd> to send,{' '}
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  )
}
