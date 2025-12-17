/**
 * 🌐 WEB SCRAPER UTILITY
 * ======================
 * Fetches and extracts content from a website URL.
 *
 * This is a lightweight scraper that:
 * 1. Fetches the HTML from the URL
 * 2. Extracts text content (strips HTML tags)
 * 3. Finds social media links
 * 4. Extracts meta information
 *
 * For production, you might want to use a service like:
 * - Firecrawl (https://firecrawl.dev)
 * - Browserless
 * - Puppeteer/Playwright
 *
 * But for MVP, this simple approach works well!
 */

import { log } from '@/lib/utils/logger'
import type { ScrapedData, SocialUrls } from '../types'

// ============================================
// 📋 CONSTANTS
// ============================================

/** Maximum content length to extract (chars) */
const MAX_CONTENT_LENGTH = 10000

/** Request timeout in ms */
const FETCH_TIMEOUT = 15000

/** User agent to use for requests */
const USER_AGENT = 'Mozilla/5.0 (compatible; FoundationBot/1.0; +https://foundation.app)'

// ============================================
// 🔗 SOCIAL MEDIA PATTERNS
// ============================================

/**
 * Regex patterns to find social media URLs
 */
const SOCIAL_PATTERNS: Record<string, RegExp> = {
  instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)\/?/gi,
  twitter: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/?/gi,
  linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:company|in)\/([a-zA-Z0-9_-]+)\/?/gi,
  facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([a-zA-Z0-9._-]+)\/?/gi,
  tiktok: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([a-zA-Z0-9._]+)\/?/gi,
  youtube: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:@|channel\/|user\/)?([a-zA-Z0-9_-]+)\/?/gi,
}

// ============================================
// 🛠️ HELPER FUNCTIONS
// ============================================

/**
 * Normalize a URL to ensure it has a protocol
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim()

  // Add https if no protocol
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = `https://${normalized}`
  }

  return normalized
}

/**
 * Extract text content from HTML
 * Strips tags and cleans up whitespace
 */
function extractTextFromHtml(html: string): string {
  // Remove script and style tags with their content
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ')

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  // Clean up whitespace
  text = text
    .replace(/\s+/g, ' ')
    .trim()

  return text
}

/**
 * Extract title from HTML
 */
function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    return titleMatch[1].trim()
  }
  return null
}

/**
 * Extract meta description from HTML
 */
function extractDescription(html: string): string | null {
  // Try standard meta description
  const descMatch = html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
  )
  if (descMatch) {
    return descMatch[1].trim()
  }

  // Try Open Graph description
  const ogMatch = html.match(
    /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i
  )
  if (ogMatch) {
    return ogMatch[1].trim()
  }

  return null
}

/**
 * Find social media URLs in content
 */
function findSocialUrls(html: string): SocialUrls {
  const socialUrls: SocialUrls = {}

  for (const [platform, pattern] of Object.entries(SOCIAL_PATTERNS)) {
    // Convert iterator to array for compatibility
    const matches = Array.from(html.matchAll(pattern))
    for (const match of matches) {
      // Skip common false positives
      if (match[1] === 'share' || match[1] === 'sharer' || match[1] === 'intent') {
        continue
      }

      // Store the full URL, not just the handle
      const fullMatch = match[0]
      if (!socialUrls[platform]) {
        // Ensure it's a full URL
        if (!fullMatch.startsWith('http')) {
          socialUrls[platform] = `https://${fullMatch}`
        } else {
          socialUrls[platform] = fullMatch
        }
        log.debug(`🔗 Found ${platform}:`, { url: socialUrls[platform] })
      }
    }
  }

  return socialUrls
}

/**
 * Extract social handle from URL
 */
export function extractHandle(url: string, platform: string): string | null {
  const pattern = SOCIAL_PATTERNS[platform]
  if (!pattern) return null

  // Reset the regex (since it's global)
  pattern.lastIndex = 0
  const match = pattern.exec(url)

  if (match && match[1]) {
    return match[1]
  }
  return null
}

// ============================================
// 🌐 MAIN SCRAPER FUNCTION
// ============================================

/**
 * Scrape a website and extract relevant data
 *
 * @param url - The URL to scrape
 * @returns ScrapedData object with extracted content
 */
export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  log.info('🌐 Starting website scrape...', { url })

  const normalizedUrl = normalizeUrl(url)

  try {
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

    // Fetch the page
    log.debug('🌐 Fetching URL...', { url: normalizedUrl })
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    // Get HTML content
    const html = await response.text()
    log.debug('🌐 Received HTML', { length: html.length })

    // Extract data
    const title = extractTitle(html)
    const description = extractDescription(html)
    const textContent = extractTextFromHtml(html)
    const socialUrls = findSocialUrls(html)

    // Truncate content if too long
    const truncatedContent = textContent.length > MAX_CONTENT_LENGTH
      ? textContent.slice(0, MAX_CONTENT_LENGTH) + '...'
      : textContent

    const result: ScrapedData = {
      url: normalizedUrl,
      title,
      description,
      content: truncatedContent,
      socialUrls,
      success: true,
    }

    log.success('🌐 Website scraped successfully', {
      title,
      contentLength: truncatedContent.length,
      socialsFound: Object.keys(socialUrls).length,
    })

    return result

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    log.error('🌐 Failed to scrape website', error, { url: normalizedUrl })

    return {
      url: normalizedUrl,
      title: null,
      description: null,
      content: '',
      socialUrls: {},
      success: false,
      error: message,
    }
  }
}
