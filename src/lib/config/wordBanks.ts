/**
 * 📚 WORD BANK CONFIGURATION
 * ==========================
 * Pre-defined word options for each selection field.
 * These help users overcome blank page syndrome by giving them
 * smart defaults to choose from.
 */

import type { WordBankConfig, WordBankCategory } from '@/lib/types'

// ============================================
// 🎯 TARGET AUDIENCE WORDS
// ============================================

const audienceLifeStage: WordBankCategory = {
  id: 'life_stage',
  label: 'Life Stage',
  emoji: '🌱',
  words: [
    'Students',
    'Recent graduates',
    'Young professionals',
    'Mid-career professionals',
    'Executives',
    'Retirees',
    'Parents',
    'Empty nesters',
    'First-time buyers',
    'Career changers',
  ],
}

const audienceMindset: WordBankCategory = {
  id: 'mindset',
  label: 'Mindset',
  emoji: '🧠',
  words: [
    'Ambitious',
    'Overwhelmed',
    'Curious',
    'Skeptical',
    'Ready for change',
    'Budget-conscious',
    'Time-strapped',
    'Growth-oriented',
    'Risk-averse',
    'Early adopters',
  ],
}

const audienceIndustry: WordBankCategory = {
  id: 'industry',
  label: 'Industry',
  emoji: '💼',
  words: [
    'Tech workers',
    'Healthcare professionals',
    'Educators',
    'Creatives',
    'Freelancers',
    'Small business owners',
    'Enterprise teams',
    'Consultants',
    'Retail workers',
    'Service providers',
  ],
}

export const TARGET_AUDIENCE_BANK: WordBankConfig = {
  id: 'target_audience',
  title: 'Who is this for?',
  description: 'Select 3-5 words that describe your ideal customer',
  minSelections: 3,
  maxSelections: 5,
  categories: [audienceLifeStage, audienceMindset, audienceIndustry],
  targetField: 'target_audience',
}

// ============================================
// 🔧 EXISTING SOLUTIONS WORDS
// ============================================

const solutionCategories: WordBankCategory = {
  id: 'solutions',
  label: 'Current Solutions',
  emoji: '🔧',
  words: [
    'Spreadsheets',
    'Email',
    'Nothing (they suffer)',
    'Expensive consultants',
    'DIY workarounds',
    'Legacy software',
    'Manual processes',
    'Competitors',
    'In-house tools',
    'Free tools',
    'Word of mouth',
    'Agencies',
  ],
}

export const EXISTING_SOLUTIONS_BANK: WordBankConfig = {
  id: 'existing_solutions',
  title: 'What do people use today?',
  description: 'How do your target customers currently solve this problem?',
  minSelections: 1,
  maxSelections: 4,
  categories: [solutionCategories],
  targetField: 'existing_solutions',
}

// ============================================
// 💰 REVENUE MODEL WORDS
// ============================================

const revenueModels: WordBankCategory = {
  id: 'revenue',
  label: 'Revenue Models',
  emoji: '💰',
  words: [
    'Subscription (SaaS)',
    'One-time purchase',
    'Freemium',
    'Usage-based',
    'Marketplace (take rate)',
    'Advertising',
    'Licensing',
    'Services/Consulting',
    'Transaction fees',
    'Enterprise contracts',
  ],
}

export const REVENUE_MODEL_BANK: WordBankConfig = {
  id: 'revenue_model',
  title: 'How will you make money?',
  description: 'Select your primary revenue model(s)',
  minSelections: 1,
  maxSelections: 3,
  categories: [revenueModels],
  targetField: 'revenue_model',
}

// ============================================
// ⚠️ RISK WORDS
// ============================================

const riskCategories: WordBankCategory = {
  id: 'risks',
  label: 'Common Risks',
  emoji: '⚠️',
  words: [
    'Technical complexity',
    'Market timing',
    'Competition',
    'Funding runway',
    'Hiring talent',
    'Regulatory issues',
    'Customer acquisition cost',
    'Dependency on key partner',
    'Scalability',
    'Unit economics',
    'Founder burnout',
    'Market size uncertainty',
  ],
}

export const RISKS_BANK: WordBankConfig = {
  id: 'biggest_risks',
  title: 'What keeps you up at night?',
  description: 'Select your biggest concerns',
  minSelections: 1,
  maxSelections: 4,
  categories: [riskCategories],
  targetField: 'biggest_risks',
}

// ============================================
// 🌟 COMPANY VALUES WORDS
// ============================================

const valuesCategory: WordBankCategory = {
  id: 'values',
  label: 'Core Values',
  emoji: '🌟',
  words: [
    'Transparency',
    'Innovation',
    'Customer obsession',
    'Speed',
    'Quality',
    'Simplicity',
    'Trust',
    'Empowerment',
    'Sustainability',
    'Inclusivity',
    'Integrity',
    'Excellence',
    'Creativity',
    'Collaboration',
    'Impact',
  ],
}

export const VALUES_BANK: WordBankConfig = {
  id: 'company_values',
  title: 'What do you stand for?',
  description: 'Pick 3-5 values that will guide your company',
  minSelections: 3,
  maxSelections: 5,
  categories: [valuesCategory],
  targetField: 'company_values',
}

// ============================================
// 🗺️ EXPORT ALL WORD BANKS
// ============================================

export const WORD_BANKS: Record<string, WordBankConfig> = {
  target_audience: TARGET_AUDIENCE_BANK,
  existing_solutions: EXISTING_SOLUTIONS_BANK,
  revenue_model: REVENUE_MODEL_BANK,
  biggest_risks: RISKS_BANK,
  company_values: VALUES_BANK,
}

/**
 * 🎲 Shuffle array helper (for showing different words)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * 🔄 Get shuffled words for a category, preserving selected items
 */
export function getShuffledWords(
  category: WordBankCategory,
  selected: string[],
  displayCount = 8
): string[] {
  const selectedInCategory = selected.filter((w) => category.words.includes(w))
  const available = category.words.filter((w) => !selected.includes(w))
  const shuffled = shuffleArray(available)
  const toShow = shuffled.slice(0, displayCount)

  return Array.from(new Set([...selectedInCategory, ...toShow]))
}
