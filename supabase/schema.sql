-- ============================================
-- 🗄️ Business Onboarder - Database Schema
-- ============================================
-- Run this in Supabase Dashboard > SQL Editor
--
-- This creates all tables for the brand foundation
-- onboarding system with proper relationships and RLS.
-- ============================================

-- ============================================
-- 📋 TABLE: users
-- Basic user account info
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'::jsonb
  -- preferences structure:
  -- {
  --   "pace": "thorough" | "fast",
  --   "theme": "light" | "dark"
  -- }
);

COMMENT ON TABLE users IS '👤 User accounts - kept minimal, profile data lives in foundation';

-- ============================================
-- 🏢 TABLE: businesses
-- One user can have multiple businesses
-- ============================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Business',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb
);

COMMENT ON TABLE businesses IS '🏢 Business profiles - each has one brand foundation';

-- ============================================
-- 💬 TABLE: onboarding_sessions
-- Conversation sessions for building foundation
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  current_focus_bucket TEXT,
  conversation_summary TEXT,
  session_metadata JSONB DEFAULT '{}'::jsonb
  -- session_metadata structure:
  -- {
  --   "message_count": number,
  --   "interaction_count": number,
  --   "avg_response_length": number
  -- }
);

COMMENT ON TABLE onboarding_sessions IS '💬 Conversation sessions - tracks progress through onboarding';

-- ============================================
-- 📝 TABLE: conversation_messages
-- Full chat history - never deleted
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN (
    'text',
    'word_bank_response',
    'slider_response',
    'binary_choice',
    'inference_confirm',
    'inference_reject',
    'inference_edit'
  )),
  interaction_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  buckets_touched TEXT[] DEFAULT '{}'::text[]
);

COMMENT ON TABLE conversation_messages IS '📝 Chat history - full audit trail for re-analysis';

-- ============================================
-- 📦 TABLE: field_buckets
-- Registry of bucket categories
-- ============================================
CREATE TABLE IF NOT EXISTS field_buckets (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL,
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 4),
  is_required BOOLEAN DEFAULT true,
  min_completion_percent INTEGER DEFAULT 50,
  icon TEXT DEFAULT '📦'
);

COMMENT ON TABLE field_buckets IS '📦 Bucket definitions - categories for organizing fields';

-- ============================================
-- 📋 TABLE: field_definitions
-- Registry of all foundation fields
-- ============================================
CREATE TABLE IF NOT EXISTS field_definitions (
  id TEXT PRIMARY KEY,
  bucket_id TEXT NOT NULL REFERENCES field_buckets(id),
  display_name TEXT NOT NULL,
  description TEXT,
  field_type TEXT NOT NULL CHECK (field_type IN (
    'short_text',
    'long_text',
    'tags',
    'scale',
    'json'
  )),
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL,
  validation_rules JSONB,
  parser_hints JSONB,
  example_value TEXT
);

COMMENT ON TABLE field_definitions IS '📋 Field definitions - schema for all foundation fields';

-- ============================================
-- ✨ TABLE: foundation_fields
-- Actual field values for each business
-- ============================================
CREATE TABLE IF NOT EXISTS foundation_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  field_id TEXT NOT NULL REFERENCES field_definitions(id),
  value TEXT,
  value_json JSONB,
  confidence TEXT DEFAULT 'none' CHECK (confidence IN ('none', 'low', 'medium', 'high')),
  source_type TEXT CHECK (source_type IN (
    'direct_input',
    'inferred',
    'confirmed_inference',
    'edited'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  source_message_ids UUID[] DEFAULT '{}'::uuid[],
  UNIQUE(business_id, field_id)
);

COMMENT ON TABLE foundation_fields IS '✨ Foundation values - the actual brand data we collect';

-- ============================================
-- 🔬 TABLE: analysis_jobs
-- Queue for AI analyzer runs
-- ============================================
CREATE TABLE IF NOT EXISTS analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
  analyzer_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  input_message_ids UUID[] NOT NULL,
  input_context JSONB,
  output_analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

COMMENT ON TABLE analysis_jobs IS '🔬 Analysis queue - AI inference jobs waiting to run';

-- ============================================
-- 🎯 TABLE: parsing_jobs
-- Queue for structured extraction from analysis
-- ============================================
CREATE TABLE IF NOT EXISTS parsing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_job_id UUID NOT NULL REFERENCES analysis_jobs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  output_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  fields_updated TEXT[] DEFAULT '{}'::text[],
  error_message TEXT
);

COMMENT ON TABLE parsing_jobs IS '🎯 Parsing queue - extracts structured fields from analysis prose';

