import { NextRequest, NextResponse } from 'next/server'
import { processDocument, getDocuments, deleteDocument } from '@/lib/document-processor'

export async function GET(request: NextRequest) {
  try {
    // Get session ID from header
    const sessionId = request.headers.get('x-session-id')
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }
    
    const documents = await getDocuments(sessionId)
    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session ID from header
    const sessionId = request.headers.get('x-session-id')
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const originalName = formData.get('originalName') as string
    const originalType = formData.get('originalType') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Use original name if it was a PDF that got converted
    const fileName = originalName || file.name
    
    // Process document with session ID
    const document = await processDocument(file, sessionId)
    
    // Update document with original filename if it was converted
    if (originalName) {
      document.filename = originalName
    }
    
    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error processing document:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process document' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get session ID from header
    const sessionId = request.headers.get('x-session-id')
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID required' },
        { status: 400 }
      )
    }
    
    await deleteDocument(documentId, sessionId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}