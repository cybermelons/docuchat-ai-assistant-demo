import { supabase, Document, DocumentChunk } from './supabase'
import { parseDocument, validateFile } from './document-parser'
import { chunkText } from './embeddings'

export interface ProcessingProgress {
  stage: 'uploading' | 'parsing' | 'chunking' | 'embedding' | 'complete' | 'error'
  progress: number
  message: string
}

export async function processDocument(
  file: File,
  sessionId: string,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<Document> {
  
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
      const chunk: Partial<DocumentChunk> = {
        document_id: doc.id,
        session_id: sessionId,
        chunk_index: index,
        content: chunkText,
        // Embedding will be generated client-side
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

export async function getDocuments(sessionId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function deleteDocument(documentId: string, sessionId: string): Promise<void> {
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
  sessionId: string,
  limit: number = 5
): Promise<Array<{ content: string; similarity: number; metadata: any }>> {
  // For now, let's get all chunks since we don't have embeddings yet
  // In production, this would use vector similarity search
  const { data: chunks, error } = await supabase
    .from('document_chunks')
    .select('*')
    .eq('session_id', sessionId)
    .limit(limit)
  
  if (error) throw error
  
  // Simple keyword matching for demo purposes
  const queryWords = query.toLowerCase().split(' ')
  const scoredChunks = (chunks || []).map((chunk: any) => {
    const content = chunk.content.toLowerCase()
    const matchCount = queryWords.filter(word => content.includes(word)).length
    const similarity = matchCount / queryWords.length
    
    return {
      content: chunk.content,
      similarity: similarity || 0.5, // Default similarity if no matches
      metadata: chunk.metadata
    }
  })
  
  // Sort by similarity and return top results
  return scoredChunks
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}