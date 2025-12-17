/**
 * 🎚️ SLIDER INPUT COMPONENT
 * =========================
 * 5-point scale slider with descriptions.
 * Great for capturing nuanced preferences.
 *
 * Usage:
 *   <SliderInput
 *     config={PROBLEM_URGENCY_SLIDER}
 *     value={value}
 *     onChange={setValue}
 *     onSubmit={handleSubmit}
 *   />
 */

'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Check } from 'lucide-react'
import type { SliderConfig } from '@/lib/types'

export interface SliderInputProps {
  /** Slider configuration */
  config: SliderConfig
  /** Current value */
  value: number | null
  /** Callback when value changes */
  onChange: (value: number) => void
  /** Callback when user confirms */
  onSubmit?: (value: number) => void
  /** Disabled state */
  disabled?: boolean
  /** Additional class names */
  className?: string
}

export function SliderInput({
  config,
  value,
  onChange,
  onSubmit,
  disabled = false,
  className,
}: SliderInputProps) {
  const { min, max, leftLabel, rightLabel, descriptions } = config
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  const handleStepClick = (step: number) => {
    if (!disabled) {
      onChange(step)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{config.label}</h3>
        {config.description && (
          <p className="text-sm text-gray-500">{config.description}</p>
        )}
      </div>

      {/* Slider track */}
      <div className="pt-4">
        {/* Labels */}
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">{leftLabel}</span>
          <span className="text-sm text-gray-500">{rightLabel}</span>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Track line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full -translate-y-1/2" />

          {/* Filled portion */}
          {value !== null && (
            <div
              className="absolute top-1/2 left-0 h-1 bg-primary-500 rounded-full -translate-y-1/2 transition-all duration-200"
              style={{
                width: `${((value - min) / (max - min)) * 100}%`,
              }}
            />
          )}

          {/* Step buttons */}
          <div className="relative flex justify-between">
            {steps.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => handleStepClick(step)}
                disabled={disabled}
                className={cn(
                  'w-8 h-8 rounded-full border-2',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  value === step
                    ? 'bg-primary-500 border-primary-500 scale-125'
                    : value !== null && step < value
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-300 hover:border-primary-400',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                aria-label={`Select ${step}`}
              >
                <span className="text-xs font-medium text-white">
                  {value === step ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>

          {/* Step numbers */}
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <span
                key={step}
                className={cn(
                  'w-8 text-center text-xs',
                  value === step ? 'text-primary-600 font-medium' : 'text-gray-400'
                )}
              >
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Description for selected value */}
      {value !== null && descriptions[value] && (
        <div
          className={cn(
            'p-4 rounded-xl bg-primary-50 text-primary-800',
            'animate-fade-in'
          )}
        >
          <p className="text-sm font-medium">{descriptions[value]}</p>
        </div>
      )}

      {/* Submit button */}
      {onSubmit && (
        <Button
          onClick={() => value !== null && onSubmit(value)}
          disabled={value === null || disabled}
          fullWidth
        >
          <Check className="w-4 h-4" />
          Confirm Selection
        </Button>
      )}
    </div>
  )
}
