/**
 * 🌐 WEB SCRAPER ANALYZER API
 * ===========================
 * POST /api/analyzers/web-scraper
 *
 * Runs the web scraper analyzer for a project.
 *
 * Request body:
 *   { projectId: string, runId?: string }
 *
 * Response:
 *   { success: boolean, runId: string, ... }
 *
 * This endpoint:
 * 1. Fetches the project
 * 2. Marks the run as "running"
 * 3. Scrapes the website
 * 4. Runs AI analysis (Phase 1 + Phase 2)
 * 5. Updates the project with results
 * 6. Marks the run as "completed"
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { log } from '@/lib/utils/logger'
import { runWebScraperAnalyzer, formatApiResponse } from '@/lib/analyzers/web-scraper'
import type { BusinessProject } from '@/lib/types'
import type { RunAnalyzerRequest, RunAnalyzerResponse } from '@/lib/analyzers/types'

// ============================================
// 📋 CONFIG
// ============================================

/** Max retries for failed runs */
const MAX_RETRIES = 3

// ============================================
// 🤖 OPENAI CLIENT
// ============================================

let openaiClient: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('❌ OPENAI_API_KEY environment variable is not set')
    }
    openaiClient = new OpenAI({ apiKey })
  }
  return openaiClient
}

// ============================================
// 🚀 POST HANDLER
// ============================================

export async function POST(request: NextRequest) {
  log.info('🌐 [API] Web scraper request received')

  let runId: string | undefined

  try {
    // Parse request body
    const body = (await request.json()) as RunAnalyzerRequest
    const { projectId } = body
    runId = body.runId

    if (!projectId) {
      log.warn('🌐 [API] Missing projectId')
      return NextResponse.json(
        { success: false, error: 'Missing projectId' },
        { status: 400 }
      )
    }

    log.debug('🌐 [API] Request params', { projectId, runId })

    // Get Supabase client
    const supabase = await createServerClient()

    // Verify user is authenticated (for direct calls)
    // Note: When called from trigger endpoint, we trust the internal call
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      log.warn('🌐 [API] Unauthorized - no session')
      // For internal calls, continue anyway (trigger endpoint handles auth)
    }

    // Fetch the project
    const { data: project, error: projectError } = await supabase
      .from('business_projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      log.warn('🌐 [API] Project not found', { projectId })
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    // Validate we have a website URL
    if (!project.website_url?.trim()) {
      log.warn('🌐 [API] No website URL on project')
      return NextResponse.json(
        { success: false, error: 'No website URL provided' },
        { status: 400 }
      )
    }

    // If no runId provided, create a new run
    if (!runId) {
      const { data: newRun, error: createError } = await supabase
        .from('analyzer_runs')
        .insert({
          project_id: projectId,
          analyzer_type: 'web_scraper',
          status: 'pending',
          trigger_reason: 'direct',
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (createError) {
        log.error('🌐 [API] Failed to create run', createError)
        throw createError
      }
      runId = newRun.id
    }

    // Mark run as running
    const { error: updateError } = await supabase
      .from('analyzer_runs')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        input_snapshot: {
          website_url: project.website_url,
          project_name: project.project_name,
        },
      })
      .eq('id', runId)

    if (updateError) {
      log.warn('🌐 [API] Failed to update run status', updateError)
    }

    log.info('🌐 [API] Starting analyzer...', { runId, url: project.website_url })

    // Run the analyzer
    const openai = getOpenAI()
    const result = await runWebScraperAnalyzer(project as BusinessProject, openai)

    // Update the project with results
    const { error: projectUpdateError } = await supabase
      .from('business_projects')
      .update(result.fieldsToUpdate)
      .eq('id', projectId)

    if (projectUpdateError) {
      log.error('🌐 [API] Failed to update project', projectUpdateError)
      throw projectUpdateError
    }

    log.success('🌐 [API] Project updated with scraped data')

    // Mark run as completed
    await supabase
      .from('analyzer_runs')
      .update({
        status: 'completed',
        raw_analysis: result.rawAnalysis,
        parsed_fields: result.parsedFields,
        confidence_score: result.parsedFields.confidence,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId)

    log.success('🌐 [API] Web scraper analyzer complete!', {
      runId,
      tagline: result.parsedFields.tagline,
      socialsFound: Object.keys(result.scrapedData.socialUrls).length,
    })

    // Return success response
    const response = formatApiResponse(runId!, result)
    return NextResponse.json(response)

  } catch (error) {
    log.error('🌐 [API] Web scraper error', error)

    // Try to mark run as failed
    if (runId) {
      try {
        const supabase = await createServerClient()

        // Get current retry count
        const { data: run } = await supabase
          .from('analyzer_runs')
          .select('retry_count')
          .eq('id', runId)
          .single()

        const retryCount = (run?.retry_count || 0) + 1

        await supabase
          .from('analyzer_runs')
          .update({
            status: retryCount < MAX_RETRIES ? 'pending' : 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            retry_count: retryCount,
            completed_at: retryCount >= MAX_RETRIES ? new Date().toISOString() : null,
          })
          .eq('id', runId)
      } catch (updateErr) {
        log.error('🌐 [API] Failed to update run status', updateErr)
      }
    }

    const response: RunAnalyzerResponse = {
      success: false,
      runId: runId || '',
      analyzerType: 'web_scraper',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
