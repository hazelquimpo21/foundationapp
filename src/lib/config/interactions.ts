/**
 * 🎛️ INTERACTION CONFIGURATIONS
 * ==============================
 * Sliders, binary choices, and other interactive inputs.
 * These provide structured ways to capture nuanced information.
 */

import type { SliderConfig, BinaryChoiceConfig } from '@/lib/types'

// ============================================
// 📊 SLIDER CONFIGURATIONS
// ============================================

export const PROBLEM_URGENCY_SLIDER: SliderConfig = {
  id: 'problem_urgency',
  label: 'How urgent is this problem?',
  description: 'How badly do people need a solution right now?',
  min: 1,
  max: 5,
  leftLabel: 'Nice to have',
  rightLabel: 'Hair on fire',
  descriptions: {
    1: '😌 Nice to have - People can live without it',
    2: '🤔 Somewhat annoying - But people cope',
    3: '😤 Frustrating - Clear pain point',
    4: '😫 Very painful - Actively seeking solutions',
    5: '🔥 Hair on fire - Must be solved immediately',
  },
  targetField: 'problem_urgency',
}

export const DIFFERENTIATION_SLIDER: SliderConfig = {
  id: 'differentiation_score',
  label: 'How different is your approach?',
  description: 'Compared to existing solutions',
  min: 1,
  max: 5,
  leftLabel: 'Similar',
  rightLabel: 'Unique',
  descriptions: {
    1: '👥 Very similar - Minor improvements',
    2: '📈 Somewhat better - Clear advantages',
    3: '🔄 Different angle - New approach',
    4: '💡 Quite unique - Hard to compare',
    5: '🦄 Category creator - Nothing like it',
  },
  targetField: 'differentiation_score',
}

export const PRICING_TIER_SLIDER: SliderConfig = {
  id: 'pricing_tier',
  label: 'Where do you want to price?',
  description: 'Your position in the market',
  min: 1,
  max: 5,
  leftLabel: 'Free/Cheap',
  rightLabel: 'Premium',
  descriptions: {
    1: '🆓 Free or very cheap - Volume play',
    2: '💵 Budget-friendly - Value positioning',
    3: '⚖️ Mid-market - Competitive pricing',
    4: '💎 Premium - Higher value, fewer customers',
    5: '👑 Enterprise - Top-tier, custom pricing',
  },
  targetField: 'pricing_tier',
}

export const TIMELINE_SLIDER: SliderConfig = {
  id: 'timeline_months',
  label: 'What\'s your target timeline?',
  description: 'How long until you want to launch?',
  min: 1,
  max: 5,
  leftLabel: 'Days',
  rightLabel: 'Years',
  descriptions: {
    1: '⚡ Days to weeks - Ship immediately',
    2: '📅 1-3 months - Quick iteration',
    3: '📆 3-6 months - Solid MVP',
    4: '🗓️ 6-12 months - Full product',
    5: '📊 1+ years - Complex undertaking',
  },
  targetField: 'timeline_months',
}

/** All sliders indexed by field name */
export const SLIDERS: Record<string, SliderConfig> = {
  problem_urgency: PROBLEM_URGENCY_SLIDER,
  differentiation_score: DIFFERENTIATION_SLIDER,
  pricing_tier: PRICING_TIER_SLIDER,
  timeline_months: TIMELINE_SLIDER,
}

// ============================================
// ⚖️ BINARY CHOICE CONFIGURATIONS
// ============================================

export const CUSTOMER_TYPE_CHOICE: BinaryChoiceConfig = {
  id: 'customer_type',
  question: 'Who are your customers?',
  options: [
    {
      value: 'b2b',
      label: 'Businesses',
      description: 'Selling to companies',
      emoji: '🏢',
    },
    {
      value: 'b2c',
      label: 'Consumers',
      description: 'Selling to individuals',
      emoji: '👤',
    },
    {
      value: 'both',
      label: 'Both',
      description: 'Mixed customer base',
      emoji: '🤝',
    },
  ],
  targetField: 'customer_type',
}

export const WHY_NOW_DRIVER_CHOICE: BinaryChoiceConfig = {
  id: 'why_now_driver',
  question: 'What\'s making this possible now?',
  options: [
    {
      value: 'technology',
      label: 'New Technology',
      description: 'AI, mobile, APIs made it possible',
      emoji: '🤖',
    },
    {
      value: 'regulation',
      label: 'Regulation Change',
      description: 'Laws or policies shifted',
      emoji: '📜',
    },
    {
      value: 'behavior',
      label: 'Behavior Shift',
      description: 'People do things differently now',
      emoji: '🔄',
    },
    {
      value: 'market',
      label: 'Market Timing',
      description: 'The market is ready',
      emoji: '📈',
    },
  ],
  targetField: 'why_now_driver',
}

export const DIFFERENTIATION_AXIS_CHOICE: BinaryChoiceConfig = {
  id: 'differentiation_axis',
  question: 'How are you competing?',
  options: [
    {
      value: 'cheaper',
      label: 'Cheaper',
      description: 'Lower cost than alternatives',
      emoji: '💵',
    },
    {
      value: 'better',
      label: 'Better',
      description: 'Higher quality or performance',
      emoji: '⭐',
    },
    {
      value: 'different',
      label: 'Different',
      description: 'Unique approach or angle',
      emoji: '🎯',
    },
    {
      value: 'faster',
      label: 'Faster',
      description: 'Quicker results or delivery',
      emoji: '⚡',
    },
    {
      value: 'easier',
      label: 'Easier',
      description: 'Simpler to use or understand',
      emoji: '✨',
    },
  ],
  targetField: 'differentiation_axis',
}

