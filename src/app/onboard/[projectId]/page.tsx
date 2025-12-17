/**
 * 🔀 ONBOARD REDIRECT PAGE
 * ========================
 * This page redirects to the setup page.
 *
 * The old chat-based onboarding has been replaced with a structured
 * step-by-step flow. See /setup, /story, /words, etc.
 */

'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { log } from '@/lib/utils/logger'

export default function OnboardRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  useEffect(() => {
    if (projectId) {
      log.info('🔀 Redirecting to setup page...', { projectId })
      router.replace(`/onboard/${projectId}/setup`)
    }
  }, [projectId, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading your project...</p>
      </div>
    </div>
  )
}
