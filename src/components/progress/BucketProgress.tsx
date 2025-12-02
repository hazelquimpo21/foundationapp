/**
 * 📊 Bucket Progress Component
 *
 * Shows progress for a single bucket with a visual bar.
 */

'use client';

import { motion } from 'framer-motion';
import { cn, getProgressBarColor } from '@/lib/utils';
import { BucketProgress as BucketProgressType } from '@/lib/types';
import { Check, Lock } from 'lucide-react';

// ============================================
// 📦 Props
// ============================================

interface BucketProgressProps {
  bucket: BucketProgressType;
  isActive?: boolean;
  onClick?: () => void;
}

// ============================================
// 🎨 Component
// ============================================

export function BucketProgress({ bucket, isActive, onClick }: BucketProgressProps) {
  const {
    bucketName,
    icon,
    completionPercent,
    fieldsCompleted,
    fieldsTotal,
    meetsMinimum,
    isRequired,
  } = bucket;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'w-full text-left p-3 rounded-xl transition-all',
        isActive
          ? 'bg-primary-50 border-2 border-primary-200'
          : 'bg-white border border-gray-100 hover:border-gray-200'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center text-lg',
            isActive ? 'bg-primary-100' : 'bg-gray-50'
          )}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name and status */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                'font-medium truncate',
                isActive ? 'text-primary-700' : 'text-gray-800'
              )}
            >
              {bucketName}
            </span>

            {/* Status indicator */}
            {meetsMinimum ? (
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-success-100 text-success-600 flex items-center justify-center">
                <Check className="w-3 h-3" />
              </span>
            ) : !isRequired ? (
              <span className="flex-shrink-0 text-xs text-gray-400">Optional</span>
            ) : null}
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', getProgressBarColor(completionPercent))}
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Field count */}
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{fieldsCompleted} of {fieldsTotal} fields</span>
            <span>{completionPercent}%</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ============================================
// 📊 Mini Progress (for compact views)
// ============================================

interface MiniProgressProps {
  bucket: BucketProgressType;
}

export function MiniProgress({ bucket }: MiniProgressProps) {
  const { bucketName, icon, completionPercent, meetsMinimum } = bucket;

  return (
    <div className="flex items-center gap-2">
      <span>{icon}</span>
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', getProgressBarColor(completionPercent))}
          style={{ width: `${completionPercent}%` }}
        />
      </div>
      {meetsMinimum && <Check className="w-3 h-3 text-success-500" />}
    </div>
  );
}
