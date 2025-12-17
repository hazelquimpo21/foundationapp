/**
 * 🎯 ONBOARD LAYOUT
 * =================
 * Wrapper component for all onboarding pages.
 * Provides consistent header, step indicator, and navigation.
 *
 * Usage:
 *   <OnboardLayout projectId={id} currentStep="setup" title="The Basics">
 *     <YourPageContent />
 *   </OnboardLayout>
 */

'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Rocket, X, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StepIndicator } from './StepIndicator'
import {
  type OnboardStep,
  getNextStep,
  getPreviousStep,
  ONBOARD_STEPS,
} from '@/lib/config/onboarding'
import { log } from '@/lib/utils/logger'

// ============================================
// 📋 TYPES
// ============================================

export interface OnboardLayoutProps {
  /** Current project ID */
  projectId: string
  /** Current step in the flow */
  currentStep: OnboardStep
  /** Page title */
  title: string
  /** Page subtitle/description */
  subtitle?: string
  /** Child content */
  children: React.ReactNode
  /** Hide the back button */
  hideBack?: boolean
  /** Hide the continue button */
  hideContinue?: boolean
  /** Custom continue button text */
  continueText?: string
  /** Continue button loading state */
  isContinueLoading?: boolean
  /** Continue button disabled state */
  isContinueDisabled?: boolean
  /** Handler for continue click (if not provided, navigates to next step) */
  onContinue?: () => void | Promise<void>
  /** Handler for back click (if not provided, navigates to previous step) */
  onBack?: () => void
  /** Custom skip button (for optional steps) */
  showSkip?: boolean
  /** Skip button handler */
  onSkip?: () => void
  /** Right sidebar content (e.g., scraper status) */
  sidebar?: React.ReactNode
}

// ============================================
// 🎨 COMPONENT
// ============================================

export function OnboardLayout({
  projectId,
  currentStep,
  title,
  subtitle,
  children,
  hideBack = false,
  hideContinue = false,
  continueText = 'Continue',
  isContinueLoading = false,
  isContinueDisabled = false,
  onContinue,
  onBack,
  showSkip = false,
  onSkip,
  sidebar,
}: OnboardLayoutProps) {
  const router = useRouter()

  // Get adjacent steps for navigation
  const prevStep = getPreviousStep(currentStep)
  const nextStep = getNextStep(currentStep)

  /**
   * 🔙 Handle back navigation
   */
  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }

    if (prevStep) {
      log.info('⬅️ Navigating back', { from: currentStep, to: prevStep.id })
      router.push(`/onboard/${projectId}/${prevStep.path}`)
    } else {
      // If no previous step, go to dashboard
      log.info('⬅️ Navigating to dashboard')
      router.push('/dashboard')
    }
  }

  /**
   * ➡️ Handle continue navigation
   */
  const handleContinue = async () => {
    if (onContinue) {
      await onContinue()
      return
    }

    if (nextStep) {
      log.info('➡️ Navigating forward', { from: currentStep, to: nextStep.id })
      router.push(`/onboard/${projectId}/${nextStep.path}`)
    }
  }

  /**
   * ⏭️ Handle skip (for optional steps)
   */
  const handleSkip = () => {
    if (onSkip) {
      onSkip()
      return
    }

    if (nextStep) {
      log.info('⏭️ Skipping step', { step: currentStep })
      router.push(`/onboard/${projectId}/${nextStep.path}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Rocket className="w-6 h-6 text-primary-500" />
              <span className="font-bold text-gray-900 hidden sm:inline">
                Foundation Studio
              </span>
            </Link>

            {/* Step Indicator (centered) */}
            <div className="flex-1 flex justify-center px-4">
              <StepIndicator
                steps={ONBOARD_STEPS}
                currentStep={currentStep}
                projectId={projectId}
              />
            </div>

            {/* Exit Button */}
            <Link
              href="/dashboard"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              title="Exit to dashboard"
            >
              <X className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className={`flex gap-8 ${sidebar ? 'lg:flex-row flex-col' : ''}`}>
          {/* Main Content Area */}
          <div className={`flex-1 ${sidebar ? 'lg:max-w-2xl' : 'max-w-2xl mx-auto'}`}>
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-500 text-lg">{subtitle}</p>
              )}
            </div>

            {/* Page Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              {children}
            </div>
          </div>

          {/* Optional Sidebar */}
          {sidebar && (
            <aside className="lg:w-80 flex-shrink-0">
              <div className="sticky top-24">{sidebar}</div>
            </aside>
          )}
        </div>
      </main>

      {/* ============================================ */}
      {/* FOOTER NAVIGATION */}
      {/* ============================================ */}
      <footer className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Back Button */}
            <div>
              {!hideBack && (
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
            </div>

            {/* Skip + Continue Buttons */}
            <div className="flex items-center gap-3">
              {showSkip && (
                <Button variant="ghost" onClick={handleSkip}>
                  Skip for now
                </Button>
              )}

              {!hideContinue && (
                <Button
                  onClick={handleContinue}
                  disabled={isContinueDisabled}
                  loading={isContinueLoading}
                >
                  {continueText}
                  {!isContinueLoading && <ArrowRight className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
