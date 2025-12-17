# Foundation Studio - Data Architecture

## Overview

Supabase is the source of truth. Local state (Zustand) handles UI responsiveness and draft inputs, but all persisted data lives in Supabase.

## Core Tables

### `members`
The authenticated user.

```sql
create table members (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  org_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Users can only see/edit their own record
alter table members enable row level security;

create policy "Users can view own member record"
  on members for select using (auth.uid() = auth_id);

create policy "Users can update own member record"
  on members for update using (auth.uid() = auth_id);
```

### `brand_projects`
The central entity containing all brand data.

```sql
create table brand_projects (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade not null,
  
  -- Project meta
  is_primary boolean default false,
  project_type text default 'portfolio' check (project_type in ('primary', 'portfolio')),
  
  -- Bucket 1: Identity Core (Weight 3)
  brand_name text,
  brand_location text,
  year_founded int,
  founding_reason text,
  company_size text check (company_size in (
    'idea', 'solo', 'micro', 'small', 'medium', 'large', 'enterprise'
  )),
  website_url text,
  
  -- Bucket 2: People & Roles (Weight 3)
  rep_name text,
  rep_role text,
  rep_email text,
  team_description text,
  linkedin_url text,
  
  -- Bucket 3: Offering & Value (Weight 2)
  core_offering text,
  products_services text[],
  unique_approach text,
  price_position int check (price_position between 1 and 5),
  
  -- Bucket 4: Audience & Customer (Weight 2)
  customer_description text,
  customer_words text[],
  customer_pain_points text[],
  customer_aspirations text[],
  industry_field text,
  
  -- Bucket 5: Voice & Personality (Weight 1)
  brand_words text[],
  brand_tone text,
  comm_style int check (comm_style between 1 and 5),
  brand_archetype text,
  
  -- Bucket 6: Digital Footprint (Weight 1)
  social_urls jsonb default '{}',
  instagram_handle text,
  linkedin_company text,
  twitter_handle text,
  facebook_url text,
  tiktok_handle text,
  youtube_url text,
  
  -- AI-Generated Fields
  ai_positioning text,
  ai_value_prop text,
  ai_brand_story text,
  ai_audience_persona text,
  ai_voice_guidelines text,
  ai_differentiators text[],
  
  -- Progress tracking
  current_step text default 'setup',
  bucket_completion jsonb default '{
    "identity": 0,
    "people": 0,
    "offering": 0,
    "audience": 0,
    "voice": 0,
    "digital": 0
  }',
  overall_completion int default 0,
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_brand_projects_member on brand_projects(member_id);
create index idx_brand_projects_primary on brand_projects(member_id, is_primary);

-- RLS
alter table brand_projects enable row level security;

create policy "Users can CRUD own brand projects"
  on brand_projects for all using (
    member_id in (select id from members where auth_id = auth.uid())
  );

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger brand_projects_updated_at
  before update on brand_projects
  for each row execute function update_updated_at();
```

### `brand_inputs`
Raw inputs before analysis. Preserves original user input separate from parsed fields.

```sql
create table brand_inputs (
  id uuid primary key default gen_random_uuid(),
  brand_project_id uuid references brand_projects(id) on delete cascade not null,
  
  input_type text not null check (input_type in (
    'madlibs_l1', 'madlibs_l2', 'madlibs_l3',
    'word_bank_brand', 'word_bank_customer',
    'sliders', 'asset_website', 'asset_linkedin',
    'asset_pdf', 'chat'
  )),
  
  input_data jsonb not null,
  
  created_at timestamptz default now()
);

-- Index for fetching all inputs for a project
create index idx_brand_inputs_project on brand_inputs(brand_project_id);

-- RLS
alter table brand_inputs enable row level security;

create policy "Users can CRUD inputs for own projects"
  on brand_inputs for all using (
    brand_project_id in (
      select bp.id from brand_projects bp
      join members m on bp.member_id = m.id
      where m.auth_id = auth.uid()
    )
  );
```

### `analyzer_runs`
Tracks each analyzer execution and results.

