/**
 * 📦 Bucket Configuration
 *
 * Defines the structure and order of field buckets.
 * This mirrors the database but provides client-side defaults.
 *
 * Buckets are organized in tiers:
 * - Tier 1: Foundation (required basics)
 * - Tier 2: Identity (who you are)
 * - Tier 3: Vision (where you're going)
 */

import { FieldBucket } from '@/lib/types';

// ============================================
// 📦 Bucket Definitions
// ============================================

export const BUCKETS: Record<string, FieldBucket> = {
  basics: {
    id: 'basics',
    display_name: 'The Basics',
    description: 'Factual information about your business',
    display_order: 1,
    tier: 1,
    is_required: true,
    min_completion_percent: 50,
    icon: '🏢',
  },
  customers: {
    id: 'customers',
    display_name: 'Your Customers',
    description: 'Who you serve and what they need',
    display_order: 2,
    tier: 1,
    is_required: true,
    min_completion_percent: 50,
    icon: '👥',
  },
  values: {
    id: 'values',
    display_name: 'Values & Beliefs',
    description: 'What you stand for',
    display_order: 3,
    tier: 2,
    is_required: true,
    min_completion_percent: 40,
    icon: '💎',
  },
  voice: {
    id: 'voice',
    display_name: 'Brand Voice',
    description: 'How you sound and show up',
    display_order: 4,
    tier: 2,
    is_required: true,
    min_completion_percent: 40,
    icon: '🎤',
  },
  positioning: {
    id: 'positioning',
    display_name: 'Positioning',
    description: 'What makes you different',
    display_order: 5,
    tier: 2,
    is_required: true,
    min_completion_percent: 40,
    icon: '🎯',
  },
  vision: {
    id: 'vision',
    display_name: 'Vision',
    description: 'Where you are headed',
    display_order: 6,
    tier: 3,
    is_required: false,
    min_completion_percent: 30,
    icon: '🔮',
  },
};

// ============================================
// 📊 Helper Functions
// ============================================

/** Get buckets sorted by display order */
export function getBucketsSorted(): FieldBucket[] {
  return Object.values(BUCKETS).sort((a, b) => a.display_order - b.display_order);
}

/** Get required buckets only */
export function getRequiredBuckets(): FieldBucket[] {
  return getBucketsSorted().filter((b) => b.is_required);
}

/** Get buckets by tier */
export function getBucketsByTier(tier: number): FieldBucket[] {
  return getBucketsSorted().filter((b) => b.tier === tier);
}

/** Get the next bucket in sequence */
export function getNextBucket(currentBucketId: string): FieldBucket | null {
  const sorted = getBucketsSorted();
  const currentIndex = sorted.findIndex((b) => b.id === currentBucketId);
  if (currentIndex === -1 || currentIndex === sorted.length - 1) {
    return null;
  }
  return sorted[currentIndex + 1];
}

/** Get bucket by ID with fallback */
export function getBucket(bucketId: string): FieldBucket | undefined {
  return BUCKETS[bucketId];
}

// ============================================
// 🎨 Bucket Styling
// ============================================

/** Colors for each bucket (Tailwind classes) */
export const BUCKET_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  basics: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  customers: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  values: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  voice: {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
  },
  positioning: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  vision: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
};
