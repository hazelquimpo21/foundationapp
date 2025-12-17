/**
 * 🎨 CLASS NAME UTILITY
 * =====================
 * Combines clsx and tailwind-merge for clean conditional class names.
 *
 * Usage:
 *   import { cn } from '@/lib/utils/cn'
 *   <div className={cn('base-class', isActive && 'active-class', className)} />
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names with Tailwind conflict resolution
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
