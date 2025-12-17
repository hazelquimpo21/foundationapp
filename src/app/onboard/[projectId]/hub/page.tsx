/**
 * 🔮 HUB PAGE (Analysis Dashboard)
 * =================================
 * Step 6: See analysis progress and results
 *
 * This is where users see:
 * - Progress of AI analyzers
 * - Previews of generated content
 * - Option to add more detail
 *
 * For MVP, we show collected data summary.
 * AI analysis will come in a future phase.
 */

'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OnboardLayout } from '@/components/onboard/OnboardLayout'
import { Card, CardTitle, CardDescription } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useProjectStore } from '@/lib/stores/projectStore'
import { log } from '@/lib/utils/logger'
import {
  Loader2,
  CheckCircle,
  Clock,
  Sparkles,
  Eye,
  MessageSquare,
  Palette,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// 📊 ANALYZER CARD
// ============================================

interface AnalyzerCardProps {
  icon: React.ReactNode
  title: string
  description: string
  status: 'complete' | 'pending' | 'running'
  preview?: string | string[]
}

function AnalyzerCard({ icon, title, description, status, preview }: AnalyzerCardProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-300',
        status === 'complete' && 'border-green-200 bg-green-50/30',
        status === 'running' && 'border-primary-200 bg-primary-50/30'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            status === 'complete' && 'bg-green-100 text-green-600',
            status === 'pending' && 'bg-gray-100 text-gray-400',
            status === 'running' && 'bg-primary-100 text-primary-600'
          )}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CardTitle className="text-base">{title}</CardTitle>

            {/* Status Badge */}
            {status === 'complete' && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                <CheckCircle className="w-3.5 h-3.5" />
                Done
              </span>
            )}
            {status === 'running' && (
              <span className="flex items-center gap-1 text-xs font-medium text-primary-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Running
              </span>
            )}
            {status === 'pending' && (
              <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                Waiting
              </span>
            )}
          </div>

          <CardDescription className="text-sm">{description}</CardDescription>

          {/* Preview Content */}
          {preview && status === 'complete' && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-100 text-sm text-gray-600">
              {Array.isArray(preview) ? (
                <ul className="list-disc list-inside space-y-1">
                  {preview.slice(0, 3).map((item, i) => (
                    <li key={i} className="truncate">{item}</li>
                  ))}
                  {preview.length > 3 && (
                    <li className="text-gray-400">+{preview.length - 3} more</li>
                  )}
                </ul>
              ) : (
                <p className="line-clamp-2">{preview}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// ============================================
// 📄 MAIN PAGE
// ============================================

export default function HubPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const { project, loadProject, updateFields, isLoading } = useProjectStore()

  // Load project on mount
  useEffect(() => {
    if (projectId) {
      log.info('🔮 Loading project for hub...', { projectId })
      loadProject(projectId)
    }
  }, [projectId, loadProject])

  /**
   * 💾 Handle continue to done page
   */
  const handleContinue = async () => {
    log.info('🎉 Navigating to completion...')

    try {
      await updateFields({
        current_step: 'done',
        status: 'completed',
      })

      router.push(`/onboard/${projectId}/done`)
    } catch (err) {
      log.error('❌ Failed to update status', err)
    }
  }

  // Loading state
  if (isLoading || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your brand data...</p>
        </div>
      </div>
    )
  }

  // Calculate what data we have
  const hasStory = !!(project.problem_statement && project.secret_sauce)
  const hasBrandWords = project.company_values && project.company_values.length > 0
  const hasCustomerWords = project.target_audience && project.target_audience.length > 0
  const hasStyle = !!(project.pricing_tier && project.differentiation_score)

  // Overall progress
  const completedSteps = [hasStory, hasBrandWords, hasCustomerWords, hasStyle].filter(Boolean).length
  const totalSteps = 4
  const progressPercent = Math.round((completedSteps / totalSteps) * 100)

  return (
    <OnboardLayout
      projectId={projectId}
      currentStep="hub"
      title="Building your brand foundation"
      subtitle="Here's what we've gathered so far"
      onContinue={handleContinue}
      continueText="View Your Foundation"
    >
      <div className="space-y-6">
        {/* Overall Progress */}
        <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-primary-900">
              {progressPercent === 100
                ? '🎉 All data collected!'
                : `${completedSteps} of ${totalSteps} sections complete`}
            </span>
          </div>
          <ProgressBar
            value={progressPercent}
            color={progressPercent === 100 ? 'success' : 'primary'}
          />
        </div>

        {/* Analyzer Cards */}
        <div className="space-y-4">
          {/* Story Analysis */}
          <AnalyzerCard
            icon={<MessageSquare className="w-5 h-5" />}
            title="Brand Story"
            description="Your founding reason and core offering"
            status={hasStory ? 'complete' : 'pending'}
            preview={
              hasStory
                ? `${project.problem_statement?.slice(0, 100)}...`
                : undefined
            }
          />

          {/* Brand Words */}
          <AnalyzerCard
            icon={<Palette className="w-5 h-5" />}
            title="Brand Personality"
            description="Words that describe your brand's character"
            status={hasBrandWords ? 'complete' : 'pending'}
            preview={hasBrandWords && project.company_values ? project.company_values : undefined}
          />

          {/* Customer Words */}
          <AnalyzerCard
            icon={<Target className="w-5 h-5" />}
            title="Target Customer"
            description="Words that describe your ideal customer"
            status={hasCustomerWords ? 'complete' : 'pending'}
            preview={hasCustomerWords && project.target_audience ? project.target_audience : undefined}
          />

          {/* Style Preferences */}
          <AnalyzerCard
            icon={<Eye className="w-5 h-5" />}
            title="Style & Positioning"
            description="Your communication style and market position"
            status={hasStyle ? 'complete' : 'pending'}
            preview={
              hasStyle
                ? `Communication: ${project.pricing_tier}/5 | Positioning: ${project.differentiation_score}/5`
                : undefined
            }
          />
        </div>

        {/* Coming Soon Notice */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-1">
            🔮 AI Analysis Coming Soon
          </h4>
          <p className="text-sm text-gray-500">
            In a future update, AI will analyze your inputs and generate:
            brand positioning, voice guidelines, and marketing copy suggestions.
          </p>
        </div>
      </div>
    </OnboardLayout>
  )
}
