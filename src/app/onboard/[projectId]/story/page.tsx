/**
 * 📖 STORY PAGE (Mad Libs)
 * ========================
 * Step 3: Tell us your story
 *
 * This is the CORE of the onboarding experience.
 * Users fill in blanks to tell their brand story.
 * Much easier than staring at a blank page!
 *
 * Required fields:
 * - repName, repRole (should be pre-filled from setup)
 * - brandName (should be pre-filled from setup)
 * - brandLocation, yearFounded
 * - foundingReason, customerDescription, coreOffering
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OnboardLayout } from '@/components/onboard/OnboardLayout'
import { MadLibsParagraph, MadLibsCompletionIndicator } from '@/components/onboard/MadLibsInput'
import { useProjectStore } from '@/lib/stores/projectStore'
import { useAuthStore } from '@/lib/stores/authStore'
import { MAD_LIBS_FIELDS } from '@/lib/config/onboarding'
import { log } from '@/lib/utils/logger'
import { Loader2, Sparkles } from 'lucide-react'

// ============================================
// 📋 TYPES
// ============================================

interface MadLibsData {
  [key: string]: string  // Index signature for Record<string, string> compatibility
  repName: string
  repRole: string
  brandName: string
  brandLocation: string
  yearFounded: string
  foundingReason: string
  customerDescription: string
  coreOffering: string
}

// All fields are required for this step
const REQUIRED_FIELDS = [
  'repName',
  'repRole',
  'brandName',
  'brandLocation',
  'yearFounded',
  'foundingReason',
  'customerDescription',
  'coreOffering',
]

// ============================================
// 📄 MAIN PAGE
// ============================================

export default function StoryPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const { project, loadProject, updateFields, isLoading, isSaving } = useProjectStore()
  const { member } = useAuthStore()

  // Form state
  const [values, setValues] = useState<MadLibsData>({
    repName: '',
    repRole: '',
    brandName: '',
    brandLocation: '',
    yearFounded: '',
    foundingReason: '',
    customerDescription: '',
    coreOffering: '',
  })
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [focusedField, setFocusedField] = useState<string | undefined>()

  // Load project on mount
  useEffect(() => {
    if (projectId) {
      log.info('📖 Loading project for story...', { projectId })
      loadProject(projectId)
    }
  }, [projectId, loadProject])

  // Pre-fill form when project loads
  useEffect(() => {
    if (project) {
      setValues({
        // From setup page
        repName: member?.name || '',
        repRole: '', // Stored elsewhere
        brandName: project.idea_name || project.project_name || '',
        // Need to fill these in
        brandLocation: '',
        yearFounded: '',
        // Map from existing fields
        foundingReason: project.problem_statement || '',
        customerDescription: project.one_liner || '',
        coreOffering: project.secret_sauce || '',
      })
    }
  }, [project, member])

  /**
   * 📝 Handle field change
   */
  const handleChange = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }))

    // Clear error when user types
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: false }))
    }
  }

  /**
   * ✅ Check if form is complete
   */
  const isComplete = () => {
    return REQUIRED_FIELDS.every((field) => values[field as keyof MadLibsData]?.trim())
  }

  /**
   * ✅ Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, boolean> = {}

    REQUIRED_FIELDS.forEach((field) => {
      if (!values[field as keyof MadLibsData]?.trim()) {
        newErrors[field] = true
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * 💾 Handle continue (save and navigate)
   */
  const handleContinue = async () => {
    if (!validateForm()) {
      log.warn('📖 Form validation failed - not all blanks filled')

      // Find first empty field and scroll to it
      const firstError = REQUIRED_FIELDS.find(
        (field) => !values[field as keyof MadLibsData]?.trim()
      )
      if (firstError) {
        setFocusedField(firstError)
      }
      return
    }

    log.info('💾 Saving story data...', values)

    try {
      // Map Mad Libs fields to database schema
      await updateFields({
        // Store the narrative data
        problem_statement: values.foundingReason,
        one_liner: values.customerDescription,
        secret_sauce: values.coreOffering,
        // Update progress
        current_step: 'words',
        status: 'in_progress',
      })

      log.success('✅ Story saved!')

      // Navigate to next step
      router.push(`/onboard/${projectId}/words`)
    } catch (err) {
      log.error('❌ Failed to save story', err)
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
      currentStep="story"
      title="Tell us your story"
      subtitle="Fill in the blanks — it's easier than starting from scratch!"
      onContinue={handleContinue}
      isContinueLoading={isSaving}
      isContinueDisabled={!isComplete()}
    >
      <div className="space-y-8">
        {/* Tip */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
          <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Pro tip</p>
            <p className="text-amber-700">
              Don&apos;t overthink it! Write like you&apos;re explaining to a friend.
              You can always refine later.
            </p>
          </div>
        </div>

        {/* Mad Libs Paragraph */}
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
          <MadLibsParagraph
            values={values}
            onChange={handleChange}
            errors={errors}
            focusedField={focusedField}
            onFieldFocus={setFocusedField}
          />
        </div>

        {/* Completion Indicator */}
        <MadLibsCompletionIndicator
          values={values}
          requiredFields={REQUIRED_FIELDS}
        />

        {/* Error Message */}
        {Object.keys(errors).length > 0 && (
          <p className="text-sm text-red-600">
            Please fill in all the blanks to continue
          </p>
        )}
      </div>
    </OnboardLayout>
  )
}
