import mammoth from 'mammoth'

export interface ParsedDocument {
  text: string
  pageCount?: number
  metadata?: Record<string, any>
}

export async function parseDocument(file: File): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer()
  
  if (file.type === 'application/pdf') {
    // For demo purposes, we'll just indicate this is a PDF
    // In production, use a proper PDF parsing service
    return {
      text: `[PDF Document: ${file.name}]\n\nPDF parsing is not available in this demo. Please try uploading a .txt or .docx file instead.\n\nFor production applications, consider using:\n- PDF.js for client-side parsing\n- A cloud service like AWS Textract\n- A server-side PDF processing service`,
      pageCount: 1,
      metadata: { 
        note: 'PDF parsing disabled for demo',
        filename: file.name,
        size: file.size
      }
    }
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  ) {
    return parseDOCX(arrayBuffer)
  } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    return parseText(arrayBuffer)
  } else {
    throw new Error(`Unsupported file type: ${file.type}`)
  }
}

async function parseDOCX(arrayBuffer: ArrayBuffer): Promise<ParsedDocument> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer })
    return {
      text: result.value,
      metadata: {
        messages: result.messages
      }
    }
  } catch (error) {
    console.error('Error parsing DOCX:', error)
    throw new Error('Failed to parse Word document')
  }
}

async function parseText(arrayBuffer: ArrayBuffer): Promise<ParsedDocument> {
  const decoder = new TextDecoder('utf-8')
  const text = decoder.decode(arrayBuffer)
  return {
    text,
    metadata: {
      encoding: 'utf-8'
    }
  }
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
  
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }
  
  const isAllowedType = ALLOWED_TYPES.includes(file.type) || 
    file.name.endsWith('.pdf') || 
    file.name.endsWith('.docx') || 
    file.name.endsWith('.txt')
  
  if (!isAllowedType) {
    return { valid: false, error: 'File type must be PDF, DOCX, or TXT' }
  }
  
  return { valid: true }
}