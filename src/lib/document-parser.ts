import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export interface ParsedDocument {
  text: string
  pageCount?: number
  metadata?: Record<string, any>
}

export async function parseDocument(file: File): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer()
  
  if (file.type === 'application/pdf') {
    return parsePDF(Buffer.from(arrayBuffer))
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

async function parsePDF(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const data = await pdfParse(buffer)
    return {
      text: data.text,
      pageCount: data.numpages,
      metadata: {
        info: data.info,
        metadata: data.metadata
      }
    }
  } catch (error) {
    console.error('Error parsing PDF:', error)
    throw new Error('Failed to parse PDF document')
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