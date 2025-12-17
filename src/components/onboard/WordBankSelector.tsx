/**
 * 🏷️ WORD BANK SELECTOR
 * =====================
 * Reusable word selection component for picking brand/customer words.
 *
 * Features:
 * - Grid of selectable chips
 * - Min/max selection enforcement
 * - Category headers
 * - Satisfying selection animations
 * - Selected words summary
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Chip } from '@/components/ui/Chip'
import { RefreshCw } from 'lucide-react'
import { shuffleArray } from '@/lib/config/wordBanks'

// ============================================
// 📋 TYPES
// ============================================

export interface WordCategory {
  id: string
  label: string
  emoji: string
  words: string[]
}

export interface WordBankSelectorProps {
  /** Section title */
  title: string
  /** Section description */
  description: string
  /** Word categories to display */
  categories: WordCategory[]
  /** Currently selected words */
  selectedWords: string[]
  /** Callback when selection changes */
  onSelectionChange: (words: string[]) => void
  /** Minimum words to select */
  minSelections?: number
  /** Maximum words to select */
  maxSelections?: number
  /** Number of words to show per category initially */
  wordsPerCategory?: number
}

// ============================================
// 🏷️ WORD CHIP
// ============================================

interface SelectableWordChipProps {
  word: string
  isSelected: boolean
  isDisabled: boolean
  onClick: () => void
}

function SelectableWordChip({
  word,
  isSelected,
  isDisabled,
  onClick,
}: SelectableWordChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled && !isSelected}
      className={cn(
        'px-4 py-2 rounded-full text-sm font-medium',
        'border-2 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',

        // Selected state
        isSelected && [
          'bg-primary-100 border-primary-500 text-primary-700',
          'shadow-sm scale-105',
        ],

        // Unselected state
        !isSelected &&
          !isDisabled && [
            'bg-white border-gray-200 text-gray-700',
            'hover:border-gray-300 hover:bg-gray-50',
          ],

        // Disabled state (max reached)
        !isSelected &&
          isDisabled && [
            'bg-gray-50 border-gray-100 text-gray-400',
            'cursor-not-allowed',
          ]
      )}
    >
      {word}
    </button>
  )
}

// ============================================
// 📂 CATEGORY SECTION
// ============================================

interface CategorySectionProps {
  category: WordCategory
  selectedWords: string[]
  onToggle: (word: string) => void
  isMaxReached: boolean
  wordsToShow: string[]
  onShuffle: () => void
}

function CategorySection({
  category,
  selectedWords,
  onToggle,
  isMaxReached,
  wordsToShow,
  onShuffle,
}: CategorySectionProps) {
  return (
    <div className="space-y-3">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <span>{category.emoji}</span>
          {category.label}
        </h4>

        {/* Shuffle Button */}
        <button
          type="button"
          onClick={onShuffle}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Shuffle
        </button>
      </div>

      {/* Words Grid */}
      <div className="flex flex-wrap gap-2">
        {wordsToShow.map((word) => (
          <SelectableWordChip
            key={word}
            word={word}
            isSelected={selectedWords.includes(word)}
            isDisabled={isMaxReached}
            onClick={() => onToggle(word)}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================
// 📊 SELECTION SUMMARY
// ============================================

interface SelectionSummaryProps {
  selectedWords: string[]
  minSelections: number
  maxSelections: number
  onRemove: (word: string) => void
}

function SelectionSummary({
  selectedWords,
  minSelections,
  maxSelections,
  onRemove,
}: SelectionSummaryProps) {
  const count = selectedWords.length
  const isComplete = count >= minSelections

  return (
    <div className="sticky bottom-0 p-4 bg-white border-t border-gray-200 rounded-b-xl">
      {/* Count */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-600">
          Selected ({count} of {minSelections}-{maxSelections})
        </span>
        {isComplete && (
          <span className="text-sm font-medium text-green-600">✓ Ready</span>
        )}
      </div>

      {/* Selected Words */}
      {selectedWords.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedWords.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => onRemove(word)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium',
                'bg-primary-100 text-primary-700 border border-primary-200',
                'hover:bg-primary-200 transition-colors',
                'flex items-center gap-1.5'
              )}
            >
              {word}
              <span className="text-primary-400 hover:text-primary-600">×</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">
          Click words above to select them
        </p>
      )}
    </div>
  )
}

// ============================================
// 🎨 MAIN COMPONENT
// ============================================

export function WordBankSelector({
  title,
  description,
  categories,
  selectedWords,
  onSelectionChange,
  minSelections = 5,
  maxSelections = 7,
  wordsPerCategory = 8,
}: WordBankSelectorProps) {
  // Track shuffled words per category
  const [shuffledCategories, setShuffledCategories] = useState<
    Record<string, string[]>
  >(() => {
    const initial: Record<string, string[]> = {}
    categories.forEach((cat) => {
      initial[cat.id] = shuffleArray(cat.words).slice(0, wordsPerCategory)
    })
    return initial
  })

  /**
   * 🔄 Toggle word selection
   */
  const handleToggle = (word: string) => {
    if (selectedWords.includes(word)) {
      // Remove
      onSelectionChange(selectedWords.filter((w) => w !== word))
    } else if (selectedWords.length < maxSelections) {
      // Add
      onSelectionChange([...selectedWords, word])
    }
  }

  /**
   * ❌ Remove a word
   */
  const handleRemove = (word: string) => {
    onSelectionChange(selectedWords.filter((w) => w !== word))
  }

  /**
   * 🔀 Shuffle a category
   */
  const handleShuffle = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    // Keep selected words, shuffle the rest
    const selectedInCategory = selectedWords.filter((w) =>
      category.words.includes(w)
    )
    const available = category.words.filter((w) => !selectedWords.includes(w))
    const shuffled = shuffleArray(available)
    const toShow = shuffled.slice(0, wordsPerCategory - selectedInCategory.length)

    setShuffledCategories((prev) => ({
      ...prev,
      [categoryId]: [...selectedInCategory, ...toShow],
    }))
  }

  const isMaxReached = selectedWords.length >= maxSelections

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>

      {/* Categories */}
      <div className="space-y-6 bg-gray-50 p-6 rounded-t-xl border border-gray-200 border-b-0">
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            selectedWords={selectedWords}
            onToggle={handleToggle}
            isMaxReached={isMaxReached}
            wordsToShow={shuffledCategories[category.id] || category.words.slice(0, wordsPerCategory)}
            onShuffle={() => handleShuffle(category.id)}
          />
        ))}
      </div>

      {/* Selection Summary */}
      <SelectionSummary
        selectedWords={selectedWords}
        minSelections={minSelections}
        maxSelections={maxSelections}
        onRemove={handleRemove}
      />
    </div>
  )
}
