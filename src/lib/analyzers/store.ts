/**
 * 🏪 ANALYZER STORE
 * =================
 * Zustand store for managing analyzer state in the UI.
 *
 * Responsibilities:
 * - Track analyzer runs for the current project
 * - Handle triggering analyzers
 * - Subscribe to realtime updates
 * - Provide loading/error states
 *
 * Usage:
 *   const { runs, triggerAnalyzers, isRunning } = useAnalyzerStore()
 */

import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { log } from '@/lib/utils/logger'
import type { AnalyzerRun, AnalyzerType, TriggerAnalyzersResponse } from './types'
import { ANALYZER_REGISTRY } from './registry'

// ============================================
// 📋 TYPES
// ============================================

interface AnalyzerState {
  // State
  runs: AnalyzerRun[]
  isLoading: boolean
  isTriggering: boolean
  error: string | null

  // Current project ID being tracked
  currentProjectId: string | null

  // Actions
  loadRuns: (projectId: string) => Promise<void>
  triggerAnalyzers: (projectId: string, analyzerType?: AnalyzerType) => Promise<TriggerAnalyzersResponse>
  subscribeToUpdates: (projectId: string) => () => void
  getRunByType: (type: AnalyzerType) => AnalyzerRun | undefined
  clearRuns: () => void
}

// ============================================
// 🏪 STORE
// ============================================

export const useAnalyzerStore = create<AnalyzerState>((set, get) => ({
  // Initial state
  runs: [],
  isLoading: false,
  isTriggering: false,
  error: null,
  currentProjectId: null,

  /**
   * 📥 Load all analyzer runs for a project
   */
  loadRuns: async (projectId: string) => {
    log.info('🤖 Loading analyzer runs...', { projectId })
    set({ isLoading: true, error: null, currentProjectId: projectId })

    try {
      const { data, error } = await supabase
        .from('analyzer_runs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error

      log.success('🤖 Analyzer runs loaded', { count: data?.length || 0 })
      set({ runs: data || [], isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load runs'
      log.error('🤖 Failed to load analyzer runs', error)
      set({ isLoading: false, error: message })
    }
  },

  /**
   * 🚀 Trigger analyzers for a project
   */
  triggerAnalyzers: async (projectId: string, analyzerType?: AnalyzerType) => {
    log.info('🚀 Triggering analyzers...', { projectId, analyzerType })
    set({ isTriggering: true, error: null })

    try {
      const response = await fetch('/api/analyzers/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, analyzerType }),
      })

      const data: TriggerAnalyzersResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to trigger analyzers')
      }

      log.success('🚀 Analyzers triggered', { triggered: data.triggered })

      // Reload runs to get updated state
      await get().loadRuns(projectId)

      set({ isTriggering: false })
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to trigger'
      log.error('🚀 Failed to trigger analyzers', error)
      set({ isTriggering: false, error: message })
      return {
        success: false,
        triggered: [],
        message: 'Failed to trigger analyzers',
        error: message,
      }
    }
  },

  /**
   * 📡 Subscribe to realtime updates for analyzer runs
   * Returns unsubscribe function
   */
  subscribeToUpdates: (projectId: string) => {
    log.info('📡 Subscribing to analyzer updates...', { projectId })

    const channel = supabase
      .channel(`analyzer-runs-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analyzer_runs',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          log.debug('📡 Analyzer run update received', { type: payload.eventType })

          const currentRuns = get().runs

          if (payload.eventType === 'INSERT') {
            const newRun = payload.new as AnalyzerRun
            const config = ANALYZER_REGISTRY[newRun.analyzer_type]
            log.info(`🤖 ${config?.icon || '⚙️'} ${config?.name || newRun.analyzer_type} started`)
            set({ runs: [newRun, ...currentRuns] })
          }

          if (payload.eventType === 'UPDATE') {
            const updatedRun = payload.new as AnalyzerRun
            const config = ANALYZER_REGISTRY[updatedRun.analyzer_type]

            // Log status changes
            if (updatedRun.status === 'completed') {
              log.success(`🤖 ${config?.icon || '✅'} ${config?.name || updatedRun.analyzer_type} complete!`)
            } else if (updatedRun.status === 'failed') {
              log.error(`🤖 ${config?.icon || '❌'} ${config?.name || updatedRun.analyzer_type} failed`, undefined, {
                error: updatedRun.error_message,
              })
            }

            set({
              runs: currentRuns.map(r =>
                r.id === updatedRun.id ? updatedRun : r
              ),
            })
          }

          if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id
            set({ runs: currentRuns.filter(r => r.id !== deletedId) })
          }
        }
      )
      .subscribe()

    // Return unsubscribe function
    return () => {
      log.debug('📡 Unsubscribing from analyzer updates')
      supabase.removeChannel(channel)
    }
  },

  /**
   * 🔍 Get a specific run by analyzer type
   */
  getRunByType: (type: AnalyzerType) => {
    return get().runs.find(r => r.analyzer_type === type)
  },

  /**
   * 🧹 Clear all runs (when switching projects)
   */
  clearRuns: () => {
    set({ runs: [], currentProjectId: null, error: null })
  },
}))

// ============================================
// 🎣 HELPER HOOKS
// ============================================

/**
 * Check if any analyzer is currently running
 */
export function useIsAnalyzerRunning(): boolean {
  const runs = useAnalyzerStore(state => state.runs)
  return runs.some(r => r.status === 'running' || r.status === 'pending')
}

/**
 * Get the latest run for a specific analyzer type
 */
export function useAnalyzerRun(type: AnalyzerType): AnalyzerRun | undefined {
  const runs = useAnalyzerStore(state => state.runs)
  return runs.find(r => r.analyzer_type === type)
}

/**
 * Get all completed analyzer runs
 */
export function useCompletedAnalyzers(): AnalyzerRun[] {
  const runs = useAnalyzerStore(state => state.runs)
  return runs.filter(r => r.status === 'completed')
}
