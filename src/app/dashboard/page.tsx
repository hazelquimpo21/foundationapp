/**
 * 📊 DASHBOARD PAGE
 * =================
 * Main dashboard showing user's projects.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle, CardDescription } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useAuthStore } from '@/lib/stores/authStore'
import { useProjectStore } from '@/lib/stores/projectStore'
import { formatRelativeTime } from '@/lib/utils/helpers'
import {
  Rocket,
  Plus,
  LogOut,
  MoreVertical,
  Trash2,
  ExternalLink,
  Loader2,
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { member, isInitialized, initialize, signOut } = useAuthStore()
  const { projects, isLoading, loadProjects, deleteProject } = useProjectStore()

  // Initialize auth
  useEffect(() => {
    initialize()
  }, [initialize])

  // Load projects when member is available
  useEffect(() => {
    if (member) {
      loadProjects(member.id)
    }
  }, [member, loadProjects])

  // Redirect if not logged in
  useEffect(() => {
    if (isInitialized && !member) {
      router.push('/login')
    }
  }, [isInitialized, member, router])

  /**
   * 🆕 Navigate to new project flow
   * Note: We now go to /onboard/new first, which handles project creation
   */
  const handleCreateProject = () => {
    router.push('/onboard/new')
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProject(projectId)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  // Loading state
  if (!isInitialized || !member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="w-7 h-7 text-primary-500" />
              <span className="text-lg font-bold text-gray-900">
                Foundation Studio
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {member.name || member.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Projects</h1>
            <p className="text-gray-500">
              {projects.length === 0
                ? 'Start by creating your first business idea'
                : `${projects.length} project${projects.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <Button onClick={handleCreateProject}>
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState onCreateProject={handleCreateProject} />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={() => handleDeleteProject(project.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

/**
 * 🔍 Get the URL to continue working on a project
 * Routes to the appropriate step based on project status
 */
function getProjectUrl(project: {
  id: string
  status: string
  current_step?: string
}): string {
  // Completed projects go to the done/summary page
  if (project.status === 'completed') {
    return `/onboard/${project.id}/done`
  }

  // Route to the current step, or setup if none set
  const step = project.current_step || 'setup'
  return `/onboard/${project.id}/${step}`
}

/**
 * Project Card Component
 */
function ProjectCard({
  project,
  onDelete,
}: {
  project: {
    id: string
    project_name: string
    idea_name: string | null
    overall_completion: number
    updated_at: string
    status: string
    current_step?: string
  }
  onDelete: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const projectUrl = getProjectUrl(project)
  const isComplete = project.status === 'completed'

  return (
    <Card className="relative group" interactive>
      {/* Menu Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.preventDefault()
            setShowMenu(!showMenu)
          }}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all"
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 mt-1 w-40 py-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
            <button
              onClick={(e) => {
                e.preventDefault()
                onDelete()
                setShowMenu(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/5 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <Link href={projectUrl}>
        <div className="pr-8">
          {/* Project Name */}
          <CardTitle className="mb-1">
            {project.idea_name || project.project_name}
          </CardTitle>

          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                project.status === 'completed'
                  ? 'bg-success/10 text-success'
                  : project.status === 'in_progress'
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {project.status.replace('_', ' ')}
            </span>
            <CardDescription className="text-xs">
              Updated {formatRelativeTime(project.updated_at)}
            </CardDescription>
          </div>

          {/* Progress Bar */}
          <ProgressBar
            value={project.overall_completion}
            label="Completion"
            showLabel
            size="sm"
          />

          {/* Open Link */}
          <div className="mt-4 flex items-center gap-1 text-sm text-primary-600 font-medium">
            {isComplete ? 'View' : 'Continue'}
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>
      </Link>
    </Card>
  )
}

/**
 * Empty State Component
 */
function EmptyState({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-6">
        <Rocket className="w-10 h-10 text-primary-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        No projects yet
      </h2>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        Create your first project to start building your brand foundation.
        Answer a few simple questions and we&apos;ll help define your brand.
      </p>
      <Button onClick={onCreateProject} size="lg">
        <Plus className="w-5 h-5" />
        Start Your First Brand
      </Button>
    </div>
  )
}
