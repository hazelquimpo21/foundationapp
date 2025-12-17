# Foundation Studio - UI Components & Design

## Design Philosophy

**Clean, elegant, with moments of delight.**

- Generous whitespace
- Soft shadows and rounded corners
- Subtle animations that feel responsive, not distracting
- Progress feels tangible and rewarding
- Inputs feel lightweight, not like filling out government forms

## Color Palette

```css
:root {
  /* Primary - Calm teal/green */
  --primary-50: #f0fdfa;
  --primary-100: #ccfbf1;
  --primary-500: #14b8a6;
  --primary-600: #0d9488;
  --primary-700: #0f766e;

  /* Neutral */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-500: #6b7280;
  --gray-700: #374151;
  --gray-900: #111827;

  /* Accent - Soft purple for highlights */
  --accent-100: #ede9fe;
  --accent-500: #8b5cf6;

  /* Feedback */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
}
```

## Typography

```css
/* Headings: Plus Jakarta Sans or similar */
font-family: 'Plus Jakarta Sans', sans-serif;

/* Body: Inter */
font-family: 'Inter', sans-serif;

/* Sizes */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
```

---

## Component Structure

```
/components
  /ui                    → Primitive components
    Button.tsx
    Input.tsx
    Chip.tsx
    Slider.tsx
    Card.tsx
    ProgressBar.tsx
    Modal.tsx
    
  /onboard               → Onboarding-specific
    MadLibsInput.tsx
    MadLibsParagraph.tsx
    WordBankGrid.tsx
    WordChip.tsx
    SliderQuestion.tsx
    StepIndicator.tsx
    VoiceInputButton.tsx
    
  /analyzers             → Analyzer display
    AnalyzerCard.tsx
    AnalyzerProgress.tsx
    AnalyzerPreview.tsx
    
  /layout                → Layout components
    OnboardLayout.tsx
    DashboardLayout.tsx
    Sidebar.tsx
```

---

## Core UI Components

### Button

```tsx
// /components/ui/Button.tsx

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

// Styles
const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
  secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
}
```

### Input

```tsx
// /components/ui/Input.tsx

interface InputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  rightElement?: React.ReactNode  // For mic icon, etc.
}

// Inline variant for mad libs
interface InlineInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  width?: 'sm' | 'md' | 'lg' | 'auto'
}
```

### Chip (for word banks)

```tsx
// /components/ui/Chip.tsx

interface ChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
}

// Styles
const baseStyles = `
  px-4 py-2 rounded-full text-sm font-medium
  transition-all duration-200 cursor-pointer
  border-2
`

const selectedStyles = `
  bg-primary-100 border-primary-500 text-primary-700
  shadow-sm
`

const unselectedStyles = `
  bg-white border-gray-200 text-gray-700
  hover:border-gray-300 hover:bg-gray-50
`

// Delight: slight scale on selection
const selectAnimation = 'transform active:scale-95'
```

### Slider

```tsx
// /components/ui/Slider.tsx

interface SliderProps {
  min?: number
  max?: number
  value: number
  onChange: (value: number) => void
  leftLabel: string
  rightLabel: string
  showValue?: boolean
}

// Visual: 5 discrete steps with labels at ends
// Thumb has subtle shadow and grows slightly on hover
```

### Progress Bar

```tsx
// /components/ui/ProgressBar.tsx

interface ProgressBarProps {
  value: number      // 0-100
  label?: string
  showPercentage?: boolean
  variant?: 'default' | 'success' | 'accent'
  size?: 'sm' | 'md'
  animated?: boolean  // Subtle pulse when in progress
}
```

---

## Onboarding Components

### MadLibsParagraph

The main fill-in-the-blank experience.

```tsx
// /components/onboard/MadLibsParagraph.tsx

interface MadLibsParagraphProps {
  template: string  // "My name is {{repName}} and I'm the {{repRole}}..."
  values: Record<string, string>
  onChange: (field: string, value: string) => void
  voiceEnabled?: boolean
}

// Renders paragraph with inline inputs replacing {{placeholders}}
// Each input has:
// - Subtle underline styling
// - Placeholder hint
// - Mic icon (if voice enabled)
// - Focus ring that's visible but not harsh

// The paragraph text itself is slightly larger, comfortable reading size
// Inputs blend in but are clearly interactive
```

### MadLibsInput

Individual inline input within mad libs.

