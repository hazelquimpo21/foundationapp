/**
 * ⚖️ Binary Choice Component
 *
 * Two-option selection (this or that).
 * Can optionally allow "both" or "neither".
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BinaryChoiceInteraction } from '@/lib/types';

// ============================================
// 📦 Props
// ============================================

interface BinaryChoiceProps {
  interaction: BinaryChoiceInteraction;
  onSubmit: (choice: string) => void;
  isSubmitting?: boolean;
}

// ============================================
// 🎨 Component
// ============================================

export function BinaryChoice({
  interaction,
  onSubmit,
  isSubmitting,
}: BinaryChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const { prompt, optionA, optionB, allowMiddle } = interaction;

  /**
   * Handle option selection.
   */
  const selectOption = (value: string) => {
    setSelected(value);
  };

  /**
   * Handle submit.
   */
  const handleSubmit = () => {
    if (selected && !isSubmitting) {
      onSubmit(selected);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-slide-up">
      {/* Prompt */}
      <p className="text-gray-800 font-medium mb-4">{prompt}</p>

      {/* Options */}
      <div className="space-y-3">
        {/* Option A */}
        <ChoiceCard
          value={optionA.value}
          label={optionA.label}
          description={optionA.description}
          isSelected={selected === optionA.value}
          onClick={() => selectOption(optionA.value)}
        />

        {/* Option B */}
        <ChoiceCard
          value={optionB.value}
          label={optionB.label}
          description={optionB.description}
          isSelected={selected === optionB.value}
          onClick={() => selectOption(optionB.value)}
        />

        {/* Middle option (both) */}
        {allowMiddle && (
          <ChoiceCard
            value="both"
            label="A bit of both"
            isSelected={selected === 'both'}
            onClick={() => selectOption('both')}
            isSubtle
          />
        )}
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!selected || isSubmitting}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all',
            selected
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
// 🃏 Choice Card
// ============================================

interface ChoiceCardProps {
  value: string;
  label: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
  isSubtle?: boolean;
}

function ChoiceCard({
  label,
  description,
  isSelected,
  onClick,
  isSubtle,
}: ChoiceCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'w-full text-left p-4 rounded-xl border-2 transition-all',
        isSelected
          ? 'bg-primary-50 border-primary-500'
          : 'bg-white border-gray-200 hover:border-gray-300',
        isSubtle && !isSelected && 'border-dashed'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={cn(
              'font-medium',
              isSelected ? 'text-primary-700' : 'text-gray-800',
              isSubtle && !isSelected && 'text-gray-500'
            )}
          >
            {label}
          </p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>

        {/* Selection indicator */}
        <div
          className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
            isSelected
              ? 'bg-primary-500 border-primary-500'
              : 'border-gray-300'
          )}
        >
          {isSelected && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>
    </motion.button>
  );
}
