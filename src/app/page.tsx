/**
 * 🏠 LANDING PAGE
 * ===============
 * Main landing page with auth options.
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/lib/stores/authStore'
import { Rocket, Sparkles, Target, TrendingUp } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const { member, isInitialized, initialize } = useAuthStore()

  // Initialize auth on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Redirect if already logged in
  useEffect(() => {
    if (isInitialized && member) {
      router.push('/dashboard')
    }
  }, [isInitialized, member, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">
              Business Onboarder
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Business Clarity
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Shape Your Business Idea
            <span className="gradient-text"> in Minutes</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Stop staring at blank pages. Our AI guides you through defining your
            business idea, validating assumptions, and creating a clear path forward.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Start for Free
                <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                I have an account
              </Button>
            </Link>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Define Your Idea"
              description="Guided prompts and word banks help you articulate what you're building and why."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI Analysis"
              description="Get instant feedback on clarity, viability, and blind spots you might have missed."
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Actionable Insights"
              description="Walk away with a clear summary, strengths, risks, and concrete next steps."
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 text-sm">
        <p>Built with 💚 for founders and dreamers</p>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200">
      <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
