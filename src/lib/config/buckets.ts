/**
 * 🪣 BUCKET CONFIGURATION
 * =======================
 * Defines the 6 buckets of information we collect.
 * Each bucket has a weight (importance) and required fields.
 *
 * Weight Guide:
 * - 3 = Required (can't proceed without)
 * - 2 = Build (analyzers can help construct)
 * - 1 = Enrichment (nice to have)
 */

export interface BucketDefinition {
  id: string
  name: string
  emoji: string
  description: string
  weight: 1 | 2 | 3
  color: string
  fields: string[]
  requiredFields: string[]
}

/**
 * 🎯 The 6 Buckets
 */
export const BUCKETS: Record<string, BucketDefinition> = {
  core_idea: {
    id: 'core_idea',
    name: 'Core Idea',
    emoji: '🎯',
    description: 'What is it, who is it for, why now?',
    weight: 3,
    color: 'primary',
    fields: [
      'idea_name',
      'one_liner',
      'target_audience',
      'problem_statement',
      'problem_urgency',
      'why_now',
      'why_now_driver',
    ],
    requiredFields: ['idea_name', 'one_liner', 'problem_statement'],
  },

  value_prop: {
    id: 'value_prop',
    name: 'Value Proposition',
    emoji: '💎',
    description: 'Problem-solution fit, unique angle',
    weight: 3,
    color: 'accent',
    fields: [
      'existing_solutions',
      'differentiation_axis',
      'differentiation_score',
      'secret_sauce',
      'validation_status',
    ],
    requiredFields: ['secret_sauce', 'validation_status'],
  },

  market: {
    id: 'market',
    name: 'Market Reality',
    emoji: '📊',
    description: 'Competition, positioning, timing',
    weight: 2,
    color: 'blue',
    fields: ['market_size_estimate', 'competitors', 'positioning'],
    requiredFields: [], // Can be built by AI
  },

  model: {
    id: 'model',
    name: 'Business Model',
    emoji: '💰',
    description: 'Revenue, pricing, unit economics',
    weight: 2,
    color: 'green',
    fields: ['revenue_model', 'pricing_tier', 'customer_type', 'sales_motion'],
    requiredFields: ['customer_type'], // At minimum, know your customer type
  },

  execution: {
    id: 'execution',
    name: 'Execution',
    emoji: '🏃',
    description: 'Team, resources, timeline, risks',
    weight: 1,
    color: 'orange',
    fields: ['team_size', 'funding_status', 'timeline_months', 'biggest_risks'],
    requiredFields: [],
  },

  vision: {
    id: 'vision',
    name: 'Vision & Values',
    emoji: '🌟',
    description: 'Long-term direction, principles',
    weight: 1,
    color: 'purple',
    fields: ['north_star_metric', 'company_values', 'exit_vision'],
    requiredFields: [],
  },
}

/**
 * 📋 Bucket order for the onboarding flow
 */
export const BUCKET_ORDER = [
  'core_idea',
  'value_prop',
  'market',
  'model',
  'execution',
  'vision',
] as const

/**
 * 🔢 Get total weight for completion calculation
 */
export const TOTAL_WEIGHT = Object.values(BUCKETS).reduce(
  (sum, bucket) => sum + bucket.weight,
  0
)

/**
 * 📊 Calculate bucket completion percentage
 * @param project - The business project data
 * @param bucketId - Which bucket to calculate
 * @returns Completion percentage (0-100)
 */
export function calculateBucketCompletion(
  project: Record<string, unknown>,
  bucketId: string
): number {
  const bucket = BUCKETS[bucketId]
  if (!bucket) return 0

  const filledFields = bucket.fields.filter((field) => {
    const value = project[field]
    if (value === null || value === undefined) return false
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'string') return value.trim().length > 0
    return true
  })

  return Math.round((filledFields.length / bucket.fields.length) * 100)
}

/**
 * 📈 Calculate overall completion with weights
 * @param bucketCompletions - Object with bucket completion percentages
 * @returns Weighted overall completion percentage (0-100)
 */
export function calculateOverallCompletion(
  bucketCompletions: Record<string, number>
): number {
  let weightedSum = 0
  let totalWeight = 0

  for (const [bucketId, completion] of Object.entries(bucketCompletions)) {
    const bucket = BUCKETS[bucketId]
    if (bucket) {
      weightedSum += completion * bucket.weight
      totalWeight += 100 * bucket.weight
    }
  }

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0
}

/**
 * ✅ Check if minimum required fields are filled
 * @param project - The business project data
 * @returns Whether the project has minimum viable data
 */
export function hasMinimumViableData(project: Record<string, unknown>): boolean {
  // Check weight-3 buckets have their required fields
  const requiredBuckets = Object.values(BUCKETS).filter((b) => b.weight === 3)

  for (const bucket of requiredBuckets) {
    for (const field of bucket.requiredFields) {
      const value = project[field]
      if (!value || (typeof value === 'string' && !value.trim())) {
        return false
      }
    }
  }

  return true
}
