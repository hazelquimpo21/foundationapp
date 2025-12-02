-- ============================================
-- 🌱 Business Onboarder - Seed Data
-- ============================================
-- Run this AFTER schema.sql
-- Populates buckets and field definitions
-- ============================================

-- ============================================
-- 📦 BUCKETS
-- ============================================

INSERT INTO field_buckets (id, display_name, description, display_order, tier, is_required, min_completion_percent, icon) VALUES
  ('basics', 'The Basics', 'Factual information about your business', 1, 1, true, 50, '🏢'),
  ('customers', 'Your Customers', 'Who you serve and what they need', 2, 1, true, 50, '👥'),
  ('values', 'Values & Beliefs', 'What you stand for', 3, 2, true, 40, '💎'),
  ('voice', 'Brand Voice', 'How you sound and show up', 4, 2, true, 40, '🎤'),
  ('positioning', 'Positioning', 'What makes you different', 5, 2, true, 40, '🎯'),
  ('vision', 'Vision', 'Where you are headed', 6, 3, false, 30, '🔮')
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;

-- ============================================
-- 📋 FIELD DEFINITIONS
-- ============================================

-- ----------------------------------------
-- 🏢 BASICS BUCKET (8 fields)
-- ----------------------------------------

INSERT INTO field_definitions (id, bucket_id, display_name, description, field_type, is_required, display_order, example_value, parser_hints) VALUES
  (
    'business_name',
    'basics',
    'Business Name',
    'The name of your business',
    'short_text',
    true,
    1,
    'Foundation Studio',
    '{"extract_as": "direct", "look_for": "business name, company name"}'::jsonb
  ),
  (
    'business_stage',
    'basics',
    'Business Stage',
    'Where you are in your journey',
    'tags',
    true,
    2,
    'launched',
    '{"options": ["idea", "pre-launch", "launched", "growing", "established", "pivoting"]}'::jsonb
  ),
  (
    'industry',
    'basics',
    'Industry',
    'What space you operate in',
    'tags',
    true,
    3,
    '["SaaS", "Marketing"]',
    '{"extract_as": "array", "look_for": "industry, sector, category"}'::jsonb
  ),
  (
    'business_model',
    'basics',
    'Business Model',
    'How you make money',
    'tags',
    false,
    4,
    'saas',
    '{"options": ["product", "service", "saas", "marketplace", "agency", "consulting", "content", "hybrid"]}'::jsonb
  ),
  (
    'founder_background',
    'basics',
    'Founder Background',
    'Your relevant experience and why you started this',
    'long_text',
    false,
    5,
    '10 years in marketing, frustrated by the blank-page problem',
    '{"look_for": "career history, expertise, origin story, frustrations"}'::jsonb
  ),
  (
    'location',
    'basics',
    'Location',
    'Where you operate from',
    'short_text',
    false,
    6,
    'San Francisco, CA',
    '{"extract_as": "direct"}'::jsonb
  ),
  (
    'year_founded',
    'basics',
    'Year Founded',
    'When you started',
    'short_text',
    false,
    7,
    '2024',
    '{"extract_as": "direct", "look_for": "year, started, founded"}'::jsonb
  ),
  (
    'team_size',
    'basics',
    'Team Size',
    'How many people work with you',
    'short_text',
    false,
    8,
    'solo',
    '{"options": ["solo", "2-5", "6-20", "21-50", "50+"]}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;

-- ----------------------------------------
-- 👥 CUSTOMERS BUCKET (9 fields)
-- ----------------------------------------

INSERT INTO field_definitions (id, bucket_id, display_name, description, field_type, is_required, display_order, example_value, parser_hints) VALUES
  (
    'customer_who_demographic',
    'customers',
    'Customer Demographics',
    'Who they are (age, job, life stage)',
    'long_text',
    true,
    1,
    'Freelancers and solopreneurs, 28-45, typically in creative fields',
    '{"look_for": "age, profession, job title, life stage, demographics"}'::jsonb
  ),
  (
    'customer_who_psychographic',
    'customers',
    'Customer Mindset',
    'How they think and what they believe',
    'long_text',
    true,
    2,
    'Ambitious but overwhelmed. Value autonomy. Skeptical of guru marketing.',
    '{"look_for": "beliefs, attitudes, mindset, values, personality"}'::jsonb
  ),
  (
    'customer_pain_surface',
    'customers',
    'Stated Problem',
    'The problem they would articulate',
    'long_text',
    true,
    3,
    'I dont have time to figure out my brand messaging',
    '{"look_for": "practical complaints, stated problems, explicit pain"}'::jsonb
  ),
  (
    'customer_pain_deep',
    'customers',
    'Underlying Pain',
    'The emotional pain underneath',
    'long_text',
    false,
    4,
    'Feeling like a fraud without polished branding',
    '{"look_for": "fears, emotions, identity concerns, deeper pain"}'::jsonb
  ),
  (
    'customer_desire_stated',
    'customers',
    'What They Say They Want',
    'The explicit goal or outcome',
    'long_text',
    true,
    5,
    'A clear brand guide and messaging framework',
    '{"look_for": "goals, desired outcomes, what they ask for"}'::jsonb
  ),
  (
    'customer_desire_true',
    'customers',
    'What They Actually Want',
    'The deeper desire (status, feeling, identity)',
    'long_text',
    false,
    6,
    'To feel confident and credible talking about their business',
    '{"look_for": "status, emotion, identity, how they want to feel"}'::jsonb
  ),
  (
    'customer_journey_awareness',
    'customers',
    'Trigger Moments',
    'When they realize they need this',
    'long_text',
    false,
    7,
    'When asked "what do you do?" and they stumble',
    '{"look_for": "trigger events, realization moments, awareness"}'::jsonb
  ),
  (
    'customer_journey_consideration',
    'customers',
    'How They Decide',
    'What they compare and what matters',
    'long_text',
    false,
    8,
    'Look for templates first, then consultants. Price sensitive.',
    '{"look_for": "decision factors, comparison, evaluation"}'::jsonb
  ),
  (
    'customer_alternatives',
    'customers',
    'Current Alternatives',
    'What they do instead of using you',
    'long_text',
    false,
    9,
    'DIY with Canva, hire agency, avoid the problem',
    '{"look_for": "alternatives, competition, status quo"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;

-- ----------------------------------------
-- 💎 VALUES BUCKET (4 fields)
-- ----------------------------------------

INSERT INTO field_definitions (id, bucket_id, display_name, description, field_type, is_required, display_order, example_value, parser_hints) VALUES
  (
    'values_core',
    'values',
    'Core Values',
    'The non-negotiable principles (3-7)',
    'tags',
    true,
    1,
    '["Authenticity", "Accessibility", "Craft", "Empowerment"]',
    '{"extract_as": "array", "count": "3-7", "look_for": "repeated themes, emphasis"}'::jsonb
  ),
  (
    'values_beliefs',
    'values',
    'Core Beliefs',
    'Fundamental beliefs about your industry',
    'long_text',
    false,
    2,
    'Every business has a unique story worth telling. AI should augment creativity, not replace it.',
    '{"look_for": "I believe, we think, industry should"}'::jsonb
  ),
  (
    'values_stands_against',
    'values',
    'What We Stand Against',
    'What you oppose or reject',
    'long_text',
    false,
    3,
    'Generic templates. Hustle culture marketing.',
    '{"look_for": "frustration, criticism, rejection, anti-values"}'::jsonb
  ),
  (
    'values_aspirational',
    'values',
    'Aspirational Values',
    'Values you are working toward',
    'tags',
    false,
    4,
    '["Thought leadership", "Community"]',
    '{"extract_as": "array", "look_for": "goals, aspirations, future values"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;

-- ----------------------------------------
-- 🎤 VOICE BUCKET (7 fields)
-- ----------------------------------------

INSERT INTO field_definitions (id, bucket_id, display_name, description, field_type, is_required, display_order, example_value, parser_hints) VALUES
  (
    'personality_tags',
    'voice',
    'Brand Personality',
    'Adjectives that describe your brand',
    'tags',
    true,
    1,
    '["Warm", "Expert", "Playful", "Direct"]',
    '{"extract_as": "array", "count": "4-6"}'::jsonb
  ),
  (
    'voice_spectrum_formal',
    'voice',
    'Formality Level',
    '1=casual, 10=formal',
    'scale',
    false,
    2,
    '4',
    '{"min": 1, "max": 10}'::jsonb
  ),
  (
    'voice_spectrum_playful',
    'voice',
    'Playfulness Level',
    '1=serious, 10=playful',
    'scale',
    false,
    3,
    '7',
    '{"min": 1, "max": 10}'::jsonb
  ),
  (
    'voice_spectrum_bold',
    'voice',
    'Boldness Level',
    '1=understated, 10=bold',
    'scale',
    false,
    4,
    '6',
    '{"min": 1, "max": 10}'::jsonb
  ),
  (
    'voice_spectrum_technical',
    'voice',
    'Technical Level',
    '1=accessible, 10=expert',
    'scale',
    false,
    5,
    '3',
    '{"min": 1, "max": 10}'::jsonb
  ),
  (
    'tone_situations',
    'voice',
    'Tone by Situation',
    'How tone shifts in different contexts',
    'json',
    false,
    6,
    '{"marketing": "enthusiastic", "support": "empathetic", "error": "calm"}',
    '{"structure": "object with situation keys"}'::jsonb
  ),
  (
    'voice_donts',
    'voice',
    'Voice Don''ts',
    'What your brand should never sound like',
    'long_text',
    false,
    7,
    'Never condescending. Never use unexplained jargon. No guru-speak.',
    '{"look_for": "never, dont, avoid, hate"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;

-- ----------------------------------------
-- 🎯 POSITIONING BUCKET (5 fields)
-- ----------------------------------------

INSERT INTO field_definitions (id, bucket_id, display_name, description, field_type, is_required, display_order, example_value, parser_hints) VALUES
  (
    'differentiator_primary',
    'positioning',
    'Primary Differentiator',
    'The main thing that makes you different',
    'long_text',
    true,
    1,
    'Conversational AI that infers your brand from dialogue—no forms, no blank pages',
    '{"look_for": "unique, different, only, unlike others"}'::jsonb
  ),
  (
    'differentiator_secondary',
    'positioning',
    'Secondary Differentiators',
    'Other meaningful differences',
    'json',
    false,
    2,
    '["Built by marketers who felt the pain", "Integrates with existing tools"]',
    '{"extract_as": "array"}'::jsonb
  ),
  (
    'positioning_statement',
    'positioning',
    'Positioning Statement',
    'Formal positioning: For [target] who [need], [brand] is the [category] that [benefit]',
    'long_text',
    false,
    3,
    'For founders who struggle to articulate their brand, Foundation is the AI onboarder that builds your brand foundation through conversation.',
    '{"template": "For [target] who [need], [brand] is the [category] that [benefit]"}'::jsonb
  ),
  (
    'competitive_landscape',
    'positioning',
    'Competitive Context',
    'Who else serves this need, how you differ',
    'long_text',
    false,
    4,
    'Alternatives: StoryBrand (expensive framework), Canva (DIY, generic), Agencies (costly, slow)',
    '{"look_for": "competitors, alternatives, comparison"}'::jsonb
  ),
  (
    'category_owned',
    'positioning',
    'Category to Own',
    'The space you want to define',
    'short_text',
    false,
    5,
    'Conversational brand onboarding',
    '{"look_for": "category, space, known as"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;

-- ----------------------------------------
-- 🔮 VISION BUCKET (4 fields)
-- ----------------------------------------

INSERT INTO field_definitions (id, bucket_id, display_name, description, field_type, is_required, display_order, example_value, parser_hints) VALUES
  (
    'mission_statement',
    'vision',
    'Mission Statement',
    'What you do and why it matters',
    'long_text',
    false,
    1,
    'We help founders find their voice so they can share their vision with the world.',
    '{"look_for": "mission, purpose, why we exist"}'::jsonb
  ),
  (
    'vision_statement',
    'vision',
    'Vision Statement',
    'The future state you are working toward',
    'long_text',
    false,
    2,
    'A world where every business can articulate its value as clearly as the big brands.',
    '{"look_for": "vision, future, world where, success looks like"}'::jsonb
  ),
  (
    'impact_statement',
    'vision',
    'Impact Statement',
    'The change you create in the world',
    'long_text',
    false,
    3,
    'Democratizing brand strategy so quality messaging isnt just for those who can afford agencies.',
    '{"look_for": "impact, change, difference we make"}'::jsonb
  ),
  (
    'growth_goals',
    'vision',
    'Growth Goals',
    'Concrete goals for the near future',
    'json',
    false,
    4,
    '{"6_month": "Launch MVP", "1_year": "1000 users", "3_year": "Platform ecosystem"}',
    '{"structure": "object with time horizon keys"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;

-- ============================================
-- ✅ Seed data complete!
-- ============================================
-- You now have:
-- - 6 buckets
-- - 37 field definitions
--
-- Ready for users to start onboarding!
-- ============================================
