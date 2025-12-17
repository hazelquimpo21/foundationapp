/**
 * 🔮 HUB PAGE (Analysis Dashboard)
 * =================================
 * Step 6: See analysis progress and results
 *
 * This is where users see:
 * - Real-time progress of AI analyzers
 * - Previews of scraped/generated content
 * - Social links discovered from their website
 * - Option to continue or add more detail
 *
 * The hub subscribes to realtime updates so users see
 * analyzer progress as it happens!
 */

'use client'

import { useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OnboardLayout } from '@/components/onboard/OnboardLayout'
import { Card, CardTitle, CardDescription } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useProjectStore } from '@/lib/stores/projectStore'
import { useAnalyzerStore, ANALYZER_REGISTRY } from '@/lib/analyzers'
import type { AnalyzerRun, AnalyzerType } from '@/lib/analyzers'
import { log } from '@/lib/utils/logger'
import { cn } from '@/lib/utils'
import {
  Loader2,
  CheckCircle,
  Clock,
  Sparkles,
  Eye,
  MessageSquare,
  Palette,
  Target,
  Globe,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

// ============================================
// 🔗 SOCIAL LINK COMPONENT
// ============================================

interface SocialLinkProps {
  platform: string
  url?: string | null
  handle?: string | null
}

/**
 * Displays a social media link if available
 */
function SocialLink({ platform, url, handle }: SocialLinkProps) {
  if (!url && !handle) return null

  // Build the URL
  let href = url
  if (!href && handle) {
    const platformUrls: Record<string, string> = {
      instagram: `https://instagram.com/${handle}`,
      twitter: `https://twitter.com/${handle}`,
      tiktok: `https://tiktok.com/@${handle}`,
      youtube: `https://youtube.com/${handle}`,
    }
    href = platformUrls[platform] || '#'
  }

  return (
    <a
      href={href || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
    >
      <span className="capitalize">{platform}</span>
      <ExternalLink className="w-3 h-3" />
    </a>
  )
}

// ============================================
// 📊 ANALYZER CARD COMPONENT
// ============================================

interface AnalyzerCardProps {
  analyzerType: AnalyzerType
  run?: AnalyzerRun
  preview?: React.ReactNode
  onRetry?: () => void
}

/**
 * Displays the status and results of an AI analyzer
 */
function AIAnalyzerCard({ analyzerType, run, preview, onRetry }: AnalyzerCardProps) {
  const config = ANALYZER_REGISTRY[analyzerType]
  const status = run?.status || 'not_started'

  // Determine card state
  const isComplete = status === 'completed'
  const isRunning = status === 'running' || status === 'pending'
  const isFailed = status === 'failed'
  const notStarted = !run

  return (
    <Card
      className={cn(
        'transition-all duration-300',
        isComplete && 'border-green-200 bg-green-50/30',
        isRunning && 'border-primary-200 bg-primary-50/30',
        isFailed && 'border-red-200 bg-red-50/30'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg',
            isComplete && 'bg-green-100',
            notStarted && 'bg-gray-100',
            isRunning && 'bg-primary-100',
            isFailed && 'bg-red-100'
          )}
        >
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CardTitle className="text-base">{config.name}</CardTitle>

            {/* Status Badge */}
            {isComplete && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                <CheckCircle className="w-3.5 h-3.5" />
                Done
              </span>
            )}
            {isRunning && (
              <span className="flex items-center gap-1 text-xs font-medium text-primary-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {status === 'pending' ? 'Waiting...' : 'Analyzing...'}
              </span>
            )}
            {isFailed && (
              <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle className="w-3.5 h-3.5" />
                Failed
              </span>
            )}
            {notStarted && (
              <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                Not started
              </span>
            )}
          </div>

          <CardDescription className="text-sm">{config.description}</CardDescription>

          {/* Preview Content */}
          {isComplete && preview && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-100">
              {preview}
            </div>
          )}

          {/* Error Message */}
          {isFailed && run?.error_message && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <p className="text-sm text-red-600 mb-2">{run.error_message}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-800"
                >
                  <RefreshCw className="w-3 h-3" />
                  Try again
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// ============================================
// 📊 DATA CARD COMPONENT
// ============================================

interface DataCardProps {
  icon: React.ReactNode
  title: string
  description: string
  isComplete: boolean
  preview?: React.ReactNode
}

/**
 * Displays collected user data (not from analyzers)
 */
function DataCard({ icon, title, description, isComplete, preview }: DataCardProps) {
  return (
    <Card className={cn(isComplete && 'border-green-200 bg-green-50/30')}>
      <div className="flex items-start gap-4">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', isComplete ? 'bg-green-100' : 'bg-gray-100')}>
          <span className={cn(isComplete ? 'text-green-600' : 'text-gray-400')}>
            {icon}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CardTitle className="text-base">{title}</CardTitle>
            {isComplete ? (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                <CheckCircle className="w-3.5 h-3.5" />
                Done
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                Pending
              </span>
            )}
          </div>
          <CardDescription>{description}</CardDescription>
          {isComplete && preview && (
            <div className="mt-3">{preview}</div>
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

  // Project store
  const { project, loadProject, updateFields, isLoading } = useProjectStore()

  // Analyzer store
  const {
    runs,
    loadRuns,
    triggerAnalyzers,
    subscribeToUpdates,
  } = useAnalyzerStore()

  // Load project and analyzer runs on mount
  useEffect(() => {
    if (projectId) {
      log.info('🔮 Loading project for hub...', { projectId })
      loadProject(projectId)
      loadRuns(projectId)
    }
  }, [projectId, loadProject, loadRuns])

  // Subscribe to realtime updates
  useEffect(() => {
    if (projectId) {
      const unsubscribe = subscribeToUpdates(projectId)
      return () => unsubscribe()
    }
  }, [projectId, subscribeToUpdates])

  /**
   * 🔄 Retry a failed analyzer
   */
  const handleRetry = useCallback(async (analyzerType: AnalyzerType) => {
    log.info('🔄 Retrying analyzer...', { analyzerType })
    await triggerAnalyzers(projectId, analyzerType)
  }, [projectId, triggerAnalyzers])

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

  // Get analyzer runs by type
  const webScraperRun = runs.find(r => r.analyzer_type === 'web_scraper')

  // Calculate what data we have
  const hasStory = !!(project.problem_statement && project.secret_sauce)
  const hasBrandWords = !!(project.company_values && project.company_values.length > 0)
  const hasCustomerWords = !!(project.target_audience && project.target_audience.length > 0)
  const hasStyle = !!(project.pricing_tier && project.differentiation_score)
  const hasWebsiteData = !!(project.scraped_tagline || project.scraped_industry)

  // Check if any analyzers are running
  const isAnalyzing = runs.some(r => r.status === 'running' || r.status === 'pending')

  // Overall progress (counting both user data and analyzer results)
  const completedSections = [hasStory, hasBrandWords, hasCustomerWords, hasStyle, hasWebsiteData].filter(Boolean).length
  const totalSections = project.website_url ? 5 : 4  // Include website data if they provided URL
  const progressPercent = Math.round((completedSections / totalSections) * 100)

  // Parse scraped social URLs
  const socialUrls = project.social_urls as Record<string, string | undefined> | null

  return (
    <OnboardLayout
      projectId={projectId}
      currentStep="hub"
      title="Building your brand foundation"
      subtitle={isAnalyzing ? '🤖 AI is analyzing your data...' : "Here's what we've gathered"}
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
                : isAnalyzing
                ? '🤖 AI is working...'
                : `${completedSections} of ${totalSections} sections complete`}
            </span>
          </div>
          <ProgressBar
            value={progressPercent}
            color={progressPercent === 100 ? 'success' : 'primary'}
          />
        </div>

        {/* Web Scraper Analyzer Card - Only show if they provided a URL */}
        {project.website_url && (
          <AIAnalyzerCard
            analyzerType="web_scraper"
            run={webScraperRun}
            onRetry={() => handleRetry('web_scraper')}
            preview={
              webScraperRun?.status === 'completed' && (
                <div className="space-y-3 text-sm">
                  {/* Scraped tagline */}
                  {project.scraped_tagline && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tagline found:</p>
                      <p className="text-gray-700 font-medium">
                        &ldquo;{project.scraped_tagline}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Industry */}
                  {project.scraped_industry && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Industry:</p>
                      <span className="inline-block px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                        {project.scraped_industry}
                      </span>
                    </div>
                  )}

                  {/* Services */}
                  {project.scraped_services && project.scraped_services.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Services found:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.scraped_services.slice(0, 3).map((service: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {service}
                          </span>
                        ))}
                        {project.scraped_services.length > 3 && (
                          <span className="px-2 py-0.5 text-xs text-gray-400">
                            +{project.scraped_services.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Social links */}
                  {(socialUrls && Object.values(socialUrls).some(v => v)) && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Social links found:</p>
                      <div className="flex flex-wrap gap-2">
                        <SocialLink platform="instagram" url={socialUrls?.instagram} handle={project.instagram_handle} />
                        <SocialLink platform="twitter" url={socialUrls?.twitter} handle={project.twitter_handle} />
                        <SocialLink platform="linkedin" url={socialUrls?.linkedin || project.linkedin_url} />
                        <SocialLink platform="facebook" url={socialUrls?.facebook || project.facebook_url} />
                        <SocialLink platform="tiktok" url={socialUrls?.tiktok} handle={project.tiktok_handle} />
                        <SocialLink platform="youtube" url={socialUrls?.youtube || project.youtube_url} />
                      </div>
                    </div>
                  )}

                  {/* Confidence */}
                  {project.scrape_confidence != null && (
                    <p className="text-xs text-gray-400">
                      Confidence: {Math.round(Number(project.scrape_confidence) * 100)}%
                    </p>
                  )}
                </div>
              )
            }
          />
        )}

        {/* User Data Cards */}
        <div className="space-y-4">
          {/* Story */}
          <DataCard
            icon={<MessageSquare className="w-5 h-5" />}
            title="Brand Story"
            description="Your founding reason and core offering"
            isComplete={hasStory}
            preview={hasStory && project.problem_statement && (
              <p className="text-sm text-gray-600 p-3 bg-white rounded-lg border border-gray-100 line-clamp-2">
                {project.problem_statement}
              </p>
            )}
          />

          {/* Brand Words */}
          <DataCard
            icon={<Palette className="w-5 h-5" />}
            title="Brand Personality"
            description="Words that describe your brand"
            isComplete={hasBrandWords}
            preview={hasBrandWords && project.company_values && (
              <div className="flex flex-wrap gap-1">
                {project.company_values.slice(0, 5).map((word, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                    {word}
                  </span>
                ))}
                {project.company_values.length > 5 && (
                  <span className="px-2 py-0.5 text-xs text-gray-400">
                    +{project.company_values.length - 5} more
                  </span>
                )}
              </div>
            )}
          />

          {/* Customer Words */}
          <DataCard
            icon={<Target className="w-5 h-5" />}
            title="Target Customer"
            description="Words that describe your ideal customer"
            isComplete={hasCustomerWords}
            preview={hasCustomerWords && project.target_audience && (
              <div className="flex flex-wrap gap-1">
                {project.target_audience.slice(0, 5).map((word, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                    {word}
                  </span>
                ))}
                {project.target_audience.length > 5 && (
                  <span className="px-2 py-0.5 text-xs text-gray-400">
                    +{project.target_audience.length - 5} more
                  </span>
                )}
              </div>
            )}
          />

          {/* Style */}
          <DataCard
            icon={<Eye className="w-5 h-5" />}
            title="Style & Positioning"
            description="Your communication style and market position"
            isComplete={hasStyle}
            preview={hasStyle && (
              <p className="text-sm text-gray-600 p-3 bg-white rounded-lg border border-gray-100">
                Communication: {project.pricing_tier}/5 | Positioning: {project.differentiation_score}/5
              </p>
            )}
          />
        </div>

        {/* Analyzing Notice */}
        {isAnalyzing && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
              <span className="text-sm font-medium text-purple-700">
                🤖 AI is still analyzing... Results will appear automatically!
              </span>
            </div>
          </div>
        )}
      </div>
    </OnboardLayout>
  )
}
