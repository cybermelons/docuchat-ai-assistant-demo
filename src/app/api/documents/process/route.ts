import { NextRequest, NextResponse } from 'next/server'
import { supabase, getSessionId } from '@/lib/supabase'
import { parseDocument, validateFile } from '@/lib/document-parser'
import { chunkText } from '@/lib/embeddings'

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionId()
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    // Parse document
    const parsed = await parseDocument(file)
    
    // Create document record
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert({
        session_id: sessionId,
        filename: file.name,
        content: parsed.text,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single()
    
    if (docError) throw docError
    
    // Create chunks (without embeddings - those will be generated client-side)
    const chunks = chunkText(parsed.text, 800)
    const chunkData = chunks.map((content, index) => ({
      document_id: doc.id,
      session_id: sessionId,
      chunk_index: index,
      content: content,
      metadata: {
        filename: file.name,
        chunk_index: index,
        total_chunks: chunks.length
      }
    }))
    
    const { error: chunksError } = await supabase
      .from('document_chunks')
      .insert(chunkData)
    
    if (chunksError) throw chunksError
    
    return NextResponse.json({ 
      document: doc,
      chunks: chunks.length 
    })
  } catch (error) {
    console.error('Error processing document:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process document',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}