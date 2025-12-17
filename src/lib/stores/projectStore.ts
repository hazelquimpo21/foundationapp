/**
 * 💼 PROJECT STORE
 * ================
 * Manages business project state with Zustand.
 *
 * Usage:
 *   const { project, updateField, createProject } = useProjectStore()
 */

import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { log } from '@/lib/utils/logger'
import { calculateBucketCompletion, calculateOverallCompletion, BUCKET_ORDER } from '@/lib/config/buckets'
import type { BusinessProject, BucketCompletion } from '@/lib/types'

interface ProjectState {
  // State
  project: BusinessProject | null
  projects: BusinessProject[]
  isLoading: boolean
  isSaving: boolean
  error: string | null

  // Actions
  loadProjects: (memberId: string) => Promise<void>
  loadProject: (projectId: string) => Promise<void>
  createProject: (memberId: string, name?: string) => Promise<BusinessProject | null>
  updateField: <K extends keyof BusinessProject>(field: K, value: BusinessProject[K]) => Promise<void>
  updateFields: (fields: Partial<BusinessProject>) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  clearProject: () => void
  clearError: () => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  project: null,
  projects: [],
  isLoading: false,
  isSaving: false,
  error: null,

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
   */
  updateFields: async (fields) => {
    const { project } = get()
    if (!project) {
      log.warn('💼 No project loaded')
      return
    }

    log.debug('💼 Updating fields', { fields: Object.keys(fields) })
    set({ isSaving: true })

    try {
      // Optimistic update
      const updatedProject = { ...project, ...fields }

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

      // Update local state
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
          ...fields,
          bucket_completion: bucketCompletion,
          overall_completion: overallCompletion,
        })
        .eq('id', project.id)

      if (error) throw error

      log.debug('💼 Fields updated')
      set({ isSaving: false })
    } catch (error) {
      log.error('💼 Failed to update fields', error)
      set({ project, isSaving: false })
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
}))
