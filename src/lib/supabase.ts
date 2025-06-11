import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Session management utilities
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    // On server, we can't access localStorage
    // Session ID should be passed from client
    return ''
  }
  
  let sessionId = localStorage.getItem('demo_session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('demo_session_id', sessionId)
  }
  return sessionId
}

// Get or create session ID (client-side only)
export function ensureSessionId(): string {
  const sessionId = getSessionId()
  if (!sessionId) {
    throw new Error('Session ID not available on server. Pass it from client.')
  }
  return sessionId
}

export async function initializeSession() {
  const sessionId = getSessionId()
  
  try {
    // Create or update session in database
    const { data, error } = await supabase
      .from('sessions')
      .upsert({
        id: sessionId,
        last_activity: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', sessionId)
      .select()
      
    if (error) {
      console.error('Error initializing session:', error)
      // Don't throw - allow app to work even if session init fails
    }
  } catch (err) {
    console.error('Failed to initialize session:', err)
    // Don't throw - allow app to work even if session init fails
  }
  
  return sessionId
}

// Database types
export interface Document {
  id: string
  session_id: string
  filename: string
  content?: string
  file_size: number
  mime_type: string
  created_at: string
  updated_at: string
}

export interface DocumentChunk {
  id: string
  document_id: string
  session_id: string
  chunk_index: number
  content: string
  embedding?: number[]
  metadata?: Record<string, any>
  created_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: Record<string, any>
  created_at: string
}