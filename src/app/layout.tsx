/**
 * 🏠 ROOT LAYOUT
 * ==============
 * Main application layout with providers.
 */

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Business Onboarder - Shape Your Business Idea',
  description: 'AI-powered business idea onboarding. Define your idea, validate assumptions, and get actionable insights.',
  keywords: ['business', 'startup', 'onboarding', 'AI', 'validation'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {/* Startup banner in console */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('%c🚀 Business Onboarder v1.0.0', 'color: #14b8a6; font-size: 16px; font-weight: bold;');
              console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #14b8a6;');
              console.log('%c📚 Docs: Check the README', 'color: #6b7280;');
              console.log('%c🐛 Found a bug? Open an issue!', 'color: #6b7280;');
            `,
          }}
        />
        {children}
      </body>
    </html>
  )
}
