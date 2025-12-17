/**
 * 📝 WEB SCRAPER PROMPT BUILDER
 * =============================
 * Phase 1 prompt for the web scraper analyzer.
 *
 * This prompt asks GPT to analyze the scraped website content
 * and infer useful information about the business.
 *
 * The AI should:
 * - Identify the main tagline/value proposition
 * - List services or offerings mentioned
 * - Infer the industry/category
 * - Note anything interesting about the brand
 */

import type { ScrapedData } from '../types'

/**
 * Build the Phase 1 analysis prompt
 *
 * @param scrapedData - Data extracted from the website
 * @param existingProjectData - Any existing project data we know
 * @returns The formatted prompt string
 */
export function buildPhase1Prompt(
  scrapedData: ScrapedData,
  existingProjectData?: {
    projectName?: string
    ideaName?: string
    problemStatement?: string
  }
): string {
  // Build context about what we already know
  let existingContext = ''
  if (existingProjectData?.projectName || existingProjectData?.ideaName) {
    existingContext = `
We already know this about the project:
- Project/Business Name: ${existingProjectData.projectName || existingProjectData.ideaName || 'Unknown'}
${existingProjectData.problemStatement ? `- Problem they solve: ${existingProjectData.problemStatement}` : ''}
`
  }

  // Build the social links section if we found any
  let socialSection = ''
  const socialUrls = Object.entries(scrapedData.socialUrls)
  if (socialUrls.length > 0) {
    socialSection = `
Social Links Found:
${socialUrls.map(([platform, url]) => `- ${platform}: ${url}`).join('\n')}
`
  }

  return `You are a business analyst helping to understand a company based on their website.

Analyze the following website content and extract insights about this business.
${existingContext}
---

**Website URL:** ${scrapedData.url}
**Page Title:** ${scrapedData.title || 'Not found'}
**Meta Description:** ${scrapedData.description || 'Not found'}
${socialSection}
---

**Website Content:**
${scrapedData.content || 'No content could be extracted'}

---

Based on this website content, please provide:

1. **Main Tagline/Value Proposition**
   What is their primary headline or tagline? Look for the main message they want visitors to see.

2. **Services or Products**
   List the main services or products they offer. Be specific.

3. **Industry/Category**
   What industry or business category do they operate in?
   Examples: SaaS, E-commerce, Marketing Agency, Health & Wellness, Restaurant, Professional Services, etc.

4. **Target Customer**
   Who seems to be their target customer? B2B or B2C? What type of person/company?

5. **Brand Personality**
   What vibe does the website give off? Professional, playful, luxury, accessible, technical, etc.

6. **Key Observations**
   Any other interesting observations about this business based on their website.

Be specific and use actual text from the website where possible. If something isn't clear from the content, say so.`
}

/**
 * Build a minimal prompt for when scraping failed
 * In this case, we just work with the URL itself
 */
export function buildMinimalPrompt(url: string): string {
  return `We couldn't fully scrape this website, but based on the URL alone:

**URL:** ${url}

Please provide what you can infer from just the URL:

1. **Company/Brand Name** - What's the likely business name from the domain?
2. **Industry Guess** - What industry might this be based on the domain name?
3. **Notes** - Any other observations from the URL structure?

Keep your analysis brief since we have limited information.`
}
