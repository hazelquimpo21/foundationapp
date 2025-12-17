# Foundation Studio - Analyzer System

## Core Concept

Analyzers are modular AI processes that:
1. Wait for specific inputs to be ready
2. Run GPT-4o-mini in two phases (analysis → parsing)
3. Update the brand project with inferred data
4. Are independently deployable as Edge Functions

## Two-Phase Pattern

**Why separate analysis from parsing?**

Function calling is excellent at extracting structured data but poor at nuanced inference. By running two phases, we get the best of both:

```
Phase 1: "Think like a brand strategist. What do you notice?"
         → Natural language insights, reading between the lines

Phase 2: "Now extract these specific fields from your analysis"
         → Clean JSON output via function calling
```

---

## Analyzer Registry

| Analyzer | Trigger Condition | Output Fields |
|----------|-------------------|---------------|
| `web_scraper` | `website_url` exists | social handles, industry guess |
| `narrative` | Mad Libs L1 complete | positioning, archetype |
| `voice` | Both word banks complete | tone, voice guidelines |
| `synthesis` | Minimum buckets complete | brand story, value prop, differentiators |
| `benefit_language` | Manual trigger | (saves to generated_outputs) |

---

## Edge Function Structure

Each analyzer follows the same pattern:

```
/supabase/functions
  ├── analyzer-web-scraper/
  │   └── index.ts
  ├── analyzer-narrative/
  │   └── index.ts
  ├── analyzer-voice/
  │   └── index.ts
  ├── analyzer-synthesis/
  │   └── index.ts
  └── analyzer-benefit-language/
      └── index.ts
```

### Base Pattern

```typescript
// supabase/functions/analyzer-narrative/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

const ANALYZER_TYPE = 'narrative'

serve(async (req) => {
  const { projectId } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const openai = new OpenAI({ 
    apiKey: Deno.env.get('OPENAI_API_KEY') 
  })

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

    // 2. Fetch project data
    const { data: project } = await supabase
      .from('brand_projects')
      .select('*')
      .eq('id', projectId)
      .single()

    // 3. Phase 1: Analysis
    const analysis = await runAnalysis(openai, project)

    // 4. Phase 2: Parse to fields
    const parsed = await parseToFields(openai, analysis)

    // 5. Update project with inferred fields
    await supabase
      .from('brand_projects')
      .update({
        ai_positioning: parsed.positioning,
        brand_archetype: parsed.archetype,
        industry_field: parsed.industry || project.industry_field
      })
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

    // 7. Check if synthesis should trigger
    await checkSynthesisTrigger(supabase, projectId)

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    // Mark failed
    await supabase
      .from('analyzer_runs')
      .update({ 
        status: 'failed', 
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('brand_project_id', projectId)
      .eq('analyzer_type', ANALYZER_TYPE)

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    })
  }
})
```

---

## Analyzer: Narrative

**Triggers when:** Mad Libs L1 is complete

### Phase 1 Prompt

```typescript
async function runAnalysis(openai: OpenAI, project: BrandProject): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: `You are a senior brand strategist analyzing a new client intake. 
Your job is to read between the lines, infer meaning, and provide insights 
that go beyond surface-level summarization.`
    }, {
      role: 'user',
      content: `Analyze this brand foundation:

Brand Name: ${project.brand_name}
Location: ${project.brand_location}
Founded: ${project.year_founded}
Company Size: ${project.company_size}
Founding Reason: ${project.founding_reason}
Core Offering: ${project.core_offering}
Customer Description: ${project.customer_description}

Provide insights on:
1. What positioning is this brand naturally gravitating toward?
2. What can we infer about their target market beyond what's stated?
3. What brand archetype energy do you sense? (e.g., Hero, Caregiver, Creator, etc.)
4. What industry/field classification fits best?
5. What's potentially unique or differentiated about their approach?
6. What gaps or tensions do you notice that might need clarification?

Be insightful and specific. This is qualitative analysis, not summarization.`
    }],
    temperature: 0.7,
    max_tokens: 1000
  })

  return response.choices[0].message.content
}
```

### Phase 2 Function

