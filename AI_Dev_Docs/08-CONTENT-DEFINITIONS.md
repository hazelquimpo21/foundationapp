# Foundation Studio - Content Definitions

## Mad Libs Templates

### Level 1: The Essentials (Required)

**Primary Brand Voice ("I/We"):**

```
My name is [repName] and I'm the [repRole] at [brandName]. 

We're based in [brandLocation] and started in [yearFounded]. 

We exist because [foundingReason]. 

In simple terms, we help [customerDescription] by [coreOffering].
```

**Portfolio Brand Voice ("They"):**

```
I'm [repName], the [repRole] working with [brandName]. 

They're based in [brandLocation] and started in [yearFounded]. 

They exist because [foundingReason]. 

In simple terms, they help [customerDescription] by [coreOffering].
```

### Level 1 Field Definitions

| Field | Placeholder Hint | Expected Length | Example |
|-------|------------------|-----------------|---------|
| `repName` | "your name" | 2-4 words | "Jordan Smith" |
| `repRole` | "Founder, CEO, Director..." | 1-4 words | "Founder and Head Coach" |
| `brandName` | "brand/business name" | 1-5 words | "Acme Coaching" |
| `brandLocation` | "city, state/country" | 1-4 words | "Austin, Texas" |
| `yearFounded` | "2020" | 4 digits | "2021" |
| `foundingReason` | "we saw a need for..." | 1-2 sentences | "too many ambitious people felt stuck without support" |
| `customerDescription` | "who you serve" | 3-10 words | "busy professionals ready for a career change" |
| `coreOffering` | "what you do for them" | 5-15 words | "providing structured coaching and accountability to reach their goals" |

---

### Level 2: The Story (Optional Enrichment)

```
Our team is [teamDescription]. 

What makes us different is [uniqueApproach].

Our customers typically struggle with [customerPainPoints]. 

What they really want is [customerAspirations].

Our main offerings include [productsServices].
```

### Level 2 Field Definitions

| Field | Placeholder Hint | Expected Length |
|-------|------------------|-----------------|
| `teamDescription` | "just me, a small team of..." | 5-20 words |
| `uniqueApproach` | "our secret sauce is..." | 1-2 sentences |
| `customerPainPoints` | "they struggle with..." | 3-10 words |
| `customerAspirations` | "they want to..." | 3-10 words |
| `productsServices` | "our main offerings" | comma-separated list |

---

### Level 3: The Depth (Optional Enrichment)

```
If our brand was a person at a party, they'd be the one who [brandPersonalityScenario].

The feeling we want customers to have after working with us is [desiredOutcomeFeeling].

In 5 years, we want to be known as [futureVision].
```

### Level 3 Field Definitions

| Field | Placeholder Hint | Expected Length |
|-------|------------------|-----------------|
| `brandPersonalityScenario` | "makes everyone laugh, quietly helps..." | 5-15 words |
| `desiredOutcomeFeeling` | "confident, relieved, excited..." | 3-10 words |
| `futureVision` | "the go-to for..." | 5-15 words |

---

## Word Banks

### Brand Personality Words

Users select 5-7 words that feel like their brand.

#### Warmth & Care
```javascript
const warmthWords = [
  'Compassionate', 'Nurturing', 'Supportive', 'Welcoming', 
  'Friendly', 'Approachable', 'Caring', 'Gentle', 
  'Kind', 'Warm', 'Empathetic', 'Thoughtful'
]
```

#### Energy & Drive
```javascript
const energyWords = [
  'Bold', 'Dynamic', 'Energetic', 'Driven', 
  'Ambitious', 'Fearless', 'Adventurous', 'Spirited', 
  'Vibrant', 'Passionate', 'Determined', 'Motivated'
]
```

#### Trust & Reliability
```javascript
const trustWords = [
  'Trustworthy', 'Reliable', 'Dependable', 'Consistent', 
  'Stable', 'Honest', 'Authentic', 'Transparent', 
  'Credible', 'Solid', 'Genuine', 'Loyal'
]
```

#### Innovation & Creativity
```javascript
const innovationWords = [
  'Innovative', 'Creative', 'Original', 'Inventive', 
  'Visionary', 'Forward-thinking', 'Cutting-edge', 'Fresh', 
  'Imaginative', 'Pioneering', 'Experimental', 'Unconventional'
]
```

#### Expertise & Quality
```javascript
const expertiseWords = [
  'Expert', 'Professional', 'Sophisticated', 'Refined', 
  'Premium', 'Meticulous', 'Precise', 'Excellent', 
  'Elite', 'Masterful', 'Polished', 'Distinguished'
]
```

#### Simplicity & Clarity
```javascript
const simplicityWords = [
  'Simple', 'Clear', 'Straightforward', 'Clean', 
  'Minimal', 'Effortless', 'Streamlined', 'Uncomplicated', 
  'Accessible', 'Easy', 'Intuitive', 'Direct'
]
```

#### Fun & Playful
```javascript
const funWords = [
  'Playful', 'Fun', 'Quirky', 'Witty', 
  'Cheerful', 'Light-hearted', 'Joyful', 'Entertaining', 
  'Delightful', 'Whimsical', 'Humorous', 'Lively'
]
```

#### Strength & Power
```javascript
const strengthWords = [
  'Strong', 'Powerful', 'Confident', 'Commanding', 
  'Authoritative', 'Resilient', 'Robust', 'Mighty', 
  'Impactful', 'Influential', 'Assertive', 'Formidable'
]
```

---

### Customer Descriptor Words

Users select 5-7 words that describe their ideal customer.

#### Life Stage
```javascript
const lifeStageWords = [
  'New parent', 'Empty nester', 'Career changer', 'Recent graduate',
  'Retiree', 'Newlywed', 'Startup founder', 'Established business owner',
  'Mid-career professional', 'First-time buyer', 'Seasoned executive', 'Young professional'
]
```

