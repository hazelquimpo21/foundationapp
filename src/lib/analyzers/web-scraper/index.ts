/**
 * 🌐 WEB SCRAPER ANALYZER
 * =======================
 * Main orchestration for the web scraper analyzer.
 *
 * This analyzer:
 * 1. Scrapes the provided website URL
 * 2. Runs Phase 1: AI analysis of the content
 * 3. Runs Phase 2: Extract structured fields
 * 4. Updates the project with inferred data
 *
 * Flow:
 *   website_url saved → trigger → scrape → analyze → parse → update project
 */

import OpenAI from 'openai'
import { log } from '@/lib/utils/logger'
import type { BusinessProject } from '@/lib/types'
import type { WebScraperParsedOutput, ScrapedData, RunAnalyzerResponse } from '../types'
import { scrapeWebsite } from './scraper'
import { buildPhase1Prompt, buildMinimalPrompt } from './prompt'
import { PHASE2_SCHEMA, RawParsedOutput, transformParsedOutput, getFieldsToUpdate } from './schema'

// ============================================
// 📋 CONFIG
// ============================================

/** OpenAI model to use */
const MODEL = 'gpt-4o-mini'

/** Max tokens for analysis */
const MAX_TOKENS = 1500

// ============================================
// 🤖 ANALYZER FUNCTIONS
// ============================================

/**
 * Run Phase 1: Natural language analysis
 *
 * @param openai - OpenAI client
 * @param scrapedData - Data from the website scrape
 * @param project - The business project
 * @returns Raw analysis text
 */
async function runPhase1Analysis(
  openai: OpenAI,
  scrapedData: ScrapedData,
  project: BusinessProject
): Promise<string> {
  log.info('🤖 Phase 1: Running analysis...', { url: scrapedData.url })

  const prompt = scrapedData.success
    ? buildPhase1Prompt(scrapedData, {
        projectName: project.project_name,
        ideaName: project.idea_name ?? undefined,
        problemStatement: project.problem_statement ?? undefined,
      })
    : buildMinimalPrompt(scrapedData.url)

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a business analyst who helps extract insights from website content. Be specific and use evidence from the content.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: MAX_TOKENS,
  })

  const analysis = response.choices[0]?.message?.content

  if (!analysis) {
    throw new Error('No analysis returned from OpenAI')
  }

  log.success('🤖 Phase 1 complete', { length: analysis.length })
  return analysis
}

/**
 * Run Phase 2: Extract structured fields
 *
 * @param openai - OpenAI client
 * @param rawAnalysis - Phase 1 analysis text
 * @returns Parsed structured output
 */
async function runPhase2Parsing(
  openai: OpenAI,
  rawAnalysis: string
): Promise<RawParsedOutput> {
  log.info('🤖 Phase 2: Parsing into fields...')

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'Extract structured data from this website analysis. Use the function provided.',
      },
      {
        role: 'user',
        content: rawAnalysis,
      },
    ],
    tools: [PHASE2_SCHEMA],
    tool_choice: 'required',
  })

  const toolCall = response.choices[0]?.message?.tool_calls?.[0]

  if (!toolCall || toolCall.type !== 'function') {
    throw new Error('No function call returned from OpenAI')
  }

  const parsedFields = JSON.parse(toolCall.function.arguments) as RawParsedOutput

  log.success('🤖 Phase 2 complete', { fields: Object.keys(parsedFields) })
  return parsedFields
}

// ============================================
// 🚀 MAIN RUN FUNCTION
// ============================================

/**
 * Run the web scraper analyzer
 *
 * This is the main entry point called by the API route.
 *
 * @param project - The business project to analyze
 * @param openai - OpenAI client instance
 * @returns The analyzer result
 */
export async function runWebScraperAnalyzer(
  project: BusinessProject,
  openai: OpenAI
): Promise<{
  rawAnalysis: string
  parsedFields: WebScraperParsedOutput
  fieldsToUpdate: Record<string, unknown>
  scrapedData: ScrapedData
}> {
  log.info('🌐 Starting web scraper analyzer', {
    projectId: project.id,
    url: project.website_url,
  })

  // Validate we have a URL
  if (!project.website_url?.trim()) {
    throw new Error('No website URL provided')
  }

  // Step 1: Scrape the website
  log.info('🌐 Step 1: Scraping website...')
  const scrapedData = await scrapeWebsite(project.website_url)

  if (!scrapedData.success) {
    log.warn('🌐 Website scrape failed, proceeding with minimal data', {
      error: scrapedData.error,
    })
  }

  // Step 2: Run Phase 1 analysis
  const rawAnalysis = await runPhase1Analysis(openai, scrapedData, project)

  // Step 3: Run Phase 2 parsing
  const rawParsed = await runPhase2Parsing(openai, rawAnalysis)

  // Step 4: Transform output
  const parsedFields = transformParsedOutput(rawParsed, scrapedData.socialUrls)

  // Step 5: Get fields to update
  const fieldsToUpdate = getFieldsToUpdate(parsedFields, scrapedData.content)

  log.success('🌐 Web scraper analyzer complete!', {
    tagline: parsedFields.tagline,
    servicesCount: parsedFields.services.length,
    industry: parsedFields.industry,
    socialsFound: Object.keys(scrapedData.socialUrls).length,
    confidence: parsedFields.confidence,
  })

  return {
    rawAnalysis,
    parsedFields,
    fieldsToUpdate,
    scrapedData,
  }
}

/**
 * Format the analyzer result for the API response
 */
export function formatApiResponse(
  runId: string,
  result: Awaited<ReturnType<typeof runWebScraperAnalyzer>>
): RunAnalyzerResponse {
  return {
    success: true,
    runId,
    analyzerType: 'web_scraper',
    status: 'completed',
    rawAnalysis: result.rawAnalysis,
    parsedFields: result.fieldsToUpdate,
  }
}
