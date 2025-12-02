/**
 * 🤖 OpenAI Client
 *
 * Centralized OpenAI client configuration.
 * All AI operations go through this client.
 */

import OpenAI from 'openai';
import { log } from '@/lib/utils';

// ============================================
// 🔧 Environment Validation
// ============================================

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  log.warn('⚠️ OPENAI_API_KEY not set - AI features will not work');
}

// ============================================
// 📦 Client Instance
// ============================================

/**
 * OpenAI client instance.
 * Uses GPT-4o-mini by default for cost efficiency.
 */
export const openai = new OpenAI({
  apiKey: apiKey || 'missing-key',
});

// ============================================
// 🎯 Model Configuration
// ============================================

/** Default model for chat and analysis */
export const DEFAULT_MODEL = 'gpt-4o-mini';

/** Model for complex analysis tasks */
export const ANALYSIS_MODEL = 'gpt-4o-mini';

/** Model for simple parsing tasks */
export const PARSING_MODEL = 'gpt-4o-mini';

// ============================================
// 🔧 Helper Functions
// ============================================

/**
 * Check if the OpenAI client is properly configured.
 */
export function isOpenAIConfigured(): boolean {
  return !!apiKey && apiKey !== 'missing-key';
}

/**
 * Create a chat completion with standard settings.
 */
export async function createChatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
) {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 1000,
  } = options;

  log.debug('🤖 Creating chat completion', {
    model,
    messageCount: messages.length,
    temperature,
  });

  const start = Date.now();

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const elapsed = Date.now() - start;
    log.info('✅ Chat completion received', {
      model,
      elapsed: `${elapsed}ms`,
      tokens: completion.usage?.total_tokens,
    });

    return completion;
  } catch (error) {
    log.error('❌ Chat completion failed', { error, model });
    throw error;
  }
}

/**
 * Create a function-calling completion.
 */
export async function createFunctionCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  functions: OpenAI.Chat.ChatCompletionCreateParams.Function[],
  options: {
    model?: string;
    temperature?: number;
  } = {}
) {
  const { model = PARSING_MODEL, temperature = 0.3 } = options;

  log.debug('🎯 Creating function completion', {
    model,
    functionCount: functions.length,
  });

  const start = Date.now();

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      functions,
      function_call: 'auto',
      temperature,
    });

    const elapsed = Date.now() - start;
    log.info('✅ Function completion received', {
      model,
      elapsed: `${elapsed}ms`,
      functionCalled: completion.choices[0]?.message?.function_call?.name,
    });

    return completion;
  } catch (error) {
    log.error('❌ Function completion failed', { error, model });
    throw error;
  }
}
