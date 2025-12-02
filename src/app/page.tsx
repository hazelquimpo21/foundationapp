/**
 * 🏠 Welcome Page
 *
 * Landing page where users start their onboarding journey.
 * Simple, focused entry point with clear CTA.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Loader2, Check } from 'lucide-react';
import { cn, log } from '@/lib/utils';

// ============================================
// 🎨 Page Component
// ============================================

export default function WelcomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState<string | null>(null);

  /**
   * Start a new onboarding session.
   */
  const handleStart = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    log.info('🚀 Starting new session', { businessName });

    try {
      // Create session via API
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim() || 'My Business',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      log.info('✅ Session created', { sessionId: data.session.id });

      // Navigate to chat
      router.push(`/chat/${data.session.id}`);
    } catch (err) {
      log.error('❌ Failed to start session', { error: err });
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50 -z-10" />

      {/* Content */}
      <div className="max-w-lg w-full text-center animate-in">
        {/* Logo/Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
          <Sparkles className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Build Your Brand Foundation
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 mb-8">
          Through a simple conversation, we'll help you articulate who you are,
          who you serve, and what makes you different.
        </p>

        {/* What you'll get */}
        <div className="text-left bg-white rounded-2xl border border-gray-100 p-5 mb-8 shadow-sm">
          <p className="text-sm font-medium text-gray-800 mb-3">
            In ~15 minutes, you'll have clarity on:
          </p>
          <ul className="space-y-2">
            {[
              'Your ideal customer and their real pain',
              'What you stand for (values & voice)',
              'What makes you genuinely different',
              'One-liners and positioning statements',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Business name input (optional) */}
        <div className="mb-6">
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Your business name (optional)"
            className={cn(
              'w-full px-5 py-4 rounded-xl text-center',
              'border-2 border-gray-200 bg-white',
              'text-gray-800 placeholder:text-gray-400',
              'focus:outline-none focus:border-primary-500',
              'transition-all duration-200'
            )}
            disabled={isLoading}
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600 mb-4">
            {error}
          </p>
        )}

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={isLoading}
          className={cn(
            'w-full flex items-center justify-center gap-3',
            'px-6 py-4 rounded-xl font-semibold text-lg',
            'bg-gradient-to-r from-primary-500 to-primary-600 text-white',
            'hover:from-primary-600 hover:to-primary-700',
            'active:scale-[0.98] transition-all duration-200',
            'shadow-lg shadow-primary-500/30',
            'disabled:opacity-70 disabled:cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Getting ready...
            </>
          ) : (
            <>
              Let's Begin
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Footer note */}
        <p className="mt-6 text-sm text-gray-400">
          No account needed. Your data stays private.
        </p>
      </div>
    </main>
  );
}
