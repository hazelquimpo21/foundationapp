/**
 * 💬 Chat API Route
 *
 * Handles incoming chat messages and generates responses.
 * This is the main endpoint for the conversation flow.
 *
 * POST /api/chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { saveMessage, getRecentMessages, getSession } from '@/lib/supabase/queries';
import { createChatCompletion, isOpenAIConfigured } from '@/lib/openai/client';
import { SYSTEM_PROMPT, OPENING_MESSAGE } from '@/config/prompts';
import { log } from '@/lib/utils';
import { ChatRequest, ChatResponse, MessageType } from '@/lib/types';

// ============================================
// 🔧 Route Configuration
// ============================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================
// 📨 POST Handler
// ============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  log.info('💬 Chat request received');

  try {
    // Parse request body
    const body = (await request.json()) as ChatRequest;
    const { sessionId, message, messageType = 'text', interactionData } = body;

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    log.info('📝 Processing message', {
      sessionId,
      messageType,
      messageLength: message.length,
    });

    // Check OpenAI configuration
    if (!isOpenAIConfigured()) {
      log.error('❌ OpenAI not configured');
      return NextResponse.json(
        { error: 'AI service not configured. Please check your API key.' },
        { status: 503 }
      );
    }

    // Get the session for context
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get recent messages for context
    const recentMessages = await getRecentMessages(sessionId, 10);

    // Build conversation history for OpenAI
    const conversationHistory = buildConversationHistory(
      recentMessages,
      message,
      session.current_focus_bucket || 'basics'
    );

    // Generate response
    const completion = await createChatCompletion(conversationHistory, {
      temperature: 0.7,
      maxTokens: 500,
    });

    const assistantMessage = completion.choices[0]?.message?.content ||
      "I'm having trouble responding right now. Could you try again?";

    // Save assistant message to database
    await saveMessage(sessionId, {
      role: 'assistant',
      content: assistantMessage,
      message_type: 'text',
      interaction_data: null,
      buckets_touched: [session.current_focus_bucket || 'basics'],
    });

    // Build response
    const response: ChatResponse = {
      message: assistantMessage,
      progress: [], // Will be populated by client
      interaction: undefined, // Future: analyze message to add interactions
    };

    const elapsed = Date.now() - startTime;
    log.info('✅ Chat response generated', {
      elapsed: `${elapsed}ms`,
      responseLength: assistantMessage.length,
    });

    return NextResponse.json(response);

  } catch (error) {
    const elapsed = Date.now() - startTime;
    log.error('❌ Chat API error', { error, elapsed: `${elapsed}ms` });

    return NextResponse.json(
      { error: 'Failed to process message. Please try again.' },
      { status: 500 }
    );
  }
}

// ============================================
// 🔧 Helper Functions
// ============================================

/**
 * Build the conversation history for OpenAI.
 */
function buildConversationHistory(
  recentMessages: Array<{ role: string; content: string }>,
  currentMessage: string,
  currentBucket: string
) {
  // Build system prompt with context
  const systemPrompt = SYSTEM_PROMPT
    .replace('{{businessName}}', 'your business')
    .replace('{{currentBucket}}', currentBucket)
    .replace('{{progressSummary}}', 'Getting started');

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  // Add recent message history
  for (const msg of recentMessages) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      });
    }
  }

  // Add current user message
  messages.push({ role: 'user', content: currentMessage });

  return messages;
}
