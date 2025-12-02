/**
 * 💡 Inference Reveal Component
 *
 * Shows an AI inference and asks for user confirmation.
 * Users can confirm, reject, or edit the inference.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, X, Edit3, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InferenceRevealInteraction } from '@/lib/types';

// ============================================
// 📦 Props
// ============================================

interface InferenceRevealProps {
  interaction: InferenceRevealInteraction;
  onRespond: (action: 'confirm' | 'reject' | 'edit', editedValue?: string) => void;
  isSubmitting?: boolean;
}

// ============================================
// 🎨 Component
// ============================================

export function InferenceReveal({
  interaction,
  onRespond,
  isSubmitting,
}: InferenceRevealProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [editValue, setEditValue] = useState(interaction.inferredValue);

  const { fieldName, displayText, confidence } = interaction;

  /**
   * Get confidence color.
   */
  const getConfidenceColor = () => {
    switch (confidence) {
      case 'high':
        return 'text-success-600';
      case 'medium':
        return 'text-amber-600';
      case 'low':
        return 'text-gray-500';
    }
  };

  /**
   * Handle edit submit.
   */
  const handleEditSubmit = () => {
    if (editValue.trim() && !isSubmitting) {
      onRespond('edit', editValue.trim());
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl border border-primary-100 shadow-sm p-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-2 text-primary-600 mb-3">
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">Here's what I'm picking up...</span>
      </div>

      {/* Field name */}
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
        {fieldName}
      </p>

      <AnimatePresence mode="wait">
        {mode === 'view' ? (
          <motion.div
            key="view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Inferred value */}
            <blockquote className="text-gray-800 text-lg leading-relaxed border-l-4 border-primary-300 pl-4 py-1 mb-4">
              "{displayText}"
            </blockquote>

            {/* Confidence indicator */}
            <p className={cn('text-xs mb-4', getConfidenceColor())}>
              {confidence === 'high' && '✨ High confidence'}
              {confidence === 'medium' && '💭 Medium confidence'}
              {confidence === 'low' && '🤔 Just a guess'}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onRespond('confirm')}
                disabled={isSubmitting}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                  'bg-success-500 text-white hover:bg-success-600 active:scale-95',
                  isSubmitting && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Check className="w-4 h-4" />
                That's it!
              </button>

              <button
                onClick={() => setMode('edit')}
                disabled={isSubmitting}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                  'bg-amber-100 text-amber-700 hover:bg-amber-200 active:scale-95',
                  isSubmitting && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Edit3 className="w-4 h-4" />
                Close, but...
              </button>

              <button
                onClick={() => onRespond('reject')}
                disabled={isSubmitting}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                  'bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95',
                  isSubmitting && 'opacity-50 cursor-not-allowed'
                )}
              >
                <X className="w-4 h-4" />
                Not quite
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Edit input */}
            <p className="text-sm text-gray-600 mb-2">
              How would you describe it?
            </p>
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Type your version..."
              rows={3}
              className={cn(
                'w-full px-4 py-3 rounded-xl border border-gray-200',
                'text-gray-800 placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                'resize-none'
              )}
            />

            {/* Edit actions */}
            <div className="flex justify-between mt-3">
              <button
                onClick={() => setMode('view')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>

              <button
                onClick={handleEditSubmit}
                disabled={!editValue.trim() || isSubmitting}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                  'bg-primary-600 text-white hover:bg-primary-700 active:scale-95',
                  (!editValue.trim() || isSubmitting) && 'opacity-50 cursor-not-allowed'
                )}
              >
                Save
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
