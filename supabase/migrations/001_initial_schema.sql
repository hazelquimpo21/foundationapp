-- ============================================
-- 🚀 BUSINESS ONBOARDER - Database Schema
-- ============================================
-- This schema powers the AI business onboarding app
-- Run this in Supabase SQL Editor or via migrations
-- ============================================

-- --------------------------------------------
-- 🧹 Clean slate (for development only)
-- --------------------------------------------
-- Uncomment these lines if you need to reset:
-- DROP TABLE IF EXISTS generated_outputs CASCADE;
-- DROP TABLE IF EXISTS analyzer_runs CASCADE;
-- DROP TABLE IF EXISTS conversation_messages CASCADE;
-- DROP TABLE IF EXISTS onboarding_sessions CASCADE;
-- DROP TABLE IF EXISTS business_projects CASCADE;
-- DROP TABLE IF EXISTS members CASCADE;

-- --------------------------------------------
-- 👤 MEMBERS TABLE
-- --------------------------------------------
-- Stores user account information
-- Links to Supabase Auth via auth_id
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🔒 Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select_own" ON members
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "members_update_own" ON members
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "members_insert_own" ON members
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- 📝 Comment for documentation
COMMENT ON TABLE members IS '👤 User profiles linked to Supabase Auth';

-- --------------------------------------------
-- 💼 BUSINESS PROJECTS TABLE
-- --------------------------------------------
-- Core entity: one row per business idea
-- Contains all bucket fields + AI-generated fields
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS business_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,

  -- 📋 Project Meta
  project_name TEXT DEFAULT 'Untitled Project',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),

  -- ============================================
  -- 🎯 BUCKET 1: CORE IDEA (Weight 3 - Required)
  -- ============================================
  idea_name TEXT,                    -- "EduFlow", "MealPrep Pro"
  one_liner TEXT,                    -- Elevator pitch
  target_audience TEXT[],            -- Selected from word bank
  problem_statement TEXT,            -- What problem does this solve?
  problem_urgency INT CHECK (problem_urgency BETWEEN 1 AND 5),
  why_now TEXT,                      -- Why is this the right time?
  why_now_driver TEXT CHECK (why_now_driver IN (
    'technology', 'regulation', 'behavior', 'market', 'other'
  )),

  -- ============================================
  -- 💎 BUCKET 2: VALUE PROP (Weight 3 - Required)
  -- ============================================
  existing_solutions TEXT[],         -- What do people use today?
  differentiation_axis TEXT CHECK (differentiation_axis IN (
    'cheaper', 'better', 'different', 'faster', 'easier'
  )),
  differentiation_score INT CHECK (differentiation_score BETWEEN 1 AND 5),
  secret_sauce TEXT,                 -- What makes you unique?
  validation_status TEXT CHECK (validation_status IN (
    'idea', 'researched', 'talked_to_users', 'pre_revenue', 'revenue'
  )),

  -- ============================================
  -- 📊 BUCKET 3: MARKET REALITY (Weight 2 - Build)
  -- ============================================
  market_size_estimate TEXT CHECK (market_size_estimate IN (
    'tiny', 'small', 'medium', 'large', 'massive'
  )),
  competitors TEXT[],                -- Known competitors
  positioning TEXT,                  -- How you fit in the market

  -- ============================================
  -- 💰 BUCKET 4: BUSINESS MODEL (Weight 2 - Build)
  -- ============================================
  revenue_model TEXT[],              -- Subscription, Marketplace, etc.
  pricing_tier INT CHECK (pricing_tier BETWEEN 1 AND 5), -- 1=free, 5=enterprise
  customer_type TEXT CHECK (customer_type IN ('b2b', 'b2c', 'both')),
  sales_motion TEXT CHECK (sales_motion IN (
    'self_serve', 'sales_led', 'plg', 'marketplace', 'hybrid'
  )),

  -- ============================================
  -- 🏃 BUCKET 5: EXECUTION (Weight 1 - Enrichment)
  -- ============================================
  team_size TEXT CHECK (team_size IN (
    'solo', 'cofounders', 'small_team', 'growing', 'established'
  )),
  funding_status TEXT CHECK (funding_status IN (
    'bootstrapped', 'pre_seed', 'seed', 'series_a_plus', 'profitable'
  )),
  timeline_months INT,               -- Expected timeline in months
  biggest_risks TEXT[],              -- Selected from word bank

  -- ============================================
  -- 🌟 BUCKET 6: VISION (Weight 1 - Enrichment)
  -- ============================================
  north_star_metric TEXT,            -- The one metric that matters
  company_values TEXT[],             -- Core values
  exit_vision TEXT CHECK (exit_vision IN (
    'lifestyle', 'acquisition', 'ipo', 'nonprofit', 'unsure'
  )),

  -- ============================================
  -- 🤖 AI-GENERATED FIELDS
  -- ============================================
  -- These are populated by analyzers, not user input
  ai_clarity_score INT CHECK (ai_clarity_score BETWEEN 1 AND 100),
  ai_one_liner TEXT,
  ai_implied_assumptions TEXT[],
  ai_viability_score INT CHECK (ai_viability_score BETWEEN 1 AND 100),
  ai_summary TEXT,
  ai_next_steps TEXT[],
  ai_market_size TEXT,
  ai_competitors TEXT[],
  ai_suggested_model TEXT,
  ai_risks JSONB,
  ai_strengths TEXT[],
  ai_weaknesses TEXT[],

  -- ============================================
  -- 📈 PROGRESS TRACKING
  -- ============================================
  current_step TEXT DEFAULT 'welcome',
  bucket_completion JSONB DEFAULT '{
    "core_idea": 0,
    "value_prop": 0,
    "market": 0,
    "model": 0,
    "execution": 0,
    "vision": 0
  }',
  overall_completion INT DEFAULT 0,

  -- ⏰ Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 📇 Indexes for performance
