import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Session management utilities
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = localStorage.getItem('demo_session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('demo_session_id', sessionId)
  }
  return sessionId
}

export async function initializeSession() {
  const sessionId = getSessionId()
  
  // Create or update session in database
  const { error } = await supabase
    .from('sessions')
    .upsert({
      id: sessionId,
      last_activity: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
    .eq('id', sessionId)
    
  if (error) {
    console.error('Error initializing session:', error)
  }
  
  // Set session ID for RLS policies
  await supabase.rpc('set_config', {
    setting: 'app.current_session_id',
    value: sessionId
  })
  
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