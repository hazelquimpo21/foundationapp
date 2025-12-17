# Foundation Studio - Analyzer Parsers (Phase 2)

Each analyzer has a `schema.ts` file that exports the function calling schema and related utilities.

---

## File Pattern

Each `schema.ts` follows this structure:

```typescript
// /supabase/functions/analyzer-{name}/schema.ts

// The OpenAI function calling schema
export const schema = {
  name: 'save_{name}_analysis',
  description: '...',
  parameters: {
    type: 'object',
    properties: { /* ... */ },
    required: [ /* ... */ ]
  }
}

// TypeScript type for the parsed output
export interface ParsedOutput {
  // Fields matching the schema
}

// Map parsed output to brand_projects columns
export function fieldsToUpdate(parsed: ParsedOutput) {
  return {
    ai_field: parsed.field,
    // ...
  }
}
```

---

## How Parsing Works

The shared `parser.ts` utility handles the OpenAI call:

After Phase 1 produces natural language analysis, Phase 2 uses function calling to extract structured fields:

```typescript
async function parseAnalysis<T>(
  openai: OpenAI, 
  analysis: string, 
  schema: FunctionSchema
): Promise<T> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `Extract structured data from this analysis:\n\n${analysis}`
    }],
    tools: [{
      type: 'function',
      function: schema
    }],
    tool_choice: { 
      type: 'function', 
      function: { name: schema.name } 
    }
  })

  const toolCall = response.choices[0].message.tool_calls?.[0]
  if (!toolCall) throw new Error('No function call in response')
  
  return JSON.parse(toolCall.function.arguments)
}
```

---

## Web Scraper Parser

```typescript
const webScraperSchema = {
  name: 'save_web_scraper_results',
  description: 'Save the extracted website analysis data',
  parameters: {
    type: 'object',
    properties: {
      social_urls: {
        type: 'object',
        description: 'Social media URLs found on the website',
        properties: {
          instagram: { type: 'string', description: 'Instagram URL or null' },
          twitter: { type: 'string', description: 'Twitter/X URL or null' },
          linkedin: { type: 'string', description: 'LinkedIn URL or null' },
          facebook: { type: 'string', description: 'Facebook URL or null' },
          tiktok: { type: 'string', description: 'TikTok URL or null' },
          youtube: { type: 'string', description: 'YouTube URL or null' },
        }
      },
      industry_guess: {
        type: 'string',
        description: 'Specific industry classification (e.g., "Executive coaching for tech leaders")'
      },
      scraped_tagline: {
        type: 'string',
        description: 'Tagline or value proposition found on site, or null if none'
      },
      scraped_services: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of services/products mentioned'
      },
      target_audience_signals: {
        type: 'string',
        description: 'Summary of target audience indicators found'
      },
      voice_observations: {
        type: 'string', 
        description: 'Observations about brand voice from website copy'
      },
      content_quality: {
        type: 'string',
        enum: ['rich', 'moderate', 'sparse', 'placeholder'],
        description: 'How much useful content was found'
      },
      confidence_score: {
        type: 'number',
        description: 'Confidence in findings, 0.0 to 1.0'
      }
    },
    required: ['industry_guess', 'content_quality', 'confidence_score']
  }
}

// TypeScript type for parsed output
interface WebScraperParsed {
  social_urls: {
    instagram?: string
    twitter?: string
    linkedin?: string
    facebook?: string
    tiktok?: string
    youtube?: string
  }
  industry_guess: string
  scraped_tagline?: string
  scraped_services?: string[]
  target_audience_signals?: string
  voice_observations?: string
  content_quality: 'rich' | 'moderate' | 'sparse' | 'placeholder'
  confidence_score: number
}
```

### Fields Updated in brand_projects

```typescript
// Also in schema.ts:

export function fieldsToUpdate(parsed: WebScraperParsed) {
  return {
    social_urls: parsed.social_urls,
    industry_field: parsed.industry_guess,
    // Note: other parsed fields stored in analyzer_runs.parsed_fields
  }
}
```

---

## Narrative Parser

