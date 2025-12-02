# 🎯 Business Onboarder

A conversational AI app that helps founders articulate their brand foundation through natural dialogue—eliminating blank page syndrome by inferring insights from conversation.

## ✨ What It Does

Instead of forms and templates, founders have a natural conversation. The AI:
- **Listens** to how you describe your business
- **Infers** your values, voice, and positioning
- **Structures** everything into a usable brand foundation
- **Generates** one-liners, positioning statements, and more

**Result:** In ~15 minutes, founders walk away with clarity on who they are, who they serve, and what makes them different.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- **npm** or **pnpm**
- **Supabase** account (free tier works)
- **OpenAI** API key

### 1. Install Dependencies

```bash
cd foundation
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run:
   - First: `supabase/schema.sql` (creates all tables)
   - Then: `supabase/seed.sql` (populates buckets and field definitions)
3. Get your API keys from **Settings > API**

### 3. Configure Environment

```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit with your keys
```

Required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 🏗️ Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Welcome   │  │    Chat     │  │  Dashboard  │              │
│  │    Page     │─▶│   Interface │─▶│   (Future)  │              │
│  └─────────────┘  └──────┬──────┘  └─────────────┘              │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      ZUSTAND STORES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Session    │  │    Chat      │  │  Foundation  │           │
│  │    Store     │  │    Store     │  │    Store     │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API ROUTES                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  /api/chat   │  │ /api/session │  │ /api/analyze │           │
│  └──────┬───────┘  └──────────────┘  └──────────────┘           │
└─────────┼────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                              │
│  ┌──────────────────────┐  ┌──────────────────────┐              │
│  │      SUPABASE        │  │       OPENAI         │              │
│  │  - Auth              │  │  - GPT-4o-mini       │              │
│  │  - Database          │  │  - Chat completions  │              │
│  │  - Realtime          │  │  - Function calling  │              │
│  └──────────────────────┘  └──────────────────────┘              │
└──────────────────────────────────────────────────────────────────┘
```

### Core Concepts

#### 📦 Buckets
Buckets are categories for organizing fields:
- **Basics** - Business name, stage, industry
- **Customers** - Demographics, pains, desires
- **Values** - Core values, beliefs, stands against
- **Voice** - Personality, tone spectrums
- **Positioning** - Differentiators, competition
- **Vision** - Mission, vision statements

#### 💬 Conversation Flow
1. User sends message
2. Message saved to database
3. OpenAI generates conversational response
4. Response displayed with optional interactions
5. Background: Analyzers run on message batches

#### 🔬 Analysis Pipeline
```
Messages → Analyzer (prose) → Parser (structured) → Fields
```
- **Analyzers** produce thoughtful narrative analysis
- **Parsers** use function-calling to extract structured data
- This separation lets GPT "think" freely before structuring

---

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Welcome page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── chat/
│   │   └── [sessionId]/
│   │       └── page.tsx      # Chat interface
│   └── api/
│       ├── chat/route.ts     # Chat message handling
│       ├── session/route.ts  # Session management
│       └── analyze/route.ts  # AI analysis
│
├── components/
│   ├── chat/                 # Chat UI components
│   │   ├── ChatContainer.tsx
│   │   ├── ChatInput.tsx
│   │   └── MessageBubble.tsx
│   ├── interactions/         # Interactive elements
│   │   ├── WordBank.tsx
│   │   ├── Slider.tsx
│   │   ├── BinaryChoice.tsx
│   │   └── InferenceReveal.tsx
│   └── progress/             # Progress tracking
│       ├── ProgressPanel.tsx
│       └── BucketProgress.tsx
│
├── store/                    # Zustand state stores
│   ├── sessionStore.ts       # Session state
│   ├── chatStore.ts          # Messages, UI state
│   └── foundationStore.ts    # Field values, progress
│
├── lib/
│   ├── types/                # TypeScript definitions
│   ├── supabase/             # Database clients & queries
│   ├── openai/               # AI client
│   └── utils.ts              # Helpers
│
├── config/
│   ├── buckets.ts            # Bucket definitions
│   ├── interactions.ts       # Word banks, sliders
│   └── prompts.ts            # AI prompts
│
└── supabase/
    ├── schema.sql            # Database tables
    └── seed.sql              # Initial data
```

---

## 🗄️ Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `businesses` | Business profiles |
| `onboarding_sessions` | Conversation sessions |
| `conversation_messages` | Chat history |
| `field_buckets` | Bucket definitions |
| `field_definitions` | Field schema |
| `foundation_fields` | Actual field values |
| `analysis_jobs` | AI analysis queue |
| `inference_reveals` | Pending inferences |

### Entity Relationships

```
users
  └── businesses (1:many)
        └── onboarding_sessions (1:many)
              └── conversation_messages (1:many)
        └── foundation_fields (1:many)
```

---

## 🎮 Interactive Elements

### Word Bank
Multi-select words from categorized options. Great for values and personality.

### Sliders
Spectrum-based selection (1-10 scale). Used for voice characteristics.

### Binary Choice
This-or-that selection. Quick gut-check questions.

### Inference Reveal
Shows AI inference for confirmation. Users can confirm, reject, or edit.

---

## 🔧 Configuration

### Adding a New Field

1. Add to `supabase/seed.sql`:
```sql
INSERT INTO field_definitions (id, bucket_id, ...) VALUES (...);
```

2. Add TypeScript type (optional) in `src/lib/types/database.ts`

3. Update analyzer prompts if needed in `src/config/prompts.ts`

### Adding a New Bucket

1. Add to `supabase/seed.sql`:
```sql
INSERT INTO field_buckets (id, display_name, ...) VALUES (...);
```

2. Add to `src/config/buckets.ts` for client-side defaults

3. Add fields for the new bucket

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
4. Deploy!

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `NEXT_PUBLIC_APP_URL` | No | App URL (for callbacks) |

---

## 🧪 Development

### Code Style

- **Files**: ~400 lines max, prefer small focused modules
- **Components**: One component per file
- **Naming**: PascalCase for components, camelCase for functions
- **Types**: Explicit types, avoid `any`
- **Comments**: Focus on "why", not "what"

### Logging

Use the `log` utility for consistent logging:

```typescript
import { log } from '@/lib/utils';

log.info('✅ Action completed', { data });
log.warn('⚠️ Warning', { issue });
log.error('❌ Error occurred', { error });
```

---

## 📚 Additional Docs

See `/AI_Dev_Docs/` for detailed specifications:
- `01-PRD.md` - Product requirements
- `02-database-schema.md` - Full schema docs
- `03-field-definitions.md` - All 37 fields
- `04-question-interaction-bank.md` - Questions & interactions
- `05-analyzer-prompts.md` - AI prompt templates
- ...and more

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a PR

---

## 📄 License

MIT

---

Built with ❤️ using Next.js, Supabase, and OpenAI
