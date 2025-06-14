import { NextRequest, NextResponse } from 'next/server'
import { searchDocuments } from '@/lib/document-processor'
import { generateChatResponse } from '@/lib/groq'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get session ID from header
    const sessionId = request.headers.get('x-session-id')
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }
    
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }
    
    // Save user message
    await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message
      })
    
    // Search for relevant document chunks
    console.log('Searching for chunks with sessionId:', sessionId)
    const relevantChunks = await searchDocuments(message, sessionId, 5)
    console.log('Found chunks:', relevantChunks.length)
    
    if (relevantChunks.length === 0) {
      const noDocsMessage = "I don't have any documents to search through yet. Please upload a document first, and then I'll be happy to answer questions about it!"
      
      // Save assistant response
      await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          role: 'assistant',
          content: noDocsMessage
        })
      
      return NextResponse.json({ 
        response: noDocsMessage,
        sources: []
      })
    }
    
    // Generate response using Groq
    console.log('Generating response with Groq...')
    const response = await generateChatResponse({
      query: message,
      relevantChunks
    })
    console.log('Generated response:', response.substring(0, 100) + '...')
    
    // Save assistant response
    await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: response,
        metadata: {
          sources: relevantChunks.map(chunk => ({
            content: chunk.content.substring(0, 100) + '...',
            similarity: chunk.similarity
          }))
        }
      })
    
    return NextResponse.json({ 
      response,
      sources: relevantChunks
    })
  } catch (error) {
    console.error('Error in chat:', error)
    
    // Check if it's a Groq API error
    if (error instanceof Error && error.message.includes('GROQ_API_KEY')) {
      return NextResponse.json({
        response: "The AI chat service is not configured. Please add your GROQ_API_KEY to use the chat feature. For now, here are the relevant sections from your document that might help answer your question.",
        sources: []
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get session ID from header
    const sessionId = request.headers.get('x-session-id')
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json({ messages: data || [] })
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
}