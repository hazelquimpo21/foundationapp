/**
 * 💬 CHAT API ROUTE
 * =================
 * Handles chat messages and AI responses.
 *
 * POST /api/chat
 * Body: { sessionId, message, messageType?, metadata? }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// System prompt for the onboarding assistant
const SYSTEM_PROMPT = `You are a friendly, insightful business advisor helping someone define their business idea. Your goal is to:

1. Ask clarifying questions to understand their business better
2. Be encouraging but also constructively critical when needed
3. Help them think through blind spots
4. Keep responses concise (2-3 sentences usually)
5. Focus on one topic at a time

Current buckets to explore:
- Core Idea: What is it, who is it for, why now?
- Value Proposition: What problem does it solve, what makes it unique?
- Market Reality: Competition, market size, timing
- Business Model: How will it make money?
- Execution: Team, resources, timeline
- Vision: Long-term goals, values

Be conversational and human. Use emojis sparingly. Ask follow-up questions. When you learn something important, summarize your understanding back to them.`

export async function POST(request: NextRequest) {
  console.log('💬 [API] Chat request received')

  try {
    // Parse request body
    const body = await request.json()
    const { sessionId, message, projectId } = body

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'Missing sessionId or message' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch conversation history
    const { data: messages, error: messagesError } = await supabase
      .from('conversation_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20) // Last 20 messages for context

    if (messagesError) {
      console.error('💬 [API] Failed to fetch messages:', messagesError)
      throw messagesError
    }

    // Fetch project data for context
    let projectContext = ''
    if (projectId) {
      const { data: project } = await supabase
        .from('business_projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (project) {
        const fields = []
        if (project.idea_name) fields.push(`Idea name: ${project.idea_name}`)
        if (project.one_liner) fields.push(`One liner: ${project.one_liner}`)
        if (project.target_audience?.length) {
          fields.push(`Target audience: ${project.target_audience.join(', ')}`)
        }
        if (project.problem_statement) {
          fields.push(`Problem: ${project.problem_statement}`)
        }
        if (project.secret_sauce) {
          fields.push(`Secret sauce: ${project.secret_sauce}`)
        }
        if (project.validation_status) {
          fields.push(`Validation: ${project.validation_status}`)
        }
        if (project.customer_type) {
          fields.push(`Customer type: ${project.customer_type}`)
        }

        if (fields.length > 0) {
          projectContext = `\n\nWhat we know so far about this business:\n${fields.join('\n')}`
        }
      }
    }

    // Build messages array for OpenAI
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT + projectContext,
      },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ]

    console.log('💬 [API] Calling OpenAI...', { messageCount: openaiMessages.length })

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const assistantMessage = completion.choices[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('No response from OpenAI')
    }

    console.log('💬 [API] Got response:', assistantMessage.slice(0, 100) + '...')

    // Save assistant message to database
    const { data: savedMessage, error: saveError } = await supabase
      .from('conversation_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: assistantMessage,
        message_type: 'text',
        metadata: {},
      })
      .select()
      .single()

    if (saveError) {
      console.error('💬 [API] Failed to save message:', saveError)
      // Continue anyway - message was generated
    }

    return NextResponse.json({
      success: true,
      message: {
        id: savedMessage?.id || 'temp',
        role: 'assistant',
        content: assistantMessage,
        message_type: 'text',
        created_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('💬 [API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
