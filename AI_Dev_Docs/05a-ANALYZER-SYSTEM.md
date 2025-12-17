# Foundation Studio - Analyzer System Overview

## Architecture

Analyzers are modular AI processes. Each analyzer:
- Lives in its own Edge Function file
- Has defined trigger conditions
- Runs two phases: Analysis → Parsing
- Updates the brand project with results
- Is independently deployable and testable

## Why Two Phases?

**Phase 1 (Analysis):** GPT reads between the lines, infers, suggests. Natural language output.

**Phase 2 (Parsing):** Function calling extracts structured fields from the analysis.

This separation exists because function calling is excellent at structure but poor at nuanced inference.

---

## File Structure

```
/supabase/functions/
  ├── _shared/
  │   ├── supabase.ts          # Shared Supabase client
  │   ├── openai.ts            # Shared OpenAI client
  │   ├── types.ts             # Shared TypeScript types
  │   ├── parser.ts            # Generic parseWithSchema utility
  │   └── utils.ts             # Shared utilities
  │
  ├── analyzer-web-scraper/
  │   ├── index.ts             # Main handler + orchestration
  │   ├── prompt.ts            # Phase 1 prompt builder
  │   └── schema.ts            # Phase 2 parser schema
  │
  ├── analyzer-narrative/
  │   ├── index.ts             # Main handler + orchestration
  │   ├── prompt.ts            # Phase 1 prompt builder
  │   └── schema.ts            # Phase 2 parser schema
  │
  ├── analyzer-voice/
  │   ├── index.ts             # Main handler + orchestration
  │   ├── prompt.ts            # Phase 1 prompt builder
  │   └── schema.ts            # Phase 2 parser schema
  │
  ├── analyzer-synthesis/
  │   ├── index.ts             # Main handler + orchestration
  │   ├── prompt.ts            # Phase 1 prompt builder
  │   └── schema.ts            # Phase 2 parser schema
  │
  └── analyzer-benefit-language/
      ├── index.ts             # Main handler + orchestration
      ├── prompt.ts            # Phase 1 prompt builder
      └── schema.ts            # Phase 2 parser schema
```

### File Responsibilities

**`index.ts`** - Orchestration only (~80-100 lines)
- Edge Function entry point
- Mark run as started
- Fetch project data
- Call prompt builder → call OpenAI → call parser
- Update project with results
- Mark run as complete
- Error handling

**`prompt.ts`** - Phase 1 prompt (~50-80 lines)
- Exports a function that takes project data
- Returns the formatted prompt string
- Easy to edit/tune without touching logic

**`schema.ts`** - Phase 2 parser (~60-100 lines)
- Exports the function calling schema object
- Exports the TypeScript type for parsed output
- Exports which fields to update in brand_projects

---

## Analyzer Registry

| Analyzer | Trigger | Required Inputs | Output Fields |
|----------|---------|-----------------|---------------|
| `web-scraper` | Auto when `website_url` saved | `website_url` | `social_urls`, `industry_field` (guess) |
| `narrative` | Auto when Mad Libs L1 complete | `brand_name`, `founding_reason`, `core_offering`, `customer_description` | `ai_positioning`, `brand_archetype` |
| `voice` | Auto when word banks complete | `brand_words[]`, `customer_words[]` | `brand_tone`, `ai_voice_guidelines` |
| `synthesis` | Auto when minimum buckets ready | All weight-3 fields + narrative complete | `ai_brand_story`, `ai_value_prop`, `ai_differentiators` |
| `benefit-language` | Manual (user clicks button) | Synthesis complete | Saves to `generated_outputs` table |

---

## Trigger Mechanism

**How triggers fire:**

1. Frontend saves data to `brand_projects` table
2. Frontend calls `/api/check-triggers` with `projectId`
3. That endpoint evaluates what analyzers should run
4. For each triggered analyzer, it:
   - Creates a `pending` record in `analyzer_runs`
   - Invokes the Edge Function asynchronously
5. UI subscribes to `analyzer_runs` via Realtime for status updates

```typescript
// /app/api/check-triggers/route.ts

export async function POST(req: Request) {
  const { projectId } = await req.json()
  
  const project = await getProject(projectId)
  const existingRuns = await getAnalyzerRuns(projectId)
  
  const toTrigger = evaluateTriggers(project, existingRuns)
  
  for (const analyzerType of toTrigger) {
    await createPendingRun(projectId, analyzerType)
    await supabase.functions.invoke(`analyzer-${analyzerType}`, {
      body: { projectId }
    })
  }
  
  return Response.json({ triggered: toTrigger })
}
```

**Trigger evaluation logic:**

