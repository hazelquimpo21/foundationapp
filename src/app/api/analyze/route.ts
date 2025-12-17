/**
 * 🤖 ANALYZE API ROUTE
 * ====================
 * Triggers AI analyzers for a project.
 *
 * POST /api/analyze
 * Body: { projectId, analyzerType }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Analyzer configurations
const ANALYZERS = {
  clarity: {
    name: 'Idea Clarity',
    systemPrompt: `You are an expert business analyst. Analyze this business idea for clarity and coherence.

Evaluate:
1. Is the core idea clearly articulated?
2. Is the target audience well-defined?
3. Is the problem statement compelling?
4. Are there implied assumptions that should be explicit?

Be constructive and specific. Provide a clarity score from 1-100.`,
    outputFields: ['ai_clarity_score', 'ai_one_liner', 'ai_implied_assumptions'],
  },
  synthesis: {
    name: 'Full Synthesis',
    systemPrompt: `You are a seasoned startup advisor. Synthesize everything you know about this business into:

1. A viability score (1-100) - how likely is this to succeed?
2. A comprehensive summary (2-3 paragraphs)
3. Key strengths (3-5 bullet points)
4. Key weaknesses/risks (3-5 bullet points)
5. Recommended next steps (3-5 actionable items)

Be honest but constructive. Focus on actionable insights.`,
    outputFields: ['ai_viability_score', 'ai_summary', 'ai_strengths', 'ai_weaknesses', 'ai_next_steps'],
  },
}

export async function POST(request: NextRequest) {
  console.log('🤖 [API] Analyze request received')

  try {
    const body = await request.json()
    const { projectId, analyzerType } = body

    if (!projectId || !analyzerType) {
      return NextResponse.json(
        { error: 'Missing projectId or analyzerType' },
        { status: 400 }
      )
    }

    const analyzer = ANALYZERS[analyzerType as keyof typeof ANALYZERS]
    if (!analyzer) {
      return NextResponse.json(
        { error: 'Invalid analyzer type' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('business_projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Create analyzer run record
    const { data: run, error: runError } = await supabase
      .from('analyzer_runs')
      .insert({
        project_id: projectId,
        analyzer_type: analyzerType,
        status: 'running',
        trigger_reason: 'manual',
        input_snapshot: project,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (runError) throw runError

    console.log('🤖 [API] Analyzer run created:', run.id)

    // Build project context for GPT
    const projectContext = buildProjectContext(project)

    // Phase 1: Analysis
    console.log('🤖 [API] Phase 1: Running analysis...')
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: analyzer.systemPrompt },
        { role: 'user', content: projectContext },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const rawAnalysis = analysisResponse.choices[0]?.message?.content
    if (!rawAnalysis) throw new Error('No analysis response')

    console.log('🤖 [API] Phase 1 complete, raw analysis length:', rawAnalysis.length)

    // Phase 2: Parse into structured fields
    console.log('🤖 [API] Phase 2: Parsing into fields...')
    const parsedFields = await parseAnalysis(rawAnalysis, analyzerType)

    console.log('🤖 [API] Phase 2 complete, parsed fields:', Object.keys(parsedFields))

    // Update analyzer run with results
    await supabase
      .from('analyzer_runs')
      .update({
        status: 'completed',
        raw_analysis: rawAnalysis,
        parsed_fields: parsedFields,
        completed_at: new Date().toISOString(),
      })
      .eq('id', run.id)

    // Update project with AI fields
    await supabase
      .from('business_projects')
      .update(parsedFields)
      .eq('id', projectId)

    console.log('🤖 [API] Analysis complete!')

    return NextResponse.json({
      success: true,
      runId: run.id,
      rawAnalysis,
      parsedFields,
    })
  } catch (error) {
    console.error('🤖 [API] Error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
}

/**
 * Build project context string for GPT
 */
