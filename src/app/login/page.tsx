/**
 * 🔐 LOGIN PAGE - Magic Link Authentication
 * ==========================================
 * Passwordless authentication using Supabase magic links.
 * 
 * Flow:
 *   1. User enters email address
 *   2. We send a magic link via Supabase OTP
 *   3. User clicks link in email → /auth/callback handles session
 *   4. User is redirected to dashboard (or original destination)
 * 
 * This handles both new signups and returning users - the callback
 * will create a member profile if one doesn't exist.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/lib/stores/authStore'
import { Rocket, Mail, AlertCircle, CheckCircle, ArrowLeft, Sparkles } from 'lucide-react'

/* ─────────────────────────────────────────────────────────────────────────────
 * 🎨 LOGIN PAGE COMPONENT
 * ───────────────────────────────────────────────────────────────────────────── */

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Preserve redirect destination for after login
  const redirect = searchParams.get('redirect') || '/dashboard'
  
  // Check for error from callback (e.g., expired magic link)
  const callbackError = searchParams.get('error_description') || searchParams.get('error')

  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 STATE & STORE
  // ═══════════════════════════════════════════════════════════════════════════
  const { 
    member, 
    isLoading, 
    error, 
    magicLinkSent,
    signInWithMagicLink, 
    clearError, 
    resetMagicLinkSent,
    initialize 
  } = useAuthStore()

  const [email, setEmail] = useState('')
  
  // Combine store error with callback error
  const displayError = error || callbackError

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔄 EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  // Initialize auth state on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Redirect if already logged in
  useEffect(() => {
    if (member) {
      router.push(redirect)
    }
  }, [member, router, redirect])

  // Clear error when email changes
  useEffect(() => {
    if (error) clearError()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎬 HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Handle magic link request submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signInWithMagicLink(email)
  }

  /**
   * Allow user to try different email
   */
  const handleTryAgain = () => {
    resetMagicLinkSent()
    setEmail('')
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* ─────────────────────────────────────────────────────────────────────
       * Logo Header
       * ───────────────────────────────────────────────────────────────────── */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Rocket className="w-8 h-8 text-primary-500" />
        <span className="text-xl font-bold text-gray-900">Business Onboarder</span>
      </Link>

      {/* ─────────────────────────────────────────────────────────────────────
       * Main Login Card
       * ───────────────────────────────────────────────────────────────────── */}
      <Card className="w-full max-w-md" padding="lg">
        
        {/* ═══════════════════════════════════════════════════════════════════
         * 📧 SUCCESS STATE: Magic link sent - check inbox
         * ═══════════════════════════════════════════════════════════════════ */}
        {magicLinkSent ? (
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            
            {/* Success Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Check your inbox
            </h1>
            <p className="text-gray-500 mb-6">
              We sent a login link to{' '}
              <span className="font-medium text-gray-700">{email}</span>
            </p>
            
            {/* Instructions */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600">
                <span className="font-medium">📬 Next steps:</span>
              </p>
              <ol className="text-sm text-gray-500 mt-2 space-y-1 list-decimal list-inside">
                <li>Open your email inbox</li>
                <li>Click the login link we sent</li>
                <li>You&apos;ll be signed in automatically</li>
              </ol>
            </div>
            
            {/* Try Again Button */}
            <Button
              variant="outline"
              fullWidth
              onClick={handleTryAgain}
            >
              <ArrowLeft className="w-4 h-4" />
              Use a different email
            </Button>
            
            {/* Didn't receive hint */}
            <p className="text-xs text-gray-400 mt-4">
              Didn&apos;t receive it? Check your spam folder or try again.
            </p>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════
           * 📝 INPUT STATE: Email form
           * ═══════════════════════════════════════════════════════════════════ */
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome
              </h1>
              <p className="text-gray-500">
                Enter your email to sign in or create an account
              </p>
            </div>

            {/* Error Message (from store or callback redirect) */}
            {displayError && (
              <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {displayError}
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
                disabled={isLoading}
                autoFocus
              />

              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                disabled={!email}
              >
                {!isLoading && <Sparkles className="w-4 h-4" />}
                {isLoading ? 'Sending link...' : 'Send magic link'}
              </Button>
            </form>

            {/* Info Note */}
            <p className="text-xs text-gray-400 text-center mt-4">
              No password needed! We&apos;ll email you a secure login link.
            </p>
          </>
        )}
      </Card>

      {/* ─────────────────────────────────────────────────────────────────────
       * Back to Home Link
       * ───────────────────────────────────────────────────────────────────── */}
      <Link
        href="/"
        className="mt-6 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back to home
      </Link>
    </div>
  )
}
