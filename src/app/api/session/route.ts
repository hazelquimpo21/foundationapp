/**
 * 💬 Session API Route
 *
 * Handles session creation and management.
 *
 * POST /api/session - Create a new session
 * GET /api/session?id=xxx - Get session details
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { log } from '@/lib/utils';

// ============================================
// 🔧 Route Configuration
// ============================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================
// 📨 POST Handler - Create Session
// ============================================

export async function POST(request: NextRequest) {
  log.info('🆕 Creating new session');

  try {
    const body = await request.json();
    const { businessName = 'My Business' } = body;

    const supabase = await createServerSupabase();

    // For MVP: Create a demo user if not authenticated
    // In production, this would use real auth
    const { data: authData } = await supabase.auth.getUser();
    let userId = authData?.user?.id;

    // If no user, create a temporary one (demo mode)
    if (!userId) {
      // For demo, we'll create an anonymous session
      // In production, require authentication
      log.info('📋 No authenticated user - using demo mode');

      // Create a placeholder user ID for demo
      userId = crypto.randomUUID();
    }

    // Create business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        user_id: userId,
        name: businessName,
        status: 'active',
      })
      .select()
      .single();

    if (businessError) {
      log.error('❌ Failed to create business', { error: businessError });
      return NextResponse.json(
        { error: 'Failed to create business' },
        { status: 500 }
      );
    }

    log.info('🏢 Business created', { businessId: business.id });

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('onboarding_sessions')
      .insert({
        business_id: business.id,
        status: 'active',
        current_focus_bucket: 'basics',
      })
      .select()
      .single();

    if (sessionError) {
      log.error('❌ Failed to create session', { error: sessionError });
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    log.info('✅ Session created', {
      sessionId: session.id,
      businessId: business.id,
    });

    return NextResponse.json({
      session,
      business,
    });

  } catch (error) {
    log.error('❌ Session creation error', { error });
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// ============================================
// 📥 GET Handler - Get Session
// ============================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID required' },
      { status: 400 }
    );
  }

  log.info('📂 Fetching session', { sessionId });

  try {
    const supabase = await createServerSupabase();

    // Fetch session with business
    const { data: session, error: sessionError } = await supabase
      .from('onboarding_sessions')
      .select(`
        *,
        business:businesses(*)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      log.error('❌ Session not found', { sessionId, error: sessionError });
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Fetch messages
    const { data: messages } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('sequence', { ascending: true });

    log.info('✅ Session fetched', {
      sessionId,
      messageCount: messages?.length || 0,
    });

    return NextResponse.json({
      session,
      business: session.business,
      messages: messages || [],
    });

  } catch (error) {
    log.error('❌ Session fetch error', { error });
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
