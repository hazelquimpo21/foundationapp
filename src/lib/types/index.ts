/**
 * 🏷️ BUSINESS ONBOARDER - Type Definitions
 * ==========================================
 * Central type definitions for the entire app.
 * Keep this file as the single source of truth for types.
 */

// ============================================
// 👤 USER & AUTH TYPES
// ============================================

export interface Member {
  id: string
  auth_id: string
  email: string
  name: string | null
  created_at: string
  updated_at: string
}

// ============================================
// 💼 BUSINESS PROJECT TYPES
// ============================================

/** Project status options */
export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'archived'

/** Why now drivers */
export type WhyNowDriver = 'technology' | 'regulation' | 'behavior' | 'market' | 'other'

/** Differentiation axis */
export type DifferentiationAxis = 'cheaper' | 'better' | 'different' | 'faster' | 'easier'

/** Validation status */
export type ValidationStatus = 'idea' | 'researched' | 'talked_to_users' | 'pre_revenue' | 'revenue'

/** Market size estimate */
export type MarketSize = 'tiny' | 'small' | 'medium' | 'large' | 'massive'

/** Customer type */
export type CustomerType = 'b2b' | 'b2c' | 'both'

/** Sales motion */
export type SalesMotion = 'self_serve' | 'sales_led' | 'plg' | 'marketplace' | 'hybrid'

/** Team size */
export type TeamSize = 'solo' | 'cofounders' | 'small_team' | 'growing' | 'established'

/** Funding status */
export type FundingStatus = 'bootstrapped' | 'pre_seed' | 'seed' | 'series_a_plus' | 'profitable'

/** Exit vision */
export type ExitVision = 'lifestyle' | 'acquisition' | 'ipo' | 'nonprofit' | 'unsure'

/** Bucket completion tracking */
export interface BucketCompletion {
  [key: string]: number  // Index signature for Record<string, number> compatibility
  core_idea: number
  value_prop: number
  market: number
  model: number
  execution: number
  vision: number
}

/** Main business project entity */
export interface BusinessProject {
  id: string
  member_id: string
  project_name: string
  status: ProjectStatus

  // Bucket 1: Core Idea
  idea_name: string | null
  one_liner: string | null
  target_audience: string[] | null
  problem_statement: string | null
  problem_urgency: number | null
  why_now: string | null
  why_now_driver: WhyNowDriver | null

  // Bucket 2: Value Prop
  existing_solutions: string[] | null
  differentiation_axis: DifferentiationAxis | null
  differentiation_score: number | null
  secret_sauce: string | null
  validation_status: ValidationStatus | null

  // Bucket 3: Market Reality
  market_size_estimate: MarketSize | null
  competitors: string[] | null
  positioning: string | null

  // Bucket 4: Business Model
  revenue_model: string[] | null
  pricing_tier: number | null
  customer_type: CustomerType | null
  sales_motion: SalesMotion | null

  // Bucket 5: Execution
  team_size: TeamSize | null
  funding_status: FundingStatus | null
  timeline_months: number | null
  biggest_risks: string[] | null

  // Bucket 6: Vision
  north_star_metric: string | null
  company_values: string[] | null
  exit_vision: ExitVision | null

  // AI-Generated Fields
  ai_clarity_score: number | null
  ai_one_liner: string | null
  ai_implied_assumptions: string[] | null
  ai_viability_score: number | null
  ai_summary: string | null
  ai_next_steps: string[] | null
  ai_market_size: string | null
  ai_competitors: string[] | null
  ai_suggested_model: string | null
  ai_risks: Record<string, unknown> | null
  ai_strengths: string[] | null
  ai_weaknesses: string[] | null

  // Progress
  current_step: string
  bucket_completion: BucketCompletion
  overall_completion: number

  // Timestamps
  created_at: string
  updated_at: string
}

// ============================================
// 💬 CHAT & SESSION TYPES
// ============================================

/** Session status */
export type SessionStatus = 'active' | 'completed' | 'abandoned'

/** Onboarding session */
export interface OnboardingSession {
  id: string
  project_id: string
  status: SessionStatus
  current_bucket: string
  started_at: string
  completed_at: string | null
  last_activity_at: string
}

/** Message roles */
export type MessageRole = 'user' | 'assistant' | 'system'

/** Message types for special interactions */
export type MessageType =
  | 'text'
  | 'word_bank'
  | 'word_bank_response'
  | 'slider'
  | 'slider_response'
  | 'binary_choice'
  | 'binary_response'
  | 'inference_reveal'
  | 'inference_confirm'
  | 'mad_lib'
  | 'mad_lib_response'

/** Chat message */
export interface ConversationMessage {
  id: string
  session_id: string
  role: MessageRole
  content: string
  message_type: MessageType
  metadata: Record<string, unknown>
  related_fields: string[] | null
  created_at: string
}

// ============================================
// ⚙️ ANALYZER TYPES
// ============================================

/** Analyzer types */
export type AnalyzerType = 'clarity' | 'market' | 'model' | 'risk' | 'synthesis'

/** Analyzer run status */
export type AnalyzerStatus = 'pending' | 'running' | 'completed' | 'failed'

/** Analyzer run */
export interface AnalyzerRun {
  id: string
  project_id: string
  analyzer_type: AnalyzerType
  status: AnalyzerStatus
  trigger_reason: string | null
  input_snapshot: Record<string, unknown> | null
  raw_analysis: string | null
  parsed_fields: Record<string, unknown> | null
  confidence_score: number | null
  error_message: string | null
  retry_count: number
  started_at: string | null
  completed_at: string | null
  created_at: string
}

// ============================================
// 📦 OUTPUT TYPES
// ============================================

/** Output types */
export type OutputType =
  | 'pitch_summary'
  | 'one_pager'
  | 'risk_assessment'
  | 'competitor_analysis'
  | 'next_steps'

/** Generated output */
export interface GeneratedOutput {
  id: string
  project_id: string
  analyzer_run_id: string | null
  output_type: OutputType
  output_data: Record<string, unknown>
  is_favorite: boolean
  created_at: string
}

// ============================================
// 🎯 UI COMPONENT TYPES
// ============================================

/** Word bank category */
export interface WordBankCategory {
  id: string
  label: string
  emoji: string
  words: string[]
}

/** Word bank config */
export interface WordBankConfig {
  id: string
  title: string
  description: string
  minSelections: number
  maxSelections: number
  categories: WordBankCategory[]
  targetField: string
}

/** Slider config */
export interface SliderConfig {
  id: string
  label: string
  description: string
  min: number
  max: number
  leftLabel: string
  rightLabel: string
  descriptions: Record<number, string>
  targetField: string
}

/** Binary choice option */
export interface BinaryOption {
  value: string
  label: string
  description?: string
  emoji?: string
}

/** Binary choice config */
export interface BinaryChoiceConfig {
  id: string
  question: string
  options: BinaryOption[]
  targetField: string
}

// ============================================
// 🔧 API RESPONSE TYPES
// ============================================

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/** Chat API request */
export interface ChatRequest {
  sessionId: string
  message: string
  messageType?: MessageType
  metadata?: Record<string, unknown>
}

/** Chat API response */
export interface ChatResponse {
  message: ConversationMessage
  nextInteraction?: {
    type: MessageType
    config: WordBankConfig | SliderConfig | BinaryChoiceConfig
  }
  fieldsUpdated?: string[]
}