```typescript
const narrativeSchema = {
  name: 'save_narrative_analysis',
  description: 'Save the parsed brand narrative analysis',
  parameters: {
    type: 'object',
    properties: {
      positioning: {
        type: 'string',
        description: 'One sentence describing their natural brand positioning'
      },
      archetype: {
        type: 'string',
        enum: [
          'Hero', 'Outlaw', 'Magician', 'Everyman', 'Lover', 'Jester',
          'Caregiver', 'Ruler', 'Creator', 'Innocent', 'Sage', 'Explorer'
        ],
        description: 'Primary brand archetype'
      },
      archetype_rationale: {
        type: 'string',
        description: 'Brief explanation of why this archetype fits'
      },
      industry: {
        type: 'string',
        description: 'Specific industry/field classification'
      },
      target_market_inference: {
        type: 'string',
        description: 'Inferred details about target market beyond stated'
      },
      differentiation_potential: {
        type: 'string',
        description: 'What could be uniquely ownable about their positioning'
      },
      clarifying_questions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Questions that would strengthen the analysis (max 3)'
      },
      confidence_score: {
        type: 'number',
        description: 'Confidence in analysis, 0.0 to 1.0'
      }
    },
    required: ['positioning', 'archetype', 'industry', 'confidence_score']
  }
}

// TypeScript type
interface NarrativeParsed {
  positioning: string
  archetype: string
  archetype_rationale?: string
  industry: string
  target_market_inference?: string
  differentiation_potential?: string
  clarifying_questions?: string[]
  confidence_score: number
}
```

### Fields Updated

```typescript
// Also in schema.ts:

export function fieldsToUpdate(parsed: NarrativeParsed, project: BrandProject) {
  return {
    ai_positioning: parsed.positioning,
    brand_archetype: parsed.archetype,
    // Don't overwrite industry if scraper already found it
    industry_field: project.industry_field || parsed.industry,
  }
}
```

---

## Voice Parser

```typescript
const voiceSchema = {
  name: 'save_voice_analysis',
  description: 'Save the parsed brand voice analysis',
  parameters: {
    type: 'object',
    properties: {
      tone_summary: {
        type: 'string',
        description: 'One phrase describing ideal tone (e.g., "Warm and confident with a touch of playfulness")'
      },
      personality_description: {
        type: 'string',
        description: 'Brand personality described as if describing a person'
      },
      voice_guidelines: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific, actionable voice guidelines (5-7 items)'
      },
      words_to_use: {
        type: 'array',
        items: { type: 'string' },
        description: 'Vocabulary words that fit this voice (10-15)'
      },
      words_to_avoid: {
        type: 'array',
        items: { type: 'string' },
        description: 'Words that clash with this voice (5-10)'
      },
      customer_perception: {
        type: 'string',
        description: 'How the brand perceives their customer based on word choices'
      },
      archetype_alignment: {
        type: 'object',
        properties: {
          aligns: { type: 'boolean' },
          suggested_archetype: { type: 'string' },
          notes: { type: 'string' }
        },
        description: 'Whether voice aligns with previously identified archetype'
      },
      tension_notes: {
        type: 'string',
        description: 'Any contradictions or tensions in word choices, or null if none'
      },
      confidence_score: {
        type: 'number',
        description: 'Confidence in analysis, 0.0 to 1.0'
      }
    },
    required: ['tone_summary', 'voice_guidelines', 'confidence_score']
  }
}

// TypeScript type
interface VoiceParsed {
  tone_summary: string
  personality_description?: string
  voice_guidelines: string[]
  words_to_use?: string[]
  words_to_avoid?: string[]
  customer_perception?: string
  archetype_alignment?: {
    aligns: boolean
    suggested_archetype?: string
    notes?: string
  }
  tension_notes?: string
  confidence_score: number
}
```

### Fields Updated

```typescript
// Also in schema.ts:

export function fieldsToUpdate(parsed: VoiceParsed) {
  return {
    brand_tone: parsed.tone_summary,
    ai_voice_guidelines: parsed.voice_guidelines.join('\n'),
  }
}
```

---

## Synthesis Parser

