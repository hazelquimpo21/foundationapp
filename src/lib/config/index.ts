/**
 * ⚙️ CONFIG INDEX
 * ===============
 * Central export point for all configuration.
 */

export {
  BUCKETS,
  BUCKET_ORDER,
  TOTAL_WEIGHT,
  calculateBucketCompletion,
  calculateOverallCompletion,
  hasMinimumViableData,
} from './buckets'

export type { BucketDefinition } from './buckets'

export {
  WORD_BANKS,
  TARGET_AUDIENCE_BANK,
  EXISTING_SOLUTIONS_BANK,
  REVENUE_MODEL_BANK,
  RISKS_BANK,
  VALUES_BANK,
  shuffleArray,
  getShuffledWords,
} from './wordBanks'

export {
  SLIDERS,
  PROBLEM_URGENCY_SLIDER,
  DIFFERENTIATION_SLIDER,
  PRICING_TIER_SLIDER,
  TIMELINE_SLIDER,
  BINARY_CHOICES,
  CUSTOMER_TYPE_CHOICE,
  WHY_NOW_DRIVER_CHOICE,
  DIFFERENTIATION_AXIS_CHOICE,
  VALIDATION_STATUS_CHOICE,
  SALES_MOTION_CHOICE,
  TEAM_SIZE_CHOICE,
  FUNDING_STATUS_CHOICE,
  EXIT_VISION_CHOICE,
  MARKET_SIZE_CHOICE,
} from './interactions'
