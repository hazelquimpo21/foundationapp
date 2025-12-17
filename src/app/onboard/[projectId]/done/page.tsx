/**
 * ✨ DONE PAGE (Completion)
 * =========================
 * Final step: Celebrate and show the brand foundation summary!
 *
 * This page displays:
 * - Celebration moment
 * - Complete brand foundation summary
 * - Export options (copy, future: PDF)
 * - Next steps
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useProjectStore } from '@/lib/stores/projectStore'
import { log } from '@/lib/utils/logger'
import {
  Loader2,
  Rocket,
  Copy,
  CheckCircle,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Palette,
  Target,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// 📋 SECTION COMPONENT
// ============================================

interface SectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <div className="py-6 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-primary-600">{icon}</span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="text-gray-700">{children}</div>
    </div>
  )
}

// ============================================
// 🏷️ WORD TAGS
// ============================================

function WordTags({ words }: { words: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {words.map((word) => (
        <span
          key={word}
          className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
        >
          {word}
        </span>
      ))}
    </div>
  )
}

// ============================================
// 📄 MAIN PAGE
// ============================================

export default function DonePage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const { project, loadProject, isLoading } = useProjectStore()
  const [copied, setCopied] = useState(false)

  // Load project on mount
  useEffect(() => {
    if (projectId) {
      log.info('✨ Loading completed project...', { projectId })
      loadProject(projectId)
    }
  }, [projectId, loadProject])

  /**
   * 📋 Copy summary to clipboard
   */
  const handleCopy = () => {
    if (!project) return

    const summary = `
# ${project.idea_name || project.project_name}

## Brand Story
${project.problem_statement || 'Not provided'}

## What We Do
${project.secret_sauce || 'Not provided'}

## Brand Personality
${project.company_values?.join(', ') || 'Not selected'}

## Target Customer
${project.target_audience?.join(', ') || 'Not selected'}
    `.trim()

    navigator.clipboard.writeText(summary)
    setCopied(true)
    log.success('📋 Summary copied to clipboard!')

    setTimeout(() => setCopied(false), 2000)
  }

  // Loading state
  if (isLoading || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your brand foundation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Rocket className="w-6 h-6 text-primary-500" />
              <span className="font-bold text-gray-900">Foundation Studio</span>
            </Link>

            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================ */}
      {/* CELEBRATION BANNER */}
      {/* ============================================ */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Your brand foundation is ready! 🎉
          </h1>
          <p className="text-primary-100 text-lg max-w-lg mx-auto">
            Great work! Here&apos;s everything we gathered about{' '}
            <span className="font-semibold text-white">
              {project.idea_name || project.project_name}
            </span>
          </p>
        </div>
      </div>

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Summary Card */}
          <Card className="mb-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <CardTitle className="text-xl">
                {project.idea_name || project.project_name}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className={cn(
                  'transition-all',
                  copied && 'bg-green-50 border-green-300 text-green-700'
                )}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            {/* Sections */}
            <div className="divide-y divide-gray-100">
              {/* Brand Story */}
              <Section icon={<MessageSquare className="w-5 h-5" />} title="Brand Story">
                <p className="leading-relaxed">
                  {project.problem_statement || (
                    <span className="text-gray-400 italic">No story provided</span>
                  )}
                </p>
                {project.secret_sauce && (
                  <p className="mt-3 leading-relaxed">
                    <span className="font-medium">What we do: </span>
                    {project.secret_sauce}
                  </p>
                )}
              </Section>

              {/* Brand Personality */}
              <Section icon={<Palette className="w-5 h-5" />} title="Brand Personality">
                {project.company_values && project.company_values.length > 0 ? (
                  <WordTags words={project.company_values} />
                ) : (
                  <span className="text-gray-400 italic">No words selected</span>
                )}
              </Section>

              {/* Target Customer */}
              <Section icon={<Target className="w-5 h-5" />} title="Target Customer">
                {project.target_audience && project.target_audience.length > 0 ? (
                  <WordTags words={project.target_audience} />
                ) : (
                  <span className="text-gray-400 italic">No words selected</span>
                )}
              </Section>

              {/* Style Preferences */}
              {(project.pricing_tier || project.differentiation_score) && (
                <Section icon={<Eye className="w-5 h-5" />} title="Style & Positioning">
                  <div className="grid grid-cols-2 gap-4">
                    {project.pricing_tier && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Communication</p>
                        <p className="font-medium">
                          {project.pricing_tier <= 2
                            ? 'Formal'
                            : project.pricing_tier === 3
                            ? 'Balanced'
                            : 'Casual'}
                        </p>
                      </div>
                    )}
                    {project.differentiation_score && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Positioning</p>
                        <p className="font-medium">
                          {project.differentiation_score <= 2
                            ? 'Budget'
                            : project.differentiation_score === 3
                            ? 'Mid-market'
                            : 'Premium'}
                        </p>
                      </div>
                    )}
                  </div>
                </Section>
              )}
            </div>
          </Card>

          {/* Next Steps */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What&apos;s next?
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard">
                <Button size="lg">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href={`/onboard/${projectId}/setup`}>
                <Button variant="outline" size="lg">
                  Edit Project
                </Button>
              </Link>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <Sparkles className="w-8 h-8 text-primary-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">
              AI-Powered Features Coming Soon
            </h4>
            <p className="text-gray-500 max-w-md mx-auto">
              Soon you&apos;ll be able to generate marketing copy, brand voice guidelines,
              and more based on your foundation. Stay tuned!
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
