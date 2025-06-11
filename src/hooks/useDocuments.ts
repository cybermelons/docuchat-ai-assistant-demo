import { useState, useEffect, useCallback } from 'react'
import { Document } from '@/lib/supabase'
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
      const response = await fetch('/api/documents')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch documents')
      }
      
      setDocuments(data.documents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  const uploadDocument = async (file: File) => {
    try {
      setError(null)
      setProcessingProgress({ stage: 'uploading', progress: 0, message: 'Starting upload...' })
      
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/documents', {
        method: 'POST',
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
      
      const response = await fetch(`/api/documents?id=${documentId}`, {
        method: 'DELETE'
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