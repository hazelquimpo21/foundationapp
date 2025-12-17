/**
 * 🎯 ANALYZER TRIGGER SYSTEM
 * ==========================
 * Evaluates which analyzers should be triggered based on project state.
 *
 * This is the brain of the analyzer system. When project data changes,
 * we evaluate all auto-trigger analyzers to see if any should run.
 *
 * Flow:
 * 1. User saves data (e.g., website URL)
 * 2. Frontend calls /api/analyzers/trigger
 * 3. This module evaluates trigger conditions
 * 4. Returns which analyzers to run
 *
 * Usage:
 *   const result = evaluateTriggers(project, existingRuns)
 *   // result.toTrigger = ['web_scraper']
 */

import type { BusinessProject } from '@/lib/types'
import type { AnalyzerRun, AnalyzerType, TriggerResult } from './types'
import { ANALYZER_REGISTRY, getAutoTriggerAnalyzers } from './registry'
import { log } from '@/lib/utils/logger'

// ============================================
// 🔍 TRIGGER EVALUATION
// ============================================

/**
 * Evaluate which analyzers should be triggered for a project
 *
 * @param project - The business project to evaluate
 * @param existingRuns - All existing analyzer runs for this project
 * @returns TriggerResult with lists of analyzers to trigger, running, and completed
 */
export function evaluateTriggers(
  project: BusinessProject,
  existingRuns: AnalyzerRun[]
): TriggerResult {
  log.info('🎯 Evaluating analyzer triggers...', {
    projectId: project.id,
    existingRunsCount: existingRuns.length,
  })

  const toTrigger: AnalyzerType[] = []
  const alreadyRunning: AnalyzerType[] = []
  const completed: AnalyzerType[] = []

  // Check each auto-trigger analyzer
  const autoTriggerAnalyzers = getAutoTriggerAnalyzers()

  for (const config of autoTriggerAnalyzers) {
    const existingRun = existingRuns.find(
      r => r.analyzer_type === config.type
    )

    // Track status
    if (existingRun?.status === 'running' || existingRun?.status === 'pending') {
      alreadyRunning.push(config.type)
      continue
    }

    if (existingRun?.status === 'completed') {
      completed.push(config.type)
      continue
    }

    // Evaluate trigger condition
    const shouldRun = config.shouldTrigger(project, existingRuns)

    if (shouldRun) {
      // Check dependencies
      if (config.dependencies?.length) {
        const dependenciesMet = config.dependencies.every(dep => {
          const depRun = existingRuns.find(r => r.analyzer_type === dep)
          return depRun?.status === 'completed'
        })

        if (!dependenciesMet) {
          log.debug(`🎯 Skipping ${config.type} - dependencies not met`, {
            dependencies: config.dependencies,
          })
          continue
        }
      }

      toTrigger.push(config.type)
      log.info(`🎯 Will trigger: ${config.icon} ${config.name}`)
    }
  }

  // Build summary message
  let summary = ''
  if (toTrigger.length === 0 && alreadyRunning.length === 0) {
    summary = '✨ All analyzers up to date!'
  } else if (toTrigger.length > 0) {
    const names = toTrigger.map(t => ANALYZER_REGISTRY[t].name).join(', ')
    summary = `🚀 Triggering: ${names}`
  } else if (alreadyRunning.length > 0) {
    summary = `⏳ Analyzers still running: ${alreadyRunning.length}`
  }

  const result: TriggerResult = {
    toTrigger,
    alreadyRunning,
    completed,
    summary,
  }

  log.success('🎯 Trigger evaluation complete', {
    toTrigger: toTrigger.length,
    alreadyRunning: alreadyRunning.length,
    completed: completed.length,
  })

  return result
}

/**
 * Check if a specific analyzer should be triggered
 *
 * @param analyzerType - The analyzer to check
 * @param project - The project to check against
 * @param existingRuns - Existing runs for this project
 * @returns boolean
 */
export function shouldTriggerAnalyzer(
  analyzerType: AnalyzerType,
  project: BusinessProject,
  existingRuns: AnalyzerRun[]
): boolean {
  const config = ANALYZER_REGISTRY[analyzerType]
  if (!config) {
    log.warn(`🎯 Unknown analyzer type: ${analyzerType}`)
    return false
  }

  return config.shouldTrigger(project, existingRuns)
}

/**
 * Check what inputs are missing for an analyzer
 * Useful for UI to show why an analyzer isn't running
 *
 * @param analyzerType - The analyzer to check
 * @param project - The project to check against
 * @returns List of missing requirements
 */
export function getMissingRequirements(
  analyzerType: AnalyzerType,
  project: BusinessProject
): string[] {
  const missing: string[] = []

  switch (analyzerType) {
    case 'web_scraper':
      if (!project.website_url?.trim()) {
        missing.push('Website URL')
      }
      break

    case 'clarity':
      if (!project.idea_name) missing.push('Idea name')
      if (!project.problem_statement) missing.push('Problem statement')
      if (!project.target_audience?.length) missing.push('Target audience')
      break

    case 'narrative':
      if (!project.problem_statement) missing.push('Problem statement')
      if (!project.secret_sauce) missing.push('Secret sauce')
      if (!project.differentiation_axis) missing.push('Differentiation')
      break

    case 'voice':
      if (!project.company_values?.length) missing.push('Brand words')
      if (!project.target_audience?.length) missing.push('Target audience')
      break

    case 'synthesis':
      if (!project.idea_name) missing.push('Idea name')
      if (!project.problem_statement) missing.push('Problem statement')
      if (!project.secret_sauce) missing.push('Secret sauce')
      break

    default:
      // Other analyzers have less strict requirements
      break
  }

  return missing
}

/**
 * Get a human-readable status message for an analyzer
 *
 * @param analyzerType - The analyzer
 * @param existingRuns - Existing runs
 * @returns Status message
 */
export function getAnalyzerStatusMessage(
  analyzerType: AnalyzerType,
  existingRuns: AnalyzerRun[]
): string {
  const run = existingRuns.find(r => r.analyzer_type === analyzerType)

  if (!run) {
    return 'Not started'
  }

  switch (run.status) {
    case 'pending':
      return '⏳ Waiting to start...'
    case 'running':
      return '🔄 Analyzing...'
    case 'completed':
      return '✅ Complete'
    case 'failed':
      return `❌ Failed: ${run.error_message || 'Unknown error'}`
    default:
      return 'Unknown status'
  }
}
