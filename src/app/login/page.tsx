/**
 * 🔐 LOGIN PAGE
 * =============
 * User authentication page.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/lib/stores/authStore'
import { Rocket, Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const { member, isLoading, error, signIn, clearError, initialize } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Initialize auth
  useEffect(() => {
    initialize()
  }, [initialize])

  // Redirect if already logged in
  useEffect(() => {
    if (member) {
      router.push(redirect)
    }
  }, [member, router, redirect])

  // Clear error on input change
  useEffect(() => {
    if (error) clearError()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await signIn(email, password)
    if (result.success) {
      router.push(redirect)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Rocket className="w-8 h-8 text-primary-500" />
        <span className="text-xl font-bold text-gray-900">Business Onboarder</span>
      </Link>

      {/* Login Card */}
      <Card className="w-full max-w-md" padding="lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500">Sign in to continue building</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
            disabled={isLoading}
          />

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={!email || !password}
          >
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign up
          </Link>
        </p>
      </Card>

      {/* Back to home */}
      <Link
        href="/"
        className="mt-6 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back to home
      </Link>
    </div>
  )
}
