/**
 * 🔘 BUTTON COMPONENT
 * ===================
 * Reusable button with multiple variants and states.
 *
 * Usage:
 *   <Button variant="primary" onClick={handleClick}>Save</Button>
 *   <Button variant="outline" size="sm" loading>Saving...</Button>
 */

'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg'
  /** Show loading spinner */
  loading?: boolean
  /** Full width button */
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `

    // Variant styles
    const variantStyles = {
      primary: `
        bg-primary-500 text-white
        hover:bg-primary-600
        focus:ring-primary-500
        active:bg-primary-700
      `,
      secondary: `
        bg-gray-100 text-gray-900
        hover:bg-gray-200
        focus:ring-gray-500
        active:bg-gray-300
      `,
      outline: `
        border-2 border-gray-300 text-gray-700 bg-transparent
        hover:bg-gray-50 hover:border-gray-400
        focus:ring-gray-500
        active:bg-gray-100
      `,
      ghost: `
        text-gray-700 bg-transparent
        hover:bg-gray-100
        focus:ring-gray-500
        active:bg-gray-200
      `,
      danger: `
        bg-error text-white
        hover:bg-red-600
        focus:ring-red-500
        active:bg-red-700
      `,
    }

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