```typescript
async function parseToFields(openai: OpenAI, analysis: string): Promise<ParsedNarrative> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `Extract structured data from this brand analysis:\n\n${analysis}`
    }],
    tools: [{
      type: 'function',
      function: {
        name: 'save_narrative_analysis',
        description: 'Save the parsed narrative analysis',
        parameters: {
          type: 'object',
          properties: {
            positioning: {
              type: 'string',
              description: 'One sentence describing their natural brand positioning'
            },
            archetype: {
              type: 'string',
              enum: ['Hero', 'Outlaw', 'Magician', 'Everyman', 'Lover', 
                     'Jester', 'Caregiver', 'Ruler', 'Creator', 'Innocent', 
                     'Sage', 'Explorer']
            },
            industry: {
              type: 'string',
              description: 'Industry/field classification'
            },
            confidence: {
              type: 'number',
              description: 'Confidence score 0-1'
            },
            clarifying_questions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Questions that would strengthen the analysis'
            }
          },
          required: ['positioning', 'archetype', 'industry', 'confidence']
        }
      }
    }],
    tool_choice: { type: 'function', function: { name: 'save_narrative_analysis' } }
  })

  const toolCall = response.choices[0].message.tool_calls?.[0]
  return JSON.parse(toolCall?.function.arguments || '{}')
}
```

---

## Analyzer: Voice

**Triggers when:** Both `brand_words` and `customer_words` are populated

### Phase 1 Prompt

```typescript
const prompt = `You are a brand voice specialist. Analyze these word selections:

Brand Words Selected: ${project.brand_words.join(', ')}
Customer Words Selected: ${project.customer_words.join(', ')}

Context:
- Brand: ${project.brand_name}
- What they do: ${project.core_offering}
- Archetype (from prior analysis): ${project.brand_archetype || 'unknown'}

Analyze:
1. What personality emerges from the brand word choices?
2. How do they perceive their customer? What does this reveal?
3. What tone of voice would authentically represent this brand?
4. Are there any tensions between their brand words and customer words?
5. Suggest specific voice guidelines (e.g., "Use conversational language", "Lead with empathy")

Be actionable and specific.`
```

### Phase 2 Fields

```typescript
{
  tone_summary: string,           // "Warm and approachable with expert confidence"
  voice_guidelines: string[],     // ["Use 'we' not 'the company'", "Lead with benefits"]
  personality_traits: string[],   // ["Encouraging", "Knowledgeable", "Playful"]
  words_to_use: string[],        // Vocabulary suggestions
  words_to_avoid: string[],      // Anti-patterns
  customer_perception: string    // How they see their customer
}
```

---

## Analyzer: Web Scraper

**Triggers when:** `website_url` is provided

This analyzer is different - it does actual web scraping before AI analysis.

```typescript
async function scrapeWebsite(url: string): Promise<ScrapedData> {
  // Use Firecrawl, Browserless, or similar
  const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('FIRECRAWL_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url,
      pageOptions: { onlyMainContent: true }
    })
  })
  
  return response.json()
}

async function findSocials(scrapedContent: string, url: string): Promise<Socials> {
  // AI extracts social links from scraped content
  // Also checks common social URL patterns based on brand name
}
```

### Output Fields

```typescript
{
  social_urls: {
    instagram?: string,
    linkedin?: string,
    twitter?: string,
    facebook?: string,
    tiktok?: string,
    youtube?: string
  },
  scraped_tagline: string,
  scraped_services: string[],
  industry_guess: string,
  scrape_confidence: number
}
```

---

## Analyzer: Synthesis

**Triggers when:** All weight-3 buckets complete + at least one weight-2 bucket

This is the "master" analyzer that creates the final brand foundation.

### Trigger Check Function

