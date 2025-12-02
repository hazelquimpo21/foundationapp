/**
 * 🛠️ Utility Functions
 *
 * Shared helper functions used throughout the app.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================
// 🎨 Styling Utilities
// ============================================

/**
 * Merge Tailwind classes intelligently.
 * Combines clsx for conditional classes with tailwind-merge
 * to handle conflicting utilities.
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// 📅 Date Utilities
// ============================================

/**
 * Format a date for display.
 *
 * @example
 * formatDate(new Date()) // "Today at 3:45 PM"
 * formatDate(yesterday) // "Yesterday at 10:30 AM"
 * formatDate(lastWeek) // "Dec 15 at 2:00 PM"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  const timeStr = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (diffDays === 0) {
    return `Today at ${timeStr}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${timeStr}`;
  } else if (diffDays < 7) {
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    return `${dayName} at ${timeStr}`;
  } else {
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${dateStr} at ${timeStr}`;
  }
}

/**
 * Format relative time (e.g., "2 minutes ago").
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(d);
}

// ============================================
// 📊 Progress Utilities
// ============================================

/**
 * Calculate completion percentage.
 *
 * @example
 * calculatePercent(3, 10) // 30
 */
export function calculatePercent(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Get progress color based on percentage.
 */
export function getProgressColor(percent: number): string {
  if (percent >= 80) return 'text-success-600';
  if (percent >= 50) return 'text-amber-600';
  if (percent >= 20) return 'text-orange-600';
  return 'text-gray-400';
}

/**
 * Get progress bar color based on percentage.
 */
export function getProgressBarColor(percent: number): string {
  if (percent >= 80) return 'bg-success-500';
  if (percent >= 50) return 'bg-amber-500';
  if (percent >= 20) return 'bg-orange-500';
  return 'bg-gray-300';
}

// ============================================
// 🔤 String Utilities
// ============================================

/**
 * Truncate text with ellipsis.
 *
 * @example
 * truncate("Hello world", 5) // "Hello..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Capitalize first letter.
 *
 * @example
 * capitalize("hello") // "Hello"
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert snake_case to Title Case.
 *
 * @example
 * snakeToTitle("customer_pain_deep") // "Customer Pain Deep"
 */
export function snakeToTitle(text: string): string {
  return text
    .split('_')
    .map(capitalize)
    .join(' ');
}

/**
 * Generate a random ID.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// ============================================
// 🔍 Validation Utilities
// ============================================

/**
 * Check if a value is empty (null, undefined, empty string, empty array).
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Check if a string is a valid email.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// 🎯 Array Utilities
// ============================================

/**
 * Chunk an array into smaller arrays.
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Get unique values from an array.
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// ============================================
// 📝 Logging Utilities
// ============================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_COLORS = {
  debug: '\x1b[90m', // gray
  info: '\x1b[36m',  // cyan
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
} as const;

const LOG_ICONS = {
  debug: '🔍',
  info: '💡',
  warn: '⚠️',
  error: '❌',
} as const;

/**
 * Create a formatted log message.
 *
 * @example
 * log.info('User logged in', { userId: '123' })
 * // 💡 [INFO] User logged in { userId: '123' }
 */
export const log = {
  debug: (message: string, data?: unknown) => logMessage('debug', message, data),
  info: (message: string, data?: unknown) => logMessage('info', message, data),
  warn: (message: string, data?: unknown) => logMessage('warn', message, data),
  error: (message: string, data?: unknown) => logMessage('error', message, data),
};

function logMessage(level: LogLevel, message: string, data?: unknown) {
  const icon = LOG_ICONS[level];
  const timestamp = new Date().toISOString();
  const prefix = `${icon} [${level.toUpperCase()}]`;

  if (process.env.NODE_ENV === 'development' || level === 'error') {
    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }
}

// ============================================
// ⏱️ Async Utilities
// ============================================

/**
 * Wait for a specified duration.
 *
 * @example
 * await sleep(1000) // wait 1 second
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff.
 *
 * @example
 * await retry(() => fetchData(), { maxAttempts: 3 })
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; initialDelay?: number } = {}
): Promise<T> {
  const { maxAttempts = 3, initialDelay = 1000 } = options;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        log.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, { error: lastError.message });
        await sleep(delay);
      }
    }
  }

  throw lastError;
}
