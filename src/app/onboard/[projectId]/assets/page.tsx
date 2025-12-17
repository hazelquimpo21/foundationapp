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
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OnboardLayout } from '@/components/onboard/OnboardLayout'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useProjectStore } from '@/lib/stores/projectStore'
import { log } from '@/lib/utils/logger'
import { Globe, Linkedin, FileText, Loader2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// 📋 TYPES
// ============================================

interface AssetsFormData {
  websiteUrl: string
  linkedinUrl: string
}

// ============================================
// 🌐 URL INPUT WITH ICON
// ============================================

interface UrlInputProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  icon: React.ReactNode
  hint?: string
}

function UrlInput({ label, placeholder, value, onChange, icon, hint }: UrlInputProps) {
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
          />
        </div>
      </div>
    </div>
  )
}

// ============================================
// 📄 MAIN PAGE
// ============================================

export default function AssetsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const { project, loadProject, updateFields, isLoading, isSaving } = useProjectStore()

  // Form state
  const [formData, setFormData] = useState<AssetsFormData>({
    websiteUrl: '',
    linkedinUrl: '',
  })

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
        websiteUrl: project.positioning || '', // We're storing URL here temporarily
        linkedinUrl: project.north_star_metric || '', // Reusing this field too
      })
    }
  }, [project])

  /**
   * 📝 Handle field change
   */
  const handleChange = (field: keyof AssetsFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  /**
   * 💾 Handle continue (save and navigate)
   */
  const handleContinue = async () => {
    log.info('💾 Saving assets data...', formData)

    try {
      // Only save if user entered something
      const updates: Record<string, unknown> = {
        current_step: 'story',
      }

      if (formData.websiteUrl.trim()) {
        updates.positioning = formData.websiteUrl.trim()
        log.info('🌐 Website URL saved', { url: formData.websiteUrl })
        // In a real app, we'd trigger the web scraper here!
      }

      if (formData.linkedinUrl.trim()) {
        updates.north_star_metric = formData.linkedinUrl.trim()
        log.info('💼 LinkedIn URL saved', { url: formData.linkedinUrl })
      }

      await updateFields(updates as Parameters<typeof updateFields>[0])

      log.success('✅ Assets saved!')
      router.push(`/onboard/${projectId}/story`)
    } catch (err) {
      log.error('❌ Failed to save assets', err)
    }
  }

  /**
   * ⏭️ Handle skip
   */
  const handleSkip = () => {
    log.info('⏭️ Skipping assets step')
    router.push(`/onboard/${projectId}/story`)
  }

  // Loading state
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
      continueText={hasContent ? 'Continue' : 'Skip for now'}
      showSkip={!!hasContent}
      onSkip={handleSkip}
    >
      <div className="space-y-4">
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-lg border border-primary-100">
          <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-primary-800">
            <p className="font-medium mb-1">This step is optional</p>
            <p className="text-primary-600">
              But if you share your website, we can analyze it and save you time
              filling in details later!
            </p>
          </div>
        </div>

        {/* Website URL */}
        <UrlInput
          label="Website"
          placeholder="https://yourbrand.com"
          value={formData.websiteUrl}
          onChange={(v) => handleChange('websiteUrl', v)}
          icon={<Globe className="w-5 h-5 text-gray-500" />}
          hint="We'll find your socials and analyze your content"
        />

        {/* LinkedIn URL */}
        <UrlInput
          label="LinkedIn"
          placeholder="linkedin.com/in/yourprofile"
          value={formData.linkedinUrl}
          onChange={(v) => handleChange('linkedinUrl', v)}
          icon={<Linkedin className="w-5 h-5 text-[#0077B5]" />}
          hint="Your personal profile or company page"
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
