import { supabase, getSessionId, Document, DocumentChunk } from './supabase'
import { parseDocument, validateFile } from './document-parser'
import { chunkText, generateEmbedding } from './embeddings'
import { nanoid } from 'nanoid'

export interface ProcessingProgress {
  stage: 'uploading' | 'parsing' | 'chunking' | 'embedding' | 'complete' | 'error'
  progress: number
  message: string
}

export async function processDocument(
  file: File,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<Document> {
  const sessionId = getSessionId()
  
  try {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }
    
    // Step 1: Upload file metadata to database
    onProgress?.({ stage: 'uploading', progress: 10, message: 'Uploading document...' })
    
    const document: Partial<Document> = {
      session_id: sessionId,
      filename: file.name,
      file_size: file.size,
      mime_type: file.type
    }
    
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single()
    
    if (docError) throw docError
    
    // Step 2: Parse document
    onProgress?.({ stage: 'parsing', progress: 30, message: 'Extracting text...' })
    const parsed = await parseDocument(file)
    
    // Update document with content
    await supabase
      .from('documents')
      .update({ content: parsed.text })
      .eq('id', doc.id)
    
    // Step 3: Chunk document
    onProgress?.({ stage: 'chunking', progress: 50, message: 'Splitting into chunks...' })
    const chunks = chunkText(parsed.text, 800) // Smaller chunks for better context
    
    // Step 4: Generate embeddings and store chunks
    onProgress?.({ stage: 'embedding', progress: 60, message: 'Generating embeddings...' })
    
    const chunkPromises = chunks.map(async (chunkText, index) => {
      const embedding = await generateEmbedding(chunkText)
      
      const chunk: Partial<DocumentChunk> = {
        document_id: doc.id,
        session_id: sessionId,
        chunk_index: index,
        content: chunkText,
        embedding: embedding as any, // Supabase will handle the vector type
        metadata: {
          filename: file.name,
          chunk_index: index,
          total_chunks: chunks.length
        }
      }
      
      return supabase
        .from('document_chunks')
        .insert(chunk)
        .select()
        .single()
    })
    
    // Process in batches to avoid overwhelming
    const batchSize = 5
    for (let i = 0; i < chunkPromises.length; i += batchSize) {
      const batch = chunkPromises.slice(i, i + batchSize)
      await Promise.all(batch)
      
      const progress = 60 + (40 * (i + batchSize) / chunkPromises.length)
      onProgress?.({ 
        stage: 'embedding', 
        progress: Math.min(progress, 95), 
        message: `Processing chunk ${Math.min(i + batchSize, chunks.length)} of ${chunks.length}...` 
      })
    }
    
    onProgress?.({ stage: 'complete', progress: 100, message: 'Document processed successfully!' })
    
    return doc
  } catch (error) {
    console.error('Error processing document:', error)
    onProgress?.({ 
      stage: 'error', 
      progress: 0, 
      message: error instanceof Error ? error.message : 'Failed to process document' 
    })
    throw error
  }
}

export async function getDocuments(): Promise<Document[]> {
  const sessionId = getSessionId()
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function deleteDocument(documentId: string): Promise<void> {
  const sessionId = getSessionId()
  
  // Chunks will be deleted automatically due to CASCADE
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('session_id', sessionId)
  
  if (error) throw error
}

export async function searchDocuments(
  query: string,
  limit: number = 5
): Promise<Array<{ content: string; similarity: number; metadata: any }>> {
  const sessionId = getSessionId()
  
  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query)
  
  // Search using Supabase function
  const { data, error } = await supabase.rpc('search_document_chunks', {
    query_embedding: queryEmbedding,
    query_session_id: sessionId,
    match_threshold: 0.7,
    match_count: limit
  })
  
  if (error) throw error
  
  return data.map((result: any) => ({
    content: result.content,
    similarity: result.similarity,
    metadata: result.metadata
  }))
}