function buildProjectContext(project: Record<string, unknown>): string {
  const sections = []

  // Core Idea
  if (project.idea_name || project.one_liner || project.problem_statement) {
    sections.push(`## Core Idea
- Name: ${project.idea_name || 'Not specified'}
- One-liner: ${project.one_liner || 'Not specified'}
- Problem: ${project.problem_statement || 'Not specified'}
- Target audience: ${(project.target_audience as string[])?.join(', ') || 'Not specified'}
- Why now: ${project.why_now || 'Not specified'} (${project.why_now_driver || ''})`)
  }

  // Value Prop
  if (project.secret_sauce || project.validation_status) {
    sections.push(`## Value Proposition
- Secret sauce: ${project.secret_sauce || 'Not specified'}
- Existing solutions: ${(project.existing_solutions as string[])?.join(', ') || 'Not specified'}
- Differentiation: ${project.differentiation_axis || 'Not specified'}
- Validation status: ${project.validation_status || 'Not specified'}`)
  }

  // Market
  if (project.market_size_estimate || project.competitors) {
    sections.push(`## Market
- Market size: ${project.market_size_estimate || 'Not specified'}
- Known competitors: ${(project.competitors as string[])?.join(', ') || 'Not specified'}
- Positioning: ${project.positioning || 'Not specified'}`)
  }

  // Business Model
  if (project.revenue_model || project.customer_type) {
    sections.push(`## Business Model
- Revenue model: ${(project.revenue_model as string[])?.join(', ') || 'Not specified'}
- Customer type: ${project.customer_type || 'Not specified'}
- Pricing tier: ${project.pricing_tier || 'Not specified'}/5
- Sales motion: ${project.sales_motion || 'Not specified'}`)
  }

  // Execution
  if (project.team_size || project.funding_status) {
    sections.push(`## Execution
- Team: ${project.team_size || 'Not specified'}
- Funding: ${project.funding_status || 'Not specified'}
- Timeline: ${project.timeline_months || 'Not specified'} months
- Biggest risks: ${(project.biggest_risks as string[])?.join(', ') || 'Not specified'}`)
  }

  // Vision
  if (project.north_star_metric || project.exit_vision) {
    sections.push(`## Vision
- North star metric: ${project.north_star_metric || 'Not specified'}
- Values: ${(project.company_values as string[])?.join(', ') || 'Not specified'}
- Exit vision: ${project.exit_vision || 'Not specified'}`)
  }

  return sections.join('\n\n') || 'No information provided yet.'
}

/**
 * Parse raw analysis into structured fields using function calling
 */
async function parseAnalysis(
  rawAnalysis: string,
  analyzerType: string
): Promise<Record<string, unknown>> {
  const schemas: Record<string, OpenAI.Chat.ChatCompletionTool> = {
    clarity: {
      type: 'function',
      function: {
        name: 'save_clarity_analysis',
        description: 'Save the clarity analysis results',
        parameters: {
          type: 'object',
          properties: {
            ai_clarity_score: {
              type: 'number',
              description: 'Clarity score from 1-100',
            },
            ai_one_liner: {
              type: 'string',
              description: 'A refined one-liner for the business',
            },
            ai_implied_assumptions: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of implied assumptions',
            },
          },
          required: ['ai_clarity_score'],
        },
      },
    },
    synthesis: {
      type: 'function',
      function: {
        name: 'save_synthesis_analysis',
        description: 'Save the synthesis analysis results',
        parameters: {
          type: 'object',
          properties: {
            ai_viability_score: {
              type: 'number',
              description: 'Viability score from 1-100',
            },
            ai_summary: {
              type: 'string',
              description: 'Comprehensive summary of the business',
            },
            ai_strengths: {
              type: 'array',
              items: { type: 'string' },
              description: 'Key strengths',
            },
            ai_weaknesses: {
              type: 'array',
              items: { type: 'string' },
              description: 'Key weaknesses/risks',
            },
            ai_next_steps: {
              type: 'array',
              items: { type: 'string' },
              description: 'Recommended next steps',
            },
          },
          required: ['ai_viability_score', 'ai_summary'],
        },
      },
    },
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Extract structured data from this analysis. Call the appropriate function with the extracted data.',
      },
      {
        role: 'user',
        content: rawAnalysis,
      },
    ],
    tools: [schemas[analyzerType]],
    tool_choice: 'required',
  })

  const toolCall = response.choices[0]?.message?.tool_calls?.[0]
  if (toolCall?.function?.arguments) {
    return JSON.parse(toolCall.function.arguments)
  }

  return {}
}
