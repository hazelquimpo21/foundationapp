/**
 * 🚀 ONBOARDING CONFIGURATION
 * ===========================
 * Central config for the structured onboarding flow.
 *
 * Philosophy: Structure over open-ended questions.
 * Users fill in blanks, select from word banks, and use sliders.
 * This reduces cognitive load and produces better data.
 *
 * @see /AI_Dev_Docs/01-PRODUCT-OVERVIEW.md for design philosophy
 */

// ============================================
// 📍 STEP DEFINITIONS
// ============================================

export type OnboardStep =
  | 'new'       // Project type selection
  | 'setup'     // Basic info (name, size, role)
  | 'assets'    // Website & LinkedIn (optional)
  | 'story'     // Mad Libs narrative
  | 'words'     // Word bank selections
  | 'style'     // Preference sliders
  | 'hub'       // Analysis dashboard
  | 'done'      // Completion & summary

export interface StepConfig {
  id: OnboardStep
  path: string
  label: string
  shortLabel: string
  emoji: string
  description: string
  isOptional: boolean
  order: number
}

/**
 * 📋 All onboarding steps in order
 * Note: 'new' doesn't appear in the indicator (it's before project creation)
 */
export const ONBOARD_STEPS: StepConfig[] = [
  {
    id: 'setup',
    path: 'setup',
    label: 'The Basics',
    shortLabel: 'Setup',
    emoji: '📝',
    description: 'Name your brand and tell us about yourself',
    isOptional: false,
    order: 1,
  },
  {
    id: 'assets',
    path: 'assets',
    label: 'Your Assets',
    shortLabel: 'Assets',
    emoji: '🔗',
    description: 'Share your website and existing materials',
    isOptional: true,
    order: 2,
  },
  {
    id: 'story',
    path: 'story',
    label: 'Your Story',
    shortLabel: 'Story',
    emoji: '📖',
    description: 'Tell us your brand story (fill in the blanks!)',
    isOptional: false,
    order: 3,
  },
  {
    id: 'words',
    path: 'words',
    label: 'Brand Words',
    shortLabel: 'Words',
    emoji: '💬',
    description: 'Pick words that feel like your brand',
    isOptional: false,
    order: 4,
  },
  {
    id: 'style',
    path: 'style',
    label: 'Your Style',
    shortLabel: 'Style',
    emoji: '🎨',
    description: 'Set your communication preferences',
    isOptional: true,
    order: 5,
  },
  {
    id: 'hub',
    path: 'hub',
    label: 'Analysis Hub',
    shortLabel: 'Hub',
    emoji: '🔮',
    description: 'See what AI discovered about your brand',
    isOptional: false,
    order: 6,
  },
  {
    id: 'done',
    path: 'done',
    label: 'Complete!',
    shortLabel: 'Done',
    emoji: '✨',
    description: 'Your brand foundation is ready',
    isOptional: false,
    order: 7,
  },
]

/**
 * 🔍 Get a step config by ID
 */
export function getStepConfig(stepId: OnboardStep): StepConfig | undefined {
  return ONBOARD_STEPS.find(s => s.id === stepId)
}

/**
 * ⏭️ Get the next step in the flow
 */
export function getNextStep(currentStep: OnboardStep): StepConfig | undefined {
  const currentIndex = ONBOARD_STEPS.findIndex(s => s.id === currentStep)
  if (currentIndex === -1 || currentIndex >= ONBOARD_STEPS.length - 1) {
    return undefined
  }
  return ONBOARD_STEPS[currentIndex + 1]
}

/**
 * ⏮️ Get the previous step in the flow
 */
export function getPreviousStep(currentStep: OnboardStep): StepConfig | undefined {
  const currentIndex = ONBOARD_STEPS.findIndex(s => s.id === currentStep)
  if (currentIndex <= 0) {
    return undefined
  }
  return ONBOARD_STEPS[currentIndex - 1]
}

/**
 * 📊 Get current step index (1-based for display)
 */
export function getStepIndex(stepId: OnboardStep): number {
  const step = ONBOARD_STEPS.find(s => s.id === stepId)
  return step?.order ?? 0
}

// ============================================
// 🏢 COMPANY SIZE OPTIONS
// ============================================

export interface CompanySizeOption {
  value: string
  label: string
  description: string
  emoji: string
}

export const COMPANY_SIZE_OPTIONS: CompanySizeOption[] = [
  { value: 'idea', label: 'Just an idea', description: 'Not started yet', emoji: '💭' },
  { value: 'solo', label: 'Solopreneur', description: 'Just me', emoji: '🧑' },
  { value: 'micro', label: '2-10 people', description: 'Small team', emoji: '👥' },
  { value: 'small', label: '11-50 people', description: 'Growing company', emoji: '🏢' },
  { value: 'medium', label: '51-200 people', description: 'Established business', emoji: '🏛️' },
  { value: 'large', label: '201+ people', description: 'Large organization', emoji: '🌆' },
]

// ============================================
// 👔 ROLE SUGGESTIONS
// ============================================

export const ROLE_SUGGESTIONS = [
  'Founder',
  'Co-Founder',
  'CEO',
  'Owner',
  'Creative Director',
  'Marketing Director',
  'Brand Strategist',
  'Consultant',
  'Freelancer',
  'Head of Marketing',
  'Managing Director',
  'Partner',
]

// ============================================
// 📝 MAD LIBS TEMPLATES
// ============================================