-- ============================================
-- 💡 TABLE: inference_reveals
-- Insights to show user for confirmation
-- ============================================
CREATE TABLE IF NOT EXISTS inference_reveals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
  field_id TEXT NOT NULL REFERENCES field_definitions(id),
  inferred_value TEXT NOT NULL,
  display_text TEXT NOT NULL,
  confidence TEXT NOT NULL,
  source_analysis_id UUID REFERENCES analysis_jobs(id),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'shown',
    'confirmed',
    'rejected',
    'edited'
  )),
  user_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

COMMENT ON TABLE inference_reveals IS '💡 Inference reveals - insights waiting for user confirmation';

-- ============================================
-- 📄 TABLE: generated_outputs
-- Generated content (one-liners, briefs, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS generated_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  output_type TEXT NOT NULL CHECK (output_type IN (
    'one_liner',
    'benefit_statement',
    'positioning_statement',
    'brand_brief',
    'messaging_framework'
  )),
  content JSONB NOT NULL,
  source_field_ids TEXT[] DEFAULT '{}'::text[],
  source_field_snapshot JSONB,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  regenerated_from UUID REFERENCES generated_outputs(id)
);

COMMENT ON TABLE generated_outputs IS '📄 Generated outputs - the deliverables users take away';

-- ============================================
-- 📊 INDEXES for Performance
-- ============================================

-- Session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_business ON onboarding_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON onboarding_sessions(status) WHERE status = 'active';

-- Message retrieval (critical for chat performance)
CREATE INDEX IF NOT EXISTS idx_messages_session ON conversation_messages(session_id, sequence);
CREATE INDEX IF NOT EXISTS idx_messages_session_created ON conversation_messages(session_id, created_at);

-- Field lookups
CREATE INDEX IF NOT EXISTS idx_fields_business ON foundation_fields(business_id);
CREATE INDEX IF NOT EXISTS idx_fields_lookup ON foundation_fields(business_id, field_id);

-- Analysis queue processing
CREATE INDEX IF NOT EXISTS idx_analysis_pending ON analysis_jobs(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_analysis_session ON analysis_jobs(session_id);

-- Parsing queue
CREATE INDEX IF NOT EXISTS idx_parsing_pending ON parsing_jobs(status) WHERE status = 'pending';

-- Inference reveals
CREATE INDEX IF NOT EXISTS idx_reveals_session ON inference_reveals(session_id, status);
CREATE INDEX IF NOT EXISTS idx_reveals_pending ON inference_reveals(session_id) WHERE status = 'pending';

-- Generated outputs
CREATE INDEX IF NOT EXISTS idx_outputs_business ON generated_outputs(business_id);

-- ============================================
-- 🔐 ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all user-data tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE foundation_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE parsing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inference_reveals ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_outputs ENABLE ROW LEVEL SECURITY;

-- Users can only see themselves
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Businesses: users own their businesses
CREATE POLICY "Users own their businesses" ON businesses
  FOR ALL USING (user_id = auth.uid());

-- Sessions: accessible if user owns the business
CREATE POLICY "Users own their sessions" ON onboarding_sessions
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

-- Messages: accessible via session ownership
CREATE POLICY "Users own their messages" ON conversation_messages
  FOR ALL USING (
    session_id IN (
      SELECT os.id FROM onboarding_sessions os
      JOIN businesses b ON os.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

-- Foundation fields: via business ownership
CREATE POLICY "Users own their foundation fields" ON foundation_fields
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

-- Analysis jobs: via session ownership
CREATE POLICY "Users own their analysis jobs" ON analysis_jobs
  FOR ALL USING (
    session_id IN (
      SELECT os.id FROM onboarding_sessions os
      JOIN businesses b ON os.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

-- Parsing jobs: via analysis job ownership
CREATE POLICY "Users own their parsing jobs" ON parsing_jobs
  FOR ALL USING (
    analysis_job_id IN (
      SELECT aj.id FROM analysis_jobs aj
      JOIN onboarding_sessions os ON aj.session_id = os.id
      JOIN businesses b ON os.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

-- Inference reveals: via session ownership
CREATE POLICY "Users own their inference reveals" ON inference_reveals
  FOR ALL USING (
    session_id IN (
      SELECT os.id FROM onboarding_sessions os
      JOIN businesses b ON os.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

-- Generated outputs: via business ownership
CREATE POLICY "Users own their generated outputs" ON generated_outputs
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

-- Field definitions are public (read-only schema data)
-- No RLS needed - anyone can read schema

-- ============================================
-- 🔄 TRIGGERS for updated_at
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foundation_fields_updated_at
  BEFORE UPDATE ON foundation_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ✅ Schema complete!
-- ============================================
-- Next step: Run the seed data script to populate
-- buckets and field definitions.
-- ============================================
