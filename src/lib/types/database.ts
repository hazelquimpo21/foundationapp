/**
 * 🗄️ Database Types
 *
 * TypeScript types that mirror our Supabase schema.
 * These should stay in sync with the database tables.
 */

// ============================================
// 📋 Enums (match database CHECK constraints)
// ============================================

/** Status of a business in the system */
export type BusinessStatus = 'active' | 'archived';

/** Status of an onboarding session */
export type SessionStatus = 'active' | 'paused' | 'completed' | 'abandoned';

/** Who sent a message in the chat */
export type MessageRole = 'user' | 'assistant' | 'system';

/** Type of message/interaction */
export type MessageType =
  | 'text'
  | 'word_bank_response'
  | 'slider_response'
  | 'binary_choice'
  | 'inference_confirm'
  | 'inference_reject'
  | 'inference_edit';

/** Type of data a field can hold */
export type FieldType = 'short_text' | 'long_text' | 'tags' | 'scale' | 'json';

/** How confident we are in a field's value */
export type ConfidenceLevel = 'none' | 'low' | 'medium' | 'high';

/** How a field value was obtained */
export type SourceType = 'direct_input' | 'inferred' | 'confirmed_inference' | 'edited';

/** Status of an analysis or parsing job */
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

/** Status of an inference reveal */
export type RevealStatus = 'pending' | 'shown' | 'confirmed' | 'rejected' | 'edited';

/** Types of generated outputs */
export type OutputType =
  | 'one_liner'
  | 'benefit_statement'
  | 'positioning_statement'
  | 'brand_brief'
  | 'messaging_framework';

// ============================================
// 📊 Database Row Types
// ============================================

/** User account */
export interface User {
  id: string;
  email: string;
  created_at: string;
  last_seen_at: string | null;
  preferences: UserPreferences;
}

/** User preferences stored in JSONB */
export interface UserPreferences {
  pace?: 'thorough' | 'fast';
  theme?: 'light' | 'dark';
}

/** Business profile */
export interface Business {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  status: BusinessStatus;
  metadata: Record<string, unknown>;
}

/** Onboarding conversation session */
export interface OnboardingSession {
  id: string;
  business_id: string;
  started_at: string;
  last_active_at: string;
  completed_at: string | null;
  status: SessionStatus;
  current_focus_bucket: string | null;
  conversation_summary: string | null;
  session_metadata: SessionMetadata;
}

/** Session metadata stored in JSONB */
export interface SessionMetadata {
  message_count?: number;
  interaction_count?: number;
  avg_response_length?: number;
}

/** A message in the conversation */
export interface ConversationMessage {
  id: string;
  session_id: string;
  sequence: number;
  role: MessageRole;
  content: string;
  message_type: MessageType;
  interaction_data: InteractionData | null;
  created_at: string;
  buckets_touched: string[];
}

/** Data from interactive elements (JSONB) */
export interface InteractionData {
  /** For word bank responses */
  selected_words?: string[];
  /** For slider responses */
  slider_values?: Record<string, number>;
  /** For binary choice */
  choice?: string;
  /** For inference responses */
  inference_id?: string;
  edited_value?: string;
}

/** Definition of a bucket (category) */
export interface FieldBucket {
  id: string;
  display_name: string;
  description: string | null;
  display_order: number;
  tier: number;
  is_required: boolean;
  min_completion_percent: number;
  icon: string;
}

/** Definition of a field */
export interface FieldDefinition {
  id: string;
  bucket_id: string;
  display_name: string;
  description: string | null;
  field_type: FieldType;
  is_required: boolean;
  display_order: number;
  validation_rules: Record<string, unknown> | null;
  parser_hints: Record<string, unknown> | null;
  example_value: string | null;
}

/** Actual field value for a business */
export interface FoundationField {
  id: string;
  business_id: string;
  field_id: string;
  value: string | null;
  value_json: unknown | null;
  confidence: ConfidenceLevel;
  source_type: SourceType | null;
  created_at: string;
  updated_at: string;
  source_message_ids: string[];
}

/** An AI analysis job */
export interface AnalysisJob {
  id: string;
  session_id: string;
  analyzer_type: string;
  status: JobStatus;
  input_message_ids: string[];
  input_context: Record<string, unknown> | null;
  output_analysis: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}

/** A parsing job (analysis → structured fields) */
export interface ParsingJob {
  id: string;
  analysis_job_id: string;
  status: JobStatus;
  output_fields: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
  fields_updated: string[];
  error_message: string | null;
}

/** An inference waiting for user confirmation */
export interface InferenceReveal {
  id: string;
  session_id: string;
  field_id: string;
  inferred_value: string;
  display_text: string;
  confidence: ConfidenceLevel;
  source_analysis_id: string | null;
  status: RevealStatus;
  user_response: string | null;
  created_at: string;
  resolved_at: string | null;
}

/** Generated content output */
export interface GeneratedOutput {
  id: string;
  business_id: string;
  output_type: OutputType;
  content: Record<string, unknown>;
  source_field_ids: string[];
  source_field_snapshot: Record<string, unknown> | null;
  is_favorite: boolean;
  created_at: string;
  regenerated_from: string | null;
}

// ============================================
// 🔗 Extended Types (with relations)
// ============================================

/** Field definition with its bucket info */
export interface FieldDefinitionWithBucket extends FieldDefinition {
  bucket: FieldBucket;
}

/** Foundation field with its definition */
export interface FoundationFieldWithDefinition extends FoundationField {
  definition: FieldDefinition;
}

/** Session with its messages */
export interface SessionWithMessages extends OnboardingSession {
  messages: ConversationMessage[];
}