```typescript
async function checkSynthesisTrigger(supabase: SupabaseClient, projectId: string) {
  const { data: project } = await supabase
    .from('brand_projects')
    .select('*')
    .eq('id', projectId)
    .single()

  // Check minimum requirements
  const hasIdentity = project.brand_name && project.founding_reason
  const hasPeople = project.rep_name && project.rep_role
  const hasOffering = project.core_offering
  const hasAudience = project.customer_description

  const weight3Complete = hasIdentity && hasPeople
  const weight2Partial = hasOffering || hasAudience

  // Check that prerequisite analyzers finished
  const { data: runs } = await supabase
    .from('analyzer_runs')
    .select('analyzer_type, status')
    .eq('brand_project_id', projectId)
    .eq('status', 'completed')

  const completedAnalyzers = runs?.map(r => r.analyzer_type) || []
  const hasNarrative = completedAnalyzers.includes('narrative')

  if (weight3Complete && weight2Partial && hasNarrative) {
    await triggerAnalyzer(supabase, projectId, 'synthesis')
  }
}
```

### Phase 1 Prompt

```typescript
const prompt = `You are a senior brand strategist creating a comprehensive brand foundation.

All Available Information:
${JSON.stringify(project, null, 2)}

Previous Analysis:
- Narrative: ${narrativeAnalysis}
- Voice: ${voiceAnalysis}
- Web Scraper: ${scraperFindings}

Create a cohesive brand foundation including:

1. BRAND STORY (2-3 paragraphs)
Write a compelling narrative about this brand's origin, purpose, and vision.

2. VALUE PROPOSITION (1 sentence)
What unique value do they provide and to whom?

3. POSITIONING STATEMENT
Following: For [target], [brand] is the [category] that [key benefit] because [reason to believe].

4. AUDIENCE PERSONA
A vivid description of their ideal customer.

5. VOICE GUIDELINES
Specific, actionable guidance for how this brand should communicate.

6. KEY DIFFERENTIATORS (3-5 points)
What makes them stand out from alternatives?

Write as if presenting to the brand owner. Be confident but acknowledge gaps.`
```

---

## Analyzer: Benefit Language

**Triggers:** Manual (user clicks "Generate Benefit Language")

### Prompt

```typescript
const prompt = `You are a conversion copywriter.

Brand: ${project.brand_name}
Offering: ${project.core_offering}
Products/Services: ${project.products_services?.join(', ')}
Customer: ${project.customer_description}
Pain Points: ${project.customer_pain_points?.join(', ')}
Aspirations: ${project.customer_aspirations?.join(', ')}

Create:

1. SIX "so that" statements from customer POV:
Format: "[specific feature/service] so that I can [outcome]"
Example: "Weekly check-ins so that I can stay accountable to my goals"

2. SIX "Wouldn't you like to..." statements (flip the outcomes):
Format: "Wouldn't you like to [outcome]?"

3. THREE homepage headline options

4. ONE elevator pitch (30 seconds spoken)

Make these specific to their actual offerings, not generic.`
```

### Output

Saved to `generated_outputs` table rather than updating project fields.

---

## Adding New Analyzers

To add a new analyzer:

1. **Create Edge Function**
   ```
   supabase functions new analyzer-{name}
   ```

2. **Follow the base pattern** (mark running → fetch data → analyze → parse → update → mark complete)

3. **Register trigger conditions** in the trigger check logic

4. **Add UI** for displaying results in the Analysis Hub

5. **Update bucket_completion** calculation if it affects a bucket

---

## Error Handling & Retries

```typescript
// In the catch block of each analyzer
if (run.retry_count < 3) {
  await supabase
    .from('analyzer_runs')
    .update({ 
      status: 'pending',
      retry_count: run.retry_count + 1,
      error_message: `Retry ${run.retry_count + 1}: ${error.message}`
    })
    .eq('id', run.id)
  
  // Re-trigger after delay
  setTimeout(() => triggerAnalyzer(projectId, ANALYZER_TYPE), 5000)
} else {
  // Final failure
  await supabase
    .from('analyzer_runs')
    .update({ status: 'failed', error_message: error.message })
    .eq('id', run.id)
}
```

---

## Cost Considerations

GPT-4o-mini pricing is very affordable, but track usage:

| Analyzer | Est. Tokens | Est. Cost |
|----------|-------------|-----------|
| Narrative | ~1,500 | $0.0003 |
| Voice | ~1,200 | $0.0002 |
| Synthesis | ~3,000 | $0.0006 |
| Benefit Lang | ~2,000 | $0.0004 |

**Total per full onboard:** ~$0.002 (fractions of a penny)
