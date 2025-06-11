import Groq from 'groq-sdk'

let groqClient: Groq | null = null

export function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set')
    }
    groqClient = new Groq({ apiKey })
  }
  return groqClient
}

export interface ChatContext {
  query: string
  relevantChunks: Array<{
    content: string
    similarity: number
  }>
}

export async function generateChatResponse(context: ChatContext): Promise<string> {
  const groq = getGroqClient()
  
  // Build context from relevant chunks
  const contextText = context.relevantChunks
    .map((chunk, i) => `[${i + 1}] ${chunk.content}`)
    .join('\n\n')
  
  const systemPrompt = `You are a helpful AI assistant that answers questions based on the provided document context. 
Always cite the specific sections [1], [2], etc. when referencing information from the context.
If the context doesn't contain relevant information to answer the question, say so clearly.
Do not use any thinking tags or internal monologue - provide direct answers only.`

  const userPrompt = `Context from the document:
${contextText}

Question: ${context.query}

Please provide a comprehensive answer based on the context above.`

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'deepseek-r1-distill-llama-70b',
      temperature: 0.3,
      max_tokens: 1000,
      stream: false
    })
    
    let content = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    
    // Remove thinking tags if present
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
    
    return content
  } catch (error) {
    console.error('Error generating chat response:', error)
    
    // Fallback response
    return `I found relevant information in your document but encountered an error generating a response. 
    
Here are the most relevant sections:
${context.relevantChunks.map((chunk, i) => `\n[${i + 1}] ${chunk.content.substring(0, 200)}...`).join('\n')}`
  }
}