```sql
create table analyzer_runs (
  id uuid primary key default gen_random_uuid(),
  brand_project_id uuid references brand_projects(id) on delete cascade not null,
  
  analyzer_type text not null,
  status text default 'pending' check (status in (
    'pending', 'running', 'completed', 'failed'
  )),
  
  -- What triggered this run
  trigger_reason text,
  
  -- Input snapshot (what was sent to analyzer)
  input_snapshot jsonb,
  
  -- Results
  raw_analysis text,           -- GPT's natural language analysis
  parsed_fields jsonb,         -- Structured output from function calling
  confidence_score float,
  
  -- Error handling
  error_message text,
  retry_count int default 0,
  
  -- Timing
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes
create index idx_analyzer_runs_project on analyzer_runs(brand_project_id);
create index idx_analyzer_runs_status on analyzer_runs(brand_project_id, status);

-- RLS
alter table analyzer_runs enable row level security;

create policy "Users can view analyzer runs for own projects"
  on analyzer_runs for select using (
    brand_project_id in (
      select bp.id from brand_projects bp
      join members m on bp.member_id = m.id
      where m.auth_id = auth.uid()
    )
  );
```

### `generated_outputs`
Stores generated content like benefit language, taglines, etc.

```sql
create table generated_outputs (
  id uuid primary key default gen_random_uuid(),
  brand_project_id uuid references brand_projects(id) on delete cascade not null,
  analyzer_run_id uuid references analyzer_runs(id) on delete set null,
  
  output_type text not null,  -- 'benefit_language', 'taglines', 'elevator_pitch', etc.
  output_data jsonb not null,
  
  is_favorite boolean default false,
  
  created_at timestamptz default now()
);

-- Index
create index idx_generated_outputs_project on generated_outputs(brand_project_id);

-- RLS
alter table generated_outputs enable row level security;

create policy "Users can CRUD outputs for own projects"
  on generated_outputs for all using (
    brand_project_id in (
      select bp.id from brand_projects bp
      join members m on bp.member_id = m.id
      where m.auth_id = auth.uid()
    )
  );
```

---

## Enums & Constants

### Company Size
| Value | Label | Skip Team Questions |
|-------|-------|---------------------|
| `idea` | Just an idea | Yes |
| `solo` | Solopreneur | Yes |
| `micro` | 2-10 people | No |
| `small` | 11-50 people | No |
| `medium` | 51-200 people | No |
| `large` | 201-1000 people | No |
| `enterprise` | 1000+ people | No |

### Analyzer Types
| Type | Trigger | Updates Fields |
|------|---------|----------------|
| `web_scraper` | website_url provided | social_urls, social handles, industry_field |
| `narrative` | madlibs_l1 complete | ai_positioning, brand_archetype |
| `voice` | word banks complete | brand_tone, ai_voice_guidelines |
| `synthesis` | minimum buckets complete | ai_brand_story, ai_value_prop, ai_differentiators |
| `benefit_language` | manual trigger | (generates to generated_outputs) |

### Bucket Weights
| Bucket | Weight | Required for MVP |
|--------|--------|------------------|
| Identity Core | 3 | Yes |
| People & Roles | 3 | Yes |
| Offering & Value | 2 | No |
| Audience & Customer | 2 | No |
| Voice & Personality | 1 | No |
| Digital Footprint | 1 | No |

---

## Realtime Subscriptions

Enable realtime on `analyzer_runs` for live progress updates:

```sql
-- In Supabase dashboard or via API
alter publication supabase_realtime add table analyzer_runs;
```

Client subscription pattern:
```typescript
supabase
  .channel(`project-${projectId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'analyzer_runs',
    filter: `brand_project_id=eq.${projectId}`
  }, handleAnalyzerUpdate)
  .subscribe()
```

---

## Data Flow

```
User Input (UI)
      │
      ▼
┌─────────────────┐
│  Local State    │  ← Zustand store, draft values
│  (Zustand)      │
└────────┬────────┘
         │ Save at breakpoints
         ▼
┌─────────────────┐
│  brand_inputs   │  ← Raw input preserved
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ brand_projects  │  ← Parsed into fields
└────────┬────────┘
         │ Triggers check
         ▼
┌─────────────────┐
│ Edge Function   │  ← Analyzer runs
│ (analyzer)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ analyzer_runs   │  ← Status + results
└────────┬────────┘
         │ On complete
         ▼
┌─────────────────┐
│ brand_projects  │  ← AI fields updated
└─────────────────┘
         │
         ▼
      Realtime → UI updates
```
