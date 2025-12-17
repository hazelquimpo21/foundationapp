/**
 * 🔗 ASSETS PAGE
 * ==============
 * Step 2: Optional assets collection
 * - Website URL
 * - LinkedIn profile
 * - File upload (future)
 *
 * This page is OPTIONAL - users can skip it.
 * But if they provide a website, we can scrape it for insights!
 *
 * Error Handling:
 * - Shows clear error messages to users
 * - Offers retry or skip options when save fails
 * - Uses timeout protection (won't hang forever)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OnboardLayout } from '@/components/onboard/OnboardLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useProjectStore } from '@/lib/stores/projectStore'
import { log } from '@/lib/utils/logger'
import {
  Globe,
  Linkedin,
  FileText,
  Loader2,
  Info,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react'

// ============================================
// 📋 TYPES
// ============================================

interface AssetsFormData {
  websiteUrl: string
  linkedinUrl: string
}

// ============================================
// 🌐 URL INPUT COMPONENT
// ============================================

interface UrlInputProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  icon: React.ReactNode
  hint?: string
  disabled?: boolean
}

/**
 * URL input field with icon - reusable component
 */
function UrlInput({
  label,
  placeholder,
  value,
  onChange,
  icon,
  hint,
  disabled,
}: UrlInputProps) {
  return (
    <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>

        {/* Input */}
        <div className="flex-1">
          <Input
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            helperText={hint}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================
// ⚠️ ERROR BANNER COMPONENT
// ============================================

interface ErrorBannerProps {
  message: string
  onRetry: () => void
  onSkip: () => void
  isRetrying: boolean
}

/**
 * Error banner with retry and skip options
 * Friendly messaging that doesn't scare non-technical users
 */
function ErrorBanner({ message, onRetry, onSkip, isRetrying }: ErrorBannerProps) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-red-800 mb-1">
            😅 Oops! Couldn&apos;t save
          </p>
          <p className="text-sm text-red-600 mb-3">
            {message.includes('timeout')
              ? "The connection is a bit slow. Let's try again!"
              : "Something went wrong, but don't worry - your data is safe."}
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onRetry}
              loading={isRetrying}
              disabled={isRetrying}
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </Button>

            <Button size="sm" variant="ghost" onClick={onSkip}>
              Skip for now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// 📄 MAIN PAGE COMPONENT
// ============================================

export default function AssetsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  // Store state
  const {
    project,
    loadProject,
    updateFields,
    isLoading,
    isSaving,
    saveError,
    clearSaveError,
  } = useProjectStore()

  // Local state
  const [formData, setFormData] = useState<AssetsFormData>({
    websiteUrl: '',
    linkedinUrl: '',
  })
  const [hasError, setHasError] = useState(false)

  // ============================================
  // 🔄 EFFECTS
  // ============================================

  // Load project on mount
  useEffect(() => {
    if (projectId) {
      log.info('🔗 Loading project for assets...', { projectId })
      loadProject(projectId)
    }
  }, [projectId, loadProject])

  // Pre-fill form when project loads
  useEffect(() => {
    if (project) {
      setFormData({
        websiteUrl: project.positioning || '',
        linkedinUrl: project.north_star_metric || '',
      })
    }
  }, [project])

  // Clear error when form changes
  useEffect(() => {
    if (hasError) {
      setHasError(false)
      clearSaveError()
    }
    // Only run when form data changes, not on hasError change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.websiteUrl, formData.linkedinUrl])

  // ============================================
  // 🎯 HANDLERS
  // ============================================

  /**
   * 📝 Handle field change
   */
  const handleChange = (field: keyof AssetsFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  /**
   * 💾 Save data and navigate to next step
   *
   * Uses try/catch to properly handle errors from the store.
   * On failure: shows error banner with retry/skip options
   * On success: navigates to story page
   */
  const handleContinue = useCallback(async () => {
    log.info('💾 Saving assets data...', formData)

    // Clear any previous errors
    setHasError(false)
    clearSaveError()

    try {
      // Build update object
      const updates: Record<string, unknown> = {
        current_step: 'story',
      }

      // Only include URLs if provided
      if (formData.websiteUrl.trim()) {
        updates.positioning = formData.websiteUrl.trim()
        log.info('🌐 Website URL:', { url: formData.websiteUrl })
      }

      if (formData.linkedinUrl.trim()) {
        updates.north_star_metric = formData.linkedinUrl.trim()
        log.info('💼 LinkedIn URL:', { url: formData.linkedinUrl })
      }

      // Save to database (throws on error)
      await updateFields(updates as Parameters<typeof updateFields>[0])

      // Success! Navigate to next step
      log.success('✅ Assets saved!')
      router.push(`/onboard/${projectId}/story`)
    } catch (err) {
      // Error occurred - show feedback to user
      const message = err instanceof Error ? err.message : 'Failed to save'
      log.error('❌ Failed to save assets', err)
      setHasError(true)
      // Don't navigate - let user retry or skip
    }
  }, [formData, updateFields, router, projectId, clearSaveError])

  /**
   * ⏭️ Skip this step entirely
   */
  const handleSkip = useCallback(() => {
    log.info('⏭️ Skipping assets step')
    router.push(`/onboard/${projectId}/story`)
  }, [router, projectId])

  /**
   * 🔄 Retry saving after an error
   */
  const handleRetry = useCallback(() => {
    log.info('🔄 Retrying save...')
    handleContinue()
  }, [handleContinue])

  // ============================================
  // 🎨 RENDER
  // ============================================

  // Loading state - project is being fetched
  if (isLoading || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user has entered anything
  const hasContent = formData.websiteUrl.trim() || formData.linkedinUrl.trim()

  return (
    <OnboardLayout
      projectId={projectId}
      currentStep="assets"
      title="Help us learn about you"
      subtitle="Share your website or LinkedIn so we can learn more (optional)"
      onContinue={handleContinue}
      isContinueLoading={isSaving}
      isContinueDisabled={hasError}
      continueText={hasContent ? 'Continue' : 'Skip for now'}
      showSkip={!!hasContent && !hasError}
      onSkip={handleSkip}
    >
      <div className="space-y-4">
        {/* Error Banner - Shows when save fails */}
        {hasError && saveError && (
          <ErrorBanner
            message={saveError}
            onRetry={handleRetry}
            onSkip={handleSkip}
            isRetrying={isSaving}
          />
        )}

        {/* Info Banner - Only show when no error */}
        {!hasError && (
          <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-lg border border-primary-100">
            <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-primary-800">
              <p className="font-medium mb-1">This step is optional</p>
              <p className="text-primary-600">
                But if you share your website, we can analyze it and save you
                time filling in details later!
              </p>
            </div>
          </div>
        )}

        {/* Website URL */}
        <UrlInput
          label="Website"
          placeholder="https://yourbrand.com"
          value={formData.websiteUrl}
          onChange={(v) => handleChange('websiteUrl', v)}
          icon={<Globe className="w-5 h-5 text-gray-500" />}
          hint="We'll find your socials and analyze your content"
          disabled={isSaving}
        />

        {/* LinkedIn URL */}
        <UrlInput
          label="LinkedIn"
          placeholder="linkedin.com/in/yourprofile"
          value={formData.linkedinUrl}
          onChange={(v) => handleChange('linkedinUrl', v)}
          icon={<Linkedin className="w-5 h-5 text-[#0077B5]" />}
          hint="Your personal profile or company page"
          disabled={isSaving}
        />

        {/* File Upload - Coming Soon */}
        <div className="p-5 rounded-xl border border-dashed border-gray-300 bg-gray-50/30 opacity-60">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Upload existing materials
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Brand guide, one-pager, etc. — Coming soon!
              </p>
            </div>
          </div>
        </div>
      </div>
    </OnboardLayout>
  )
}