CREATE INDEX idx_projects_member ON business_projects(member_id);
CREATE INDEX idx_projects_status ON business_projects(member_id, status);

-- 🔒 Row Level Security
ALTER TABLE business_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_all_own" ON business_projects
  FOR ALL USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

COMMENT ON TABLE business_projects IS '💼 Business ideas with all bucket data and AI fields';

-- --------------------------------------------
-- 💬 ONBOARDING SESSIONS TABLE
-- --------------------------------------------
-- Tracks chat sessions for each project
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES business_projects(id) ON DELETE CASCADE NOT NULL,

  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  current_bucket TEXT DEFAULT 'core_idea',

  -- Session metadata
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_project ON onboarding_sessions(project_id);

ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_via_project" ON onboarding_sessions
  FOR ALL USING (
    project_id IN (
      SELECT bp.id FROM business_projects bp
      JOIN members m ON bp.member_id = m.id
      WHERE m.auth_id = auth.uid()
    )
  );

COMMENT ON TABLE onboarding_sessions IS '💬 Chat sessions for onboarding flow';

-- --------------------------------------------
-- 📝 CONVERSATION MESSAGES TABLE
-- --------------------------------------------
-- Stores full chat history with typed messages
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES onboarding_sessions(id) ON DELETE CASCADE NOT NULL,

  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Message type for special interactions
  message_type TEXT DEFAULT 'text' CHECK (message_type IN (
    'text',              -- Regular text message
    'word_bank',         -- Word bank selection prompt
    'word_bank_response',-- User's word bank selections
    'slider',            -- Slider input prompt
    'slider_response',   -- User's slider value
    'binary_choice',     -- Yes/No or A/B choice
    'binary_response',   -- User's binary selection
    'inference_reveal',  -- AI suggestion to accept/reject
    'inference_confirm', -- User accepted/rejected inference
    'mad_lib',           -- Fill-in-the-blank prompt
    'mad_lib_response'   -- User's mad lib completion
  )),

  -- Metadata for typed messages
  metadata JSONB DEFAULT '{}',

  -- Which field(s) this message relates to
  related_fields TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON conversation_messages(session_id);
