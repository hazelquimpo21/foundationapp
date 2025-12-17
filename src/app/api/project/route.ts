/**
 * 💼 PROJECT API ROUTE
 * ====================
 * CRUD operations for business projects.
 *
 * GET /api/project?id=xxx - Get a project
 * POST /api/project - Create a project
 * PATCH /api/project - Update a project
 * DELETE /api/project?id=xxx - Delete a project
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET - Fetch a project by ID
 */
export async function GET(request: NextRequest) {
  console.log('💼 [API] GET project request')

  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing project ID' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: project, error } = await supabase
      .from('business_projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, project })
  } catch (error) {
    console.error('💼 [API] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create a new project
 */
export async function POST(request: NextRequest) {
  console.log('💼 [API] POST project request')

  try {
    const body = await request.json()
    const { name } = body

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get member ID
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Create project
    const { data: project, error } = await supabase
      .from('business_projects')
      .insert({
        member_id: member.id,
        project_name: name || 'Untitled Project',
        status: 'draft',
      })
      .select()
      .single()

    if (error) throw error

    console.log('💼 [API] Project created:', project.id)

    return NextResponse.json({ success: true, project })
  } catch (error) {
    console.error('💼 [API] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update a project
 */
export async function PATCH(request: NextRequest) {
  console.log('💼 [API] PATCH project request')

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing project ID' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update project (RLS will ensure user owns it)
    const { data: project, error } = await supabase
      .from('business_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    console.log('💼 [API] Project updated:', id)

    return NextResponse.json({ success: true, project })
  } catch (error) {
    console.error('💼 [API] PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete a project
 */
export async function DELETE(request: NextRequest) {
  console.log('💼 [API] DELETE project request')

  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing project ID' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('business_projects')
      .delete()
      .eq('id', projectId)

    if (error) throw error

    console.log('💼 [API] Project deleted:', projectId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('💼 [API] DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
