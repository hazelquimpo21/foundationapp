# Foundation Studio - Product Overview

## What Is This?

Foundation Studio is an AI-powered brand onboarding app that helps marketing professionals and entrepreneurs build comprehensive brand foundations. It's designed to combat "blank page syndrome" through structured inputs (mad libs, word banks, sliders) combined with AI analysis.

## Who Is It For?

**Primary Users:**
- Marketing agencies onboarding new clients
- Freelance marketers/brand strategists
- Solopreneurs defining their own brand

**Usage Pattern:**
Users maintain a **Primary Brand** (their own business) plus a **Portfolio** of **Brand Projects** (brands they manage for others).

## Core Philosophy

### 1. Structure Over Open-Ended
Instead of "tell me about your brand," we use fill-in-the-blank mad libs, word banks, and sliders. This reduces cognitive load and produces more consistent, analyzable inputs.

### 2. Separation of Analysis & Parsing
GPT-4o-mini runs in two phases:
- **Phase 1:** Human-like analysis (read between the lines, infer, suggest)
- **Phase 2:** Function calling to parse analysis into structured fields

This separation exists because function calling is great at structure but poor at nuanced inference.

### 3. Progressive Disclosure
Not everything is required upfront. Buckets have weights:
- **Weight 3:** Required for minimum viable profile
- **Weight 2:** Important, unlocks richer analysis
- **Weight 1:** Enrichment, for comprehensive profiles

### 4. Concurrent Intelligence
Analyzers run in parallel when their required inputs exist. The UI shows progress without blocking the user.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| State | Zustand (local) + Supabase Realtime (sync) |
| Backend | Supabase (Auth, Database, Edge Functions, Realtime) |
| AI | GPT-4o-mini via OpenAI API |
| Voice | Whisper API (optional voice input) |
| Scraping | Firecrawl or similar (via Edge Function) |

## File Structure Philosophy

Keep files under 400 lines. Split by responsibility:

```
/app
  /onboard
    /[projectId]
      /setup          → Project setup page
      /assets         → Website & asset upload
      /story          → Mad libs level 1
      /personality    → Word banks
      /preferences    → Sliders
      /hub            → Analysis dashboard
      /complete       → Final summary

/components
  /onboard           → Onboarding-specific components
  /ui                → Shared UI primitives
  /analyzers         → Analyzer status/preview components

/lib
  /stores            → Zustand stores
  /supabase          → Supabase client & helpers
  /analyzers         → Analyzer trigger logic

/supabase
  /functions         → Edge functions (one per analyzer)
  /migrations        → Database migrations
```

## Key Concepts

### Brand Project
The central entity. Contains all fields across all buckets. Has a `bucket_completion` JSONB field tracking progress.

### Buckets
Logical groupings of related fields. Each bucket has:
- A weight (priority level)
- Required vs optional fields
- A completion percentage

### Analyzers
Modular AI processes that run when their inputs are ready. Each analyzer:
- Has defined trigger conditions
- Produces both raw analysis and parsed fields
- Updates the brand project with inferred data
- Is independently deployable as an Edge Function

### Input Methods
- **Mad Libs:** Fill-in-the-blank paragraphs
- **Word Banks:** Select from curated word lists
- **Sliders:** Spectrum selections (casual↔formal)
- **Assets:** URLs and files for scraping/analysis
- **Chat:** Clarification and expansion (future)

## Future Extensibility

The system is designed for:
- **More analyzers:** Add new Edge Functions, register trigger conditions
- **More buckets:** Add fields to schema, create input UI, wire to analyzers
- **More outputs:** Benefit language, taglines, brand guides, etc.
- **More input types:** Video uploads, competitor URLs, customer interviews

## Success Metrics

- Time to minimum viable profile < 5 minutes
- User completes at least Weight-3 buckets: > 80%
- Returns to add more detail: > 40%
- Exports or uses generated content: > 60%