CREATE INDEX idx_messages_created ON conversation_messages(session_id, created_at);

ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_via_session" ON conversation_messages
  FOR ALL USING (
    session_id IN (
      SELECT os.id FROM onboarding_sessions os
      JOIN business_projects bp ON os.project_id = bp.id
      JOIN members m ON bp.member_id = m.id
      WHERE m.auth_id = auth.uid()
    )
  );

COMMENT ON TABLE conversation_messages IS '📝 Chat messages with typed interactions';

-- --------------------------------------------
-- ⚙️ ANALYZER RUNS TABLE
-- --------------------------------------------
-- Tracks AI analyzer jobs and their results
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS analyzer_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES business_projects(id) ON DELETE CASCADE NOT NULL,

  -- Analyzer info
  analyzer_type TEXT NOT NULL CHECK (analyzer_type IN (
    'clarity',    -- Idea clarity analysis
    'market',     -- Market research
    'model',      -- Business model suggestions
    'risk',       -- Risk identification
    'synthesis'   -- Full synthesis
  )),

  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'running', 'completed', 'failed'
  )),

  -- What triggered this run
  trigger_reason TEXT,

  -- Input/Output
  input_snapshot JSONB,              -- What was sent to analyzer
  raw_analysis TEXT,                 -- GPT's natural language response
  parsed_fields JSONB,               -- Structured output from function calling
  confidence_score FLOAT,

  -- Error handling
  error_message TEXT,
  retry_count INT DEFAULT 0,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_runs_project ON analyzer_runs(project_id);
CREATE INDEX idx_runs_status ON analyzer_runs(project_id, status);

ALTER TABLE analyzer_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "runs_via_project" ON analyzer_runs
  FOR SELECT USING (
    project_id IN (
      SELECT bp.id FROM business_projects bp
      JOIN members m ON bp.member_id = m.id
      WHERE m.auth_id = auth.uid()
    )
  );

COMMENT ON TABLE analyzer_runs IS '⚙️ AI analyzer job tracking';

-- Enable realtime for analyzer status updates
ALTER PUBLICATION supabase_realtime ADD TABLE analyzer_runs;

-- --------------------------------------------
-- 📦 GENERATED OUTPUTS TABLE
-- --------------------------------------------
-- Stores AI-generated content like pitch decks, summaries
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS generated_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES business_projects(id) ON DELETE CASCADE NOT NULL,
  analyzer_run_id UUID REFERENCES analyzer_runs(id) ON DELETE SET NULL,

  output_type TEXT NOT NULL CHECK (output_type IN (
    'pitch_summary',
    'one_pager',
    'risk_assessment',
    'competitor_analysis',
    'next_steps'
  )),

  output_data JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_outputs_project ON generated_outputs(project_id);

ALTER TABLE generated_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "outputs_via_project" ON generated_outputs
  FOR ALL USING (
    project_id IN (
      SELECT bp.id FROM business_projects bp
      JOIN members m ON bp.member_id = m.id
      WHERE m.auth_id = auth.uid()
    )
  );

COMMENT ON TABLE generated_outputs IS '📦 AI-generated deliverables';

-- --------------------------------------------
-- 🔄 UTILITY FUNCTIONS
-- --------------------------------------------

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables that need it
CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON business_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- --------------------------------------------
-- 🎉 SETUP COMPLETE
-- --------------------------------------------
-- Your database is ready!
--
-- Next steps:
-- 1. Enable Email Auth in Supabase Dashboard > Auth > Providers
-- 2. (Optional) Enable Google OAuth
-- 3. Set up your environment variables
-- --------------------------------------------