```typescript
function evaluateTriggers(
  project: BrandProject, 
  existingRuns: AnalyzerRun[]
): string[] {
  const toTrigger: string[] = []
  const completed = existingRuns
    .filter(r => r.status === 'completed')
    .map(r => r.analyzer_type)
  const pending = existingRuns
    .filter(r => r.status === 'pending' || r.status === 'running')
    .map(r => r.analyzer_type)

  // Web scraper: needs website, not already running/complete
  if (project.website_url && 
      !completed.includes('web-scraper') && 
      !pending.includes('web-scraper')) {
    toTrigger.push('web-scraper')
  }

  // Narrative: needs mad libs L1 complete
  const hasMadLibsL1 = project.brand_name && 
                       project.founding_reason && 
                       project.core_offering && 
                       project.customer_description
  if (hasMadLibsL1 && 
      !completed.includes('narrative') && 
      !pending.includes('narrative')) {
    toTrigger.push('narrative')
  }

  // Voice: needs both word banks
  const hasWordBanks = project.brand_words?.length >= 5 && 
                       project.customer_words?.length >= 5
  if (hasWordBanks && 
      !completed.includes('voice') && 
      !pending.includes('voice')) {
    toTrigger.push('voice')
  }

  // Synthesis: needs minimum buckets + narrative done
  const hasMinimum = hasMadLibsL1 && project.rep_name && project.rep_role
  if (hasMinimum && 
      completed.includes('narrative') &&
      !completed.includes('synthesis') && 
      !pending.includes('synthesis')) {
    toTrigger.push('synthesis')
  }

  return toTrigger
}
```

---

## Bucket Completion Calculation

```typescript
// Called after any project update

function calculateBucketCompletion(project: BrandProject): BucketCompletion {
  return {
    identity: calculateIdentityCompletion(project),
    people: calculatePeopleCompletion(project),
    offering: calculateOfferingCompletion(project),
    audience: calculateAudienceCompletion(project),
    voice: calculateVoiceCompletion(project),
    digital: calculateDigitalCompletion(project),
  }
}

function calculateIdentityCompletion(p: BrandProject): number {
  const fields = [
    p.brand_name,
    p.brand_location,
    p.year_founded,
    p.founding_reason,
    p.company_size,
    p.website_url,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

// Similar functions for other buckets...

function calculateOverallCompletion(buckets: BucketCompletion): number {
  // Weighted average
  const weights = {
    identity: 3,
    people: 3,
    offering: 2,
    audience: 2,
    voice: 1,
    digital: 1,
  }
  
  let weightedSum = 0
  let totalWeight = 0
  
  for (const [bucket, completion] of Object.entries(buckets)) {
    const weight = weights[bucket as keyof typeof weights]
    weightedSum += completion * weight
    totalWeight += weight * 100
  }
  
  return Math.round((weightedSum / totalWeight) * 100)
}
```

---

## Environment Variables

```bash
# .env.local (frontend)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Supabase Edge Functions secrets (set via CLI)
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set FIRECRAWL_API_KEY=fc-...  # or alternative scraper
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...  # auto-available
```

**Security note:** Edge Functions use the service role key which bypasses RLS. This is intentional - analyzers need to update any project, and we validate ownership before triggering them. The service role key never touches the browser.

---

## Error Handling

Each analyzer follows this pattern:

```typescript
try {
  // 1. Mark as running
  // 2. Fetch data
  // 3. Run analysis
  // 4. Parse results
  // 5. Update project
  // 6. Mark complete
} catch (error) {
  const run = await getCurrentRun()
  
  if (run.retry_count < 3) {
    // Retry with exponential backoff
    await supabase.from('analyzer_runs').update({
      status: 'pending',
      retry_count: run.retry_count + 1,
      error_message: `Attempt ${run.retry_count + 1}: ${error.message}`
    }).eq('id', run.id)
    
    // Re-invoke after delay (handled by separate retry system)
  } else {
    // Final failure
    await supabase.from('analyzer_runs').update({
      status: 'failed',
      error_message: error.message,
      completed_at: new Date().toISOString()
    }).eq('id', run.id)
  }
}
```

**UI handling of failed analyzers:**
- Show error state on card with message
- "Retry" button creates new pending run
- Don't block user progress - they can continue without that analyzer

---

## Testing Locally

```bash
# Start Supabase locally
supabase start

# Serve Edge Functions locally  
supabase functions serve

# Test an analyzer
curl -X POST http://localhost:54321/functions/v1/analyzer-narrative \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"projectId": "test-uuid"}'
```

---

## Adding a New Analyzer

1. Create folder: `supabase/functions/analyzer-{name}/`

2. Create three files:

   **`prompt.ts`**
   ```typescript
   import { BrandProject } from '../_shared/types'
   
   export function buildPrompt(project: BrandProject): string {
     return `You are a brand strategist...
     
     Brand: ${project.brand_name}
     ...
     `
   }
   ```

   **`schema.ts`**
   ```typescript
   export const schema = {
     name: 'save_{name}_analysis',
     description: '...',
     parameters: {
       type: 'object',
       properties: { /* ... */ },
       required: [ /* ... */ ]
     }
   }
   
   export interface ParsedOutput {
     // TypeScript type matching schema
   }
   
   export const fieldsToUpdate = (parsed: ParsedOutput) => ({
     // Map parsed output to brand_projects columns
   })
   ```

   **`index.ts`**
   ```typescript
   import { buildPrompt } from './prompt'
   import { schema, fieldsToUpdate, ParsedOutput } from './schema'
   import { parseWithSchema } from '../_shared/parser'
   // ... orchestration logic
   ```

3. Add trigger condition in `/app/api/check-triggers/route.ts`

4. Add UI card to Analysis Hub page

5. Deploy: `supabase functions deploy analyzer-{name}`
