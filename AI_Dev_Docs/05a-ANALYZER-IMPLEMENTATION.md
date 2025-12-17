# Foundation Studio - Analyzer Implementation (Actual)

> **Note:** This document describes the actual implementation as of the current codebase. The original 05-ANALYZER-SYSTEM.md describes the intended Edge Functions pattern, but we implemented a simpler Next.js API route pattern for MVP.

## Architecture

Instead of Supabase Edge Functions, analyzers are implemented as:

1. **Next.js API Routes** (`/api/analyzers/{name}/route.ts`)
2. **Modular Library** (`/lib/analyzers/`)
3. **Zustand Store** for UI state

```
┌──────────────────────────────────────────────────────────────┐
│                      ANALYZER SYSTEM                           │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  /lib/analyzers/                                              │
│  ├── types.ts         # Type definitions                      │
│  ├── registry.ts      # Analyzer configs & trigger logic      │
│  ├── triggers.ts      # Trigger evaluation                    │
│  ├── store.ts         # Zustand store                         │
│  └── web-scraper/     # Web scraper analyzer                  │
│      ├── index.ts     # Orchestration                         │
│      ├── scraper.ts   # Website scraping                      │
│      ├── prompt.ts    # Phase 1 prompts                       │
│      └── schema.ts    # Phase 2 schema                        │
│                                                                │
│  /app/api/analyzers/                                          │
│  ├── trigger/route.ts    # Evaluates & triggers analyzers     │
│  └── web-scraper/route.ts # Runs web scraper analyzer         │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

## Flow

```
User saves website URL on Assets page
         │
         ▼
┌─────────────────────────┐
│  Assets Page calls      │
│  triggerAnalyzers()     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  POST /api/trigger      │
│                         │
│  1. Fetches project     │
│  2. Fetches existing    │
│     analyzer runs       │
│  3. Evaluates triggers  │
│  4. Creates pending run │
│  5. Fires off analyzer  │
│     (async, no wait)    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  POST /api/web-scraper  │
│                         │
│  1. Marks run as        │
│     "running"           │
│  2. Scrapes website     │
│  3. Phase 1: AI         │
│     analysis            │
│  4. Phase 2: Parse      │
│     to fields           │
│  5. Updates project     │
│  6. Marks run           │
│     "completed"         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Realtime subscription  │
│  updates Hub page UI    │
└─────────────────────────┘
```

## Key Files

### `/lib/analyzers/types.ts`

Defines all type definitions:
- `AnalyzerType` - String union of analyzer names
- `AnalyzerStatus` - pending | running | completed | failed
- `AnalyzerRun` - Database row shape
- `AnalyzerConfig` - Config for each analyzer
- `SocialUrls`, `ScrapedData`, etc. - Scraper types

### `/lib/analyzers/registry.ts`

Central configuration for all analyzers:

```typescript
const webScraperConfig: AnalyzerConfig = {
  type: 'web_scraper',
  name: 'Website Analyzer',
  description: 'Scrapes your website to find social links',
  icon: '🌐',
  autoTrigger: true,

  shouldTrigger: (project, existingRuns) => {
    // Return true if should run
    if (!project.website_url?.trim()) return false
    const existing = existingRuns.find(r => r.analyzer_type === 'web_scraper')
    if (existing?.status === 'completed') return false
    return true
  },

  outputFields: ['scraped_tagline', 'scraped_industry', 'social_urls', ...]
}