/**
 * Mad Libs Level 1 - The core narrative
 * These are fill-in-the-blank prompts that feel natural to complete.
 *
 * Field mappings to existing database:
 * - repName → maps to member.name (or stored separately)
 * - repRole → stored in project
 * - brandName → project_name / idea_name
 * - brandLocation → stored in project metadata
 * - yearFounded → stored in project metadata
 * - foundingReason → one_liner or problem_statement
 * - customerDescription → target_audience (converted to string)
 * - coreOffering → one_liner or secret_sauce
 */
export interface MadLibField {
  id: string
  placeholder: string
  hint: string
  width: 'sm' | 'md' | 'lg' | 'xl'
  type: 'text' | 'number' | 'year'
  maxLength?: number
}

export const MAD_LIBS_FIELDS: MadLibField[] = [
  { id: 'repName', placeholder: 'your name', hint: 'e.g., Jordan Smith', width: 'md', type: 'text' },
  { id: 'repRole', placeholder: 'your role', hint: 'e.g., Founder', width: 'md', type: 'text' },
  { id: 'brandName', placeholder: 'brand/business name', hint: 'e.g., Acme Coaching', width: 'lg', type: 'text' },
  { id: 'brandLocation', placeholder: 'city, state', hint: 'e.g., Austin, TX', width: 'md', type: 'text' },
  { id: 'yearFounded', placeholder: 'year', hint: 'e.g., 2021', width: 'sm', type: 'year', maxLength: 4 },
  { id: 'foundingReason', placeholder: 'why you started this', hint: 'e.g., too many people felt stuck', width: 'xl', type: 'text' },
  { id: 'customerDescription', placeholder: 'who you serve', hint: 'e.g., busy professionals ready for change', width: 'lg', type: 'text' },
  { id: 'coreOffering', placeholder: 'what you do for them', hint: 'e.g., coaching and accountability', width: 'xl', type: 'text' },
]

/**
 * The Mad Libs paragraph template
 * {{fieldId}} markers get replaced with inline inputs
 */
export const MAD_LIBS_TEMPLATE = `My name is {{repName}} and I'm the {{repRole}} at {{brandName}}.

We're based in {{brandLocation}} and started in {{yearFounded}}.

We exist because {{foundingReason}}.

In simple terms, we help {{customerDescription}} by {{coreOffering}}.`

// ============================================
// 🎚️ SLIDER CONFIGURATIONS
// ============================================

export interface SliderConfig {
  id: string
  label: string
  description: string
  leftLabel: string
  rightLabel: string
  defaultValue: number
  descriptions: Record<number, string>
}

export const SLIDER_CONFIGS: SliderConfig[] = [
  {
    id: 'commStyle',
    label: 'Communication Style',
    description: 'How do you want to sound?',
    leftLabel: 'Formal',
    rightLabel: 'Casual',
    defaultValue: 3,
    descriptions: {
      1: 'Highly professional and formal',
      2: 'Professional with some warmth',
      3: 'Balanced - professional yet approachable',
      4: 'Friendly and conversational',
      5: 'Very casual and personal',
    },
  },
  {
    id: 'pricePosition',
    label: 'Price Positioning',
    description: 'Where do you sit in the market?',
    leftLabel: 'Budget',
    rightLabel: 'Premium',
    defaultValue: 3,
    descriptions: {
      1: 'Most affordable option in market',
      2: 'Value-focused pricing',
      3: 'Mid-market positioning',
      4: 'Upper mid-range',
      5: 'Premium/luxury positioning',
    },
  },
]

// ============================================
// 🎯 PROJECT TYPE OPTIONS
// ============================================

export interface ProjectTypeOption {
  value: 'primary' | 'portfolio'
  label: string
  description: string
  emoji: string
}

export const PROJECT_TYPE_OPTIONS: ProjectTypeOption[] = [
  {
    value: 'primary',
    label: 'My Brand',
    description: 'Define your own business',
    emoji: '🏠',
  },
  {
    value: 'portfolio',
    label: 'Client Brand',
    description: "A brand you're working with",
    emoji: '📁',
  },
]

// ============================================
// 🔄 FIELD MAPPINGS
// ============================================

/**
 * Maps our onboarding fields to the existing database schema.
 * This lets us build the new UX without database migrations!
 *
 * The existing BusinessProject schema has these fields we can use:
 * - project_name → brand name
 * - idea_name → brand name (display)
 * - one_liner → founding reason + core offering combined
 * - target_audience → customer words (array)
 * - problem_statement → founding reason
 * - secret_sauce → core offering / unique approach
 * - company_values → brand personality words
 * - validation_status → can use existing enum
 * - customer_type → B2B/B2C (existing)
 *
 * For new fields, we use the metadata pattern or add them later.
 */
export const FIELD_MAPPINGS = {
  // Setup page
  brandName: 'idea_name',        // Primary display name
  companySize: 'team_size',      // Uses existing team_size field
  repRole: 'current_step',       // Temporarily store in unused field (or metadata)

  // Story page (Mad Libs)
  foundingReason: 'problem_statement',
  coreOffering: 'secret_sauce',
  customerDescription: 'one_liner',  // We'll parse this intelligently

  // Words page
  brandWords: 'company_values',
  customerWords: 'target_audience',

  // Style page
  commStyle: 'pricing_tier',         // Reuse slider field
  pricePosition: 'differentiation_score',  // Reuse slider field

  // Assets page
  websiteUrl: 'positioning',     // Store URL in text field for now
  linkedinUrl: 'north_star_metric',  // Store URL in text field for now
} as const
