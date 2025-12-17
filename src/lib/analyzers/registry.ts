/**
 * 📋 ANALYZER REGISTRY
 * ====================
 * Central registry of all available analyzers.
 *
 * Each analyzer is defined with:
 * - Trigger conditions (when it should auto-run)
 * - Output fields (what it updates)
 * - Dependencies (other analyzers that must complete first)
 *
 * To add a new analyzer:
 * 1. Add the type to AnalyzerType in types.ts
 * 2. Add the config here
 * 3. Create the analyzer implementation in analyzers/{name}/
 * 4. Add the API route
 */

import type { BusinessProject } from '@/lib/types'
import type { AnalyzerConfig, AnalyzerRun, AnalyzerType } from './types'

// ============================================
// 🌐 WEB SCRAPER ANALYZER
// ============================================

const webScraperConfig: AnalyzerConfig = {
  type: 'web_scraper',
  name: 'Website Analyzer',
  description: 'Scrapes your website to find social links and learn about your business',
  icon: '🌐',
  autoTrigger: true,

  shouldTrigger: (project: BusinessProject, existingRuns: AnalyzerRun[]): boolean => {
    // Needs a website URL
    if (!project.website_url?.trim()) {
      return false
    }

    // Check if already running or completed
    const existingRun = existingRuns.find(
      r => r.analyzer_type === 'web_scraper'
    )

    // Don't trigger if pending, running, or completed
    if (existingRun?.status === 'pending' ||
        existingRun?.status === 'running' ||
        existingRun?.status === 'completed') {
      return false
    }

    return true
  },

  outputFields: [
    'social_urls',
    'scraped_tagline',
    'scraped_services',
    'scraped_industry',
    'scraped_content',
    'scrape_confidence',
    'scraped_at',
    'instagram_handle',
    'twitter_handle',
    'facebook_url',
    'tiktok_handle',
    'youtube_url',
  ],
}

// ============================================
// 💡 CLARITY ANALYZER
// ============================================

const clarityConfig: AnalyzerConfig = {
  type: 'clarity',
  name: 'Idea Clarity',
  description: 'Analyzes how clearly your business idea is articulated',
  icon: '💡',
  autoTrigger: true,

  shouldTrigger: (project: BusinessProject, existingRuns: AnalyzerRun[]): boolean => {
    // Needs core idea fields filled
    const hasCoreIdea = !!(
      project.idea_name &&
      project.problem_statement &&
      project.target_audience?.length
    )

    if (!hasCoreIdea) return false

    // Check if already running or completed
    const existingRun = existingRuns.find(r => r.analyzer_type === 'clarity')
    if (existingRun?.status === 'pending' ||
        existingRun?.status === 'running' ||
        existingRun?.status === 'completed') {
      return false
    }

    return true
  },

  outputFields: [
    'ai_clarity_score',
    'ai_one_liner',
    'ai_implied_assumptions',
  ],
}

// ============================================
// 📖 NARRATIVE ANALYZER
// ============================================

const narrativeConfig: AnalyzerConfig = {
  type: 'narrative',
  name: 'Brand Narrative',
  description: 'Analyzes your brand story and positioning',
  icon: '📖',
  autoTrigger: true,

  shouldTrigger: (project: BusinessProject, existingRuns: AnalyzerRun[]): boolean => {
    // Needs story-related fields
    const hasStory = !!(
      project.problem_statement &&
      project.secret_sauce &&
      project.differentiation_axis
    )

    if (!hasStory) return false

    const existingRun = existingRuns.find(r => r.analyzer_type === 'narrative')
    if (existingRun?.status === 'pending' ||
        existingRun?.status === 'running' ||
        existingRun?.status === 'completed') {
      return false
    }

    return true
  },

  outputFields: [
    'ai_summary',
  ],
}

// ============================================
// 🎤 VOICE ANALYZER
// ============================================

const voiceConfig: AnalyzerConfig = {
  type: 'voice',
  name: 'Brand Voice',
  description: 'Analyzes your brand personality and communication style',
  icon: '🎤',
  autoTrigger: true,

  shouldTrigger: (project: BusinessProject, existingRuns: AnalyzerRun[]): boolean => {
    // Needs company values (brand words)
    const hasVoice = !!(
      project.company_values?.length &&
      project.target_audience?.length
    )

    if (!hasVoice) return false

    const existingRun = existingRuns.find(r => r.analyzer_type === 'voice')
    if (existingRun?.status === 'pending' ||
        existingRun?.status === 'running' ||
        existingRun?.status === 'completed') {
      return false
    }

    return true
  },

  outputFields: [],  // TBD
}

// ============================================
// 🔮 SYNTHESIS ANALYZER
// ============================================