```tsx
// /components/onboard/MadLibsInput.tsx

interface MadLibsInputProps {
  field: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  onVoiceClick?: () => void
  voiceEnabled?: boolean
}

// Styling:
// - No visible border by default, just subtle underline
// - On focus: soft glow + darker underline
// - Auto-width based on content (with min-width)
// - Mic icon appears on hover/focus
```

### WordBankGrid

Grid of selectable word chips.

```tsx
// /components/onboard/WordBankGrid.tsx

interface WordBankGridProps {
  words: WordCategory[]
  selectedWords: string[]
  onToggle: (word: string) => void
  minSelections?: number
  maxSelections?: number
}

interface WordCategory {
  name: string
  words: string[]
}

// Layout:
// - Categories as subtle headers
// - Chips flow in flex-wrap grid
// - Selected chips rise slightly (shadow)
// - Counter shows "3 of 5-7 selected"
// - Shuffle button per category
```

### StepIndicator

Shows progress through onboarding.

```tsx
// /components/onboard/StepIndicator.tsx

interface StepIndicatorProps {
  steps: Step[]
  currentStep: string
}

interface Step {
  id: string
  label: string
  icon?: React.ReactNode
}

// Visual:
// - Horizontal dots/circles connected by lines
// - Completed steps: filled primary color + checkmark
// - Current step: larger, pulsing slightly
// - Future steps: gray outline
// - On mobile: show current step name + X of Y
```

### VoiceInputButton

Whisper integration for voice input.

```tsx
// /components/onboard/VoiceInputButton.tsx

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void
  isListening: boolean
  onStartListening: () => void
  onStopListening: () => void
}

// Visual states:
// - Idle: subtle mic icon
// - Listening: pulsing red dot, waveform animation
// - Processing: spinner
// - Complete: brief checkmark before returning to idle
```

---

## Analyzer Components

### AnalyzerCard

Shows status of a single analyzer.

```tsx
// /components/analyzers/AnalyzerCard.tsx

interface AnalyzerCardProps {
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  label: string
  description: string
  preview?: string  // First bit of analysis to show
}

// Visual states:
// - Pending: gray, subtle "waiting" icon
// - Running: primary color border, animated progress dots
// - Completed: success color, expand to show preview
// - Failed: error color, retry button

// Card has icon representing analyzer type
// (magnifying glass for scraper, brain for narrative, etc.)
```

### AnalyzerProgress

Overall analysis progress visualization.

```tsx
// /components/analyzers/AnalyzerProgress.tsx

interface AnalyzerProgressProps {
  runs: Record<string, AnalyzerRun>
  requiredAnalyzers: string[]
}

// Shows:
// - Overall % complete
// - List of analyzers with status icons
// - Estimated time remaining (if running)
// - "Ready to view summary" when synthesis complete
```

---

## Layout Components

### OnboardLayout

Wrapper for all onboarding pages.

```tsx
// /components/layout/OnboardLayout.tsx

interface OnboardLayoutProps {
  children: React.ReactNode
  projectId: string
  currentStep: string
  showProgress?: boolean
  sidebar?: React.ReactNode  // For scraper status, etc.
}

// Structure:
// ┌─────────────────────────────────────────────┐
// │  Logo          Step Indicator          Exit │
// ├─────────────────────────────────────────────┤
// │                                    │        │
// │         Main Content               │Sidebar │
// │         (children)                 │(opt)   │
// │                                    │        │
// ├─────────────────────────────────────────────┤
// │  Back                           Continue    │
// └─────────────────────────────────────────────┘

// Footer nav is sticky
// Sidebar collapses on mobile
```

---

## Animation Guidelines

Keep animations subtle and purposeful:

```css
/* Standard transition */
transition: all 150ms ease;

/* Hover lift for cards */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Chip selection pop */
.chip-selected {
  animation: select-pop 200ms ease;
}
@keyframes select-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Running analyzer pulse */
.analyzer-running {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Progress bar fill */
.progress-fill {
  transition: width 500ms ease-out;
}
```

---

## Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

**Mobile considerations:**
- Mad libs paragraph stacks more vertically
- Word bank uses 2-column grid instead of 4
- Sidebar becomes bottom sheet or separate step
- Step indicator becomes compact

---

## Accessibility

- All interactive elements are keyboard navigable
- Focus rings are visible but not harsh
- Color alone doesn't convey meaning (icons + labels)
- ARIA labels on icon-only buttons
- Minimum contrast ratios met
- Voice input as enhancement, not requirement
