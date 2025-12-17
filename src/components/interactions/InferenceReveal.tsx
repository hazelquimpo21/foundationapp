/**
 * 💡 INFERENCE REVEAL COMPONENT
 * =============================
 * Shows AI inference with accept/reject/edit options.
 * Key component for conversational inference flow.
 *
 * Usage:
 *   <InferenceReveal
 *     title="I noticed something..."
 *     inference="Your target audience seems to value..."
 *     onAccept={() => handleAccept()}
 *     onReject={() => handleReject()}
 *     onEdit={(edited) => handleEdit(edited)}
 *   />
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import {
  Lightbulb,
  Check,
  X,
  Pencil,
  Sparkles,
} from 'lucide-react'

export interface InferenceRevealProps {
  /** Title/header for the inference */
  title?: string
  /** The AI's inference text */
  inference: string
  /** The field this inference relates to */
  field?: string
  /** Callback when user accepts */
  onAccept: () => void
  /** Callback when user rejects */
  onReject: () => void
  /** Callback when user edits (optional) */
  onEdit?: (editedText: string) => void
  /** Confidence level (0-1) */
  confidence?: number
  /** Disabled state */
  disabled?: boolean
  /** Additional class names */
  className?: string
}

export function InferenceReveal({
  title = "Here's what I'm picking up...",
  inference,
  field,
  onAccept,
  onReject,
  onEdit,
  confidence,
  disabled = false,
  className,
}: InferenceRevealProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(inference)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    if (onEdit && editedText.trim()) {
      onEdit(editedText.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedText(inference)
    setIsEditing(false)
  }

  return (
    <div
      className={cn(
        'rounded-2xl border-2 border-accent-200 bg-accent-50/50 p-5',
        'animate-fade-in',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-accent-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            {title}
            <Sparkles className="w-4 h-4 text-accent-500" />
          </h4>
          {field && (
            <p className="text-sm text-gray-500">
              For: <span className="font-medium">{field}</span>
            </p>
          )}
        </div>
        {confidence !== undefined && (
          <div
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              confidence > 0.8
                ? 'bg-success/10 text-success'
                : confidence > 0.5
                ? 'bg-warning/10 text-warning'
                : 'bg-gray-100 text-gray-600'
            )}
          >
            {Math.round(confidence * 100)}% confident
          </div>
        )}
      </div>

      {/* Inference content */}
      <div className="mb-4">
        {isEditing ? (
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            autoResize
            minRows={2}
            maxRows={6}
            className="bg-white"
          />
        ) : (
          <div className="p-4 rounded-xl bg-white border border-accent-200">
            <p className="text-gray-800 whitespace-pre-wrap">{inference}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {isEditing ? (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveEdit}
              disabled={!editedText.trim() || disabled}
            >
              <Check className="w-4 h-4" />
              Save Changes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              disabled={disabled}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={onAccept}
              disabled={disabled}
            >
              <Check className="w-4 h-4" />
              That's right!
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReject}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
              Not quite
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                disabled={disabled}
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/**
 * 🔄 Quick Confirm Component
 * Simpler inline confirmation for smaller inferences
 */
export function QuickConfirm({
  text,
  onConfirm,
  onDeny,
  className,
}: {
  text: string
  onConfirm: () => void
  onDeny: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-full',
        'bg-gray-100 text-sm text-gray-700',
        'animate-fade-in',
        className
      )}
    >
      <span>{text}</span>
      <button
        onClick={onConfirm}
        className="p-1 rounded-full bg-success/20 text-success hover:bg-success/30 transition-colors"
        aria-label="Confirm"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onDeny}
        className="p-1 rounded-full bg-error/20 text-error hover:bg-error/30 transition-colors"
        aria-label="Deny"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