export const VALIDATION_STATUS_CHOICE: BinaryChoiceConfig = {
  id: 'validation_status',
  question: 'How validated is this idea?',
  options: [
    {
      value: 'idea',
      label: 'Just an idea',
      description: 'Haven\'t tested it yet',
      emoji: '💭',
    },
    {
      value: 'researched',
      label: 'Researched',
      description: 'Did market research',
      emoji: '🔍',
    },
    {
      value: 'talked_to_users',
      label: 'Talked to users',
      description: 'Had customer conversations',
      emoji: '💬',
    },
    {
      value: 'pre_revenue',
      label: 'Pre-revenue',
      description: 'Built something, no money yet',
      emoji: '🛠️',
    },
    {
      value: 'revenue',
      label: 'Revenue',
      description: 'Making money!',
      emoji: '💰',
    },
  ],
  targetField: 'validation_status',
}

export const SALES_MOTION_CHOICE: BinaryChoiceConfig = {
  id: 'sales_motion',
  question: 'How will you sell?',
  options: [
    {
      value: 'self_serve',
      label: 'Self-serve',
      description: 'Customers buy themselves',
      emoji: '🛒',
    },
    {
      value: 'sales_led',
      label: 'Sales-led',
      description: 'Sales team closes deals',
      emoji: '🤝',
    },
    {
      value: 'plg',
      label: 'Product-led',
      description: 'Product drives adoption',
      emoji: '🚀',
    },
    {
      value: 'marketplace',
      label: 'Marketplace',
      description: 'Platform connects buyers/sellers',
      emoji: '🏪',
    },
  ],
  targetField: 'sales_motion',
}

export const TEAM_SIZE_CHOICE: BinaryChoiceConfig = {
  id: 'team_size',
  question: 'What\'s your team situation?',
  options: [
    {
      value: 'solo',
      label: 'Solo',
      description: 'Just me',
      emoji: '🧑',
    },
    {
      value: 'cofounders',
      label: 'Co-founders',
      description: '2-3 founding team',
      emoji: '👥',
    },
    {
      value: 'small_team',
      label: 'Small team',
      description: '4-10 people',
      emoji: '👨‍👩‍👧‍👦',
    },
    {
      value: 'growing',
      label: 'Growing',
      description: '10-50 people',
      emoji: '📈',
    },
  ],
  targetField: 'team_size',
}

export const FUNDING_STATUS_CHOICE: BinaryChoiceConfig = {
  id: 'funding_status',
  question: 'What\'s your funding situation?',
  options: [
    {
      value: 'bootstrapped',
      label: 'Bootstrapped',
      description: 'Self-funded',
      emoji: '🥾',
    },
    {
      value: 'pre_seed',
      label: 'Pre-seed',
      description: 'Friends, family, angels',
      emoji: '🌱',
    },
    {
      value: 'seed',
      label: 'Seed',
      description: 'Seed round raised',
      emoji: '🌿',
    },
    {
      value: 'series_a_plus',
      label: 'Series A+',
      description: 'Institutional funding',
      emoji: '🌳',
    },
    {
      value: 'profitable',
      label: 'Profitable',
      description: 'Self-sustaining',
      emoji: '💎',
    },
  ],
  targetField: 'funding_status',
}

export const EXIT_VISION_CHOICE: BinaryChoiceConfig = {
  id: 'exit_vision',
  question: 'What\'s your long-term vision?',
  options: [
    {
      value: 'lifestyle',
      label: 'Lifestyle business',
      description: 'Build for freedom & income',
      emoji: '🏖️',
    },
    {
      value: 'acquisition',
      label: 'Acquisition',
      description: 'Build to sell',
      emoji: '🤝',
    },
    {
      value: 'ipo',
      label: 'Go big (IPO)',
      description: 'Build a huge company',
      emoji: '🚀',
    },
    {
      value: 'nonprofit',
      label: 'Impact/Nonprofit',
      description: 'Mission over money',
      emoji: '💚',
    },
    {
      value: 'unsure',
      label: 'Not sure yet',
      description: 'Figuring it out',
      emoji: '🤔',
    },
  ],
  targetField: 'exit_vision',
}

export const MARKET_SIZE_CHOICE: BinaryChoiceConfig = {
  id: 'market_size_estimate',
  question: 'How big do you think the market is?',
  options: [
    {
      value: 'tiny',
      label: 'Tiny niche',
      description: 'Very specialized, <$10M',
      emoji: '🔬',
    },
    {
      value: 'small',
      label: 'Small',
      description: 'Niche market, $10-100M',
      emoji: '📦',
    },
    {
      value: 'medium',
      label: 'Medium',
      description: 'Solid market, $100M-1B',
      emoji: '🏢',
    },
    {
      value: 'large',
      label: 'Large',
      description: 'Big market, $1-10B',
      emoji: '🏙️',
    },
    {
      value: 'massive',
      label: 'Massive',
      description: 'Huge market, $10B+',
      emoji: '🌍',
    },
  ],
  targetField: 'market_size_estimate',
}

/** All binary choices indexed by field name */
export const BINARY_CHOICES: Record<string, BinaryChoiceConfig> = {
  customer_type: CUSTOMER_TYPE_CHOICE,
  why_now_driver: WHY_NOW_DRIVER_CHOICE,
  differentiation_axis: DIFFERENTIATION_AXIS_CHOICE,
  validation_status: VALIDATION_STATUS_CHOICE,
  sales_motion: SALES_MOTION_CHOICE,
  team_size: TEAM_SIZE_CHOICE,
  funding_status: FUNDING_STATUS_CHOICE,
  exit_vision: EXIT_VISION_CHOICE,
  market_size_estimate: MARKET_SIZE_CHOICE,
}
