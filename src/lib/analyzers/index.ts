/**
 * 🤖 ANALYZER SYSTEM - Public API
 * ================================
 * Central export for the analyzer system.
 *
 * Import from here for clean imports:
 *   import { useAnalyzerStore, evaluateTriggers } from '@/lib/analyzers'
 */

// Types
export type {
  AnalyzerType,
  AnalyzerStatus,
  AnalyzerRun,
  AnalyzerConfig,
  TriggerResult,
  TriggerAnalyzersRequest,
  TriggerAnalyzersResponse,
  RunAnalyzerRequest,
  RunAnalyzerResponse,
  SocialUrls,
  ScrapedData,
  WebScraperParsedOutput,
} from './types'

// Registry
export {
  ANALYZER_REGISTRY,
  getAnalyzerConfig,
  getAutoTriggerAnalyzers,
  getAllAnalyzerTypes,
} from './registry'

// Triggers
export {
  evaluateTriggers,
  shouldTriggerAnalyzer,
  getMissingRequirements,
  getAnalyzerStatusMessage,
} from './triggers'

// Store
export {
  useAnalyzerStore,
  useIsAnalyzerRunning,
  useAnalyzerRun,
  useCompletedAnalyzers,
} from './store'