#### Mindset
```javascript
const mindsetWords = [
  'Ambitious', 'Curious', 'Overwhelmed', 'Stuck',
  'Ready for change', 'Growth-oriented', 'Skeptical', 'Eager',
  'Cautious', 'Open-minded', 'Frustrated', 'Hopeful',
  'Determined', 'Confused', 'Motivated', 'Stressed'
]
```

#### Needs & Priorities
```javascript
const needsWords = [
  'Time-strapped', 'Budget-conscious', 'Quality-focused', 'Results-driven',
  'Relationship-oriented', 'Independence-seeking', 'Security-seeking', 'Status-conscious',
  'Value-driven', 'Convenience-focused', 'Privacy-minded', 'Community-seeking',
  'Health-conscious', 'Family-first', 'Career-focused', 'Balance-seeking'
]
```

#### Industry Context
```javascript
const industryWords = [
  'Creative professional', 'Healthcare worker', 'Educator', 'Tech worker',
  'Service provider', 'Maker/Artisan', 'Consultant', 'Retail owner',
  'Finance professional', 'Legal professional', 'Nonprofit worker', 'Real estate',
  'Hospitality', 'Manufacturing', 'Agency owner', 'Freelancer'
]
```

---

## Word Bank UI Configuration

```typescript
interface WordCategory {
  id: string
  label: string
  words: string[]
  shufflePool?: string[]  // Additional words for shuffle
  icon?: string
}

interface WordBankConfig {
  minSelections: number
  maxSelections: number
  categories: WordCategory[]
}

const brandWordBankConfig: WordBankConfig = {
  minSelections: 5,
  maxSelections: 7,
  categories: [
    { id: 'warmth', label: 'Warmth & Care', words: warmthWords, icon: '💛' },
    { id: 'energy', label: 'Energy & Drive', words: energyWords, icon: '⚡' },
    { id: 'trust', label: 'Trust & Reliability', words: trustWords, icon: '🤝' },
    { id: 'innovation', label: 'Innovation & Creativity', words: innovationWords, icon: '💡' },
    { id: 'expertise', label: 'Expertise & Quality', words: expertiseWords, icon: '✨' },
    { id: 'simplicity', label: 'Simplicity & Clarity', words: simplicityWords, icon: '🎯' },
    { id: 'fun', label: 'Fun & Playful', words: funWords, icon: '🎈' },
    { id: 'strength', label: 'Strength & Power', words: strengthWords, icon: '💪' },
  ]
}

const customerWordBankConfig: WordBankConfig = {
  minSelections: 5,
  maxSelections: 7,
  categories: [
    { id: 'lifestage', label: 'Life Stage', words: lifeStageWords, icon: '🌱' },
    { id: 'mindset', label: 'Mindset', words: mindsetWords, icon: '🧠' },
    { id: 'needs', label: 'Needs & Priorities', words: needsWords, icon: '🎯' },
    { id: 'industry', label: 'Industry Context', words: industryWords, icon: '💼' },
  ]
}
```

---

## Shuffle Behavior

Each category can have a larger pool than what's initially displayed. Shuffle reveals different options:

```typescript
// Display 6-8 words per category initially
// Shuffle replaces current words with others from the pool
// Selected words are always preserved (don't disappear on shuffle)

function shuffleCategory(category: WordCategory, selected: string[]): string[] {
  const available = category.words.filter(w => !selected.includes(w))
  const shuffled = shuffleArray(available)
  const toShow = shuffled.slice(0, 8)
  
  // Always include any selected words from this category
  const selectedInCategory = selected.filter(w => category.words.includes(w))
  return [...new Set([...selectedInCategory, ...toShow])]
}
```

---

## Role Suggestions

Pre-populated options for the role field:

```typescript
const roleSuggestions = [
  'Founder',
  'Co-Founder', 
  'CEO',
  'Owner',
  'Creative Director',
  'Marketing Director',
  'Brand Strategist',
  'Consultant',
  'Freelancer',
  'Head of Marketing',
  'CMO',
  'Managing Director',
  'Partner',
]
```

---

## Company Size Options

```typescript
const companySizeOptions = [
  { value: 'idea', label: 'Just an idea', description: 'Not started yet' },
  { value: 'solo', label: 'Solopreneur', description: 'Just me' },
  { value: 'micro', label: '2-10 people', description: 'Small team' },
  { value: 'small', label: '11-50 people', description: 'Growing company' },
  { value: 'medium', label: '51-200 people', description: 'Established business' },
  { value: 'large', label: '201-1000 people', description: 'Large organization' },
  { value: 'enterprise', label: '1000+ people', description: 'Enterprise' },
]

// Skip team questions for these sizes
const skipTeamQuestions = ['idea', 'solo']
```

---

## Slider Configurations

```typescript
const sliderConfigs = {
  commStyle: {
    label: 'Communication Style',
    min: 1,
    max: 5,
    leftLabel: 'Formal',
    rightLabel: 'Casual',
    descriptions: {
      1: 'Highly professional and formal',
      2: 'Professional with some warmth',
      3: 'Balanced - professional yet approachable',
      4: 'Friendly and conversational',
      5: 'Very casual and personal',
    }
  },
  pricePosition: {
    label: 'Price Positioning',
    min: 1,
    max: 5,
    leftLabel: 'Budget',
    rightLabel: 'Premium',
    descriptions: {
      1: 'Most affordable option in market',
      2: 'Value-focused pricing',
      3: 'Mid-market positioning',
      4: 'Upper mid-range',
      5: 'Premium/luxury positioning',
    }
  }
}
```
