/**
 * 📝 INPUT COMPONENT
 * ==================
 * Text input with label, error states, and helper text.
 *
 * Usage:
 *   <Input label="Email" type="email" placeholder="you@example.com" />
 *   <Input label="Password" error="Password is required" />
 */

'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text above the input */
  label?: string
  /** Error message (shows error state when present) */
  error?: string
  /** Helper text below the input */
  helperText?: string
  /** Left icon */
  leftIcon?: React.ReactNode
  /** Right icon */
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    // Generate ID if not provided
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              // Base styles
              'w-full rounded-lg border bg-white px-4 py-2.5',
              'text-gray-900 placeholder-gray-400',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              // Default state
              'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20',
              // Error state
              error && 'border-error focus:border-error focus:ring-error/20',
              // With icons
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              // Disabled
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

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

Input.displayName = 'Input'

export { Input }
