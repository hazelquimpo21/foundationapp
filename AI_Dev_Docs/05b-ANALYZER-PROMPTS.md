# Foundation Studio - Analyzer Prompts (Phase 1)

Each analyzer has a `prompt.ts` file that exports a `buildPrompt()` function. These are the prompt templates.

---

## File Pattern

Each `prompt.ts` follows this structure:

```typescript
// /supabase/functions/analyzer-{name}/prompt.ts

import { BrandProject } from '../_shared/types'

export function buildPrompt(project: BrandProject): string {
  return `Your prompt here with ${project.field} interpolation...`
}
```

---

## Web Scraper Analyzer

**Note:** This analyzer first scrapes the website, THEN runs AI analysis on the scraped content.

### Scraping Step

```typescript
// Use Firecrawl, Browserless, or Puppeteer
const scrapedContent = await scrapeWebsite(project.website_url)

// Also check common social URL patterns
const possibleSocials = await checkSocialUrls(project.brand_name)
```

### Analysis Prompt

```typescript
const webScraperPrompt = `You are a brand researcher analyzing a company's website.

SCRAPED WEBSITE CONTENT:
${scrapedContent.text}

WEBSITE URL: ${project.website_url}
BRAND NAME: ${project.brand_name}

Analyze this website and identify:

1. SOCIAL MEDIA PRESENCE
   Look for social media links in the content. List any you find with their full URLs.
   Common patterns: /instagram, /twitter, /linkedin, /facebook, /tiktok, /youtube
   
2. INDUSTRY CLASSIFICATION
   What industry or field does this business operate in?
   Be specific (e.g., "Executive coaching" not just "coaching")

3. TAGLINE OR VALUE PROPOSITION
   Did you find a clear tagline, slogan, or value proposition on the site?
   Quote it exactly if found.

4. SERVICES OR PRODUCTS
   List any specific services or products mentioned.

5. TARGET AUDIENCE SIGNALS
   Any clues about who they serve? (mentioned client types, testimonials, language used)

6. BRAND VOICE OBSERVATIONS
   How does the website copy feel? Formal/casual? Warm/professional? 
   Note any distinctive language patterns.

7. CONFIDENCE ASSESSMENT
   How much useful information did you find? 
   (rich content / moderate / sparse / mostly placeholder)

Be specific and quote from the content when possible.`
```

---

## Narrative Analyzer

**Triggers when:** Mad Libs Level 1 is complete

```typescript
const narrativePrompt = `You are a senior brand strategist analyzing a new client intake.
Your job is to read between the lines, infer meaning, and provide insights that go beyond surface-level summarization.

BRAND INTAKE INFORMATION:
- Brand Name: ${project.brand_name}
- Location: ${project.brand_location}
- Year Founded: ${project.year_founded}
- Company Size: ${project.company_size}
- Founding Reason: "${project.founding_reason}"
- Core Offering: "${project.core_offering}"
- Customer Description: "${project.customer_description}"

${project.rep_name ? `- Brand Rep: ${project.rep_name}, ${project.rep_role}` : ''}

ANALYSIS TASKS:

1. POSITIONING INSIGHT
   Based on these inputs, what positioning is this brand naturally gravitating toward?
   Write one clear sentence that captures their position in the market.

2. TARGET MARKET INFERENCE  
   What can we infer about their target market beyond what's explicitly stated?
   What assumptions can we make about demographics, psychographics, buying behavior?

3. BRAND ARCHETYPE
   What brand archetype energy do you sense? Choose ONE primary archetype:
   - Hero (empowerment, mastery, courage)
   - Outlaw (disruption, liberation, revolution)  
   - Magician (transformation, vision, innovation)
   - Everyman (belonging, authenticity, equality)
   - Lover (intimacy, passion, appreciation)
   - Jester (joy, playfulness, living in the moment)
   - Caregiver (nurturing, service, compassion)
   - Ruler (control, leadership, success)
   - Creator (innovation, self-expression, vision)
   - Innocent (optimism, simplicity, trust)
   - Sage (wisdom, truth, understanding)
   - Explorer (freedom, discovery, adventure)
   
   Explain why this archetype fits.

