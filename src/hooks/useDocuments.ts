import { useState, useEffect, useCallback } from 'react'
import { Document, getSessionId } from '@/lib/supabase'
import { ProcessingProgress } from '@/lib/document-processor'
import { toast } from 'sonner'

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
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch documents'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const uploadDocument = async (file: File) => {
    try {
      setError(null)
      setProcessingProgress({ stage: 'uploading', progress: 0, message: 'Starting upload...' })
      
      // File size validation
      const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
      const WARN_FILE_SIZE = 10 * 1024 * 1024 // 10MB
      
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds 50MB limit. Please use a smaller file.`)
      }
      
      if (file.size > WARN_FILE_SIZE) {
        console.warn(`Large file detected (${(file.size / 1024 / 1024).toFixed(1)}MB). Processing may take longer.`)
      }
      
      const sessionId = getSessionId()
      let processedFile = file
      
      // Handle PDF parsing on client side
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setProcessingProgress({ stage: 'parsing', progress: 10, message: 'Loading PDF...' })
        
        // Dynamic import to avoid SSR issues
        const { parsePDFClient } = await import('@/lib/client-pdf-parser')
        
        const arrayBuffer = await file.arrayBuffer()
        
        // Parse with progress callback
        const parsed = await parsePDFClient(arrayBuffer, (progress) => {
          setProcessingProgress({
            stage: 'parsing',
            progress: 10 + (progress.percentage * 0.4), // 10-50% range
            message: `Processing page ${progress.currentPage} of ${progress.totalPages}...`
          })
        })
        
        // Create a new text file with the extracted content
        const textBlob = new Blob([parsed.text], { type: 'text/plain' })
        processedFile = new File([textBlob], file.name.replace('.pdf', '_parsed.txt'), {
          type: 'text/plain',
          lastModified: Date.now()
        })
        
        setProcessingProgress({ stage: 'parsing', progress: 50, message: 'PDF processed, uploading...' })
      }
      
      const formData = new FormData()
      formData.append('file', processedFile)
      formData.append('originalName', file.name)
      formData.append('originalType', file.type)
      
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
      
      toast.success('Document uploaded successfully!')
      return data.document
    } catch (err) {
      let errorMessage = 'Failed to upload document'
      
      if (err instanceof Error) {
        // Provide user-friendly error messages
        if (err.message.includes('50MB limit')) {
          errorMessage = err.message
        } else if (err.message.includes('Password-protected')) {
          errorMessage = 'Password-protected PDFs are not supported'
        } else if (err.message.includes('corrupted')) {
          errorMessage = 'This PDF appears to be corrupted or invalid'
        } else if (err.message.includes('No text content')) {
          errorMessage = 'No text found in PDF. This might be a scanned image.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      setProcessingProgress({ stage: 'error', progress: 0, message: errorMessage })
      
      // Clear progress after showing error
      setTimeout(() => setProcessingProgress(null), 5000)
      
      toast.error(errorMessage)
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
      toast.success('Document deleted')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document'
      setError(errorMessage)
      toast.error(errorMessage)
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