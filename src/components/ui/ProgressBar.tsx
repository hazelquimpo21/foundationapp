/**
 * 📊 PROGRESS BAR COMPONENT
 * =========================
 * Visual progress indicator with animation.
 *
 * Usage:
 *   <ProgressBar value={75} />
 *   <ProgressBar value={50} color="success" showLabel />
 */

'use client'

import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  /** Current progress value (0-100) */
  value: number
  /** Maximum value (default 100) */
  max?: number
  /** Color scheme */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'accent'
  /** Height size */
  size?: 'sm' | 'md' | 'lg'
  /** Show percentage label */
  showLabel?: boolean
  /** Custom label text */
  label?: string
  /** Additional class names */
  className?: string
  /** Animate the progress bar */
  animated?: boolean
}

export function ProgressBar({
  value,
  max = 100,
  color = 'primary',
  size = 'md',
  showLabel = false,
  label,
  className,
  animated = true,
}: ProgressBarProps) {
  // Calculate percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  // Size styles
  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  // Color styles
  const colorStyles = {
    primary: 'bg-primary-500',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    accent: 'bg-accent-500',
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-medium text-gray-700">
            {label || 'Progress'}
          </span>
          <span className="text-sm font-medium text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      {/* Progress bar track */}
      <div
        className={cn(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          sizeStyles[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {/* Progress bar fill */}
        <div
          className={cn(
            'h-full rounded-full',
            colorStyles[color],
            animated && 'transition-all duration-500 ease-out'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

/**
 * 📊 Circular Progress
 * For compact progress displays
 */
export function CircularProgress({
  value,
  max = 100,
  size = 48,
  strokeWidth = 4,
  color = 'primary',
  showValue = true,
  className,
}: {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: 'primary' | 'success' | 'warning' | 'error' | 'accent'
  showValue?: boolean
  className?: string
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  const colorStyles = {
    primary: 'text-primary-500',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    accent: 'text-accent-500',
  }

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={cn(colorStyles[color], 'transition-all duration-500 ease-out')}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Center value */}
      {showValue && (
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-700"
        >
          {Math.round(percentage)}
        </span>
      )}
    </div>
  )
}
