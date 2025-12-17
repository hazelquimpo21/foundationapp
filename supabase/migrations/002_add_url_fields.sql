-- ============================================
-- 🔗 ADD URL FIELDS MIGRATION
-- ============================================
-- Adds proper website_url and linkedin_url fields
-- to the business_projects table.
-- 
-- Previously, URLs were stored in positioning/north_star_metric
-- which was incorrect. This migration adds the proper fields.
-- ============================================

-- Add website_url column
ALTER TABLE business_projects
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Add linkedin_url column  
ALTER TABLE business_projects
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN business_projects.website_url IS '🌐 Company/brand website URL';
COMMENT ON COLUMN business_projects.linkedin_url IS '💼 LinkedIn profile or company page URL';

-- ============================================
-- 🧹 OPTIONAL: Migrate existing data
-- ============================================
-- If you have existing data stored in the wrong fields,
-- uncomment and run this to migrate it:
-- 
-- UPDATE business_projects
-- SET website_url = positioning
-- WHERE positioning LIKE 'http%'
--   AND website_url IS NULL;
-- 
-- UPDATE business_projects
-- SET linkedin_url = north_star_metric
-- WHERE north_star_metric LIKE '%linkedin%'
--   AND linkedin_url IS NULL;
-- 
-- Then clear the old values:
-- UPDATE business_projects
-- SET positioning = NULL
-- WHERE positioning LIKE 'http%';
-- 
-- UPDATE business_projects
-- SET north_star_metric = NULL
-- WHERE north_star_metric LIKE '%linkedin%';
-- ============================================

