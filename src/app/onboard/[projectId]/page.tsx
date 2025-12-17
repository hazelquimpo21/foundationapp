/**
 * 💬 ONBOARD PAGE
 * ===============
 * Main chat interface for onboarding a business idea.
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChatContainer, WelcomeMessage } from '@/components/chat'
import { WordBank } from '@/components/interactions/WordBank'
import { SliderInput } from '@/components/interactions/SliderInput'
import { BinaryChoice } from '@/components/interactions/BinaryChoice'
import { ProgressBar, CircularProgress } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/lib/stores/authStore'
import { useProjectStore } from '@/lib/stores/projectStore'
import { useChatStore } from '@/lib/stores/chatStore'
import { BUCKETS, BUCKET_ORDER } from '@/lib/config/buckets'
import { TARGET_AUDIENCE_BANK } from '@/lib/config/wordBanks'
import { CUSTOMER_TYPE_CHOICE, VALIDATION_STATUS_CHOICE } from '@/lib/config/interactions'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'

export default function OnboardPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const { member, isInitialized, initialize } = useAuthStore()
  const { project, isLoading: projectLoading, loadProject, updateField, updateFields } = useProjectStore()
  const { messages, isTyping, loadSession, sendMessage, addAssistantMessage, setTyping, session } = useChatStore()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeInteraction, setActiveInteraction] = useState<string | null>(null)

  // Initialize auth
  useEffect(() => {
    initialize()
  }, [initialize])

  // Load project and session
  useEffect(() => {
    if (member && projectId) {
      loadProject(projectId)
      loadSession(projectId)
    }
  }, [member, projectId, loadProject, loadSession])

  // Redirect if not logged in
  useEffect(() => {
    if (isInitialized && !member) {
      router.push('/login')
    }
  }, [isInitialized, member, router])

  /**
   * Handle sending a chat message
   */
  const handleSendMessage = useCallback(async (content: string) => {
    // Save user message
    const userMessage = await sendMessage(content)
    if (!userMessage) return

    // Show typing indicator
    setTyping(true)

    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session?.id,
          projectId,
          message: content,
        }),
      })

      const data = await response.json()

      if (data.success && data.message) {
        addAssistantMessage(data.message.content)
      } else {
        addAssistantMessage("Sorry, I couldn't process that. Could you try again?")
      }
    } catch (error) {
      console.error('Chat error:', error)
      addAssistantMessage("Oops, something went wrong. Let's try that again!")
    } finally {
      setTyping(false)
    }
  }, [session?.id, projectId, sendMessage, setTyping, addAssistantMessage])

  /**
   * Handle word bank selection
   */
  const handleWordBankSubmit = async (field: string, values: string[]) => {
    await updateField(field as keyof typeof project, values as never)
    setActiveInteraction(null)

    // Send a message about the selection
    const fieldLabel = field === 'target_audience' ? 'target audience' : field
    handleSendMessage(`I've selected my ${fieldLabel}: ${values.join(', ')}`)
  }

  /**
   * Handle binary choice selection
   */
  const handleChoiceSubmit = async (field: string, value: string) => {
    await updateField(field as keyof typeof project, value as never)
    setActiveInteraction(null)
  }

  // Loading state
  if (!isInitialized || !member || projectLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
          sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <h2 className="font-semibold text-gray-900">
            {project?.idea_name || project?.project_name || 'Your Idea'}
          </h2>
        </div>

        {/* Progress Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <CircularProgress
              value={project?.overall_completion || 0}
              size={40}
              strokeWidth={3}
            />
          </div>
        </div>

        {/* Buckets */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Sections
          </h3>
          <div className="space-y-2">
            {BUCKET_ORDER.map((bucketId) => {
              const bucket = BUCKETS[bucketId]
              const completion = project?.bucket_completion?.[bucketId as keyof typeof project.bucket_completion] || 0

              return (
                <button
                  key={bucketId}
                  onClick={() => {
                    // Could scroll to relevant section or trigger interaction
                  }}
                  className={cn(
                    'w-full p-3 rounded-lg text-left transition-all',
                    'hover:bg-gray-50',
                    completion === 100 && 'bg-success/5'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-2">
                      <span>{bucket.emoji}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {bucket.name}
                      </span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <ProgressBar value={completion} size="sm" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setActiveInteraction('analyze')}
          >
            <Sparkles className="w-4 h-4" />
            Analyze My Idea
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-10 p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-5 h-5 text-gray-600" />
          ) : (
            <PanelLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Chat Area */}
        <ChatContainer
          messages={messages}
          onSend={handleSendMessage}
          isTyping={isTyping}
          placeholder="Tell me about your business idea..."
          emptyState={
            <WelcomeMessage
              title="Let's shape your idea! 🚀"
              description="I'll ask you questions to help define and validate your business idea. Just type naturally - I'll guide you through it."
              suggestions={[
                "I have an idea for...",
                "I want to help...",
                "There's a problem with...",
              ]}
              onSuggestionClick={handleSendMessage}
            />
          }
          footer={
            activeInteraction && (
              <InteractionPanel
                type={activeInteraction}
                project={project}
                onClose={() => setActiveInteraction(null)}
                onWordBankSubmit={handleWordBankSubmit}
                onChoiceSubmit={handleChoiceSubmit}
              />
            )
          }
        />

        {/* Quick Actions */}
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          <QuickActionButton
            label="🎯 Define audience"
            onClick={() => setActiveInteraction('target_audience')}
          />
          <QuickActionButton
            label="💼 Customer type"
            onClick={() => setActiveInteraction('customer_type')}
          />
          <QuickActionButton
            label="✅ Validation status"
            onClick={() => setActiveInteraction('validation_status')}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Quick Action Button
 */
function QuickActionButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm',
        'bg-white border border-gray-200 text-gray-700',
        'hover:border-primary-300 hover:bg-primary-50',
        'transition-all duration-200'
      )}
    >
      {label}
    </button>
  )
}

/**
 * Interaction Panel
 */
function InteractionPanel({
  type,
  project,
  onClose,
  onWordBankSubmit,
  onChoiceSubmit,
}: {
  type: string
  project: typeof useProjectStore extends { project: infer P } ? P : never
  onClose: () => void
  onWordBankSubmit: (field: string, values: string[]) => void
  onChoiceSubmit: (field: string, value: string) => void
}) {
  const [selectedWords, setSelectedWords] = useState<string[]>(
    (project?.target_audience as string[]) || []
  )
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)

  if (type === 'target_audience') {
    return (
      <div className="animate-slide-up">
        <WordBank
          config={TARGET_AUDIENCE_BANK}
          selected={selectedWords}
          onChange={setSelectedWords}
          onSubmit={(values) => onWordBankSubmit('target_audience', values)}
        />
      </div>
    )
  }

  if (type === 'customer_type') {
    return (
      <div className="animate-slide-up">
        <BinaryChoice
          config={CUSTOMER_TYPE_CHOICE}
          value={selectedChoice || (project?.customer_type as string) || null}
          onChange={setSelectedChoice}
          onSubmit={(value) => onChoiceSubmit('customer_type', value)}
        />
      </div>
    )
  }

  if (type === 'validation_status') {
    return (
      <div className="animate-slide-up">
        <BinaryChoice
          config={VALIDATION_STATUS_CHOICE}
          value={selectedChoice || (project?.validation_status as string) || null}
          onChange={setSelectedChoice}
          onSubmit={(value) => onChoiceSubmit('validation_status', value)}
          layout="stack"
        />
      </div>
    )
  }

  if (type === 'analyze') {
    return (
      <div className="animate-slide-up p-4 bg-accent-50 rounded-xl border border-accent-200">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-500" />
          AI Analysis
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Get instant feedback on your idea&apos;s clarity, viability, and potential blind spots.
        </p>
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              // Trigger analysis
              await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  projectId: project?.id,
                  analyzerType: 'clarity',
                }),
              })
              onClose()
            }}
          >
            Run Analysis
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return null
}
