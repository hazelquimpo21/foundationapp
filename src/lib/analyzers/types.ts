/**
 * 🤖 ANALYZER TYPES
 * =================
 * Type definitions for the analyzer system.
 *
 * The analyzer system follows a modular, two-phase pattern:
 * 1. Phase 1 (Analysis): AI reads between the lines, infers meaning
 * 2. Phase 2 (Parsing): Extract structured fields from the analysis
 *
 * Each analyzer has:
 * - Defined trigger conditions (what data must exist to run)
 * - Input requirements (what project fields it needs)
 * - Output fields (what it updates in the project)
 */

import type { BusinessProject } from '@/lib/types'

// ============================================
// 📋 ANALYZER TYPES
// ============================================

/**
 * All available analyzer types
 * Each maps to an API endpoint and has specific trigger conditions
 */
export type AnalyzerType =
  | 'web_scraper'    // Scrapes website, finds socials, infers industry
  | 'clarity'        // Analyzes idea clarity
  | 'narrative'      // Brand narrative analysis
  | 'voice'          // Brand voice analysis
  | 'synthesis'      // Full brand synthesis
  | 'market'         // Market research
  | 'model'          // Business model suggestions
  | 'risk'           // Risk identification

/**
 * Analyzer run status
 */
export type AnalyzerStatus = 'pending' | 'running' | 'completed' | 'failed'

// ============================================
// 📊 ANALYZER RUN
// ============================================

/**
 * Represents a single analyzer run
 * Tracks status, results, and errors
 */
export interface AnalyzerRun {
  id: string
  project_id: string
  analyzer_type: AnalyzerType
  status: AnalyzerStatus

  // What triggered this run
  trigger_reason: string | null

  // Input/Output
  input_snapshot: Record<string, unknown> | null
  raw_analysis: string | null       // Phase 1 output
  parsed_fields: Record<string, unknown> | null  // Phase 2 output
  confidence_score: number | null

  // Error handling
  error_message: string | null
  retry_count: number

  // Timing
  started_at: string | null
  completed_at: string | null
  created_at: string
}

// ============================================
// ⚙️ ANALYZER CONFIG
// ============================================

/**
 * Configuration for an analyzer
 * Defines when it triggers and what it outputs
 */
export interface AnalyzerConfig {
  /** Unique identifier for this analyzer */
  type: AnalyzerType

  /** Human-readable name */
  name: string

  /** Short description */
  description: string

  /** Emoji icon for UI */
  icon: string

  /** Whether this analyzer auto-triggers */
  autoTrigger: boolean

  /** Function to check if trigger conditions are met */
  shouldTrigger: (project: BusinessProject, existingRuns: AnalyzerRun[]) => boolean

  /** Fields this analyzer updates in the project */
  outputFields: string[]

  /** Dependencies - other analyzers that must complete first */
  dependencies?: AnalyzerType[]
}

// ============================================
// 🔄 TRIGGER RESULT
// ============================================

/**
 * Result of evaluating trigger conditions
 */
export interface TriggerResult {
  /** Analyzers that should be triggered */
  toTrigger: AnalyzerType[]

  /** Analyzers that are already running/pending */
  alreadyRunning: AnalyzerType[]

  /** Analyzers that have completed */
  completed: AnalyzerType[]

  /** Human-readable summary */
  summary: string
}

// ============================================
// 📨 API REQUEST/RESPONSE TYPES
// ============================================

/**
 * Request to trigger analyzers for a project
 */
export interface TriggerAnalyzersRequest {
  projectId: string
  /** Optional: specific analyzer to trigger (otherwise auto-detect) */
  analyzerType?: AnalyzerType
  /** Optional: force re-run even if already completed */
  force?: boolean
}

/**
 * Response from trigger endpoint
 */
export interface TriggerAnalyzersResponse {
  success: boolean
  triggered: AnalyzerType[]
  message: string
  error?: string
}

/**
 * Request to run a specific analyzer
 */
export interface RunAnalyzerRequest {
  projectId: string
  analyzerType: AnalyzerType
  runId?: string  // If resuming an existing run
}

/**
 * Response from analyzer run
 */
export interface RunAnalyzerResponse {
  success: boolean
  runId: string
  analyzerType: AnalyzerType
  status: AnalyzerStatus
  rawAnalysis?: string
  parsedFields?: Record<string, unknown>
  error?: string
}

// ============================================
// 🌐 WEB SCRAPER SPECIFIC TYPES
// ============================================

/**
 * Social media URLs found by the scraper
 */
export interface SocialUrls {
  instagram?: string
  twitter?: string
  linkedin?: string
  facebook?: string
  tiktok?: string
  youtube?: string
  [key: string]: string | undefined  // Allow other platforms
}

/**
 * Data extracted by the web scraper
 */
export interface ScrapedData {
  /** Full URL that was scraped */
  url: string

  /** Page title */
  title: string | null

  /** Meta description */
  description: string | null

  /** Main text content (truncated) */
  content: string

  /** Social media URLs found on page */
  socialUrls: SocialUrls

  /** Whether scrape was successful */
  success: boolean

  /** Error message if failed */
  error?: string
}

/**
 * Parsed output from web scraper analyzer
 */
export interface WebScraperParsedOutput {
  /** Main tagline/headline found */
  tagline: string | null

  /** Services or offerings mentioned */
  services: string[]

  /** Inferred industry */
  industry: string | null

  /** Social handles extracted */
  socialUrls: SocialUrls

  /** Individual handles for easy access */
  instagramHandle: string | null
  twitterHandle: string | null
  facebookUrl: string | null
  tiktokHandle: string | null
  youtubeUrl: string | null
  linkedinUrl: string | null

  /** Confidence in the analysis (0-1) */
  confidence: number
}
