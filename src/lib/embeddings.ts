let embeddingPipeline: any = null

// Initialize the embedding pipeline
export async function initializeEmbeddings() {
  if (typeof window === 'undefined') {
    throw new Error('Embeddings can only be initialized on the client side')
  }
  
  if (!embeddingPipeline) {
    const { pipeline } = await import('@xenova/transformers')
    embeddingPipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    )
  }
  return embeddingPipeline
}

// Generate embeddings for text
export async function generateEmbedding(text: string): Promise<number[]> {
  const pipe = await initializeEmbeddings()
  const output = await pipe(text, {
    pooling: 'mean',
    normalize: true
  })
  
  // Convert to regular array
  return Array.from(output.data)
}

// Split text into chunks for embedding
export function chunkText(text: string, maxChunkSize: number = 1000): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const chunks: string[] = []
  let currentChunk = ''
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += ' ' + sentence
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}