export const ANALYZER_REGISTRY = { web_scraper: webScraperConfig, ... }
```

### `/lib/analyzers/triggers.ts`

Evaluates which analyzers should run:

```typescript
export function evaluateTriggers(
  project: BusinessProject,
  existingRuns: AnalyzerRun[]
): TriggerResult {
  // Returns { toTrigger: ['web_scraper'], alreadyRunning: [], completed: [] }
}
```

### `/lib/analyzers/store.ts`

Zustand store for UI state:

```typescript
const useAnalyzerStore = create((set, get) => ({
  runs: [],
  loadRuns: async (projectId) => { ... },
  triggerAnalyzers: async (projectId, type?) => { ... },
  subscribeToUpdates: (projectId) => { ... },
}))
```

### `/lib/analyzers/web-scraper/`

The web scraper analyzer implementation:

- **scraper.ts** - `scrapeWebsite(url)` function that fetches HTML, extracts text, finds social links
- **prompt.ts** - Builds the Phase 1 analysis prompt
- **schema.ts** - OpenAI function calling schema for Phase 2
- **index.ts** - `runWebScraperAnalyzer()` orchestrates everything

## Database Tables

### `analyzer_runs` (existing)

Extended with new analyzer_type 'web_scraper':

```sql
ALTER TABLE analyzer_runs
ADD CONSTRAINT analyzer_runs_analyzer_type_check
CHECK (analyzer_type IN (
  'clarity', 'market', 'model', 'risk', 'synthesis',
  'web_scraper', 'narrative', 'voice'
));
```

### `business_projects` (new columns)

```sql
-- Web scraper output fields
ALTER TABLE business_projects ADD COLUMN social_urls JSONB DEFAULT '{}';
ALTER TABLE business_projects ADD COLUMN scraped_tagline TEXT;
ALTER TABLE business_projects ADD COLUMN scraped_services TEXT[];
ALTER TABLE business_projects ADD COLUMN scraped_industry TEXT;
ALTER TABLE business_projects ADD COLUMN scraped_content TEXT;
ALTER TABLE business_projects ADD COLUMN scrape_confidence FLOAT;
ALTER TABLE business_projects ADD COLUMN scraped_at TIMESTAMPTZ;
ALTER TABLE business_projects ADD COLUMN instagram_handle TEXT;
ALTER TABLE business_projects ADD COLUMN twitter_handle TEXT;
ALTER TABLE business_projects ADD COLUMN facebook_url TEXT;
ALTER TABLE business_projects ADD COLUMN tiktok_handle TEXT;
ALTER TABLE business_projects ADD COLUMN youtube_url TEXT;
```

## UI Integration

### Assets Page

```typescript
// After saving URL successfully
if (websiteUrl) {
  triggerAnalyzers(projectId, 'web_scraper')
    .then(result => log.success('Triggered!', result))
    .catch(err => log.error('Failed', err))
}
// Don't await - let user continue immediately
router.push(`/onboard/${projectId}/story`)
```

### Hub Page

```typescript
// Subscribe to realtime updates
useEffect(() => {
  const unsubscribe = subscribeToUpdates(projectId)
  return () => unsubscribe()
}, [projectId])

// Show analyzer status
const webScraperRun = runs.find(r => r.analyzer_type === 'web_scraper')
<AIAnalyzerCard
  analyzerType="web_scraper"
  run={webScraperRun}
  onRetry={() => handleRetry('web_scraper')}
/>
```

## Adding a New Analyzer

1. **Add type** to `types.ts`:
   ```typescript
   export type AnalyzerType = 'web_scraper' | 'your_analyzer'
   ```

2. **Add config** to `registry.ts`:
   ```typescript
   const yourAnalyzerConfig: AnalyzerConfig = { ... }
   export const ANALYZER_REGISTRY = {
     web_scraper: webScraperConfig,
     your_analyzer: yourAnalyzerConfig,
   }
   ```

3. **Create folder** `lib/analyzers/your-analyzer/`:
   - `index.ts` - Main `runYourAnalyzer()` function
   - `prompt.ts` - Phase 1 prompt builder
   - `schema.ts` - Phase 2 function schema

4. **Create API route** `app/api/analyzers/your-analyzer/route.ts`

5. **Add SQL migration** for output fields

6. **Update TypeScript types** in `lib/types/index.ts`

## Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# For future enhancements (not implemented)
FIRECRAWL_API_KEY=...  # Better web scraping
```

## Differences from Original Design

| Original Design | Actual Implementation |
|-----------------|----------------------|
| Supabase Edge Functions | Next.js API Routes |
| Deno runtime | Node.js runtime |
| `/supabase/functions/` | `/app/api/analyzers/` |
| Database triggers | Manual API triggers |
| Complex trigger chains | Simple direct triggers |

The simpler implementation works well for MVP and can be migrated to Edge Functions later if needed for better scaling.
