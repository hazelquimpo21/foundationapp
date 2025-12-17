/**
 * 🗄️ SUPABASE INDEX
 * ==================
 * Central export point for Supabase clients.
 */

export { supabase, createClient } from './client'
export { createServerClient, createAdminClient } from './server'
export { updateSession } from './middleware'
