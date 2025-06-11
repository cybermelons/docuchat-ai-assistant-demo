'use client'

export interface ParsedDocument {
  text: string
  pageCount?: number
  metadata?: Record<string, any>
}

export interface ParseProgress {
  currentPage: number
  totalPages: number
  percentage: number
}

export async function parsePDFClient(
  arrayBuffer: ArrayBuffer,
  onProgress?: (progress: ParseProgress) => void
): Promise<ParsedDocument> {
  try {
    // Dynamic import to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist')
    
    // Set up the worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
    
    // Create loading task with error handling
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    
    // Handle loading errors
    loadingTask.onPassword = () => {
      throw new Error('Password-protected PDFs are not supported')
    }
    
    const pdf = await loadingTask.promise
    
    if (pdf.numPages === 0) {
      throw new Error('PDF contains no pages')
    }
    
    let fullText = ''
    
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        fullText += pageText + '\n\n'
        
        // Report progress
        if (onProgress) {
          onProgress({
            currentPage: i,
            totalPages: pdf.numPages,
            percentage: Math.round((i / pdf.numPages) * 100)
          })
        }
      } catch (pageError) {
        console.warn(`Failed to parse page ${i}:`, pageError)
        // Continue with other pages even if one fails
      }
    }
    
    if (!fullText.trim()) {
      throw new Error('No text content found in PDF')
    }
    
    return {
      text: fullText,
      pageCount: pdf.numPages,
      metadata: {
        numPages: pdf.numPages
      }
    }
  } catch (error) {
    console.error('Error parsing PDF:', error)
    
    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF structure')) {
        throw new Error('The PDF file appears to be corrupted or invalid')
      }
      if (error.message.includes('Unsupported feature')) {
        throw new Error('This PDF uses features that are not currently supported')
      }
      if (error.message.includes('password')) {
        throw new Error('Password-protected PDFs are not supported')
      }
      throw error
    }
    
    throw new Error('Failed to parse PDF document')
  }
}