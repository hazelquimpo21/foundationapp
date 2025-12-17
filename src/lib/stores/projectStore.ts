/**
 * 💼 PROJECT STORE
 * ================
 * Manages business project state with Zustand.
 *
 * Features:
 * - Optimistic updates for snappy UX
 * - Timeout protection (no hanging forever)
 * - Proper error propagation for calling code
 * - Save error state for UI feedback
 *
 * Usage:
 *   const { project, updateField, createProject, saveError } = useProjectStore()
 */

import { create } from 'zustand'
import { supabase, createClient } from '@/lib/supabase/client'
import { log } from '@/lib/utils/logger'
import { calculateBucketCompletion, calculateOverallCompletion, BUCKET_ORDER } from '@/lib/config/buckets'
import type { BusinessProject, BucketCompletion } from '@/lib/types'

// ============================================
// 📋 CONFIG
// ============================================

/** Database operation timeout in ms */
const DB_TIMEOUT_MS = 20000

// ============================================
// 📋 TYPES
// ============================================

interface ProjectState {
  // State
  project: BusinessProject | null
  projects: BusinessProject[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  /** Last save error - separate from load errors for better UX */
  saveError: string | null

  // Actions
  loadProjects: (memberId: string) => Promise<void>
  loadProject: (projectId: string) => Promise<void>
  createProject: (memberId: string, name?: string) => Promise<BusinessProject | null>
  updateField: <K extends keyof BusinessProject>(field: K, value: BusinessProject[K]) => Promise<void>
  /** Updates multiple fields - THROWS on error for caller handling */
  updateFields: (fields: Partial<BusinessProject>) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  clearProject: () => void
  clearError: () => void
  clearSaveError: () => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  project: null,
  projects: [],
  isLoading: false,
  isSaving: false,
  error: null,
  saveError: null,

  /**
   * 📋 Load all projects for a member
   */
  loadProjects: async (memberId) => {
    log.info('💼 Loading projects...', { memberId })
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase
        .from('business_projects')
        .select('*')
        .eq('member_id', memberId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      log.success('💼 Projects loaded', { count: data.length })
      set({ projects: data, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load projects'
      log.error('💼 Failed to load projects', error)
      set({ isLoading: false, error: message })
    }
  },

  /**
   * 📄 Load a single project
   */
  loadProject: async (projectId) => {
    log.info('💼 Loading project...', { projectId })
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase
        .from('business_projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) throw error

      log.success('💼 Project loaded', { name: data.project_name })
      set({ project: data, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load project'
      log.error('💼 Failed to load project', error)
      set({ isLoading: false, error: message })
    }
  },

  /**
   * ➕ Create a new project
   */
  createProject: async (memberId, name = 'Untitled Project') => {
    log.info('💼 Creating project...', { memberId, name })
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase
        .from('business_projects')
        .insert({
          member_id: memberId,
          project_name: name,
          status: 'draft',
        })
        .select()
        .single()

      if (error) throw error

      log.success('💼 Project created', { id: data.id })
      set((state) => ({
        project: data,
        projects: [data, ...state.projects],
        isLoading: false,
      }))

      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create project'
      log.error('💼 Failed to create project', error)
      set({ isLoading: false, error: message })
      return null
    }
  },

  /**
   * 📝 Update a single field
   */
  updateField: async (field, value) => {
    const { project } = get()
    if (!project) {
      log.warn('💼 No project loaded')
      return
    }

    log.debug('💼 Updating field', { field, value })
    set({ isSaving: true })

    try {
      // Optimistic update
      const updatedProject = { ...project, [field]: value }

      // Recalculate completion
      const bucketCompletion: BucketCompletion = {
        core_idea: 0,
        value_prop: 0,
        market: 0,
        model: 0,
        execution: 0,
        vision: 0,
      }

      for (const bucketId of BUCKET_ORDER) {
        bucketCompletion[bucketId as keyof BucketCompletion] = calculateBucketCompletion(
          updatedProject as unknown as Record<string, unknown>,
          bucketId
        )
      }

      const overallCompletion = calculateOverallCompletion(bucketCompletion)

      // Update local state immediately
      set({
        project: {
          ...updatedProject,
          bucket_completion: bucketCompletion,
          overall_completion: overallCompletion,
        },
      })

      // Persist to database
      const { error } = await supabase
        .from('business_projects')
        .update({
          [field]: value,
          bucket_completion: bucketCompletion,
          overall_completion: overallCompletion,
        })
        .eq('id', project.id)

      if (error) throw error

      log.debug('💼 Field updated', { field })
      set({ isSaving: false })
    } catch (error) {
      log.error('💼 Failed to update field', error)
      // Revert optimistic update
      set({ project, isSaving: false })
    }
  },

  /**
   * 📝 Update multiple fields at once
   *
   * ⚠️ IMPORTANT: This function THROWS on error!
   * The calling code must handle errors appropriately.
   * This is intentional - callers need to know when saves fail
   * so they can show user feedback and decide whether to proceed.
   *
   * @throws Error if the database update fails or times out
   */
  updateFields: async (fields) => {
    const { project } = get()
    if (!project) {
      log.warn('💼 No project loaded')
      throw new Error('No project loaded - cannot save changes')
    }

    const fieldKeys = Object.keys(fields)
    log.info('💼 Updating fields...', { 
      projectId: project.id,
      fields: fieldKeys,
      fieldCount: fieldKeys.length 
    })
    set({ isSaving: true, saveError: null })

    // Keep original for rollback
    const originalProject = project

    try {
      // Optimistic update - update UI immediately
      const updatedProject = { ...project, ...fields }

      // Recalculate completion scores
      const bucketCompletion: BucketCompletion = {
        core_idea: 0,
        value_prop: 0,
        market: 0,
        model: 0,
        execution: 0,
        vision: 0,
      }

      for (const bucketId of BUCKET_ORDER) {
        bucketCompletion[bucketId as keyof BucketCompletion] = calculateBucketCompletion(
          updatedProject as unknown as Record<string, unknown>,
          bucketId
        )
      }

      const overallCompletion = calculateOverallCompletion(bucketCompletion)

      // Update local state immediately (optimistic)
      set({
        project: {
          ...updatedProject,
          bucket_completion: bucketCompletion,
          overall_completion: overallCompletion,
        },
      })

      // Persist to database with timeout protection
      log.debug('💼 Starting database update...', { projectId: project.id })
      const startTime = Date.now()

      // Log what we're about to save (for debugging)
      const updatePayload = {
        ...fields,
        bucket_completion: bucketCompletion,
        overall_completion: overallCompletion,
      }
      log.debug('💼 Update payload:', { 
        fields: Object.keys(updatePayload),
        projectId: project.id 
      })

      // Use a fresh client to avoid any stale auth state issues
      const freshClient = createClient()
      
      log.debug('💼 Calling Supabase update...', { 
        table: 'business_projects',
        projectId: project.id,
        fieldNames: Object.keys(updatePayload)
      })

      const updatePromise = freshClient
        .from('business_projects')
        .update(updatePayload)
        .eq('id', project.id)
        .select('id, updated_at')
        .single()
        .then(result => {
          log.debug('💼 Supabase resolved', { 
            hasData: !!result.data, 
            hasError: !!result.error,
            errorMessage: result.error?.message,
            errorCode: result.error?.code,
            duration: `${Date.now() - startTime}ms`
          })
          return result
        })
        .catch(err => {
          log.error('💼 Supabase rejected', err, {
            duration: `${Date.now() - startTime}ms`
          })
          throw err
        })

      // Create a timeout promise that rejects after DB_TIMEOUT_MS
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Database update timed out after ${DB_TIMEOUT_MS}ms`))
        }, DB_TIMEOUT_MS)
      })

      // Race the update against the timeout
      const { data, error } = await Promise.race([
        updatePromise,
        timeoutPromise
      ]) as Awaited<typeof updatePromise>

      const duration = Date.now() - startTime

      if (error) {
        log.error('💼 Database error', error, { 
          code: error.code,
          details: error.details,
          hint: error.hint,
          duration: `${duration}ms`
        })
        throw new Error(error.message || 'Database update failed')
      }

      log.success('💼 Fields updated ✓', { 
        duration: `${duration}ms`,
        updatedAt: data?.updated_at 
      })
      set({ isSaving: false })
    } catch (error) {
      // Rollback optimistic update
      const message = error instanceof Error ? error.message : 'Failed to save'
      log.error('💼 Failed to update fields', error)
      set({
        project: originalProject,
        isSaving: false,
        saveError: message,
      })

      // Re-throw so calling code knows it failed!
      throw error
    }
  },

  /**
   * 🗑️ Delete a project
   */
  deleteProject: async (projectId) => {
    log.info('💼 Deleting project...', { projectId })
    set({ isLoading: true, error: null })

    try {
      const { error } = await supabase
        .from('business_projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      log.success('💼 Project deleted')
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        project: state.project?.id === projectId ? null : state.project,
        isLoading: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete project'
      log.error('💼 Failed to delete project', error)
      set({ isLoading: false, error: message })
    }
  },

  /**
   * 🧹 Clear current project
   */
  clearProject: () => set({ project: null }),

  /**
   * 🧹 Clear error message
   */
  clearError: () => set({ error: null }),

  /**
   * 🧹 Clear save error message
   */
  clearSaveError: () => set({ saveError: null }),
}))
