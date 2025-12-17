/**
 * 🏷️ CHIP COMPONENT
 * =================
 * Selectable tag/chip for word banks and multi-select.
 *
 * Usage:
 *   <Chip selected onClick={() => toggle()}>Innovation</Chip>
 *   <Chip variant="outline">Tag</Chip>
 */

'use client'

import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export interface ChipProps extends React.HTMLAttributes<HTMLButtonElement> {
  /** Whether the chip is selected */
  selected?: boolean
  /** Visual variant */
  variant?: 'default' | 'outline'
  /** Size */
  size?: 'sm' | 'md'
  /** Show remove button */
  removable?: boolean
  /** Callback when remove is clicked */
  onRemove?: () => void
  /** Disabled state */
  disabled?: boolean
}

export function Chip({
  className,
  selected = false,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  disabled = false,
  children,
  ...props
}: ChipProps) {
  // Base styles
  const baseStyles = `
    inline-flex items-center gap-1.5
    rounded-full font-medium
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
  `

  // Size styles
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-sm',
  }

  // Variant + selected styles
  const stateStyles = {
    default: {
      unselected: `
        bg-gray-100 text-gray-700
        hover:bg-gray-200
        active:bg-gray-300
      `,
      selected: `
        bg-primary-500 text-white
        hover:bg-primary-600
        active:bg-primary-700
      `,
    },
    outline: {
      unselected: `
        border-2 border-gray-300 text-gray-700 bg-transparent
        hover:border-gray-400 hover:bg-gray-50
        active:bg-gray-100
      `,
      selected: `
        border-2 border-primary-500 text-primary-700 bg-primary-50
        hover:bg-primary-100
        active:bg-primary-200
      `,
    },
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove?.()
  }

  return (
    <button
      type="button"
      className={cn(
        baseStyles,
        sizeStyles[size],
        stateStyles[variant][selected ? 'selected' : 'unselected'],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
      {removable && selected && (
        <X
          className="h-3.5 w-3.5 hover:opacity-70"
          onClick={handleRemove}
          aria-label="Remove"
        />
      )}
    </button>
  )
}

/**
 * 🏷️ Chip Group
 * Container for multiple chips with consistent spacing
 */
export function ChipGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)} {...props}>
      {children}
    </div>
  )
}
