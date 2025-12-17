/**
 * ⚡ ASYNC UTILITIES
 * ==================
 * Safe async operation helpers with timeout and retry.
 * Makes database calls resilient and user-friendly.
 *
 * Usage:
 *   import { withTimeout, withRetry, safeAsync } from '@/lib/utils/async'
 *
 *   // Simple timeout
 *   await withTimeout(fetchData(), 5000)
 *
 *   // With retry
 *   await withRetry(() => saveData(), { maxAttempts: 3 })
 *
 *   // Safe async (no throw, returns result object)
 *   const { data, error } = await safeAsync(fetchData())
 */

import { log } from './logger'

// ============================================
// 📋 TYPES
// ============================================

/**
 * Result type for safe async operations
 * Similar to Go's error handling - explicit success/error
 */
export interface AsyncResult<T> {
  data: T | null
  error: Error | null
  success: boolean
}

/**
 * Retry configuration options
 */
export interface RetryOptions {
  /** Max number of attempts (default: 3) */
  maxAttempts?: number
  /** Initial delay in ms (default: 1000) */
  initialDelay?: number
  /** Multiply delay by this factor each retry (default: 2) */
  backoffFactor?: number
  /** Function to determine if error is retryable (default: all errors) */
  isRetryable?: (error: Error) => boolean
  /** Called on each retry attempt */
  onRetry?: (attempt: number, error: Error) => void
}

// ============================================
// ⏱️ TIMEOUT WRAPPER
// ============================================

/**
 * ⏱️ Wrap a promise with a timeout
 *
 * If the promise doesn't resolve within the timeout,
 * rejects with a TimeoutError.
 *
 * @example
 *   await withTimeout(fetch('/api'), 5000, 'API call')
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName = 'Operation'
): Promise<T> {
  return new Promise((resolve, reject) => {
    // Set up the timeout
    const timeoutId = setTimeout(() => {
      reject(new Error(`⏱️ ${operationName} timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    // Race the promise against the timeout
    promise
      .then((result) => {
        clearTimeout(timeoutId)
        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}

// ============================================
// 🔄 RETRY WRAPPER
// ============================================

/**
 * 🔄 Retry an async operation with exponential backoff
 *
 * @example
 *   const result = await withRetry(
 *     () => saveToDatabase(data),
 *     {
 *       maxAttempts: 3,
 *       initialDelay: 1000,
 *       onRetry: (attempt, err) => log.warn(`Retry ${attempt}`, err)
 *     }
 *   )
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    backoffFactor = 2,
    isRetryable = () => true,
    onRetry,
  } = options

  let lastError: Error = new Error('Unknown error')
  let delay = initialDelay

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      // Check if we should retry
      if (attempt < maxAttempts && isRetryable(lastError)) {
        onRetry?.(attempt, lastError)
        log.warn(`🔄 Retry ${attempt}/${maxAttempts} after ${delay}ms`, {
          error: lastError.message,
        })

        // Wait before retrying
        await sleep(delay)
        delay *= backoffFactor
      }
    }
  }

  throw lastError
}

// ============================================
// 🛡️ SAFE ASYNC WRAPPER
// ============================================

/**
 * 🛡️ Wrap an async operation to never throw
 *
 * Returns a result object with data, error, and success boolean.
 * Useful when you want to handle errors inline without try/catch.
 *
 * @example
 *   const { data, error, success } = await safeAsync(fetchUser(id))
 *   if (!success) {
 *     showError(error.message)
 *     return
 *   }
 *   setUser(data)
 */
export async function safeAsync<T>(
  promise: Promise<T>
): Promise<AsyncResult<T>> {
  try {
    const data = await promise
    return { data, error: null, success: true }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    return { data: null, error, success: false }
  }
}

// ============================================
// 🎯 COMBINED HELPERS
// ============================================

/**
 * 🎯 Safe async with timeout - the safest option!
 *
 * Combines timeout protection with safe error handling.
 * Never throws, never hangs forever.
 *
 * @example
 *   const { data, error, success } = await safeFetch(
 *     fetch('/api/data'),
 *     5000,
 *     'Load user data'
 *   )
 */
export async function safeFetch<T>(
  promise: Promise<T>,
  timeoutMs = 10000,
  operationName = 'Operation'
): Promise<AsyncResult<T>> {
  return safeAsync(withTimeout(promise, timeoutMs, operationName))
}

/**
 * 🚀 Execute with timeout and retry - for critical operations
 *
 * @example
 *   const result = await resilientFetch(
 *     () => saveProject(data),
 *     { timeout: 5000, maxAttempts: 3 }
 *   )
 */
export async function resilientFetch<T>(
  operation: () => Promise<T>,
  options: {
    timeout?: number
    operationName?: string
  } & RetryOptions = {}
): Promise<T> {
  const { timeout = 10000, operationName = 'Operation', ...retryOptions } = options

  return withRetry(
    () => withTimeout(operation(), timeout, operationName),
    retryOptions
  )
}

// ============================================
// 🛠️ UTILITY HELPERS
// ============================================

/**
 * 💤 Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 🎲 Check if an error is a network error (worth retrying)
 */
export function isNetworkError(error: Error): boolean {
  const networkPatterns = [
    'network',
    'timeout',
    'fetch',
    'connection',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
  ]

  const message = error.message.toLowerCase()
  return networkPatterns.some((pattern) => message.includes(pattern.toLowerCase()))
}

/**
 * 🔌 Check if an error is a Supabase/database error
 */
export function isSupabaseError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  return 'code' in error || 'message' in error
}
