/**
 * 🎨 STYLE PAGE (Sliders)
 * =======================
 * Step 5: Quick preference sliders
 *
 * This page is OPTIONAL - users can skip it.
 * Two simple sliders for communication style and price positioning.
 *
 * These are intentionally fast to fill in.
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OnboardLayout } from '@/components/onboard/OnboardLayout'
import { StyleSlider } from '@/components/onboard/StyleSlider'
import { useProjectStore } from '@/lib/stores/projectStore'
import { SLIDER_CONFIGS } from '@/lib/config/onboarding'
import { log } from '@/lib/utils/logger'
import { Loader2, Zap } from 'lucide-react'

// ============================================
// 📄 MAIN PAGE
// ============================================

export default function StylePage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const { project, loadProject, updateFields, isLoading, isSaving } = useProjectStore()

  // Slider values
  const [commStyle, setCommStyle] = useState(3)
  const [pricePosition, setPricePosition] = useState(3)

  // Load project on mount
  useEffect(() => {
    if (projectId) {
      log.info('🎨 Loading project for style...', { projectId })
      loadProject(projectId)
    }
  }, [projectId, loadProject])

  // Pre-fill from existing data
  useEffect(() => {
    if (project) {
      // We're reusing some numeric fields to store these
      if (project.pricing_tier) {
        setCommStyle(project.pricing_tier)
      }
      if (project.differentiation_score) {
        setPricePosition(project.differentiation_score)
      }
    }
  }, [project])

  /**
   * 💾 Handle continue (save and navigate)
   */
  const handleContinue = async () => {
    log.info('💾 Saving style preferences...', {
      commStyle,
      pricePosition,
    })

    try {
      await updateFields({
        // Store slider values
        pricing_tier: commStyle,
        differentiation_score: pricePosition,
        // Update progress
        current_step: 'hub',
      })

      log.success('✅ Style saved!')

      // Navigate to hub (analysis dashboard)
      router.push(`/onboard/${projectId}/hub`)
    } catch (err) {
      log.error('❌ Failed to save style', err)
    }
  }

  /**
   * ⏭️ Handle skip
   */
  const handleSkip = () => {
    log.info('⏭️ Skipping style step')
    router.push(`/onboard/${projectId}/hub`)
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

  // Get slider configs
  const commStyleConfig = SLIDER_CONFIGS.find((s) => s.id === 'commStyle')!
  const pricePositionConfig = SLIDER_CONFIGS.find((s) => s.id === 'pricePosition')!

  return (
    <OnboardLayout
      projectId={projectId}
      currentStep="style"
      title="A few quick preferences"
      subtitle="These help us understand your positioning"
      onContinue={handleContinue}
      isContinueLoading={isSaving}
      showSkip={true}
      onSkip={handleSkip}
    >
      <div className="space-y-6">
        {/* Quick note */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <Zap className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p>
              This step is optional, but it helps us tailor your brand voice.
              Just drag to where you feel most comfortable!
            </p>
          </div>
        </div>

        {/* Communication Style Slider */}
        <StyleSlider
          id="commStyle"
          label={commStyleConfig.label}
          description={commStyleConfig.description}
          leftLabel={commStyleConfig.leftLabel}
          rightLabel={commStyleConfig.rightLabel}
          value={commStyle}
          onChange={setCommStyle}
          descriptions={commStyleConfig.descriptions}
        />

        {/* Price Positioning Slider */}
        <StyleSlider
          id="pricePosition"
          label={pricePositionConfig.label}
          description={pricePositionConfig.description}
          leftLabel={pricePositionConfig.leftLabel}
          rightLabel={pricePositionConfig.rightLabel}
          value={pricePosition}
          onChange={setPricePosition}
          descriptions={pricePositionConfig.descriptions}
        />
      </div>
    </OnboardLayout>
  )
}
