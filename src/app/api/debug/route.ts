import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const sessionId = request.headers.get('x-session-id')
  
  if (!sessionId) {
    return NextResponse.json({ error: 'No session ID' })
  }
  
  // Get documents
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('session_id', sessionId)
  
  // Get chunks
  const { data: chunks } = await supabase
    .from('document_chunks')
    .select('*')
    .eq('session_id', sessionId)
    .limit(5)
  
  // Get messages
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(5)
  
  return NextResponse.json({
    sessionId,
    documents: documents?.length || 0,
    chunks: chunks?.length || 0,
    messages: messages || [],
    timestamp: new Date().toISOString()
  })
}