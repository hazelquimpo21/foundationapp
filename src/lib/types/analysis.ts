/**
 * 🔬 Analysis Types
 *
 * Types for the AI analysis and parsing pipeline.
 */

// ============================================
// 🤖 Analyzer Types
// ============================================

/** Available analyzer types */
export type AnalyzerType =
  | 'customer_empathy'
  | 'values_inferrer'
  | 'voice_detector'
  | 'differentiation_detector'
  | 'completeness_checker'
  | 'session_summarizer';

/** Configuration for an analyzer */
export interface AnalyzerConfig {
  id: AnalyzerType;
  name: string;
  description: string;
  /** Which buckets trigger this analyzer */
  triggerBuckets: string[];
  /** Which parser to use for output */
  parser: ParserType;
  /** System prompt template */
  promptTemplate: string;
}

/** Context passed to an analyzer */
export interface AnalyzerContext {
  businessName: string;
  businessDescription?: string;
  industry?: string;
  conversationChunk: ConversationChunk[];
  existingFields?: Record<string, string>;
}

/** A chunk of conversation for analysis */
export interface ConversationChunk {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/** Output from an analyzer */
export interface AnalysisOutput {
  analyzerId: AnalyzerType;
  prose: string;
  timestamp: string;
  inputMessageCount: number;
}

// ============================================
// 🎯 Parser Types
// ============================================

/** Available parser types */
export type ParserType =
  | 'customer_fields'
  | 'values_fields'
  | 'voice_fields'
  | 'positioning_fields'
  | 'vision_fields'
  | 'basics_fields';

/** Configuration for a parser */
export interface ParserConfig {
  id: ParserType;
  name: string;
  /** Field IDs this parser can extract */
  targetFields: string[];
  /** OpenAI function schema */
  functionSchema: FunctionSchema;
}

/** OpenAI function calling schema */
export interface FunctionSchema {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, PropertySchema>;
    required?: string[];
  };
}

/** Schema for a single property in function calling */
export interface PropertySchema {
  type: 'string' | 'number' | 'array' | 'object' | 'boolean';
  description: string;
  enum?: string[];
  items?: PropertySchema;
  properties?: Record<string, PropertySchema>;
}

/** Output from a parser */
export interface ParsedFields {
  /** Field ID → extracted value */
  fields: Record<string, ParsedFieldValue>;
  /** Any fields the parser couldn't extract */
  skipped: string[];
}

/** A single parsed field value */
export interface ParsedFieldValue {
  value: string | string[] | number | Record<string, unknown>;
  confidence: 'low' | 'medium' | 'high';
  reasoning?: string;
}

// ============================================
// 📋 Job Types
// ============================================

/** Request to queue an analysis job */
export interface AnalysisJobRequest {
  sessionId: string;
  analyzerType: AnalyzerType;
  messageIds: string[];
  context?: Record<string, unknown>;
}

/** Result of a completed analysis job */
export interface AnalysisJobResult {
  jobId: string;
  analyzerId: AnalyzerType;
  status: 'completed' | 'failed';
  analysis?: string;
  error?: string;
  processingTimeMs: number;
}

/** Result of a completed parsing job */
export interface ParsingJobResult {
  jobId: string;
  status: 'completed' | 'failed';
  fieldsExtracted: string[];
  fieldsUpdated: string[];
  error?: string;
}
