/**
 * 📝 SIGNUP PAGE
 * ==============
 * New user registration page.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/lib/stores/authStore'
import { Rocket, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const { member, isLoading, error, signUp, clearError, initialize } = useAuthStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')

  // Initialize auth
  useEffect(() => {
    initialize()
  }, [initialize])

  // Redirect if already logged in
  useEffect(() => {
    if (member) {
      router.push('/dashboard')
    }
  }, [member, router])

  // Clear errors on input change
  useEffect(() => {
    if (error) clearError()
    if (localError) setLocalError('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, email, password, confirmPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords match
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    const result = await signUp(email, password, name)
    if (result.success) {
      router.push('/dashboard')
    }
  }

  const displayError = error || localError

  // Password strength indicator
  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthColors = ['bg-gray-200', 'bg-error', 'bg-warning', 'bg-success']
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong']

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Rocket className="w-8 h-8 text-primary-500" />
        <span className="text-xl font-bold text-gray-900">Business Onboarder</span>
      </Link>

      {/* Signup Card */}
      <Card className="w-full max-w-md" padding="lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500">Start shaping your business idea</p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {displayError}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name (optional)"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            disabled={isLoading}
          />

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

          <div>
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
            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthColors[passwordStrength]}`}
                    style={{ width: `${(passwordStrength / 3) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{strengthLabels[passwordStrength]}</span>
              </div>
            )}
          </div>

          <div>
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
              disabled={isLoading}
            />
            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <div className="mt-1 flex items-center gap-1 text-xs">
                {password === confirmPassword ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                    <span className="text-success">Passwords match</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-error" />
                    <span className="text-error">Passwords don&apos;t match</span>
                  </>
                )}
              </div>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={!email || !password || !confirmPassword}
          >
            Create Account
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

        {/* Login Link */}
        <p className="text-center text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in
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
