/**
 * 📚 WORD BANK COMPONENT
 * ======================
 * Multi-select word picker with categories and shuffle.
 * Key component for overcoming blank page syndrome.
 *
 * Usage:
 *   <WordBank
 *     config={TARGET_AUDIENCE_BANK}
 *     selected={selected}
 *     onChange={setSelected}
 *     onSubmit={handleSubmit}
 *   />
 */

'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { Shuffle, Check } from 'lucide-react'
import type { WordBankConfig } from '@/lib/types'
import { shuffleArray } from '@/lib/config/wordBanks'

export interface WordBankProps {
  /** Word bank configuration */
  config: WordBankConfig
  /** Currently selected words */
  selected: string[]
  /** Callback when selection changes */
  onChange: (selected: string[]) => void
  /** Callback when user confirms selection */
  onSubmit?: (selected: string[]) => void
  /** Disabled state */
  disabled?: boolean
  /** Additional class names */
  className?: string
  /** Number of words to show per category */
  wordsPerCategory?: number
}

export function WordBank({
  config,
  selected,
  onChange,
  onSubmit,
  disabled = false,
  className,
  wordsPerCategory = 8,
}: WordBankProps) {
  // Track shuffled words per category
  const [shuffleKey, setShuffleKey] = useState(0)

  // Get visible words for each category (shuffled, preserving selected)
  const visibleWords = useMemo(() => {
    const result: Record<string, string[]> = {}

    config.categories.forEach((category) => {
      // Get selected words from this category
      const selectedInCategory = selected.filter((w) =>
        category.words.includes(w)
      )

      // Get remaining words, shuffle them
      const available = category.words.filter((w) => !selected.includes(w))
      const shuffled = shuffleArray(available)

      // Take first N, but always include selected ones
      const toShow = shuffled.slice(0, wordsPerCategory - selectedInCategory.length)
      result[category.id] = [...selectedInCategory, ...toShow]
    })

    return result
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, shuffleKey, selected.length])

  // Handle word toggle
  const toggleWord = (word: string) => {
    if (disabled) return

    if (selected.includes(word)) {
      // Remove word
      onChange(selected.filter((w) => w !== word))
    } else if (selected.length < config.maxSelections) {
      // Add word
      onChange([...selected, word])
    }
  }

  // Handle shuffle
  const handleShuffle = () => {
    setShuffleKey((k) => k + 1)
  }

  // Check if selection is valid
  const isValid =
    selected.length >= config.minSelections &&
    selected.length <= config.maxSelections

  const canAddMore = selected.length < config.maxSelections

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {config.title}
          </h3>
          <p className="text-sm text-gray-500">{config.description}</p>
        </div>
        <button
          type="button"
          onClick={handleShuffle}
          disabled={disabled}
          className={cn(
            'p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Shuffle words"
        >
          <Shuffle className="w-5 h-5" />
        </button>
      </div>

      {/* Selection counter */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'text-sm font-medium px-3 py-1 rounded-full',
            isValid ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-600'
          )}
        >
          {selected.length} / {config.minSelections}-{config.maxSelections} selected
        </div>
        {!canAddMore && (
          <span className="text-sm text-warning">Max reached</span>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {config.categories.map((category) => (
          <div key={category.id}>
            {/* Category label */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{category.emoji}</span>
              <span className="text-sm font-medium text-gray-700">
                {category.label}
              </span>
            </div>

            {/* Word chips */}
            <ChipGroup>
              {visibleWords[category.id]?.map((word) => (
                <Chip
                  key={word}
                  selected={selected.includes(word)}
                  onClick={() => toggleWord(word)}
                  disabled={
                    disabled ||
                    (!selected.includes(word) && !canAddMore)
                  }
                >
                  {word}
                </Chip>
              ))}
            </ChipGroup>
          </div>
        ))}
      </div>

      {/* Selected preview */}
      {selected.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Your selections:
          </p>
          <ChipGroup>
            {selected.map((word) => (
              <Chip
                key={word}
                selected
                removable
                onRemove={() => toggleWord(word)}
                disabled={disabled}
              >
                {word}
              </Chip>
            ))}
          </ChipGroup>
        </div>
      )}

      {/* Submit button */}
      {onSubmit && (
        <Button
          onClick={() => onSubmit(selected)}
          disabled={!isValid || disabled}
          fullWidth
          className="mt-4"
        >
          <Check className="w-4 h-4" />
          Confirm Selection
        </Button>
      )}
    </div>
  )
}
