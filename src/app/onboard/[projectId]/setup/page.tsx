/**
 * 📝 SETUP PAGE
 * =============
 * Step 1: Capture the basics
 * - Brand name
 * - Company size
 * - Your name
 * - Your role
 *
 * Simple, focused, no overwhelm.
 * Gets just enough info to personalize the rest of the flow.
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OnboardLayout } from '@/components/onboard/OnboardLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useProjectStore } from '@/lib/stores/projectStore'
import { useAuthStore } from '@/lib/stores/authStore'
import {
  COMPANY_SIZE_OPTIONS,
  ROLE_SUGGESTIONS,
} from '@/lib/config/onboarding'
import { log } from '@/lib/utils/logger'
import { cn } from '@/lib/utils'
import { ChevronDown, Loader2 } from 'lucide-react'

// ============================================
// 📋 TYPES
// ============================================

interface SetupFormData {
  brandName: string
  companySize: string
  repName: string
  repRole: string
}

// ============================================
// 🏢 COMPANY SIZE SELECTOR
// ============================================

interface CompanySizeSelectorProps {
  value: string
  onChange: (value: string) => void
}

function CompanySizeSelector({ value, onChange }: CompanySizeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        How big is the team?
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {COMPANY_SIZE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'p-3 rounded-lg border-2 text-left transition-all',
              'hover:border-primary-300 hover:bg-primary-50/50',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              value === option.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{option.emoji}</span>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {option.label}
                </div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================
// 👔 ROLE INPUT WITH SUGGESTIONS
// ============================================

interface RoleInputProps {
  value: string
  onChange: (value: string) => void
}

function RoleInput({ value, onChange }: RoleInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  return (
    <div className="relative">
      <Input
        label="Your role"
        placeholder="e.g., Founder, CEO, Marketing Director"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        rightIcon={
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              showSuggestions && 'rotate-180'
            )}
          />
        }
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {ROLE_SUGGESTIONS.filter(
            (role) =>
              role.toLowerCase().includes(value.toLowerCase()) || value === ''
          ).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                onChange(role)
                setShowSuggestions(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// 📄 MAIN PAGE
// ============================================

export default function SetupPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const { project, loadProject, updateFields, isLoading, isSaving } = useProjectStore()
  const { member } = useAuthStore()

  // Form state
  const [formData, setFormData] = useState<SetupFormData>({
    brandName: '',
    companySize: '',
    repName: '',
    repRole: '',
  })
  const [errors, setErrors] = useState<Partial<SetupFormData>>({})

  // Load project on mount
  useEffect(() => {
    if (projectId) {
      log.info('📝 Loading project for setup...', { projectId })
      loadProject(projectId)
    }
  }, [projectId, loadProject])

  // Pre-fill form when project loads
  useEffect(() => {
    if (project) {
      setFormData({
        brandName: project.idea_name || project.project_name || '',
        companySize: project.team_size || '',
        repName: member?.name || '',
        repRole: '', // No good existing field for this
      })
    }
  }, [project, member])

  /**
   * 📝 Handle field change
   */
  const handleChange = (field: keyof SetupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  /**
   * ✅ Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<SetupFormData> = {}

    if (!formData.brandName.trim()) {
      newErrors.brandName = 'Brand name is required'
    }
    if (!formData.companySize) {
      newErrors.companySize = 'Please select a company size'
    }
    if (!formData.repName.trim()) {
      newErrors.repName = 'Your name is required'
    }
    if (!formData.repRole.trim()) {
      newErrors.repRole = 'Your role is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * 💾 Handle continue (save and navigate)
   */
  const handleContinue = async () => {
    if (!validateForm()) {
      log.warn('📝 Form validation failed', { errors })
      return
    }

    log.info('💾 Saving setup data...', formData)

    try {
      // Save to project
      // Map our form fields to the existing database schema
      await updateFields({
        idea_name: formData.brandName,
        project_name: formData.brandName,
        team_size: formData.companySize as 'solo' | 'cofounders' | 'small_team' | 'growing' | 'established',
        status: 'in_progress',
        current_step: 'assets',
      })

      log.success('✅ Setup saved!')

      // Navigate to next step
      router.push(`/onboard/${projectId}/assets`)
    } catch (err) {
      log.error('❌ Failed to save setup', err)
    }
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

  return (
    <OnboardLayout
      projectId={projectId}
      currentStep="setup"
      title="First, the basics"
      subtitle="Let's get to know your brand"
      onContinue={handleContinue}
      isContinueLoading={isSaving}
      isContinueDisabled={isSaving}
    >
      <div className="space-y-6">
        {/* Brand Name */}
        <Input
          label="What's the brand called?"
          placeholder="Enter your brand or business name"
          value={formData.brandName}
          onChange={(e) => handleChange('brandName', e.target.value)}
          error={errors.brandName}
          autoFocus
        />

        {/* Company Size */}
        <div>
          <CompanySizeSelector
            value={formData.companySize}
            onChange={(value) => handleChange('companySize', value)}
          />
          {errors.companySize && (
            <p className="mt-1.5 text-sm text-error">{errors.companySize}</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-2" />

        {/* About You Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            About you
          </h3>

          {/* Your Name */}
          <Input
            label="Your name"
            placeholder="What should we call you?"
            value={formData.repName}
            onChange={(e) => handleChange('repName', e.target.value)}
            error={errors.repName}
          />

          {/* Your Role */}
          <RoleInput
            value={formData.repRole}
            onChange={(value) => handleChange('repRole', value)}
          />
          {errors.repRole && (
            <p className="mt-1.5 text-sm text-error">{errors.repRole}</p>
          )}
        </div>
      </div>
    </OnboardLayout>
  )
}
