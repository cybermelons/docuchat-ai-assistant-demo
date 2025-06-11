'use client'

import * as pdfjsLib from 'pdfjs-dist'

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

export interface ParsedDocument {
  text: string
  pageCount?: number
  metadata?: Record<string, any>
}

export async function parsePDFClient(arrayBuffer: ArrayBuffer): Promise<ParsedDocument> {
  try {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      fullText += pageText + '\n\n'
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
    throw new Error('Failed to parse PDF document')
  }
}