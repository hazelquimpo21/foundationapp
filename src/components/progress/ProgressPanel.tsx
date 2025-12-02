/**
 * 📊 Progress Panel Component
 *
 * Sidebar showing overall progress across all buckets.
 * Displays during conversation to show what's been covered.
 */

'use client';

import { useFoundationStore, useOverallProgress, useIsFoundationReady } from '@/store';
import { BucketProgress } from './BucketProgress';
import { cn } from '@/lib/utils';
import { Check, ChevronRight } from 'lucide-react';

// ============================================
// 📦 Props
// ============================================

interface ProgressPanelProps {
  currentBucket?: string;
  onBucketClick?: (bucketId: string) => void;
  className?: string;
}

// ============================================
// 🎨 Component
// ============================================

export function ProgressPanel({
  currentBucket,
  onBucketClick,
  className,
}: ProgressPanelProps) {
  const bucketProgress = useFoundationStore((s) => s.bucketProgress);
  const overallProgress = useOverallProgress();
  const isReady = useIsFoundationReady();

  // Group by tier
  const tier1 = bucketProgress.filter((b) => b.tier === 1);
  const tier2 = bucketProgress.filter((b) => b.tier === 2);
  const tier3 = bucketProgress.filter((b) => b.tier === 3);

  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 p-4', className)}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800">Your Foundation</h3>
        <p className="text-sm text-gray-500 mt-1">
          {isReady ? '🎉 Ready to generate outputs!' : 'Building your brand...'}
        </p>
      </div>

      {/* Overall progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-medium text-primary-600">{overallProgress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Buckets by tier */}
      <div className="space-y-4">
        {/* Tier 1: Foundation */}
        <BucketTierSection
          title="Foundation"
          buckets={tier1}
          currentBucket={currentBucket}
          onBucketClick={onBucketClick}
        />

        {/* Tier 2: Identity */}
        <BucketTierSection
          title="Identity"
          buckets={tier2}
          currentBucket={currentBucket}
          onBucketClick={onBucketClick}
        />

        {/* Tier 3: Vision (if any) */}
        {tier3.length > 0 && (
          <BucketTierSection
            title="Vision"
            buckets={tier3}
            currentBucket={currentBucket}
            onBucketClick={onBucketClick}
            isOptional
          />
        )}
      </div>

      {/* Action button when ready */}
      {isReady && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            className={cn(
              'w-full flex items-center justify-center gap-2',
              'px-4 py-3 rounded-xl font-medium transition-all',
              'bg-gradient-to-r from-primary-500 to-primary-600 text-white',
              'hover:from-primary-600 hover:to-primary-700 active:scale-98'
            )}
          >
            View Dashboard
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// 📁 Tier Section
// ============================================

interface BucketTierSectionProps {
  title: string;
  buckets: Array<{
    bucketId: string;
    bucketName: string;
    icon: string;
    tier: number;
    isRequired: boolean;
    completionPercent: number;
    fieldsCompleted: number;
    fieldsTotal: number;
    meetsMinimum: boolean;
  }>;
  currentBucket?: string;
  onBucketClick?: (bucketId: string) => void;
  isOptional?: boolean;
}

function BucketTierSection({
  title,
  buckets,
  currentBucket,
  onBucketClick,
  isOptional,
}: BucketTierSectionProps) {
  if (buckets.length === 0) return null;

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-2 flex items-center gap-2">
        {title}
        {isOptional && (
          <span className="text-gray-300">(optional)</span>
        )}
      </p>
      <div className="space-y-2">
        {buckets.map((bucket) => (
          <BucketProgress
            key={bucket.bucketId}
            bucket={bucket}
            isActive={bucket.bucketId === currentBucket}
            onClick={() => onBucketClick?.(bucket.bucketId)}
          />
        ))}
      </div>
    </div>
  );
}
