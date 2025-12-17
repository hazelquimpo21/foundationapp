# Foundation Studio - User Stories & Flows

## User Personas

### Maya - Agency Owner
Runs a 5-person branding agency. Uses Foundation Studio to onboard every new client. Needs to quickly capture brand essentials during discovery calls, then let AI fill gaps.

### Jordan - Freelance Marketer
Solo consultant who works with 3-4 clients at a time. Also uses it for their own brand. Wants efficiency and professional-looking outputs to share with clients.

### Sam - Solopreneur
Just started a coaching business. Has ideas but struggles to articulate brand clearly. Needs guidance and structure, not blank forms.

---

## Epic 1: Account & Portfolio Setup

### US-1.1: Create Account
**As a** new user  
**I want to** sign up with email or Google  
**So that** I can save my brand projects

**Acceptance Criteria:**
- Email/password or Google OAuth
- Immediately prompted to create first project after signup
- No email verification required to start (can verify later)

### US-1.2: View My Portfolio
**As a** returning user  
**I want to** see all my brand projects in one place  
**So that** I can manage multiple brands

**Acceptance Criteria:**
- Dashboard shows Primary Brand prominently
- Portfolio section lists all Brand Projects
- Each card shows: name, completion %, last edited
- Quick actions: Continue, View Summary, Delete

---

## Epic 2: Project Onboarding Flow

### US-2.1: Start New Project
**As a** user  
**I want to** quickly set up a new brand project  
**So that** I can begin the onboarding process

**Acceptance Criteria:**
- Choose: "My own brand" or "A brand I'm working with"
- Enter brand name (required)
- Select company size from options
- Enter my name and role
- Proceeds to next step on submit

**Company Size Options:**
- Just an idea / not started yet
- Solopreneur
- 2-10 people
- 11-50 people
- 51-200 people
- 201-1000 people
- 1000+ people

### US-2.2: Provide Website & Assets
**As a** user  
**I want to** share my website and LinkedIn  
**So that** AI can learn about my brand automatically

**Acceptance Criteria:**
- Website URL input (optional but encouraged)
- LinkedIn URL input (personal or company)
- File upload for existing brand materials (PDF)
- "Skip for now" clearly available
- If website provided, scraper starts immediately
- Visual indicator that background processing has begun
- Can proceed without waiting for scraper

### US-2.3: Complete Mad Libs Level 1
**As a** user  
**I want to** fill in blanks about my brand story  
**So that** I can articulate my brand foundation without staring at a blank page

**Acceptance Criteria:**
- Displays paragraph with inline input fields for blanks
- Each input has mic icon for Whisper voice input
- Tab moves between inputs smoothly
- Paragraph adapts pronouns based on Primary vs Portfolio brand
- All blanks required before proceeding
- Right sidebar shows scraper progress if website was provided
- Saves to Supabase on completion
- Triggers narrative_analyzer on completion

**Mad Libs L1 Template (Primary):**
> My name is `[___]` and I'm the `[___]` at `[___]`. We're based in `[___]` and started in `[___]`. We exist because `[___]`. In simple terms, we help `[___]` by `[___]`.

### US-2.4: Select Brand Personality Words
**As a** user  
**I want to** choose words that describe my brand  
**So that** AI understands my brand's personality without me writing essays

**Acceptance Criteria:**
- Grid of word chips organized by category
- Select 5-7 words (enforced)
- Visual feedback on selection (satisfying micro-interaction)
- Selected words shown in sticky summary area
- Can deselect to change choices
- "Shuffle" option to see different words in category

### US-2.5: Select Customer Words
**As a** user  
**I want to** describe my ideal customer with word selections  
**So that** AI understands who I serve

**Acceptance Criteria:**
- Similar UI to brand words
- Categories: Life Stage, Mindset, Needs, Industry
- Select 5-7 words
- Triggers voice_analyzer when both word banks complete

### US-2.6: Set Preference Sliders
**As a** user  
**I want to** indicate my brand's positioning on spectrums  
**So that** AI can understand nuances quickly

**Acceptance Criteria:**
- Communication Style: Formal ↔ Casual (5-point)
- Price Position: Budget ↔ Premium (5-point)
- Clean slider UI with labels at each end
- Optional page - can skip

### US-2.7: View Analysis Progress
**As a** user  
**I want to** see what AI is discovering about my brand  
**So that** I feel progress and can add more detail if needed

**Acceptance Criteria:**
- Shows each analyzer with status (pending/running/complete)
- Real-time updates via Supabase Realtime
- Preview snippets appear as analyzers complete
- "Add more detail" expands to Mad Libs L2
- Can proceed to summary when minimum analysis complete
- Synthesis analyzer triggers when ready

### US-2.8: View Brand Foundation Summary
**As a** user  
**I want to** see my complete brand foundation  
**So that** I can use it for marketing and share with my team

**Acceptance Criteria:**
- Beautiful formatted summary of all brand fields
- Includes AI-generated insights and suggestions
- Export options: Copy, PDF, (future: Notion)
- "Generate Benefit Language" button (add-on analyzer)
- Save confirmation
- Return to portfolio option

---

## Epic 3: Returning & Editing

### US-3.1: Continue Incomplete Project
**As a** user  
**I want to** pick up where I left off  
**So that** I don't lose progress

**Acceptance Criteria:**
- Dashboard shows incomplete projects with progress
- "Continue" button takes to next incomplete step
- All previous inputs preserved

### US-3.2: Edit Existing Project
**As a** user  
**I want to** update my brand information  
**So that** my foundation stays current

**Acceptance Criteria:**
- Any field can be edited from summary view
- Changes trigger relevant re-analysis
- Version history (future consideration)

---

## User Flow Diagram

```
┌─────────────┐
│   Sign Up   │
└──────┬──────┘
       ▼
┌─────────────┐     ┌─────────────┐
│  Dashboard  │────▶│ View Project│
└──────┬──────┘     └─────────────┘
       │ New Project
       ▼
┌─────────────┐
│ Project     │  ← Brand name, size, your role
│ Setup       │
└──────┬──────┘
       ▼
┌─────────────┐
│ Website &   │  ← Optional assets, kicks off scraper
│ Assets      │
└──────┬──────┘
       ▼
┌─────────────┐
│ Mad Libs    │  ← Origin story blanks
│ Level 1     │  → Triggers: narrative_analyzer
└──────┬──────┘
       ▼
┌─────────────┐
│ Word Banks  │  ← Brand words, customer words
│             │  → Triggers: voice_analyzer
└──────┬──────┘
       ▼
┌─────────────┐
│ Sliders     │  ← Optional preferences
└──────┬──────┘
       ▼
┌─────────────┐
│ Analysis    │  ← Real-time progress, optional L2
│ Hub         │  → Triggers: synthesis_analyzer
└──────┬──────┘
       ▼
┌─────────────┐
│ Foundation  │  ← Summary, export, next steps
│ Complete    │
└─────────────┘
```

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User closes mid-onboarding | Auto-save at each step, resume on return |
| Website scraper fails | Show graceful error, continue without scraped data |
| Website has no useful content | Analyzer notes low confidence, prompts for more input |
| User selects contradictory words | Analyzer notes tension, may ask clarifying question |
| Company size is "just an idea" | Skip team-related questions, adjust language |
| User wants to change brand name | Allow edit, re-run affected analyzers |
