/**
 * 📊 WEB SCRAPER SCHEMA
 * =====================
 * Phase 2 parsing schema for the web scraper analyzer.
 *
 * This defines the structured output we want from GPT's function calling.
 * GPT takes the Phase 1 analysis and extracts specific fields.
 */

import type { WebScraperParsedOutput } from '../types'

/**
 * OpenAI function calling schema for Phase 2 parsing
 */
export const PHASE2_SCHEMA = {
  type: 'function' as const,
  function: {
    name: 'save_website_analysis',
    description: 'Save the structured analysis of a website',
    parameters: {
      type: 'object',
      properties: {
        tagline: {
          type: 'string',
          description: 'The main tagline or value proposition from the website. Extract the exact text if possible.',
        },
        services: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of services or products offered, as mentioned on the site',
        },
        industry: {
          type: 'string',
          description: 'The business industry or category (e.g., SaaS, Marketing Agency, E-commerce, Restaurant)',
        },
        targetCustomer: {
          type: 'string',
          description: 'Description of the target customer (B2B/B2C, demographics, etc.)',
        },
        brandPersonality: {
          type: 'string',
          description: 'Brand personality traits observed (professional, playful, luxury, etc.)',
        },
        confidence: {
          type: 'number',
          description: 'Confidence level in the analysis from 0 to 1 (1 = very confident)',
        },
      },
      required: ['tagline', 'services', 'industry', 'confidence'],
    },
  },
}

/**
 * Type for the raw parsed output from GPT
 */
export interface RawParsedOutput {
  tagline?: string
  services?: string[]
  industry?: string
  targetCustomer?: string
  brandPersonality?: string
  confidence?: number
}

/**
 * Transform the raw GPT output plus scraped social data
 * into our final WebScraperParsedOutput format
 */
export function transformParsedOutput(
  rawOutput: RawParsedOutput,
  socialUrls: Record<string, string | undefined>
): WebScraperParsedOutput {
  // Extract handles from URLs
  const extractHandle = (url: string | undefined, platform: string): string | null => {
    if (!url) return null

    // Platform-specific extraction patterns
    const patterns: Record<string, RegExp> = {
      instagram: /instagram\.com\/([a-zA-Z0-9_.]+)/i,
      twitter: /(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i,
      tiktok: /tiktok\.com\/@([a-zA-Z0-9._]+)/i,
      youtube: /youtube\.com\/(?:@|channel\/|user\/)?([a-zA-Z0-9_-]+)/i,
      linkedin: /linkedin\.com\/(?:company|in)\/([a-zA-Z0-9_-]+)/i,
    }

    const pattern = patterns[platform]
    if (!pattern) return null

    const match = url.match(pattern)
    return match ? match[1] : null
  }

  return {
    tagline: rawOutput.tagline || null,
    services: rawOutput.services || [],
    industry: rawOutput.industry || null,
    socialUrls: {
      instagram: socialUrls.instagram,
      twitter: socialUrls.twitter,
      linkedin: socialUrls.linkedin,
      facebook: socialUrls.facebook,
      tiktok: socialUrls.tiktok,
      youtube: socialUrls.youtube,
    },
    instagramHandle: extractHandle(socialUrls.instagram, 'instagram'),
    twitterHandle: extractHandle(socialUrls.twitter, 'twitter'),
    facebookUrl: socialUrls.facebook || null,
    tiktokHandle: extractHandle(socialUrls.tiktok, 'tiktok'),
    youtubeUrl: socialUrls.youtube || null,
    linkedinUrl: socialUrls.linkedin || null,
    confidence: rawOutput.confidence ?? 0.5,
  }
}

/**
 * Fields to update in the business_projects table
 */
export function getFieldsToUpdate(
  parsed: WebScraperParsedOutput,
  rawContent: string
): Record<string, unknown> {
  return {
    // Scraped content fields
    scraped_tagline: parsed.tagline,
    scraped_services: parsed.services,
    scraped_industry: parsed.industry,
    scraped_content: rawContent.slice(0, 5000), // Truncate for storage
    scrape_confidence: parsed.confidence,
    scraped_at: new Date().toISOString(),

    // Social URLs as JSONB
    social_urls: parsed.socialUrls,

    // Individual social handles
    instagram_handle: parsed.instagramHandle,
    twitter_handle: parsed.twitterHandle,
    facebook_url: parsed.facebookUrl,
    tiktok_handle: parsed.tiktokHandle,
    youtube_url: parsed.youtubeUrl,
    // Note: linkedin_url already exists, only update if we found one and it's different
    ...(parsed.linkedinUrl && { linkedin_url: parsed.linkedinUrl }),
  }
}
