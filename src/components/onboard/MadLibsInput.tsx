/**
 * 📝 MAD LIBS INPUT COMPONENTS
 * ============================
 * Fill-in-the-blank style inputs for capturing brand narrative.
 *
 * Philosophy: Structure over open-ended questions.
 * Users fill in blanks, which feels easier than staring at empty forms.
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { MAD_LIBS_FIELDS, type MadLibField } from '@/lib/config/onboarding'

// ============================================
// 📋 TYPES
// ============================================

export interface MadLibsInputProps {
  /** The field configuration */
  field: MadLibField
  /** Current value */
  value: string
  /** Change handler */
  onChange: (value: string) => void
  /** Focus handler */
  onFocus?: () => void
  /** Blur handler */
  onBlur?: () => void
  /** Whether this field has an error */
  hasError?: boolean
}

export interface MadLibsParagraphProps {
  /** All field values */
  values: Record<string, string>
  /** Change handler for a specific field */
  onChange: (fieldId: string, value: string) => void
  /** Which fields have errors */
  errors?: Record<string, boolean>
  /** The currently focused field */
  focusedField?: string
  /** Handler when a field is focused */
  onFieldFocus?: (fieldId: string) => void
}

// ============================================
// 📝 SINGLE MAD LIBS INPUT
// ============================================

/**
 * An inline input field that blends into the paragraph text.
 * Features:
 * - Subtle underline styling
 * - Auto-width based on content
 * - Placeholder hint
 * - Error state
 */
export function MadLibsInput({
  field,
  value,
  onChange,
  onFocus,
  onBlur,
  hasError = false,
}: MadLibsInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Auto-resize input based on content
  const getInputWidth = () => {
    const baseWidth = {
      sm: 80,
      md: 150,
      lg: 220,
      xl: 300,
    }
    const charWidth = 10 // Approximate pixels per character
    const contentWidth = value.length * charWidth
    return Math.max(baseWidth[field.width], contentWidth + 20)
  }

  const handleFocus = () => {
    setIsFocused(true)
    onFocus?.()
  }

  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value

    // Special handling for year input
    if (field.type === 'year') {
      newValue = newValue.replace(/\D/g, '').slice(0, 4)
    }

    onChange(newValue)
  }

  return (
    <span className="relative inline-block align-baseline">
      <input
        ref={inputRef}
        type={field.type === 'year' ? 'text' : field.type}
        inputMode={field.type === 'year' ? 'numeric' : undefined}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        style={{ width: getInputWidth() }}
        className={cn(
          // Base styles
          'inline-block px-2 py-1 rounded',
          'text-inherit font-medium placeholder-gray-400',
          'border-b-2 bg-transparent',
          'transition-all duration-200',
          'focus:outline-none',

          // Normal state
          !hasError && !isFocused && 'border-gray-300',

          // Focused state
          !hasError && isFocused && 'border-primary-500 bg-primary-50/30',

          // Error state
          hasError && 'border-red-400 bg-red-50/30',

          // Filled state
          value && !isFocused && !hasError && 'border-primary-200 bg-primary-50/20'
        )}
        aria-label={field.placeholder}
      />

      {/* Floating hint (shown on focus when empty) */}
      {isFocused && !value && (
        <span className="absolute left-0 -bottom-6 text-xs text-gray-400 whitespace-nowrap">
          {field.hint}
        </span>
      )}
    </span>
  )
}

// ============================================
// 📖 MAD LIBS PARAGRAPH
// ============================================

/**
 * The complete Mad Libs paragraph with inline inputs.
 * Parses the template and replaces {{fieldId}} markers with inputs.
 */
export function MadLibsParagraph({
  values,
  onChange,
  errors = {},
  focusedField,
  onFieldFocus,
}: MadLibsParagraphProps) {
  // Get field config by ID
  const getField = (fieldId: string): MadLibField | undefined => {
    return MAD_LIBS_FIELDS.find(f => f.id === fieldId)
  }

  // Build the paragraph with inputs
  // Split by {{fieldId}} patterns
  const template = `My name is {{repName}} and I'm the {{repRole}} at {{brandName}}.

We're based in {{brandLocation}} and started in {{yearFounded}}.

We exist because {{foundingReason}}.

In simple terms, we help {{customerDescription}} by {{coreOffering}}.`

  // Parse template into parts
  const parts: Array<{ type: 'text' | 'input'; content: string }> = []
  let remaining = template

  const regex = /\{\{(\w+)\}\}/g
  let match
  let lastIndex = 0

  while ((match = regex.exec(template)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: template.slice(lastIndex, match.index),
      })
    }

    // Add input
    parts.push({
      type: 'input',
      content: match[1], // Field ID
    })

    lastIndex = regex.lastIndex
  }

  // Add remaining text
  if (lastIndex < template.length) {
    parts.push({
      type: 'text',
      content: template.slice(lastIndex),
    })
  }

  return (
    <div className="text-lg leading-relaxed text-gray-700 space-y-6">
      {parts.map((part, index) => {
        if (part.type === 'text') {
          // Handle newlines in text
          return part.content.split('\n\n').map((paragraph, pIndex) => (
            <span key={`${index}-${pIndex}`}>
              {pIndex > 0 && <br className="block h-4" />}
              {paragraph}
            </span>
          ))
        }

        // Render input
        const field = getField(part.content)
        if (!field) return null

        return (
          <MadLibsInput
            key={index}
            field={field}
            value={values[field.id] || ''}
            onChange={(value) => onChange(field.id, value)}
            hasError={errors[field.id]}
            onFocus={() => onFieldFocus?.(field.id)}
          />
        )
      })}
    </div>
  )
}

// ============================================
// 📊 COMPLETION INDICATOR
// ============================================

interface CompletionIndicatorProps {
  values: Record<string, string>
  requiredFields: string[]
}

export function MadLibsCompletionIndicator({
  values,
  requiredFields,
}: CompletionIndicatorProps) {
  const filledCount = requiredFields.filter(
    (fieldId) => values[fieldId]?.trim()
  ).length
  const totalCount = requiredFields.length
  const percentage = Math.round((filledCount / totalCount) * 100)

  return (
    <div className="flex items-center gap-3 text-sm">
      {/* Progress bar */}
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            percentage === 100 ? 'bg-green-500' : 'bg-primary-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Count */}
      <span className="text-gray-500 whitespace-nowrap">
        {filledCount} of {totalCount} filled
      </span>

      {/* Complete indicator */}
      {percentage === 100 && (
        <span className="text-green-600 font-medium">✓ Complete</span>
      )}
    </div>
  )
}
