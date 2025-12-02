/**
 * 🏷️ Word Bank Component
 *
 * Interactive word selection interface.
 * Users can select multiple words from categorized options.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WordBankInteraction, WordOption, WordCategory } from '@/lib/types';

// ============================================
// 📦 Props
// ============================================

interface WordBankProps {
  interaction: WordBankInteraction;
  onSubmit: (selectedWords: string[]) => void;
  isSubmitting?: boolean;
}

// ============================================
// 🎨 Component
// ============================================

export function WordBank({ interaction, onSubmit, isSubmitting }: WordBankProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const { prompt, words, selectionRange, categories } = interaction;
  const { min, max } = selectionRange;

  /**
   * Toggle word selection.
   */
  const toggleWord = (value: string) => {
    setSelected((prev) => {
      if (prev.includes(value)) {
        return prev.filter((w) => w !== value);
      }
      if (prev.length >= max) {
        return prev; // Max reached
      }
      return [...prev, value];
    });
  };

  /**
   * Check if submission is valid.
   */
  const isValid = selected.length >= min && selected.length <= max;

  /**
   * Handle submit.
   */
  const handleSubmit = () => {
    if (isValid && !isSubmitting) {
      onSubmit(selected);
    }
  };

  // Group words by category if categories exist
  const groupedWords = categories
    ? categories.map((cat) => ({
        ...cat,
        words: words.filter((w) => w.category === cat.id),
      }))
    : [{ id: 'all', label: '', words }];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-slide-up">
      {/* Prompt */}
      <p className="text-gray-800 font-medium mb-4">{prompt}</p>

      {/* Selection hint */}
      <p className="text-sm text-gray-500 mb-4">
        Select {min === max ? min : `${min}-${max}`} options
        <span className="ml-2 text-primary-600">
          ({selected.length} selected)
        </span>
      </p>

      {/* Word Groups */}
      <div className="space-y-4">
        {groupedWords.map((group) => (
          <div key={group.id}>
            {/* Category Label */}
            {group.label && (
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                {group.label}
              </p>
            )}

            {/* Words */}
            <div className="flex flex-wrap gap-2">
              {group.words.map((word) => (
                <WordChip
                  key={word.value}
                  word={word}
                  isSelected={selected.includes(word.value)}
                  isDisabled={
                    selected.length >= max && !selected.includes(word.value)
                  }
                  onClick={() => toggleWord(word.value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all',
            isValid
              ? 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <>Processing...</>
          ) : (
            <>
              Continue
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================
// 🏷️ Word Chip
// ============================================

interface WordChipProps {
  word: WordOption;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function WordChip({ word, isSelected, isDisabled, onClick }: WordChipProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      className={cn(
        'px-4 py-2 rounded-full text-sm font-medium transition-all',
        'border-2',
        isSelected
          ? 'bg-primary-50 border-primary-500 text-primary-700'
          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300',
        isDisabled && !isSelected && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span className="flex items-center gap-2">
        {word.label}
        <AnimatePresence>
          {isSelected && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check className="w-4 h-4 text-primary-600" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
