/**
 * 📍 STEP INDICATOR
 * =================
 * Visual progress indicator for the onboarding flow.
 * Shows dots/steps with completion states.
 *
 * Desktop: Shows all steps as connected dots
 * Mobile: Shows "Step X of Y" text
 */

'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StepConfig, OnboardStep } from '@/lib/config/onboarding'

// ============================================
// 📋 TYPES
// ============================================

export interface StepIndicatorProps {
  /** All steps in the flow */
  steps: StepConfig[]
  /** Current active step */
  currentStep: OnboardStep
  /** Project ID for navigation links */
  projectId: string
  /** Whether steps are clickable */
  interactive?: boolean
}

// ============================================
// 🎨 COMPONENT
// ============================================

export function StepIndicator({
  steps,
  currentStep,
  projectId,
  interactive = true,
}: StepIndicatorProps) {
  // Find current step index
  const currentIndex = steps.findIndex(s => s.id === currentStep)

  return (
    <>
      {/* Desktop: Full step indicator */}
      <nav className="hidden sm:flex items-center gap-1" aria-label="Progress">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isFuture = index > currentIndex

          // Determine if step should be clickable
          // Only allow clicking on completed steps or current step
          const isClickable = interactive && (isCompleted || isCurrent)

          const StepContent = (
            <>
              {/* Step Circle */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                  // Completed
                  isCompleted && 'bg-primary-500 text-white',
                  // Current
                  isCurrent && 'bg-primary-500 text-white ring-4 ring-primary-100 scale-110',
                  // Future
                  isFuture && 'bg-gray-200 text-gray-400'
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Connector Line (except for last step) */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-6 h-0.5 transition-colors duration-300',
                    index < currentIndex ? 'bg-primary-500' : 'bg-gray-200'
                  )}
                />
              )}
            </>
          )

          if (isClickable && isCompleted) {
            return (
              <Link
                key={step.id}
                href={`/onboard/${projectId}/${step.path}`}
                className="flex items-center hover:opacity-80 transition-opacity"
                title={step.label}
              >
                {StepContent}
              </Link>
            )
          }

          return (
            <div
              key={step.id}
              className="flex items-center"
              title={step.label}
            >
              {StepContent}
            </div>
          )
        })}
      </nav>

      {/* Mobile: Simplified indicator */}
      <div className="sm:hidden flex items-center gap-2 text-sm">
        <span className="font-medium text-primary-600">
          {steps.find(s => s.id === currentStep)?.emoji}
        </span>
        <span className="text-gray-600">
          Step {currentIndex + 1} of {steps.length}
        </span>
        <span className="text-gray-400">•</span>
        <span className="text-gray-900 font-medium">
          {steps.find(s => s.id === currentStep)?.shortLabel}
        </span>
      </div>
    </>
  )
}

// ============================================
// 📊 MINI PROGRESS BAR VARIANT
// ============================================

/**
 * A simpler progress bar variant for tight spaces
 */
export function StepProgressBar({
  steps,
  currentStep,
}: {
  steps: StepConfig[]
  currentStep: OnboardStep
}) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)
  const progress = ((currentIndex + 1) / steps.length) * 100

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Label */}
      <div className="mt-1 text-xs text-gray-500 text-center">
        {currentIndex + 1} of {steps.length} completed
      </div>
    </div>
  )
}
