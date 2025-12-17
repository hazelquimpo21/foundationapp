/**
 * 📝 LOGGER UTILITY
 * =================
 * Beautiful, informative console logging with emojis.
 * Makes debugging a joy and logs readable for non-devs too.
 *
 * Usage:
 *   import { log } from '@/lib/utils/logger'
 *   log.info('User logged in', { userId: '123' })
 *   log.success('Project saved!')
 *   log.error('Failed to save', error)
 */

type LogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error'

interface LogConfig {
  emoji: string
  color: string
  bgColor: string
}

const LOG_CONFIGS: Record<LogLevel, LogConfig> = {
  debug: { emoji: '🔍', color: '#6b7280', bgColor: '#f3f4f6' },
  info: { emoji: '💡', color: '#3b82f6', bgColor: '#eff6ff' },
  success: { emoji: '✅', color: '#10b981', bgColor: '#ecfdf5' },
  warn: { emoji: '⚠️', color: '#f59e0b', bgColor: '#fffbeb' },
  error: { emoji: '❌', color: '#ef4444', bgColor: '#fef2f2' },
}

/**
 * Format a timestamp for logging
 */
function getTimestamp(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * Check if we're in development mode
 */
function isDev(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if debug mode is enabled
 */
function isDebugEnabled(): boolean {
  return process.env.DEBUG_MODE === 'true' || isDev()
}

/**
 * Core logging function
 */
function logMessage(
  level: LogLevel,
  message: string,
  data?: unknown,
  error?: Error
): void {
  // Skip debug logs in production unless explicitly enabled
  if (level === 'debug' && !isDebugEnabled()) {
    return
  }

  const config = LOG_CONFIGS[level]
  const timestamp = getTimestamp()
  const prefix = `${config.emoji} [${timestamp}]`

  // Browser console styling
  if (typeof window !== 'undefined') {
    const style = `
      color: ${config.color};
      background: ${config.bgColor};
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
    `

    if (data) {
      console.groupCollapsed(`%c${prefix} ${message}`, style)
      console.log('📦 Data:', data)
      if (error) {
        console.error('🔥 Error:', error)
      }
      console.groupEnd()
    } else if (error) {
      console.error(`%c${prefix} ${message}`, style, error)
    } else {
      console.log(`%c${prefix} ${message}`, style)
    }
  }
  // Server-side logging (simpler format)
  else {
    const serverPrefix = `${config.emoji} [${level.toUpperCase()}] [${timestamp}]`

    if (error) {
      console.error(serverPrefix, message, data || '', error)
    } else if (data) {
      console.log(serverPrefix, message, JSON.stringify(data, null, 2))
    } else {
      console.log(serverPrefix, message)
    }
  }
}

/**
 * 🔍 Debug log - Only shows in development
 */
function debug(message: string, data?: unknown): void {
  logMessage('debug', message, data)
}

/**
 * 💡 Info log - General information
 */
function info(message: string, data?: unknown): void {
  logMessage('info', message, data)
}

/**
 * ✅ Success log - Operation completed successfully
 */
function success(message: string, data?: unknown): void {
  logMessage('success', message, data)
}

/**
 * ⚠️ Warning log - Something to watch
 */
function warn(message: string, data?: unknown): void {
  logMessage('warn', message, data)
}

/**
 * ❌ Error log - Something went wrong
 */
function error(message: string, err?: Error | unknown, data?: unknown): void {
  const errorObj = err instanceof Error ? err : undefined
  logMessage('error', message, data, errorObj)
}

/**
 * 🚀 App startup banner
 */
function startup(appName: string, version: string): void {
  if (typeof window !== 'undefined') {
    console.log(
      `%c
🚀 ${appName} v${version}
━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Environment: ${process.env.NODE_ENV}
⏰ Started: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━
`,
      'color: #14b8a6; font-family: monospace; font-size: 12px;'
    )
  } else {
    console.log(`
╔════════════════════════════════════════╗
║  🚀 ${appName} v${version}
║  🌐 Environment: ${process.env.NODE_ENV}
║  ⏰ Started: ${new Date().toLocaleString()}
╚════════════════════════════════════════╝
`)
  }
}

/**
 * 📊 Log API request (for debugging)
 */
function apiRequest(method: string, path: string, data?: unknown): void {
  debug(`📡 API ${method} ${path}`, data)
}

/**
 * 📊 Log API response (for debugging)
 */
function apiResponse(
  method: string,
  path: string,
  status: number,
  data?: unknown
): void {
  if (status >= 400) {
    error(`📡 API ${method} ${path} → ${status}`, undefined, data)
  } else {
    debug(`📡 API ${method} ${path} → ${status}`, data)
  }
}

/**
 * ⏱️ Time an operation
 */
function time(label: string): () => void {
  const start = performance.now()
  return () => {
    const duration = Math.round(performance.now() - start)
    debug(`⏱️ ${label} took ${duration}ms`)
  }
}

/**
 * Export the logger object
 */
export const log = {
  debug,
  info,
  success,
  warn,
  error,
  startup,
  apiRequest,
  apiResponse,
  time,
}

// Also export individual functions for convenience
export { debug, info, success, warn, error, startup, time }
