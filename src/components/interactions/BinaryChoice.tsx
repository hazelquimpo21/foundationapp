/**
 * ⚖️ BINARY CHOICE COMPONENT
 * ==========================
 * Multiple choice selection with visual cards.
 * Perfect for categorical questions.
 *
 * Usage:
 *   <BinaryChoice
 *     config={CUSTOMER_TYPE_CHOICE}
 *     value={value}
 *     onChange={setValue}
 *     onSubmit={handleSubmit}
 *   />
 */

'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Check } from 'lucide-react'
import type { BinaryChoiceConfig } from '@/lib/types'

export interface BinaryChoiceProps {
  /** Choice configuration */
  config: BinaryChoiceConfig
  /** Current selected value */
  value: string | null
  /** Callback when value changes */
  onChange: (value: string) => void
  /** Callback when user confirms */
  onSubmit?: (value: string) => void
  /** Disabled state */
  disabled?: boolean
  /** Layout style */
  layout?: 'grid' | 'stack'
  /** Additional class names */
  className?: string
}

export function BinaryChoice({
  config,
  value,
  onChange,
  onSubmit,
  disabled = false,
  layout = 'grid',
  className,
}: BinaryChoiceProps) {
  const handleSelect = (optionValue: string) => {
    if (!disabled) {
      onChange(optionValue)
    }
  }

  // Determine grid columns based on options count
  const gridCols = config.options.length <= 2
    ? 'grid-cols-2'
    : config.options.length === 3
    ? 'grid-cols-3'
    : 'grid-cols-2 md:grid-cols-4'

  return (
    <div className={cn('space-y-4', className)}>
      {/* Question */}
      <h3 className="text-lg font-semibold text-gray-900">{config.question}</h3>

      {/* Options */}
      <div
        className={cn(
          layout === 'grid' ? `grid gap-3 ${gridCols}` : 'flex flex-col gap-3'
        )}
      >
        {config.options.map((option) => {
          const isSelected = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              disabled={disabled}
              className={cn(
                'relative p-4 rounded-xl border-2 text-left',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Emoji */}
              {option.emoji && (
                <span className="text-2xl mb-2 block">{option.emoji}</span>
              )}

              {/* Label */}
              <span
                className={cn(
                  'font-medium block',
                  isSelected ? 'text-primary-900' : 'text-gray-900'
                )}
              >
                {option.label}
              </span>

              {/* Description */}
              {option.description && (
                <span
                  className={cn(
                    'text-sm mt-1 block',
                    isSelected ? 'text-primary-700' : 'text-gray-500'
                  )}
                >
                  {option.description}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Submit button */}
      {onSubmit && (
        <Button
          onClick={() => value && onSubmit(value)}
          disabled={!value || disabled}
          fullWidth
        >
          <Check className="w-4 h-4" />
          Confirm Selection
        </Button>
      )}
    </div>
  )
}
