/**
 * 📝 TEXTAREA COMPONENT
 * =====================
 * Multi-line text input with auto-resize option.
 *
 * Usage:
 *   <Textarea label="Description" placeholder="Tell us more..." />
 *   <Textarea autoResize maxRows={5} />
 */

'use client'

import { forwardRef, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text above the textarea */
  label?: string
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Auto-resize based on content */
  autoResize?: boolean
  /** Minimum rows */
  minRows?: number
  /** Maximum rows */
  maxRows?: number
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`
    const internalRef = useRef<HTMLTextAreaElement>(null)
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef

    // Auto-resize logic
    const handleResize = () => {
      const textarea = textareaRef.current
      if (!textarea || !autoResize) return

      // Reset height to calculate scrollHeight
      textarea.style.height = 'auto'

      // Calculate line height
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24
      const minHeight = lineHeight * minRows
      const maxHeight = lineHeight * maxRows

      // Set new height within bounds
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`
    }

    useEffect(() => {
      handleResize()
    }, [props.value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      handleResize()
      onChange?.(e)
    }

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id={textareaId}
          rows={autoResize ? minRows : undefined}
          onChange={handleChange}
          className={cn(
            // Base styles
            'w-full rounded-lg border bg-white px-4 py-3',
            'text-gray-900 placeholder-gray-400',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'resize-none',
            // Default state
            'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20',
            // Error state
            error && 'border-error focus:border-error focus:ring-error/20',
            // Disabled
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />

        {/* Helper text or error */}
        {(error || helperText) && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-error' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
