-- ============================================
-- 🌐 WEB SCRAPER ANALYZER MIGRATION
-- ============================================
-- Adds support for the web scraper analyzer:
-- 1. Extends analyzer_type enum with 'web_scraper'
-- 2. Adds scraped data fields to business_projects
-- 3. Adds social_urls JSONB for flexible social storage
-- ============================================

-- --------------------------------------------
-- 1️⃣ EXTEND ANALYZER_TYPE ENUM
-- --------------------------------------------
-- Drop and recreate the check constraint to add 'web_scraper'
-- This is the safe way to modify CHECK constraints in Postgres

ALTER TABLE analyzer_runs
DROP CONSTRAINT IF EXISTS analyzer_runs_analyzer_type_check;

ALTER TABLE analyzer_runs
ADD CONSTRAINT analyzer_runs_analyzer_type_check
CHECK (analyzer_type IN (
  'clarity',       -- Idea clarity analysis
  'market',        -- Market research
  'model',         -- Business model suggestions
  'risk',          -- Risk identification
  'synthesis',     -- Full synthesis
  'web_scraper',   -- 🆕 Website scraping & social discovery
  'narrative',     -- 🆕 Brand narrative analysis (future)
  'voice'          -- 🆕 Brand voice analysis (future)
));

-- --------------------------------------------
-- 2️⃣ ADD SCRAPED DATA FIELDS
-- --------------------------------------------
-- These fields store data extracted from the user's website

-- Social URLs as JSONB (flexible structure)
ALTER TABLE business_projects
ADD COLUMN IF NOT EXISTS social_urls JSONB DEFAULT '{}';
COMMENT ON COLUMN business_projects.social_urls IS '🔗 Scraped social media URLs {instagram, twitter, linkedin, facebook, tiktok, youtube}';

-- Scraped tagline/headline from website
ALTER TABLE business_projects
ADD COLUMN IF NOT EXISTS scraped_tagline TEXT;
COMMENT ON COLUMN business_projects.scraped_tagline IS '📝 Main headline/tagline scraped from website';

-- Scraped services/offerings
ALTER TABLE business_projects
ADD COLUMN IF NOT EXISTS scraped_services TEXT[];
COMMENT ON COLUMN business_projects.scraped_services IS '📋 Services/offerings found on website';

-- Industry guess from scraper
ALTER TABLE business_projects
ADD COLUMN IF NOT EXISTS scraped_industry TEXT;
COMMENT ON COLUMN business_projects.scraped_industry IS '🏢 Industry inferred from website content';

-- Raw scraped content (for debugging/reprocessing)
ALTER TABLE business_projects
ADD COLUMN IF NOT EXISTS scraped_content TEXT;
COMMENT ON COLUMN business_projects.scraped_content IS '📄 Raw text content scraped from website (truncated)';

-- Scrape metadata
ALTER TABLE business_projects
ADD COLUMN IF NOT EXISTS scrape_confidence FLOAT;
COMMENT ON COLUMN business_projects.scrape_confidence IS '📊 Confidence score for scraped data (0-1)';

ALTER TABLE business_projects
ADD COLUMN IF NOT EXISTS scraped_at TIMESTAMPTZ;
COMMENT ON COLUMN business_projects.scraped_at IS '⏰ When the website was last scraped';

-- --------------------------------------------
-- 3️⃣ ADD INDIVIDUAL SOCIAL HANDLE FIELDS
-- --------------------------------------------
-- For easier querying and display, also store handles directly

ALTER TABLE business_projects
ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
COMMENT ON COLUMN business_projects.instagram_handle IS '📸 Instagram username (without @)';

ALTER TABLE business_projects
ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
COMMENT ON COLUMN business_projects.twitter_handle IS '🐦 Twitter/X username (without @)';

ALTER TABLE business_projects
ADD COLUMN IF NOT EXISTS facebook_url TEXT;
COMMENT ON COLUMN business_projects.facebook_url IS '📘 Facebook page URL';

ALTER TABLE business_projects
ADD COLUMN IF NOT EXISTS tiktok_handle TEXT;
COMMENT ON COLUMN business_projects.tiktok_handle IS '🎵 TikTok username (without @)';

ALTER TABLE business_projects
ADD COLUMN IF NOT EXISTS youtube_url TEXT;
COMMENT ON COLUMN business_projects.youtube_url IS '📺 YouTube channel URL';

-- --------------------------------------------
-- 4️⃣ CREATE INDEX FOR FASTER LOOKUPS
-- --------------------------------------------
-- Index on website_url for finding projects to scrape
CREATE INDEX IF NOT EXISTS idx_projects_website_url
ON business_projects(website_url)
WHERE website_url IS NOT NULL;

-- --------------------------------------------
-- 🎉 MIGRATION COMPLETE
-- --------------------------------------------
-- Next steps:
-- 1. Deploy the web scraper analyzer API
-- 2. Update types in the frontend
-- 3. Connect assets page to trigger scraper
-- --------------------------------------------
