# 🤖 Analyzer System

The analyzer system powers the AI-driven insights in Foundation Studio. When users provide data (like a website URL), analyzers automatically run to extract and infer additional information.

## 📋 Overview

Analyzers follow a **two-phase pattern**:

1. **Phase 1 (Analysis)**: GPT reads between the lines, infers meaning, provides insights
2. **Phase 2 (Parsing)**: Function calling extracts structured fields from the analysis

This separation exists because function calling is excellent at structure but poor at nuanced inference.

## 🗂️ File Structure

```
src/lib/analyzers/
├── index.ts           # Public API exports
├── types.ts           # TypeScript type definitions
├── registry.ts        # Analyzer configurations and trigger conditions
├── triggers.ts        # Trigger evaluation logic
├── store.ts           # Zustand store for UI state
├── README.md          # This file!
│
└── web-scraper/       # Web Scraper Analyzer
    ├── index.ts       # Main orchestration
    ├── scraper.ts     # Website scraping utility
    ├── prompt.ts      # Phase 1 prompt builder
    └── schema.ts      # Phase 2 parsing schema
```

## 🌐 Web Scraper Analyzer

**Triggers when:** User provides a `website_url`

**What it does:**
1. Scrapes the website HTML
2. Extracts social media links (Instagram, Twitter, LinkedIn, etc.)
3. Uses AI to identify the tagline, services, and industry
4. Updates the project with discovered data

**Output fields:**
- `scraped_tagline` - Main headline found on the site
- `scraped_services` - List of services/offerings
- `scraped_industry` - Inferred industry category
- `social_urls` - JSONB with platform URLs
- `instagram_handle`, `twitter_handle`, etc. - Individual handles

## 🔌 API Endpoints

### POST `/api/analyzers/trigger`

Evaluates which analyzers should run and triggers them.

```typescript
// Request
{
  projectId: string,
  analyzerType?: string,  // Optional: specific analyzer
  force?: boolean         // Optional: re-run even if completed
}

// Response
{
  success: boolean,
  triggered: string[],
  message: string
}
```

### POST `/api/analyzers/web-scraper`

Runs the web scraper analyzer.

```typescript
// Request
{
  projectId: string,
  runId?: string  // Optional: resume existing run
}

// Response
{
  success: boolean,
  runId: string,
  analyzerType: 'web_scraper',
  status: 'completed' | 'failed',
  rawAnalysis?: string,
  parsedFields?: object
}
```

## 🔄 Flow Diagram

```
User saves website URL
        │
        ▼
┌───────────────────┐
│  Assets Page      │
│  calls trigger    │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  /api/trigger     │
│  evaluates what   │
│  should run       │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Creates pending  │
│  analyzer_run     │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  /api/web-scraper │
│  runs analyzer    │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Updates project  │
│  with results     │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Realtime update  │
│  to UI (Hub page) │
└───────────────────┘
```

## 🛠️ Adding a New Analyzer

1. **Add the type** to `types.ts`:
   ```typescript
   export type AnalyzerType =
     | 'web_scraper'
     | 'your_new_analyzer'  // Add here
   ```

2. **Add config** to `registry.ts`:
   ```typescript
   const yourAnalyzerConfig: AnalyzerConfig = {
     type: 'your_new_analyzer',
     name: 'Your Analyzer',
     description: 'What it does',
     icon: '🔮',
     autoTrigger: true,
     shouldTrigger: (project, existingRuns) => {
       // Return true if this should run
     },
     outputFields: ['field1', 'field2'],
   }
   ```

3. **Create the analyzer folder**:
   ```
   src/lib/analyzers/your-analyzer/
   ├── index.ts    # Main logic
   ├── prompt.ts   # Phase 1 prompt
   └── schema.ts   # Phase 2 schema
   ```

4. **Create API route**:
   ```
   src/app/api/analyzers/your-analyzer/route.ts
   ```

5. **Add SQL migration** for new fields (if needed)

## 🧪 Testing

To test an analyzer locally:

```bash
# 1. Make sure the app is running
npm run dev

# 2. Create a project with a website URL

# 3. Check the console for analyzer logs

# 4. View the Hub page to see results
```

## 📊 Database Tables

**`analyzer_runs`** - Tracks each analyzer execution:
- `id` - UUID
- `project_id` - Which project
- `analyzer_type` - Which analyzer ran
- `status` - pending, running, completed, failed
- `raw_analysis` - Phase 1 output
- `parsed_fields` - Phase 2 output
- `error_message` - If failed, why

## 🔐 Environment Variables

```bash
# Required for AI analysis
OPENAI_API_KEY=sk-...
```

## 💡 Tips

- **Analyzers run async** - User doesn't wait for them
- **Realtime updates** - UI subscribes to changes
- **Retry on failure** - Automatic retries up to 3 times
- **Fire and forget** - Trigger returns immediately
