/**
 * 🎚️ STYLE SLIDER COMPONENT
 * =========================
 * A 5-point slider for preference selection.
 * Shows labels at ends and a description of current value.
 */

'use client'

import { cn } from '@/lib/utils'

// ============================================
// 📋 TYPES
// ============================================

export interface StyleSliderProps {
  /** Unique ID */
  id: string
  /** Slider label */
  label: string
  /** Optional description */
  description?: string
  /** Left end label */
  leftLabel: string
  /** Right end label */
  rightLabel: string
  /** Current value (1-5) */
  value: number
  /** Change handler */
  onChange: (value: number) => void
  /** Value descriptions */
  descriptions?: Record<number, string>
}

// ============================================
// 🎨 COMPONENT
// ============================================

export function StyleSlider({
  id,
  label,
  description,
  leftLabel,
  rightLabel,
  value,
  onChange,
  descriptions,
}: StyleSliderProps) {
  const steps = [1, 2, 3, 4, 5]

  return (
    <div className="p-6 rounded-xl border border-gray-200 bg-white">
      {/* Label & Description */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">{label}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {/* Slider Track */}
      <div className="relative px-2">
        {/* Track Background */}
        <div className="absolute top-1/2 left-2 right-2 h-1.5 bg-gray-200 rounded-full -translate-y-1/2" />

        {/* Progress Track */}
        <div
          className="absolute top-1/2 left-2 h-1.5 bg-primary-500 rounded-full -translate-y-1/2 transition-all duration-200"
          style={{ width: `${((value - 1) / 4) * 100}%` }}
        />

        {/* Step Buttons */}
        <div className="relative flex justify-between">
          {steps.map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onChange(step)}
              className={cn(
                'w-6 h-6 rounded-full transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                step <= value
                  ? 'bg-primary-500 border-2 border-primary-500'
                  : 'bg-white border-2 border-gray-300',
                step === value && 'scale-125 shadow-md'
              )}
              aria-label={`Step ${step}`}
            />
          ))}
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-3 px-2">
        <span className="text-sm text-gray-500">{leftLabel}</span>
        <span className="text-sm text-gray-500">{rightLabel}</span>
      </div>

      {/* Current Value Description */}
      {descriptions && descriptions[value] && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Current: </span>
            {descriptions[value]}
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================
// 📊 COMPACT VARIANT
// ============================================

interface CompactSliderProps {
  label: string
  leftLabel: string
  rightLabel: string
  value: number
  onChange: (value: number) => void
}

export function CompactStyleSlider({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
}: CompactSliderProps) {
  const steps = [1, 2, 3, 4, 5]

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-16 text-right">{leftLabel}</span>

        <div className="flex-1 flex items-center gap-1">
          {steps.map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onChange(step)}
              className={cn(
                'flex-1 h-2 rounded-full transition-colors',
                step <= value ? 'bg-primary-500' : 'bg-gray-200'
              )}
            />
          ))}
        </div>

        <span className="text-xs text-gray-500 w-16">{rightLabel}</span>
      </div>
    </div>
  )
}
