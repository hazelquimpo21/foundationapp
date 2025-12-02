/**
 * 🏠 Root Layout
 *
 * The root layout for the entire application.
 * Sets up fonts, metadata, and global providers.
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// ============================================
// 🔤 Font Configuration
// ============================================

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// ============================================
// 📋 Metadata
// ============================================

export const metadata: Metadata = {
  title: 'Business Onboarder | Build Your Brand Foundation',
  description:
    'A conversational AI app that helps founders articulate their brand foundation through natural dialogue.',
  keywords: [
    'brand',
    'branding',
    'startup',
    'founder',
    'business',
    'AI',
    'onboarding',
    'positioning',
    'values',
  ],
  authors: [{ name: 'Foundation' }],
  openGraph: {
    title: 'Business Onboarder',
    description: 'Build your brand foundation through conversation',
    type: 'website',
  },
};

// ============================================
// 🎨 Layout Component
// ============================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans min-h-screen bg-gray-50">
        {/* Main Content */}
        {children}
      </body>
    </html>
  );
}