4. INDUSTRY CLASSIFICATION
   What industry or field classification best fits this business?
   Be specific (e.g., "B2B SaaS for healthcare" not just "technology")

5. DIFFERENTIATION POTENTIAL
   What's potentially unique about their approach based on how they described it?
   What could they lean into more?

6. GAPS AND TENSIONS
   What's missing or unclear? What questions would strengthen this foundation?
   Note any tensions between what they say and what might actually be true.

Be insightful and specific. This is qualitative analysis, not summarization.`
```

---

## Voice Analyzer

**Triggers when:** Both word banks are complete (5-7 words each)

```typescript
const voicePrompt = `You are a brand voice specialist analyzing word selections to understand brand personality.

BRAND CONTEXT:
- Brand Name: ${project.brand_name}
- Core Offering: ${project.core_offering}
- Brand Archetype (from prior analysis): ${project.brand_archetype || 'not yet determined'}

WORD SELECTIONS:

Brand Personality Words (how they see themselves):
${project.brand_words.join(', ')}

Customer Descriptor Words (how they see their audience):
${project.customer_words.join(', ')}

ANALYSIS TASKS:

1. PERSONALITY SYNTHESIS
   What overall brand personality emerges from these word choices?
   Describe it as if describing a person's character.

2. TONE SUMMARY
   In one phrase, describe the ideal tone of voice.
   Format: "[adjective] and [adjective] with [quality]"
   Example: "Warm and confident with a touch of playfulness"

3. CUSTOMER PERCEPTION
   How does this brand perceive their customer based on the words chosen?
   What does this reveal about their approach and values?

4. VOICE GUIDELINES
   Provide 5-7 specific, actionable voice guidelines.
   Format as clear directives, e.g.:
   - "Use 'we' and 'you' to create partnership feeling"
   - "Lead with benefits before features"
   - "Avoid jargon; explain concepts simply"

5. VOCABULARY SUGGESTIONS
   Words TO use (10-15 words that fit this voice):
   Words to AVOID (5-10 words that clash):

6. TENSION CHECK
   Are there any contradictions between brand words and customer words?
   Any misalignment between how they see themselves vs. who they serve?

7. ARCHETYPE ALIGNMENT
   Do these word choices align with the ${project.brand_archetype || 'suggested'} archetype?
   Or does the voice suggest a different archetype?

Be specific and actionable. These guidelines will be used for actual content creation.`
```

---

## Synthesis Analyzer

**Triggers when:** Minimum buckets complete + narrative analyzer done

```typescript
const synthesisPrompt = `You are a senior brand strategist creating a comprehensive brand foundation document.

ALL AVAILABLE INFORMATION:

Identity:
- Brand Name: ${project.brand_name}
- Location: ${project.brand_location}
- Founded: ${project.year_founded}
- Company Size: ${project.company_size}
- Website: ${project.website_url || 'not provided'}

People:
- Brand Rep: ${project.rep_name}, ${project.rep_role}
- Team: ${project.team_description || 'not provided'}

Offering:
- Core Offering: ${project.core_offering}
- Products/Services: ${project.products_services?.join(', ') || 'not provided'}
- Unique Approach: ${project.unique_approach || 'not provided'}
- Price Position: ${project.price_position || 'not specified'}/5 (1=budget, 5=premium)

Audience:
- Customer Description: ${project.customer_description}
- Customer Pain Points: ${project.customer_pain_points?.join(', ') || 'not provided'}
- Customer Aspirations: ${project.customer_aspirations?.join(', ') || 'not provided'}
- Customer Words: ${project.customer_words?.join(', ') || 'not provided'}

Voice & Personality:
- Brand Words: ${project.brand_words?.join(', ') || 'not provided'}
- Communication Style: ${project.comm_style || 'not specified'}/5 (1=formal, 5=casual)
- Brand Archetype: ${project.brand_archetype || 'not determined'}

