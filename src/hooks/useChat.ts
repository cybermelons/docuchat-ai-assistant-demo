import { useState, useEffect, useCallback } from 'react'
import { ChatMessage } from '@/lib/supabase'

interface ChatResponse {
  response: string
  sources: Array<{
    content: string
    similarity: number
    metadata?: any
  }>
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch chat history on mount
  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/chat')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch messages')
      }
      
      setMessages(data.messages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (content: string): Promise<ChatResponse | null> => {
    try {
      setError(null)
      setSending(true)
      
      // Add user message optimistically
      const userMessage: Partial<ChatMessage> = {
        role: 'user',
        content,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, userMessage as ChatMessage])
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: content })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }
      
      // Add assistant response
      const assistantMessage: Partial<ChatMessage> = {
        role: 'assistant',
        content: data.response,
        metadata: { sources: data.sources },
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMessage as ChatMessage])
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      // Remove the optimistic user message on error
      setMessages(prev => prev.slice(0, -1))
      return null
    } finally {
      setSending(false)
    }
  }

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    clearMessages,
    refetch: fetchMessages
  }
}