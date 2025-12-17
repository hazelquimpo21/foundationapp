# 🚀 Foundation Studio

AI-powered brand onboarding app that helps founders and consultants define their brand foundation through guided, structured inputs (Mad Libs, word banks, and sliders).

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Data Model](#-data-model)
- [State Management](#-state-management)
- [API Routes](#-api-routes)
- [Components](#-components)
- [Configuration](#-configuration)
- [Deployment](#-deployment)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.local.example .env.local

# 3. Fill in your credentials in .env.local
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - SUPABASE_SERVICE_ROLE_KEY
#    - OPENAI_API_KEY

# 4. Set up database
#    Run supabase/migrations/001_initial_schema.sql in Supabase SQL Editor

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Pages     │  │ Components  │  │    Zustand Stores       │  │
│  │  - Landing  │  │  - UI       │  │  - authStore            │  │
│  │  - Login    │  │  - Chat     │  │  - projectStore         │  │
│  │  - Dashboard│  │  - Interact │  │  - chatStore            │  │
│  │  - Onboard  │  │  - Progress │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API ROUTES                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ /api/chat   │  │/api/project │  │    /api/analyze         │  │
│  │             │  │             │  │                         │  │
│  │ GPT-4o-mini │  │    CRUD     │  │  Two-Phase Analysis     │  │
│  │ responses   │  │ operations  │  │  1. Analysis (GPT)      │  │
│  │             │  │             │  │  2. Parse (Function)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │    Auth     │  │  Database   │  │      Realtime           │  │
│  │             │  │             │  │                         │  │
│  │ Email/Pass  │  │ PostgreSQL  │  │ Analyzer status         │  │
│  │ Google OAuth│  │ + RLS       │  │ updates                 │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Concepts

1. **Structured Onboarding**: Users flow through guided steps with fill-in-the-blank Mad Libs, word bank selections, and preference sliders. This reduces cognitive load compared to open-ended chat.

2. **Two-Phase AI Analysis**:
   - **Phase 1 (Analysis)**: GPT-4o-mini reads between the lines, infers, suggests
   - **Phase 2 (Parsing)**: Function calling extracts structured fields

3. **6 Buckets**: Business information is organized into weighted buckets:
   - 🎯 Core Idea (Weight 3 - Required)
   - 💎 Value Prop (Weight 3 - Required)
   - 📊 Market Reality (Weight 2 - Build)
   - 💰 Business Model (Weight 2 - Build)
   - 🏃 Execution (Weight 1 - Enrichment)
   - 🌟 Vision (Weight 1 - Enrichment)

---

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── chat/            # Chat endpoint (GPT)
│   │   ├── project/         # Project CRUD
│   │   └── analyze/         # AI analysis
│   ├── dashboard/           # Dashboard page
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   ├── onboard/             # Onboarding flow
│   │   ├── new/             # Project type selection
│   │   └── [projectId]/     # Per-project steps
│   │       ├── setup/       # Basic info form
│   │       ├── assets/      # Website & LinkedIn (optional)
│   │       ├── story/       # Mad Libs narrative
│   │       ├── words/       # Word bank selections
│   │       ├── style/       # Preference sliders
│   │       ├── hub/         # Analysis dashboard
│   │       └── done/        # Completion page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
│
├── components/               # React components
│   ├── ui/                  # Primitives (Button, Input, Card)
│   ├── onboard/             # Onboarding components
│   │   ├── OnboardLayout    # Wrapper with step indicator
│   │   ├── MadLibsInput     # Fill-in-blank inputs
│   │   ├── WordBankSelector # Word selection grid
│   │   └── StyleSlider      # Preference sliders
│   ├── chat/                # Chat interface components
│   ├── interactions/        # Word banks, sliders, choices
│   └── progress/            # Progress indicators
│
├── lib/                      # Core libraries
│   ├── analyzers/           # 🆕 AI Analyzer System
│   │   ├── index.ts         # Public exports
│   │   ├── types.ts         # Type definitions
│   │   ├── registry.ts      # Analyzer configs
│   │   ├── triggers.ts      # Trigger evaluation
│   │   ├── store.ts         # Zustand store
│   │   └── web-scraper/     # Web Scraper Analyzer
│   │       ├── index.ts     # Main orchestration
│   │       ├── scraper.ts   # Website scraping
│   │       ├── prompt.ts    # Phase 1 prompt
│   │       └── schema.ts    # Phase 2 schema
│   ├── config/              # Configuration
│   │   ├── buckets.ts       # Bucket definitions
│   │   ├── onboarding.ts    # Onboarding steps, Mad Libs, sliders
│   │   ├── wordBanks.ts     # Word bank options
│   │   └── interactions.ts  # Slider/choice configs
│   ├── stores/              # Zustand stores
│   │   ├── authStore.ts     # Auth state
│   │   ├── projectStore.ts  # Project state
│   │   └── chatStore.ts     # Chat state
│   ├── supabase/            # Supabase clients
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client
│   │   └── middleware.ts    # Auth middleware
│   ├── types/               # TypeScript types
│   └── utils/               # Utilities
│       ├── cn.ts            # Class name helper
│       ├── helpers.ts       # General helpers
│       └── logger.ts        # Logging utility
│
├── middleware.ts             # Next.js middleware (auth)
│
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  # Database schema
```

---

## 📊 Data Model

### Core Tables

```
members                    # User accounts
├── id (uuid)
├── auth_id (uuid)        # Links to Supabase Auth
├── email (text)
├── name (text)
└── timestamps

business_projects          # Main entity
├── id (uuid)
├── member_id (uuid)
├── project_name (text)
├── status (draft|in_progress|completed|archived)
│
├── # Bucket 1: Core Idea
├── idea_name, one_liner, target_audience[],
├── problem_statement, problem_urgency, why_now, why_now_driver
│
├── # Bucket 2: Value Prop
├── existing_solutions[], differentiation_axis,
├── differentiation_score, secret_sauce, validation_status
│
├── # Bucket 3: Market
├── market_size_estimate, competitors[], positioning
│
├── # Bucket 4: Business Model
├── revenue_model[], pricing_tier, customer_type, sales_motion
│
├── # Bucket 5: Execution
├── team_size, funding_status, timeline_months, biggest_risks[]
│
├── # Bucket 6: Vision
├── north_star_metric, company_values[], exit_vision
│
├── # AI-Generated Fields
├── ai_clarity_score, ai_one_liner, ai_implied_assumptions[],
├── ai_viability_score, ai_summary, ai_next_steps[],
├── ai_strengths[], ai_weaknesses[]
│
├── # Progress
├── bucket_completion (jsonb), overall_completion (int)
└── timestamps

onboarding_sessions        # Chat sessions
├── id, project_id
├── status, current_bucket
└── timestamps

conversation_messages      # Chat history
├── id, session_id
├── role (user|assistant|system)
├── content (text)
├── message_type (text|word_bank|slider|etc.)
├── metadata (jsonb)
└── created_at

analyzer_runs              # AI analysis jobs
├── id, project_id
├── analyzer_type (clarity|market|model|risk|synthesis)
├── status (pending|running|completed|failed)
├── raw_analysis, parsed_fields
└── timestamps
```

---

## 🏪 State Management

Three Zustand stores manage client-side state:

### `useAuthStore`
```typescript
{
  member: Member | null     // Current user
  isLoading: boolean        // Auth operations in progress
  isInitialized: boolean    // Auth state loaded
  error: string | null

  initialize()              // Check existing session
  signIn(email, password)   // Login
  signUp(email, password, name?)  // Register
  signOut()                 // Logout
}
```

### `useProjectStore`
```typescript
{
  project: BusinessProject | null  // Current project
  projects: BusinessProject[]      // All user projects
  isLoading: boolean
  isSaving: boolean

  loadProjects(memberId)           // Load all projects
  loadProject(projectId)           // Load single project
  createProject(memberId, name?)   // Create new project
  updateField(field, value)        // Update single field
  updateFields(fields)             // Update multiple fields
  deleteProject(projectId)         // Delete project
}
```

### `useChatStore`
```typescript
{
  session: OnboardingSession | null  // Current session
  messages: ConversationMessage[]    // Chat history
  isTyping: boolean                  // AI is responding

  loadSession(projectId)             // Load/create session
  sendMessage(content, type?, metadata?)  // Send user message
  addAssistantMessage(content)       // Add AI response
  setTyping(isTyping)               // Toggle typing indicator
}
```

---

## 🔌 API Routes

### `POST /api/chat`

Send a chat message and get AI response.

```typescript
// Request
{
  sessionId: string
  projectId: string
  message: string
}

// Response
{
  success: boolean
  message: {
    id: string
    role: 'assistant'
    content: string
    message_type: 'text'
    created_at: string
  }
}
```

### `POST /api/project`

Create a new project.

```typescript
// Request
{ name?: string }

// Response
{ success: boolean, project: BusinessProject }
```

### `PATCH /api/project`

Update project fields.

```typescript
// Request
{ id: string, ...fields }

// Response
{ success: boolean, project: BusinessProject }
```

### `POST /api/analyze`

Legacy AI analysis endpoint (clarity/synthesis).

```typescript
// Request
{
  projectId: string
  analyzerType: 'clarity' | 'synthesis'
}

// Response
{
  success: boolean
  runId: string
  rawAnalysis: string
  parsedFields: object
}
```

### `POST /api/analyzers/trigger` 🆕

Trigger AI analyzers (auto-detects which to run).

```typescript
// Request
{
  projectId: string
  analyzerType?: string  // Optional: specific analyzer
  force?: boolean        // Optional: re-run even if completed
}

// Response
{
  success: boolean
  triggered: string[]
  message: string
}
```

### `POST /api/analyzers/web-scraper` 🆕

Scrapes a website and extracts insights.

```typescript
// Request
{
  projectId: string
  runId?: string  // Optional: resume existing run
}

// Response
{
  success: boolean
  runId: string
  analyzerType: 'web_scraper'
  status: 'completed' | 'failed'
  rawAnalysis?: string
  parsedFields?: object
}
```

---

## 🧱 Components

### UI Components (`components/ui/`)

| Component | Description |
|-----------|-------------|
| `Button` | Primary, secondary, outline, ghost, danger variants |
| `Input` | Text input with label, error, icons |
| `Textarea` | Multi-line with auto-resize |
| `Card` | Container with variants and sub-components |
| `Chip` | Selectable tags for word banks |
| `ProgressBar` | Horizontal and circular progress |

### Onboarding Components (`components/onboard/`)

| Component | Description |
|-----------|-------------|
| `OnboardLayout` | Wrapper with header, step indicator, navigation footer |
| `StepIndicator` | Progress dots showing current step (desktop) or X/Y (mobile) |
| `MadLibsInput` | Single fill-in-blank inline input |
| `MadLibsParagraph` | Full paragraph with embedded blank inputs |
| `WordBankSelector` | Multi-select word grid with categories and shuffle |
| `StyleSlider` | 5-point preference slider with descriptions |

### Chat Components (`components/chat/`)

| Component | Description |
|-----------|-------------|
| `ChatContainer` | Main chat interface with messages and input |
| `ChatInput` | Message input with send button |
| `MessageBubble` | Individual message with role styling |
| `TypingIndicator` | "AI is thinking" dots |
| `WelcomeMessage` | Empty state with suggestions |

### Interaction Components (`components/interactions/`)

| Component | Description |
|-----------|-------------|
| `WordBank` | Multi-select word picker with categories |
| `SliderInput` | 5-point scale with descriptions |
| `BinaryChoice` | Multiple choice cards |
| `InferenceReveal` | AI suggestion with accept/reject/edit |

---

## ⚙️ Configuration

### Buckets (`lib/config/buckets.ts`)

Defines the 6 information buckets:

```typescript
const BUCKETS = {
  core_idea: {
    weight: 3,  // Required
    fields: ['idea_name', 'one_liner', ...],
    requiredFields: ['idea_name', 'one_liner', 'problem_statement']
  },
  // ... other buckets
}
```

### Word Banks (`lib/config/wordBanks.ts`)

Pre-defined word options for selections:

```typescript
const TARGET_AUDIENCE_BANK = {
  minSelections: 3,
  maxSelections: 5,
  categories: [
    { id: 'life_stage', words: ['Students', 'Young professionals', ...] },
    { id: 'mindset', words: ['Ambitious', 'Overwhelmed', ...] },
    // ...
  ]
}
```

### Interactions (`lib/config/interactions.ts`)

Slider and binary choice configurations:

```typescript
const PROBLEM_URGENCY_SLIDER = {
  min: 1, max: 5,
  leftLabel: 'Nice to have',
  rightLabel: 'Hair on fire',
  descriptions: {
    1: '😌 Nice to have - People can live without it',
    // ...
  }
}
```

---

## 🚢 Deployment

### Vercel (Frontend)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
4. Deploy!

### Supabase (Backend)

1. Create a new Supabase project
2. Run the SQL migration in SQL Editor
3. Enable Email Auth in Auth > Providers
4. (Optional) Enable Google OAuth
5. Copy the API keys to Vercel

---

## 📝 Development Notes

### Adding a New Field

1. Add to SQL schema (`supabase/migrations/`)
2. Add to TypeScript types (`lib/types/index.ts`)
3. Add to relevant bucket (`lib/config/buckets.ts`)
4. (If needed) Add interaction config (`lib/config/interactions.ts`)
5. Update UI components to use the field

### Adding a New Analyzer

The analyzer system is now modular! See `src/lib/analyzers/README.md` for full details.

**Quick steps:**
1. Add the type to `lib/analyzers/types.ts`
2. Add config to `lib/analyzers/registry.ts`
3. Create analyzer folder: `lib/analyzers/your-analyzer/`
4. Create API route: `app/api/analyzers/your-analyzer/route.ts`
5. Add SQL migration for new fields (if needed)

**Existing analyzers:**
- `web_scraper` - Scrapes website, finds socials, infers industry
- `clarity` - Analyzes idea clarity (legacy)
- `synthesis` - Full business synthesis (legacy)

### Debugging

Enable verbose logging:
```bash
DEBUG_MODE=true npm run dev
```

Check the console for emoji-prefixed logs:
- 🔐 Auth operations
- 💼 Project operations
- 💬 Chat operations
- 🤖 Analyzer operations

---

## 📄 License

MIT - Build cool things! 🚀
