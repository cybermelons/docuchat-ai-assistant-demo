import { useState, useEffect, useCallback } from 'react'
import { Document, getSessionId } from '@/lib/supabase'
import { ProcessingProgress } from '@/lib/document-processor'

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null)

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const sessionId = getSessionId()
      
      const response = await fetch('/api/documents', {
        headers: {
          'x-session-id': sessionId
        }
      })
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', await response.text())
        throw new Error('Server returned non-JSON response')
      }
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch documents')
      }
      
      setDocuments(data.documents || [])
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  const uploadDocument = async (file: File) => {
    try {
      setError(null)
      setProcessingProgress({ stage: 'uploading', progress: 0, message: 'Starting upload...' })
      
      const sessionId = getSessionId()
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'x-session-id': sessionId
        },
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document')
      }
      
      setDocuments(prev => [data.document, ...prev])
      setProcessingProgress({ stage: 'complete', progress: 100, message: 'Document processed!' })
      
      // Clear progress after a delay
      setTimeout(() => setProcessingProgress(null), 3000)
      
      return data.document
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document'
      setError(errorMessage)
      setProcessingProgress({ stage: 'error', progress: 0, message: errorMessage })
      throw err
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      setError(null)
      const sessionId = getSessionId()
      
      const response = await fetch(`/api/documents?id=${documentId}`, {
        method: 'DELETE',
        headers: {
          'x-session-id': sessionId
        }
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete document')
      }
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document')
      throw err
    }
  }

  return {
    documents,
    loading,
    error,
    processingProgress,
    uploadDocument,
    deleteDocument,
    refetch: fetchDocuments
  }
}