Founding Story:
"${project.founding_reason}"

PREVIOUS ANALYSIS:
${narrativeAnalysis || 'Not available'}
${voiceAnalysis || 'Not available'}
${webScraperFindings || 'Not available'}

---

CREATE THE BRAND FOUNDATION:

1. BRAND STORY (2-3 paragraphs)
   Write a compelling narrative about this brand's origin, purpose, and vision.
   Make it human and engaging, not corporate.

2. VALUE PROPOSITION (1 sentence)
   What unique value do they provide to whom?
   Format: "[Brand] helps [specific audience] [achieve outcome] through [unique approach]"

3. POSITIONING STATEMENT
   Follow this format:
   "For [target audience], [brand name] is the [category/frame of reference] that [key benefit] because [reason to believe]."

4. AUDIENCE PERSONA
   Create a vivid description of their ideal customer.
   Include: who they are, what they're dealing with, what they want, why they'd choose this brand.
   Give them a name and make them feel real.

5. VOICE GUIDELINES SUMMARY
   Distill the voice into 3-5 memorable guidelines.
   These should be easy to remember and apply.

6. KEY DIFFERENTIATORS (3-5 points)
   What makes this brand stand out?
   Be specific and honest - don't manufacture differentiation.

7. BRAND PROMISE
   One sentence that captures what customers can always expect.

Write as if presenting to the brand owner. Be confident but acknowledge where more information would strengthen the foundation.`
```

---

## Benefit Language Analyzer

**Triggers:** Manual (user clicks "Generate Benefit Language")

```typescript
const benefitLanguagePrompt = `You are a conversion copywriter creating customer-focused messaging.

BRAND CONTEXT:
- Brand: ${project.brand_name}
- Value Prop: ${project.ai_value_prop}
- Core Offering: ${project.core_offering}
- Products/Services: ${project.products_services?.join(', ')}

CUSTOMER CONTEXT:
- Who they serve: ${project.customer_description}
- Customer pain points: ${project.customer_pain_points?.join(', ')}
- Customer aspirations: ${project.customer_aspirations?.join(', ')}
- Audience persona: ${project.ai_audience_persona}

VOICE GUIDELINES:
${project.ai_voice_guidelines}

---

CREATE BENEFIT LANGUAGE:

1. "SO THAT" STATEMENTS (6 options)
   Write from the customer's point of view.
   Format: "[specific feature/service/offering] so that I can [meaningful outcome]"
   
   Make them specific to this brand's actual offerings.
   Bad: "Great service so that I can be happy"
   Good: "Weekly accountability calls so that I can stay on track with my goals"

2. "WOULDN'T YOU LIKE TO..." STATEMENTS (6 options)
   Flip the outcomes into questions.
   Format: "Wouldn't you like to [outcome from above]?"
   
   These work well for headlines and CTAs.

3. HOMEPAGE HEADLINES (3 options)
   Each should be:
   - Clear about who this is for
   - Compelling about the benefit
   - True to the brand voice
   
   Provide a headline + optional subheadline for each.

4. ELEVATOR PITCH (30 seconds spoken)
   Write as if the brand owner is introducing themselves at a networking event.
   Should flow naturally when read aloud.
   Include: who they help, what problem they solve, what makes them different.

5. SOCIAL MEDIA BIO (160 characters)
   Punchy, clear, includes what they do and for whom.

6. EMAIL SUBJECT LINES (5 options)
   For a welcome email to new subscribers/clients.
   Should create curiosity while being authentic to voice.

Make everything specific to their actual business. Avoid generic marketing speak.`
```

---

## Prompt Best Practices

When modifying these prompts:

1. **Be specific about format** - Tell the AI exactly how to structure output
2. **Provide context** - Include all relevant project data
3. **Set the persona** - "You are a senior brand strategist" focuses the response
4. **Ask for specificity** - "Be specific" and "avoid generic" are useful guardrails
5. **Include examples** - Good/bad examples clarify expectations
6. **Request honesty** - "Acknowledge where more information would help"
