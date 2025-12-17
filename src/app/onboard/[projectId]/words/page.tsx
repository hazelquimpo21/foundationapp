/**
 * 💬 WORDS PAGE (Word Banks)
 * ==========================
 * Step 4: Select brand and customer words
 *
 * Two word bank selections:
 * 1. Brand personality words (how you see your brand)
 * 2. Customer descriptor words (who you serve)
 *
 * This structured approach is much easier than asking
 * "describe your brand voice" from scratch.
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OnboardLayout } from '@/components/onboard/OnboardLayout'
import { WordBankSelector } from '@/components/onboard/WordBankSelector'
import { useProjectStore } from '@/lib/stores/projectStore'
import { log } from '@/lib/utils/logger'
import { Loader2 } from 'lucide-react'

// ============================================
// 📚 WORD BANK DEFINITIONS
// ============================================

/**
 * Brand Personality Words
 * Users pick 5-7 words that feel like their brand
 */
const BRAND_WORD_CATEGORIES = [
  {
    id: 'warmth',
    label: 'Warmth & Care',
    emoji: '💛',
    words: [
      'Compassionate', 'Nurturing', 'Supportive', 'Welcoming',
      'Friendly', 'Approachable', 'Caring', 'Gentle',
      'Kind', 'Warm', 'Empathetic', 'Thoughtful',
    ],
  },
  {
    id: 'energy',
    label: 'Energy & Drive',
    emoji: '⚡',
    words: [
      'Bold', 'Dynamic', 'Energetic', 'Driven',
      'Ambitious', 'Fearless', 'Adventurous', 'Spirited',
      'Vibrant', 'Passionate', 'Determined', 'Motivated',
    ],
  },
  {
    id: 'trust',
    label: 'Trust & Reliability',
    emoji: '🤝',
    words: [
      'Trustworthy', 'Reliable', 'Dependable', 'Consistent',
      'Stable', 'Honest', 'Authentic', 'Transparent',
      'Credible', 'Solid', 'Genuine', 'Loyal',
    ],
  },
  {
    id: 'expertise',
    label: 'Expertise & Quality',
    emoji: '✨',
    words: [
      'Expert', 'Professional', 'Sophisticated', 'Refined',
      'Premium', 'Meticulous', 'Precise', 'Excellent',
      'Elite', 'Masterful', 'Polished', 'Distinguished',
    ],
  },
  {
    id: 'innovation',
    label: 'Innovation & Creativity',
    emoji: '💡',
    words: [
      'Innovative', 'Creative', 'Original', 'Inventive',
      'Visionary', 'Forward-thinking', 'Fresh', 'Modern',
      'Imaginative', 'Pioneering', 'Cutting-edge', 'Unconventional',
    ],
  },
  {
    id: 'fun',
    label: 'Fun & Playful',
    emoji: '🎈',
    words: [
      'Playful', 'Fun', 'Quirky', 'Witty',
      'Cheerful', 'Light-hearted', 'Joyful', 'Entertaining',
      'Delightful', 'Whimsical', 'Humorous', 'Lively',
    ],
  },
]

/**
 * Customer Descriptor Words
 * Users pick 5-7 words that describe their ideal customer
 */
const CUSTOMER_WORD_CATEGORIES = [
  {
    id: 'life_stage',
    label: 'Life Stage',
    emoji: '🌱',
    words: [
      'New parent', 'Career changer', 'Recent graduate', 'Retiree',
      'Mid-career professional', 'Startup founder', 'Empty nester',
      'Young professional', 'Established business owner', 'First-time buyer',
    ],
  },
  {
    id: 'mindset',
    label: 'Mindset',
    emoji: '🧠',
    words: [
      'Ambitious', 'Curious', 'Overwhelmed', 'Stuck',
      'Ready for change', 'Growth-oriented', 'Skeptical', 'Eager',
      'Cautious', 'Open-minded', 'Motivated', 'Stressed',
    ],
  },
  {
    id: 'needs',
    label: 'Needs & Priorities',
    emoji: '🎯',
    words: [
      'Time-strapped', 'Budget-conscious', 'Quality-focused', 'Results-driven',
      'Relationship-oriented', 'Balance-seeking', 'Security-seeking', 'Status-conscious',
      'Value-driven', 'Convenience-focused', 'Health-conscious', 'Career-focused',
    ],
  },
  {
    id: 'industry',
    label: 'Industry',
    emoji: '💼',
    words: [
      'Creative professional', 'Healthcare worker', 'Educator', 'Tech worker',
      'Service provider', 'Consultant', 'Retail owner', 'Freelancer',
      'Finance professional', 'Nonprofit worker', 'Agency owner', 'Small business owner',
    ],
  },
]

// ============================================
// 📄 MAIN PAGE
// ============================================

export default function WordsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const { project, loadProject, updateFields, isLoading, isSaving } = useProjectStore()

  // Selection state
  const [brandWords, setBrandWords] = useState<string[]>([])
  const [customerWords, setCustomerWords] = useState<string[]>([])

  // Load project on mount
  useEffect(() => {
    if (projectId) {
      log.info('💬 Loading project for words...', { projectId })
      loadProject(projectId)
    }
  }, [projectId, loadProject])

  // Pre-fill from existing data
  useEffect(() => {
    if (project) {
      // Brand words stored in company_values
      if (project.company_values && Array.isArray(project.company_values)) {
        setBrandWords(project.company_values)
      }
      // Customer words stored in target_audience
      if (project.target_audience && Array.isArray(project.target_audience)) {
        setCustomerWords(project.target_audience)
      }
    }
  }, [project])

  /**
   * ✅ Check if both selections are complete
   */
  const isComplete = () => {
    return brandWords.length >= 5 && customerWords.length >= 5
  }

  /**
   * 💾 Handle continue (save and navigate)
   */
  const handleContinue = async () => {
    if (!isComplete()) {
      log.warn('💬 Word selections incomplete')
      return
    }

    log.info('💾 Saving word selections...', {
      brandWords,
      customerWords,
    })

    try {
      await updateFields({
        // Store brand words in company_values
        company_values: brandWords,
        // Store customer words in target_audience
        target_audience: customerWords,
        // Update progress
        current_step: 'style',
      })

      log.success('✅ Words saved!')

      // Navigate to next step
      router.push(`/onboard/${projectId}/style`)
    } catch (err) {
      log.error('❌ Failed to save words', err)
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
      currentStep="words"
      title="Words that feel like your brand"
      subtitle="Pick words from each section — this helps us understand your voice"
      onContinue={handleContinue}
      isContinueLoading={isSaving}
      isContinueDisabled={!isComplete()}
    >
      <div className="space-y-10">
        {/* Brand Personality Words */}
        <WordBankSelector
          title="Brand Personality"
          description="Pick 5-7 words that describe how you want your brand to feel"
          categories={BRAND_WORD_CATEGORIES}
          selectedWords={brandWords}
          onSelectionChange={setBrandWords}
          minSelections={5}
          maxSelections={7}
          wordsPerCategory={6}
        />

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Customer Descriptor Words */}
        <WordBankSelector
          title="Your Ideal Customer"
          description="Pick 5-7 words that describe who you serve"
          categories={CUSTOMER_WORD_CATEGORIES}
          selectedWords={customerWords}
          onSelectionChange={setCustomerWords}
          minSelections={5}
          maxSelections={7}
          wordsPerCategory={6}
        />
      </div>
    </OnboardLayout>
  )
}
