/**
 * 🔍 Supabase Query Functions
 *
 * Reusable database queries organized by entity.
 * These abstract away the Supabase client usage.
 */

import { createClient } from './client';
import { createServerSupabase, createAdminSupabase } from './server';
import {
  Business,
  OnboardingSession,
  ConversationMessage,
  FoundationField,
  FieldBucket,
  FieldDefinition,
  AnalysisJob,
  InferenceReveal,
} from '@/lib/types';
import { log } from '@/lib/utils';

// ============================================
// 🏢 Business Queries
// ============================================

/**
 * Get all businesses for the current user.
 */
export async function getUserBusinesses(): Promise<Business[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    log.error('Failed to fetch businesses', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single business by ID.
 */
export async function getBusiness(businessId: string): Promise<Business | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  if (error) {
    log.error('Failed to fetch business', { businessId, error });
    return null;
  }

  return data;
}

/**
 * Create a new business.
 */
export async function createBusiness(
  userId: string,
  name: string = 'My Business'
): Promise<Business> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('businesses')
    .insert({ user_id: userId, name })
    .select()
    .single();

  if (error) {
    log.error('Failed to create business', error);
    throw error;
  }

  log.info('🏢 Business created', { businessId: data.id, name });
  return data;
}

// ============================================
// 💬 Session Queries
// ============================================

/**
 * Get active session for a business.
 */
export async function getActiveSession(
  businessId: string
): Promise<OnboardingSession | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('onboarding_sessions')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    log.error('Failed to fetch session', error);
  }

  return data || null;
}

/**
 * Get a session by ID.
 */
export async function getSession(sessionId: string): Promise<OnboardingSession | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('onboarding_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    log.error('Failed to fetch session', { sessionId, error });
    return null;
  }

  return data;
}

/**
 * Create a new onboarding session.
 */
export async function createSession(businessId: string): Promise<OnboardingSession> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('onboarding_sessions')
    .insert({
      business_id: businessId,
      status: 'active',
      current_focus_bucket: 'basics',
    })
    .select()
    .single();

  if (error) {
    log.error('Failed to create session', error);
    throw error;
  }

  log.info('💬 Session created', { sessionId: data.id, businessId });
  return data;
}

/**
 * Update session status.
 */
export async function updateSessionStatus(
  sessionId: string,
  status: OnboardingSession['status'],
  updates: Partial<OnboardingSession> = {}
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('onboarding_sessions')
    .update({ status, last_active_at: new Date().toISOString(), ...updates })
    .eq('id', sessionId);

  if (error) {
    log.error('Failed to update session', error);
    throw error;
  }

  log.info('📝 Session updated', { sessionId, status });
}

// ============================================
// 📝 Message Queries
// ============================================

/**
 * Get messages for a session.
 */
export async function getSessionMessages(
  sessionId: string,
  limit: number = 50
): Promise<ConversationMessage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('conversation_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('sequence', { ascending: true })
    .limit(limit);

  if (error) {
    log.error('Failed to fetch messages', error);
    throw error;
  }

  return data || [];
}

/**
 * Get recent messages for analysis.
 */
export async function getRecentMessages(
  sessionId: string,
  count: number = 5
): Promise<ConversationMessage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('conversation_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('sequence', { ascending: false })
    .limit(count);

  if (error) {
    log.error('Failed to fetch recent messages', error);
    throw error;
  }

  return (data || []).reverse();
}

/**
 * Save a new message.
 */
export async function saveMessage(
  sessionId: string,
  message: Omit<ConversationMessage, 'id' | 'session_id' | 'created_at' | 'sequence'>
): Promise<ConversationMessage> {
  const supabase = createClient();

  // Get the next sequence number
  const { data: lastMessage } = await supabase
    .from('conversation_messages')
    .select('sequence')
    .eq('session_id', sessionId)
    .order('sequence', { ascending: false })
    .limit(1)
    .single();

  const nextSequence = (lastMessage?.sequence || 0) + 1;

  const { data, error } = await supabase
    .from('conversation_messages')
    .insert({
      ...message,
      session_id: sessionId,
      sequence: nextSequence,
    })
    .select()
    .single();

  if (error) {
    log.error('Failed to save message', error);
    throw error;
  }

  return data;
}

// ============================================
// ✨ Foundation Fields Queries
// ============================================

/**
 * Get all foundation fields for a business.
 */
export async function getFoundationFields(
  businessId: string
): Promise<FoundationField[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('foundation_fields')
    .select('*')
    .eq('business_id', businessId);

  if (error) {
    log.error('Failed to fetch foundation fields', error);
    throw error;
  }

  return data || [];
}

/**
 * Update or insert a foundation field.
 */
export async function upsertFoundationField(
  businessId: string,
  fieldId: string,
  value: string | null,
  valueJson: unknown | null,
  confidence: FoundationField['confidence'],
  sourceType: FoundationField['source_type'],
  sourceMessageIds: string[] = []
): Promise<FoundationField> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('foundation_fields')
    .upsert(
      {
        business_id: businessId,
        field_id: fieldId,
        value,
        value_json: valueJson,
        confidence,
        source_type: sourceType,
        source_message_ids: sourceMessageIds,
      },
      { onConflict: 'business_id,field_id' }
    )
    .select()
    .single();

  if (error) {
    log.error('Failed to upsert foundation field', error);
    throw error;
  }

  log.info('✨ Field updated', { fieldId, confidence });
  return data;
}

// ============================================
// 📦 Schema Queries
// ============================================

/**
 * Get all bucket definitions.
 */
export async function getFieldBuckets(): Promise<FieldBucket[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('field_buckets')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    log.error('Failed to fetch buckets', error);
    throw error;
  }

  return data || [];
}

/**
 * Get all field definitions.
 */
export async function getFieldDefinitions(): Promise<FieldDefinition[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('field_definitions')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    log.error('Failed to fetch field definitions', error);
    throw error;
  }

  return data || [];
}

// ============================================
// 🔬 Analysis Queries
// ============================================

/**
 * Queue an analysis job.
 */
export async function queueAnalysisJob(
  sessionId: string,
  analyzerType: string,
  messageIds: string[],
  context?: Record<string, unknown>
): Promise<AnalysisJob> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('analysis_jobs')
    .insert({
      session_id: sessionId,
      analyzer_type: analyzerType,
      input_message_ids: messageIds,
      input_context: context,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    log.error('Failed to queue analysis job', error);
    throw error;
  }

  log.info('🔬 Analysis job queued', { jobId: data.id, analyzerType });
  return data;
}

/**
 * Get pending analysis jobs.
 */
export async function getPendingAnalysisJobs(
  limit: number = 10
): Promise<AnalysisJob[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from('analysis_jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    log.error('Failed to fetch pending jobs', error);
    throw error;
  }

  return data || [];
}

// ============================================
// 💡 Inference Queries
// ============================================

/**
 * Get pending inference reveals for a session.
 */
export async function getPendingInferences(
  sessionId: string
): Promise<InferenceReveal[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('inference_reveals')
    .select('*')
    .eq('session_id', sessionId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    log.error('Failed to fetch pending inferences', error);
    throw error;
  }

  return data || [];
}

/**
 * Update inference reveal status.
 */
export async function updateInferenceStatus(
  inferenceId: string,
  status: InferenceReveal['status'],
  userResponse?: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('inference_reveals')
    .update({
      status,
      user_response: userResponse,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', inferenceId);

  if (error) {
    log.error('Failed to update inference', error);
    throw error;
  }

  log.info('💡 Inference updated', { inferenceId, status });
}
