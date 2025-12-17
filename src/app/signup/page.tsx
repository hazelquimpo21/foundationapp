/**
 * 📝 SIGNUP PAGE - Redirect to Magic Link Login
 * ==============================================
 * With magic link authentication, signup and login are unified.
 * New users simply enter their email on the login page, and the
 * /auth/callback route creates their profile automatically.
 * 
 * This page redirects to /login to maintain a clean, single auth flow.
 * We keep this route for backwards compatibility (old links, bookmarks).
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔀 REDIRECT: Send users to the unified login page
  // Magic link handles both new and existing users seamlessly
  // ═══════════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    router.replace('/login')
  }, [router])

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎨 RENDER: Brief loading state while redirecting
  // ═══════════════════════════════════════════════════════════════════════════
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Redirecting to login...</p>
    </div>
  )
}
