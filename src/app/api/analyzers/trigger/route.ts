/**
 * 🎯 ANALYZER TRIGGER API
 * =======================
 * POST /api/analyzers/trigger
 *
 * Evaluates which analyzers should run for a project
 * and triggers them asynchronously.
 *
 * Request body:
 *   { projectId: string, analyzerType?: string, force?: boolean }
 *
 * Response:
 *   { success: boolean, triggered: string[], message: string }
 *
 * This endpoint:
 * 1. Fetches the project and existing analyzer runs
 * 2. Evaluates trigger conditions
 * 3. Creates pending run records
 * 4. Kicks off analyzers asynchronously
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { log } from '@/lib/utils/logger'
import { evaluateTriggers } from '@/lib/analyzers/triggers'
import { ANALYZER_REGISTRY } from '@/lib/analyzers/registry'
import type {
  AnalyzerType,
  TriggerAnalyzersRequest,
  TriggerAnalyzersResponse,
} from '@/lib/analyzers/types'
import type { BusinessProject } from '@/lib/types'

// ============================================
// 📋 CONFIG
// ============================================

/** Base URL for analyzer API calls - use request URL for self-reference */
function getBaseUrl(request: NextRequest): string {
  const url = new URL(request.url)
  return `${url.protocol}//${url.host}`
}

// ============================================
// 🚀 POST HANDLER
// ============================================

export async function POST(request: NextRequest) {
  log.info('🎯 [API] Trigger request received')

  try {
    // Parse request body
    const body = (await request.json()) as TriggerAnalyzersRequest
    const { projectId, analyzerType, force = false } = body

    if (!projectId) {
      log.warn('🎯 [API] Missing projectId')
      return NextResponse.json(
        { success: false, triggered: [], message: 'Missing projectId', error: 'Missing projectId' },
        { status: 400 }
      )
    }

    log.debug('🎯 [API] Request params', { projectId, analyzerType, force })

    // Get Supabase client
    const supabase = await createServerClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      log.warn('🎯 [API] Unauthorized')
      return NextResponse.json(
        { success: false, triggered: [], message: 'Unauthorized', error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch the project
    const { data: project, error: projectError } = await supabase
      .from('business_projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      log.warn('🎯 [API] Project not found', { projectId })
      return NextResponse.json(
        { success: false, triggered: [], message: 'Project not found', error: 'Project not found' },
        { status: 404 }
      )
    }

    // Fetch existing analyzer runs
    const { data: existingRuns, error: runsError } = await supabase
      .from('analyzer_runs')
      .select('*')
      .eq('project_id', projectId)

    if (runsError) {
      log.error('🎯 [API] Failed to fetch runs', runsError)
      throw runsError
    }

    // Determine which analyzers to trigger
    let toTrigger: AnalyzerType[] = []

    if (analyzerType) {
      // Specific analyzer requested
      const config = ANALYZER_REGISTRY[analyzerType as AnalyzerType]
      if (!config) {
        return NextResponse.json(
          { success: false, triggered: [], message: `Unknown analyzer: ${analyzerType}`, error: 'Unknown analyzer' },
          { status: 400 }
        )
      }

      // Check if already running (unless force)
      const existingRun = existingRuns?.find(r => r.analyzer_type === analyzerType)
      if (!force && (existingRun?.status === 'pending' || existingRun?.status === 'running')) {
        return NextResponse.json({
          success: true,
          triggered: [],
          message: `${config.name} is already running`,
        })
      }

      // Check trigger condition
      const shouldRun = force || config.shouldTrigger(project as BusinessProject, existingRuns || [])
      if (shouldRun) {
        toTrigger.push(analyzerType as AnalyzerType)
      } else {
        return NextResponse.json({
          success: true,
          triggered: [],
          message: `${config.name} trigger conditions not met`,
        })
      }
    } else {
      // Auto-detect which analyzers to trigger
      const triggerResult = evaluateTriggers(project as BusinessProject, existingRuns || [])
      toTrigger = triggerResult.toTrigger
    }

    if (toTrigger.length === 0) {
      log.info('🎯 [API] No analyzers to trigger')
      return NextResponse.json({
        success: true,
        triggered: [],
        message: 'No analyzers need to run right now',
      })
    }

    // Create pending run records and trigger analyzers
    const triggered: AnalyzerType[] = []

    for (const type of toTrigger) {
      const config = ANALYZER_REGISTRY[type]

      try {
        // Check if there's an existing run to clean up first
        const existingRun = existingRuns?.find(r => r.analyzer_type === type)
        if (existingRun && force) {
          // Delete the old run if forcing
          await supabase
            .from('analyzer_runs')
            .delete()
            .eq('id', existingRun.id)
        }

        // Create new pending run
        const { data: run, error: createError } = await supabase
          .from('analyzer_runs')
          .insert({
            project_id: projectId,
            analyzer_type: type,
            status: 'pending',
            trigger_reason: analyzerType ? 'manual' : 'auto',
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single()

        if (createError) {
          log.error(`🎯 [API] Failed to create run for ${type}`, createError)
          continue
        }

        log.info(`🎯 [API] Created pending run: ${config.icon} ${config.name}`, { runId: run.id })

        // Trigger the analyzer asynchronously (fire and forget)
        const baseUrl = getBaseUrl(request)
        fetch(`${baseUrl}/api/analyzers/${type.replace('_', '-')}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Forward auth headers
            'Cookie': request.headers.get('cookie') || '',
          },
          body: JSON.stringify({ projectId, runId: run.id }),
        }).catch(err => {
          log.error(`🎯 [API] Failed to trigger ${type}`, err)
        })

        triggered.push(type)
      } catch (err) {
        log.error(`🎯 [API] Error triggering ${type}`, err)
      }
    }

    // Build response message
    const names = triggered.map(t => ANALYZER_REGISTRY[t].name).join(', ')
    const message = triggered.length > 0
      ? `🚀 Started: ${names}`
      : 'No analyzers were triggered'

    log.success('🎯 [API] Trigger complete', { triggered })

    const response: TriggerAnalyzersResponse = {
      success: true,
      triggered,
      message,
    }

    return NextResponse.json(response)

  } catch (error) {
    log.error('🎯 [API] Trigger error', error)
    return NextResponse.json(
      {
        success: false,
        triggered: [],
        message: 'Failed to trigger analyzers',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