const synthesisConfig: AnalyzerConfig = {
  type: 'synthesis',
  name: 'Full Synthesis',
  description: 'Creates a comprehensive analysis of your business',
  icon: '🔮',
  autoTrigger: false,  // Manual trigger only

  shouldTrigger: (project: BusinessProject, existingRuns: AnalyzerRun[]): boolean => {
    // Needs minimum buckets complete
    const hasMinimum = !!(
      project.idea_name &&
      project.problem_statement &&
      project.secret_sauce
    )

    if (!hasMinimum) return false

    // Also needs clarity analyzer to have completed
    const clarityRun = existingRuns.find(r => r.analyzer_type === 'clarity')
    if (clarityRun?.status !== 'completed') return false

    const existingRun = existingRuns.find(r => r.analyzer_type === 'synthesis')
    if (existingRun?.status === 'pending' ||
        existingRun?.status === 'running' ||
        existingRun?.status === 'completed') {
      return false
    }

    return true
  },

  outputFields: [
    'ai_viability_score',
    'ai_summary',
    'ai_strengths',
    'ai_weaknesses',
    'ai_next_steps',
  ],

  dependencies: ['clarity'],
}

// ============================================
// 📊 MARKET ANALYZER
// ============================================

const marketConfig: AnalyzerConfig = {
  type: 'market',
  name: 'Market Analysis',
  description: 'Analyzes market size and competition',
  icon: '📊',
  autoTrigger: false,

  shouldTrigger: (project: BusinessProject, existingRuns: AnalyzerRun[]): boolean => {
    const hasMarketData = !!(
      project.market_size_estimate ||
      project.competitors?.length
    )

    if (!hasMarketData) return false

    const existingRun = existingRuns.find(r => r.analyzer_type === 'market')
    if (existingRun?.status === 'pending' ||
        existingRun?.status === 'running' ||
        existingRun?.status === 'completed') {
      return false
    }

    return true
  },

  outputFields: [
    'ai_market_size',
    'ai_competitors',
  ],
}

// ============================================
// 💼 MODEL ANALYZER
// ============================================

const modelConfig: AnalyzerConfig = {
  type: 'model',
  name: 'Business Model',
  description: 'Suggests revenue models and pricing strategies',
  icon: '💼',
  autoTrigger: false,

  shouldTrigger: (project: BusinessProject, existingRuns: AnalyzerRun[]): boolean => {
    const hasModelData = !!(
      project.revenue_model?.length ||
      project.customer_type
    )

    if (!hasModelData) return false

    const existingRun = existingRuns.find(r => r.analyzer_type === 'model')
    if (existingRun?.status === 'pending' ||
        existingRun?.status === 'running' ||
        existingRun?.status === 'completed') {
      return false
    }

    return true
  },

  outputFields: [
    'ai_suggested_model',
  ],
}

// ============================================
// ⚠️ RISK ANALYZER
// ============================================

const riskConfig: AnalyzerConfig = {
  type: 'risk',
  name: 'Risk Assessment',
  description: 'Identifies potential risks and challenges',
  icon: '⚠️',
  autoTrigger: false,

  shouldTrigger: (project: BusinessProject, existingRuns: AnalyzerRun[]): boolean => {
    const hasRiskData = !!(
      project.biggest_risks?.length ||
      project.validation_status
    )

    if (!hasRiskData) return false

    const existingRun = existingRuns.find(r => r.analyzer_type === 'risk')
    if (existingRun?.status === 'pending' ||
        existingRun?.status === 'running' ||
        existingRun?.status === 'completed') {
      return false
    }

    return true
  },

  outputFields: [
    'ai_risks',
  ],
}

// ============================================
// 📚 REGISTRY
// ============================================

/**
 * All registered analyzer configs
 */
export const ANALYZER_REGISTRY: Record<AnalyzerType, AnalyzerConfig> = {
  web_scraper: webScraperConfig,
  clarity: clarityConfig,
  narrative: narrativeConfig,
  voice: voiceConfig,
  synthesis: synthesisConfig,
  market: marketConfig,
  model: modelConfig,
  risk: riskConfig,
}

/**
 * Get config for a specific analyzer
 */
export function getAnalyzerConfig(type: AnalyzerType): AnalyzerConfig {
  const config = ANALYZER_REGISTRY[type]
  if (!config) {
    throw new Error(`Unknown analyzer type: ${type}`)
  }
  return config
}

/**
 * Get all auto-trigger analyzers
 */
export function getAutoTriggerAnalyzers(): AnalyzerConfig[] {
  return Object.values(ANALYZER_REGISTRY).filter(config => config.autoTrigger)
}

/**
 * Get all analyzer types
 */
export function getAllAnalyzerTypes(): AnalyzerType[] {
  return Object.keys(ANALYZER_REGISTRY) as AnalyzerType[]
}