```typescript
const synthesisSchema = {
  name: 'save_synthesis_results',
  description: 'Save the complete brand foundation synthesis',
  parameters: {
    type: 'object',
    properties: {
      brand_story: {
        type: 'string',
        description: 'Compelling 2-3 paragraph brand narrative'
      },
      value_proposition: {
        type: 'string',
        description: 'One sentence value proposition'
      },
      positioning_statement: {
        type: 'string',
        description: 'Formal positioning statement following For/Is/That/Because format'
      },
      audience_persona: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Persona name' },
          description: { type: 'string', description: 'Full persona description' },
          pain_points: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Key pain points (3-5)'
          },
          aspirations: {
            type: 'array',
            items: { type: 'string' },
            description: 'Key aspirations (3-5)'
          }
        }
      },
      voice_summary: {
        type: 'array',
        items: { type: 'string' },
        description: 'Distilled voice guidelines (3-5 memorable points)'
      },
      differentiators: {
        type: 'array',
        items: { type: 'string' },
        description: 'Key differentiators (3-5 specific points)'
      },
      brand_promise: {
        type: 'string',
        description: 'One sentence brand promise'
      },
      gaps_acknowledged: {
        type: 'array',
        items: { type: 'string' },
        description: 'Areas where more information would strengthen foundation'
      },
      confidence_score: {
        type: 'number',
        description: 'Overall confidence in synthesis, 0.0 to 1.0'
      }
    },
    required: [
      'brand_story', 
      'value_proposition', 
      'positioning_statement',
      'differentiators',
      'confidence_score'
    ]
  }
}

// TypeScript type
interface SynthesisParsed {
  brand_story: string
  value_proposition: string
  positioning_statement: string
  audience_persona?: {
    name: string
    description: string
    pain_points?: string[]
    aspirations?: string[]
  }
  voice_summary?: string[]
  differentiators: string[]
  brand_promise?: string
  gaps_acknowledged?: string[]
  confidence_score: number
}
```

### Fields Updated

```typescript
// Also in schema.ts:

export function fieldsToUpdate(parsed: SynthesisParsed, project: BrandProject) {
  return {
    ai_brand_story: parsed.brand_story,
    ai_value_prop: parsed.value_proposition,
    ai_positioning: parsed.positioning_statement, // Overwrites narrative's simpler version
    ai_audience_persona: JSON.stringify(parsed.audience_persona),
    ai_voice_guidelines: parsed.voice_summary?.join('\n') || project.ai_voice_guidelines,
    ai_differentiators: parsed.differentiators,
  }
}
```

---

## Benefit Language Parser

```typescript
const benefitLanguageSchema = {
  name: 'save_benefit_language',
  description: 'Save generated benefit language and copy',
  parameters: {
    type: 'object',
    properties: {
      so_that_statements: {
        type: 'array',
        items: { type: 'string' },
        description: '6 "so that I can" statements from customer POV'
      },
      wouldnt_you_like: {
        type: 'array',
        items: { type: 'string' },
        description: '6 "Wouldn\'t you like to..." questions'
      },
      headlines: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            headline: { type: 'string' },
            subheadline: { type: 'string' }
          }
        },
        description: '3 headline options with optional subheadlines'
      },
      elevator_pitch: {
        type: 'string',
        description: '30-second elevator pitch'
      },
      social_bio: {
        type: 'string',
        description: 'Social media bio (160 chars or less)'
      },
      email_subject_lines: {
        type: 'array',
        items: { type: 'string' },
        description: '5 welcome email subject line options'
      }
    },
    required: [
      'so_that_statements',
      'wouldnt_you_like', 
      'headlines',
      'elevator_pitch'
    ]
  }
}

// TypeScript type
interface BenefitLanguageParsed {
  so_that_statements: string[]
  wouldnt_you_like: string[]
  headlines: Array<{
    headline: string
    subheadline?: string
  }>
  elevator_pitch: string
  social_bio?: string
  email_subject_lines?: string[]
}
```

### Saved to generated_outputs Table

```typescript
// This analyzer is different - it doesn't update brand_projects
// Instead, schema.ts exports a save function:

export async function saveOutput(
  supabase: SupabaseClient,
  projectId: string, 
  runId: string,
  parsed: BenefitLanguageParsed
) {
  return supabase.from('generated_outputs').insert({
    brand_project_id: projectId,
    analyzer_run_id: runId,
    output_type: 'benefit_language',
    output_data: parsed,
  })
}
```

---

## Shared Parser Utility

