/**
 * 🔬 Analyze API Route
 *
 * Runs AI analyzers on conversation chunks.
 * Called asynchronously after messages are sent.
 *
 * POST /api/analyze
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { createChatCompletion, isOpenAIConfigured, ANALYSIS_MODEL } from '@/lib/openai/client';
import { log } from '@/lib/utils';
import { AnalyzerType, ConversationChunk } from '@/lib/types';

// ============================================
// 🔧 Route Configuration
// ============================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================
// 🤖 Analyzer Prompts
// ============================================

const ANALYZER_PROMPTS: Record<AnalyzerType, string> = {
  customer_empathy: `You're analyzing a founder's conversation about their business to understand their customer deeply.

Read this conversation and write your observations about:
1. WHO THE CUSTOMER REALLY IS - Demographics and mindset
2. THE PAIN BENEATH THE PAIN - Emotional/psychological pain underneath
3. THE REAL DESIRE - What they actually want (status, feeling, identity)
4. GAPS AND CONTRADICTIONS - What's missing or unclear

Write thoughtful prose analysis. Quote specific phrases that reveal insight.`,

  values_inferrer: `You're analyzing a founder's conversation to identify deep values and beliefs.

Look for:
1. EVIDENT VALUES - What shows up repeatedly in how they describe things
2. STATED VS OPERATIONAL - Do their answers align with stated values
3. BELIEFS ABOUT THE WORLD - What they assume is obvious
4. WHAT THEY STAND AGAINST - What frustrates them

Write narrative analysis with specific evidence.`,

  voice_detector: `You're analyzing a founder's conversation to identify their natural brand voice.

Analyze for:
1. NATURAL TONE - Formal or casual? Long or punchy sentences?
2. PERSONALITY MARKERS - Warm or crisp? Bold or measured?
3. ENERGY AND PACE - Fast and energetic or thoughtful and measured?
4. WHAT THEY'D NEVER SAY - What would feel wrong for this voice?

Suggest where they'd land on spectrums (formal↔casual, playful↔serious, bold↔understated).`,

  differentiation_detector: `You're analyzing for genuine differentiation.

Look for:
1. STATED DIFFERENTIATORS - What do they claim makes them different?
2. HIDDEN DIFFERENTIATORS - Unique approaches that emerged naturally
3. FOUNDER ADVANTAGE - Does their background give unique insight?
4. POTENTIAL CATEGORY - Are they creating something new?

Be rigorous—note what's genuinely unique vs table stakes.`,

  completeness_checker: `Review the conversation to assess what we know vs what's missing.

Analyze:
1. WHAT'S SOLID - Clear, confident information
2. CRITICAL GAPS - Essential missing information
3. CONTRADICTIONS TO RESOLVE - Inconsistencies
4. RECOMMENDED NEXT QUESTIONS - Natural follow-ups

Focus on what would most improve the foundation's usefulness.`,

  session_summarizer: `Create a brief summary of this conversation for context restoration.

Include:
1. Business overview (1-2 sentences)
2. What's been established (key facts, bulleted)
3. Current conversation state (what were we discussing?)
4. Natural next topic or question
5. Notable moments

Keep under 200 words.`,
};

// ============================================
// 📨 POST Handler
// ============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  log.info('🔬 Analysis request received');

  try {
    const body = await request.json();
    const { sessionId, analyzerType, messageIds } = body as {
      sessionId: string;
      analyzerType: AnalyzerType;
      messageIds: string[];
    };

    // Validate
    if (!sessionId || !analyzerType || !messageIds?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, analyzerType, messageIds' },
        { status: 400 }
      );
    }

    if (!ANALYZER_PROMPTS[analyzerType]) {
      return NextResponse.json(
        { error: `Unknown analyzer type: ${analyzerType}` },
        { status: 400 }
      );
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    const supabase = await createServerSupabase();

    // Fetch messages to analyze
    const { data: messages, error: messagesError } = await supabase
      .from('conversation_messages')
      .select('*')
      .in('id', messageIds)
      .order('sequence', { ascending: true });

    if (messagesError || !messages?.length) {
      log.error('❌ Failed to fetch messages', { error: messagesError });
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Build conversation chunk
    const conversationText = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    log.info('🔬 Running analyzer', {
      analyzerType,
      messageCount: messages.length,
    });

    // Create analysis job record
    const { data: job, error: jobError } = await supabase
      .from('analysis_jobs')
      .insert({
        session_id: sessionId,
        analyzer_type: analyzerType,
        input_message_ids: messageIds,
        status: 'processing',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError) {
      log.error('❌ Failed to create analysis job', { error: jobError });
    }

    // Run analysis
    const analyzerPrompt = ANALYZER_PROMPTS[analyzerType];
    const completion = await createChatCompletion([
      { role: 'system', content: analyzerPrompt },
      { role: 'user', content: `CONVERSATION:\n\n${conversationText}` },
    ], {
      model: ANALYSIS_MODEL,
      temperature: 0.7,
      maxTokens: 1000,
    });

    const analysis = completion.choices[0]?.message?.content || '';

    // Update job with results
    if (job) {
      await supabase
        .from('analysis_jobs')
        .update({
          status: 'completed',
          output_analysis: analysis,
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id);
    }

    const elapsed = Date.now() - startTime;
    log.info('✅ Analysis complete', {
      analyzerType,
      elapsed: `${elapsed}ms`,
      analysisLength: analysis.length,
    });

    return NextResponse.json({
      jobId: job?.id,
      analyzerType,
      analysis,
      processingTimeMs: elapsed,
    });

  } catch (error) {
    const elapsed = Date.now() - startTime;
    log.error('❌ Analysis error', { error, elapsed: `${elapsed}ms` });

    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
