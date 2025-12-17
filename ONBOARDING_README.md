# 🚀 Foundation Studio - Onboarding Flow

## Overview

The onboarding flow guides new users through defining their brand foundation using structured inputs (not overwhelming chat!).

**Philosophy:** Structure over open-ended questions. Users fill in blanks, select from word banks, and use sliders. This reduces cognitive load and produces better data.

## 📁 File Structure

```
src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx              # Project list, routes to /onboard/new
│   └── onboard/
│       ├── new/
│       │   └── page.tsx          # Step 0: Project type selection
│       └── [projectId]/
│           ├── setup/
│           │   └── page.tsx      # Step 1: Basic info (brand name, size, role)
│           ├── assets/
│           │   └── page.tsx      # Step 2: Website & LinkedIn (optional)
│           ├── story/
│           │   └── page.tsx      # Step 3: Mad Libs narrative
│           ├── words/
│           │   └── page.tsx      # Step 4: Brand & customer word banks
│           ├── style/
│           │   └── page.tsx      # Step 5: Communication & price sliders
│           ├── hub/
│           │   └── page.tsx      # Step 6: Analysis dashboard
│           └── done/
│               └── page.tsx      # Step 7: Celebration & summary
│
├── components/
│   └── onboard/
│       ├── index.ts              # Barrel export
│       ├── OnboardLayout.tsx     # Wrapper with header, nav, footer
│       ├── StepIndicator.tsx     # Progress dots
│       ├── MadLibsInput.tsx      # Fill-in-the-blank inputs
│       ├── WordBankSelector.tsx  # Word selection grid
│       └── StyleSlider.tsx       # Preference sliders
│
└── lib/
    └── config/
        └── onboarding.ts         # Step definitions, word banks, sliders
```

## 🔄 User Flow

```
Dashboard
    │
    ▼
/onboard/new ─────────────────────────────────────────────┐
    │                                                     │
    │ "My Brand" or "Client Brand" selection              │
    │ Creates project record                              │
    ▼                                                     │
/onboard/[projectId]/setup                                │
    │                                                     │
    │ • Brand name                                        │
    │ • Company size (radio buttons)                      │
    │ • Your name                                         │
    │ • Your role (dropdown with suggestions)             │
    ▼                                                     │
/onboard/[projectId]/assets (OPTIONAL)                    │
    │                                                     │
    │ • Website URL                                       │
    │ • LinkedIn URL                                      │
    │ • Skip button available                             │
    ▼                                                     │
/onboard/[projectId]/story                                │
    │                                                     │
    │ Mad Libs: "My name is ___ and I'm the ___ at ___"   │
    │ Fill in all blanks to continue                      │
    ▼                                                     │
/onboard/[projectId]/words                                │
    │                                                     │
    │ • Brand personality words (5-7 from categories)     │
    │ • Customer descriptor words (5-7 from categories)   │
    ▼                                                     │
/onboard/[projectId]/style (OPTIONAL)                     │
    │                                                     │
    │ • Communication style slider (Formal ↔ Casual)      │
    │ • Price positioning slider (Budget ↔ Premium)       │
    │ • Skip button available                             │
    ▼                                                     │
/onboard/[projectId]/hub                                  │
    │                                                     │
    │ Analysis dashboard showing:                         │
    │ • Collected data summary                            │
    │ • Progress indicators                               │
    │ • (Future: AI analysis status)                      │
    ▼                                                     │
/onboard/[projectId]/done                                 │
    │                                                     │
    │ • Celebration banner                                │
    │ • Complete brand foundation summary                 │
    │ • Copy to clipboard                                 │
    │ • Return to dashboard                               │
    ▼                                                     │
Dashboard ◄───────────────────────────────────────────────┘
```

## 🗄️ Data Mapping

The onboarding fields map to the existing `business_projects` database schema:

| Onboarding Field | Database Field | Notes |
|-----------------|----------------|-------|
| Brand Name | `idea_name`, `project_name` | Display name |
| Company Size | `team_size` | Existing enum |
| Rep Role | `current_step` | Temporarily stored |
| Founding Reason | `problem_statement` | Why they exist |
| Core Offering | `secret_sauce` | What they do |
| Customer Description | `one_liner` | Who they serve |
| Brand Words | `company_values` | Array of strings |
| Customer Words | `target_audience` | Array of strings |
| Comm Style | `pricing_tier` | Slider value 1-5 |
| Price Position | `differentiation_score` | Slider value 1-5 |
| Website URL | `positioning` | Temporary storage |
| LinkedIn URL | `north_star_metric` | Temporary storage |

> **Note:** Some fields are temporarily stored in unrelated columns to avoid database migrations in MVP. This will be cleaned up in a future refactor.

## 🎨 Components

### OnboardLayout
Wrapper for all onboarding pages. Provides:
- Header with logo and exit button
- Step indicator (dots showing progress)
- Back/Continue navigation footer
- Optional skip button
- Optional sidebar (for future scraper status)

### StepIndicator
Shows progress through the 7 steps:
- Desktop: Connected dots with checkmarks for completed steps
- Mobile: "Step X of Y" text

### MadLibsInput & MadLibsParagraph
Fill-in-the-blank inputs that feel natural:
- Inline inputs that blend with paragraph text
- Auto-width based on content
- Placeholder hints
- Completion indicator

### WordBankSelector
Grid of selectable word chips:
- Categories with shuffle buttons
- Min/max selection enforcement (5-7)
- Sticky summary bar showing selections
- Satisfying selection animations

### StyleSlider
5-point preference sliders:
- Labels at both ends
- Description of current value
- Clean, touchable design

## 🔧 Configuration

All step definitions and content are in `/src/lib/config/onboarding.ts`:

```typescript
// Step definitions
ONBOARD_STEPS: StepConfig[]

// Company size options
COMPANY_SIZE_OPTIONS: CompanySizeOption[]

// Role suggestions
ROLE_SUGGESTIONS: string[]

// Mad Libs field definitions
MAD_LIBS_FIELDS: MadLibField[]

// Slider configurations
SLIDER_CONFIGS: SliderConfig[]

// Project type options
PROJECT_TYPE_OPTIONS: ProjectTypeOption[]
```

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

## 🧪 Testing the Flow

1. Sign up or log in
2. Click "New Project" on dashboard
3. Select "My Brand" or "Client Brand"
4. Fill in setup form
5. Optionally add website/LinkedIn
6. Complete Mad Libs story
7. Select brand and customer words
8. Adjust style sliders (optional)
9. View hub summary
10. Celebrate on done page!

## 📝 Future Enhancements

- [ ] Web scraper integration (analyze website on assets step)
- [ ] AI analysis on hub page
- [ ] PDF export on done page
- [ ] Voice input for Mad Libs
- [ ] Level 2 & 3 Mad Libs for more detail
- [ ] Real-time validation

## 🐛 Known Limitations

1. Some data stored in temporary columns (see mapping table)
2. No AI analysis yet (placeholders shown)
3. No PDF export yet
4. No voice input yet

---

Built with 💜 by a scrappy indie hacker
