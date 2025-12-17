/**
 * 🆕 NEW PROJECT PAGE
 * ===================
 * First step: Choose project type (My Brand vs Client Brand)
 *
 * This page creates a new project and routes to setup.
 * Simple, focused, no overwhelm.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Rocket, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/lib/stores/authStore'
import { useProjectStore } from '@/lib/stores/projectStore'
import { PROJECT_TYPE_OPTIONS, type ProjectTypeOption } from '@/lib/config/onboarding'
import { log } from '@/lib/utils/logger'
import { cn } from '@/lib/utils'

// ============================================
// 🎨 PROJECT TYPE CARD
// ============================================

interface ProjectTypeCardProps {
  option: ProjectTypeOption
  isSelected: boolean
  onClick: () => void
}

function ProjectTypeCard({ option, isSelected, onClick }: ProjectTypeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-6 rounded-xl border-2 text-left transition-all duration-200',
        'hover:border-primary-300 hover:bg-primary-50/50',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        isSelected
          ? 'border-primary-500 bg-primary-50 shadow-md'
          : 'border-gray-200 bg-white'
      )}
    >
      {/* Emoji */}
      <div className="text-4xl mb-4">{option.emoji}</div>

      {/* Label */}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {option.label}
      </h3>

      {/* Description */}
      <p className="text-gray-500">{option.description}</p>

      {/* Selection Indicator */}
      <div className="mt-4 flex items-center gap-2">
        <div
          className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
            isSelected
              ? 'border-primary-500 bg-primary-500'
              : 'border-gray-300'
          )}
        >
          {isSelected && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
              <path
                d="M10 3L4.5 8.5L2 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <span className={cn(
          'text-sm font-medium',
          isSelected ? 'text-primary-700' : 'text-gray-400'
        )}>
          {isSelected ? 'Selected' : 'Select'}
        </span>
      </div>
    </button>
  )
}

// ============================================
// 📄 MAIN PAGE
// ============================================

export default function NewProjectPage() {
  const router = useRouter()
  const { member } = useAuthStore()
  const { createProject } = useProjectStore()

  const [selectedType, setSelectedType] = useState<'primary' | 'portfolio'>('primary')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 🚀 Handle project creation
   */
  const handleContinue = async () => {
    if (!member) {
      log.warn('🚫 Cannot create project - no member')
      setError('Please log in to create a project')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      log.info('🆕 Creating new project...', { type: selectedType })

      // Create the project with a default name
      const projectName = selectedType === 'primary'
        ? 'My Brand'
        : 'New Client Brand'

      const project = await createProject(member.id, projectName)

      if (!project) {
        throw new Error('Failed to create project')
      }

      log.success('✅ Project created!', { id: project.id })

      // Navigate to the setup page
      router.push(`/onboard/${project.id}/setup`)
    } catch (err) {
      log.error('❌ Failed to create project', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back to Dashboard */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <Rocket className="w-6 h-6 text-primary-500" />
              <span className="font-bold text-gray-900">Foundation Studio</span>
            </div>

            {/* Spacer for alignment */}
            <div className="w-32" />
          </div>
        </div>
      </header>

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Let&apos;s build a brand foundation
            </h1>
            <p className="text-lg text-gray-500">
              First, tell us what kind of project this is
            </p>
          </div>

          {/* Project Type Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {PROJECT_TYPE_OPTIONS.map((option) => (
              <ProjectTypeCard
                key={option.value}
                option={option}
                isSelected={selectedType === option.value}
                onClick={() => setSelectedType(option.value)}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleContinue}
              loading={isCreating}
              className="min-w-[200px]"
            >
              {isCreating ? 'Creating...' : 'Get Started'}
              {!isCreating && <ArrowRight className="w-5 h-5" />}
            </Button>
          </div>

          {/* Helper Text */}
          <p className="text-center text-sm text-gray-400 mt-6">
            Don&apos;t worry, you can always change this later
          </p>
        </div>
      </main>
    </div>
  )
}
