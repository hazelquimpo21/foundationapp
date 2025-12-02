/**
 * 💬 Chat Types
 *
 * Types for the chat interface and conversation flow.
 */

import { MessageRole, MessageType, InteractionData } from './database';

// ============================================
// 📨 Chat Message Types
// ============================================

/** A message as displayed in the UI */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  type: MessageType;
  interaction?: ChatInteraction;
  timestamp: Date;
  isStreaming?: boolean;
}

/** Response from the chat API */
export interface ChatResponse {
  message: string;
  interaction?: ChatInteraction;
  progress: BucketProgress[];
  inferenceReveals?: PendingInference[];
}

/** Request to the chat API */
export interface ChatRequest {
  sessionId: string;
  message: string;
  messageType?: MessageType;
  interactionData?: InteractionData;
}

// ============================================
// 🔄 Conversation Flow Types
// ============================================

/** Result of classifying a user message */
export interface MessageClassification {
  /** Which buckets this message is relevant to */
  bucketsTouched: string[];
  /** Any fields that can be directly extracted */
  directExtractions: DirectExtraction[];
  /** Should we trigger analysis after this message? */
  shouldTriggerAnalysis: boolean;
  /** Detected intent of the message */
  intent: MessageIntent;
}

/** A field value extracted directly from user input */
export interface DirectExtraction {
  fieldId: string;
  value: string | string[] | number;
  confidence: 'low' | 'medium' | 'high';
}

/** What the user is trying to do */
export type MessageIntent =
  | 'answering_question'
  | 'asking_question'
  | 'providing_context'
  | 'confirming'
  | 'rejecting'
  | 'editing'
  | 'navigating'
  | 'unclear';

/** Decision about what to do next in conversation */
export interface ResponseDecision {
  action: ResponseAction;
  targetBucket?: string;
  targetField?: string;
  inferenceToShow?: string;
  customPrompt?: string;
}

/** Type of response action to take */
export type ResponseAction =
  | 'answer_question'
  | 'show_inference'
  | 'ask_followup'
  | 'transition_bucket'
  | 'fill_gap'
  | 'wrap_up'
  | 'acknowledge';

// ============================================
// 📊 Progress Tracking
// ============================================

/** Progress for a single bucket */
export interface BucketProgress {
  bucketId: string;
  bucketName: string;
  icon: string;
  tier: number;
  isRequired: boolean;
  /** Number from 0-100 */
  completionPercent: number;
  /** Count of fields with values */
  fieldsCompleted: number;
  /** Total fields in bucket */
  fieldsTotal: number;
  /** Has met minimum completion threshold */
  meetsMinimum: boolean;
}

/** Overall foundation progress */
export interface FoundationProgress {
  buckets: BucketProgress[];
  overallPercent: number;
  requiredComplete: boolean;
  readyForOutputs: boolean;
}

// ============================================
// 💡 Inference Types
// ============================================

/** An inference waiting to be shown to user */
export interface PendingInference {
  id: string;
  fieldId: string;
  fieldName: string;
  bucketId: string;
  inferredValue: string;
  displayText: string;
  confidence: 'low' | 'medium' | 'high';
}

/** User's response to an inference */
export interface InferenceResponse {
  inferenceId: string;
  action: 'confirm' | 'reject' | 'edit';
  editedValue?: string;
}