```typescript
// /supabase/functions/_shared/parser.ts

import OpenAI from 'openai'

export async function parseWithSchema<T>(
  openai: OpenAI,
  analysis: string,
  schema: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
): Promise<T> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: 'Extract structured data from the provided analysis. Be thorough but only include information that is clearly present or can be confidently inferred.'
    }, {
      role: 'user',
      content: analysis
    }],
    tools: [{
      type: 'function',
      function: schema
    }],
    tool_choice: { 
      type: 'function', 
      function: { name: schema.name } 
    },
    temperature: 0.3  // Lower temperature for more consistent parsing
  })

  const toolCall = response.choices[0].message.tool_calls?.[0]
  
  if (!toolCall) {
    throw new Error('Parser did not return function call')
  }
  
  try {
    return JSON.parse(toolCall.function.arguments) as T
  } catch (e) {
    throw new Error(`Failed to parse function arguments: ${e}`)
  }
}
```

---

## Shared Types File

```typescript
// /supabase/functions/_shared/types.ts

export interface AnalyzerRun {
  id: string
  brand_project_id: string
  analyzer_type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input_snapshot?: Record<string, unknown>
  raw_analysis?: string
  parsed_fields?: Record<string, unknown>
  error_message?: string
  retry_count: number
  started_at?: string
  completed_at?: string
  created_at: string
}

export interface BrandProject {
  id: string
  member_id: string
  is_primary: boolean
  
  // Identity
  brand_name?: string
  brand_location?: string
  year_founded?: number
  founding_reason?: string
  company_size?: string
  website_url?: string
  
  // People
  rep_name?: string
  rep_role?: string
  
  // ... all other fields from schema
  
  // AI-generated fields
  ai_positioning?: string
  ai_value_prop?: string
  ai_brand_story?: string
  ai_audience_persona?: string
  ai_voice_guidelines?: string
  ai_differentiators?: string[]
  brand_archetype?: string
  brand_tone?: string
}

// Re-export parsed types from each analyzer's schema.ts
// (or define them here if you prefer centralized types)
```

---

## Example: Complete Analyzer (index.ts)

Showing how `prompt.ts` and `schema.ts` are used together:

```typescript
// /supabase/functions/analyzer-narrative/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getSupabase } from '../_shared/supabase.ts'
import { getOpenAI } from '../_shared/openai.ts'
import { parseWithSchema } from '../_shared/parser.ts'
import { BrandProject } from '../_shared/types.ts'

import { buildPrompt } from './prompt.ts'
import { schema, NarrativeParsed, fieldsToUpdate } from './schema.ts'

const ANALYZER_TYPE = 'narrative'

serve(async (req) => {
  const { projectId } = await req.json()
  const supabase = getSupabase()
  const openai = getOpenAI()

  try {
    // 1. Mark as running
    const { data: run } = await supabase
      .from('analyzer_runs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('brand_project_id', projectId)
      .eq('analyzer_type', ANALYZER_TYPE)
      .eq('status', 'pending')
      .select()
      .single()

    // 2. Fetch project
    const { data: project } = await supabase
      .from('brand_projects')
      .select('*')
      .eq('id', projectId)
      .single() as { data: BrandProject }

    // 3. Phase 1: Analysis
    const prompt = buildPrompt(project)
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })
    const analysis = analysisResponse.choices[0].message.content

    // 4. Phase 2: Parse
    const parsed = await parseWithSchema<NarrativeParsed>(openai, analysis, schema)

    // 5. Update project
    const updates = fieldsToUpdate(parsed, project)
    await supabase
      .from('brand_projects')
      .update(updates)
      .eq('id', projectId)

    // 6. Mark complete
    await supabase
      .from('analyzer_runs')
      .update({
        status: 'completed',
        raw_analysis: analysis,
        parsed_fields: parsed,
        completed_at: new Date().toISOString()
      })
      .eq('id', run.id)

    return new Response(JSON.stringify({ success: true }))

  } catch (error) {
    // Error handling (see 05a-ANALYZER-SYSTEM.md)
    await supabase
      .from('analyzer_runs')
      .update({ status: 'failed', error_message: error.message })
      .eq('brand_project_id', projectId)
      .eq('analyzer_type', ANALYZER_TYPE)

    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
```
```
