# DocuChat - AI Document Assistant

An intelligent document assistant that helps you chat with your documents using AI. Upload documents, ask questions, and get instant answers based on your content.

🔗 **Live Demo**: [Coming Soon]  
📚 **Repository**: [github.com/cybermelons/docuchat-ai-assistant-demo](https://github.com/cybermelons/docuchat-ai-assistant-demo)

## 🎯 Portfolio Demo

This is a portfolio demonstration project showcasing:
- Modern AI integration with Groq LLM and vector search
- Client-side document processing with PDF.js
- Session-based multi-tenancy with Supabase RLS
- Real-time progress tracking and error handling
- Clean, responsive UI built with Next.js and TypeScript

## Features

- **Document Upload**: Support for multiple file formats
  - PDF files (text extraction only, no images)
  - Text files (.txt)
  - Word documents (.docx)
- **AI-Powered Chat**: Ask questions about your uploaded documents
- **Session-Based Storage**: Each visitor gets their own isolated workspace
- **Vector Search**: Intelligent document retrieval using embeddings
- **Progress Tracking**: Real-time upload and processing status

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm package manager
- Groq API key (for chat functionality)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your Groq API key to `.env.local`:
```
GROQ_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to use the application.

## How It Works

1. **Upload Documents**: Drag and drop or click to upload PDF, TXT, or DOCX files
2. **Processing**: Documents are parsed and split into chunks for efficient retrieval
3. **Ask Questions**: Type questions in the chat interface
4. **Get Answers**: AI searches through your documents and provides relevant answers

## Technical Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **AI/ML**: Groq API (LLM), Transformers.js (embeddings)
- **Document Processing**: PDF.js (client-side PDF parsing)
- **Database**: Supabase with pgvector for vector similarity search

## Limitations

- PDF support is text-only (images and complex layouts are not processed)
- Maximum file size: 50MB
- Password-protected PDFs are not supported
- Session data is temporary (24-hour retention)

## Architecture

### Frontend Architecture
- **Next.js 15 App Router**: Server and client components
- **React Hooks**: Custom hooks for documents and chat state
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Full type safety

### Backend Architecture
- **API Routes**: RESTful endpoints for document and chat operations
- **Vector Storage**: Supabase pgvector for similarity search
- **Document Processing Pipeline**:
  1. Client-side parsing (PDF.js for PDFs)
  2. Text chunking with overlap
  3. Embedding generation (Transformers.js)
  4. Vector storage with metadata

### AI Integration
- **Groq LLM**: Fast inference with deepseek-r1-distill-llama-70b
- **Transformers.js**: Browser-based embeddings (no API costs)
- **RAG Pipeline**: Retrieval-augmented generation for accurate answers

### Security & Isolation
- **Session-based isolation**: Each user has isolated data
- **Row Level Security (RLS)**: Database-level access control
- **No data persistence**: 24-hour automatic cleanup
- **Client-side processing**: Sensitive documents never leave the browser

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/         # Chat completion with RAG
│   │   └── documents/    # Document upload and retrieval
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Main application page
├── components/
│   ├── ChatArea.tsx      # Chat interface
│   └── Sidebar.tsx       # Document list and upload
├── hooks/
│   ├── useChat.ts        # Chat state management
│   └── useDocuments.ts   # Document operations
└── lib/
    ├── client-pdf-parser.ts  # Browser PDF parsing
    ├── document-processor.ts # Chunking and embedding
    ├── groq.ts              # LLM integration
    └── supabase.ts          # Database and storage
```

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Type checking
pnpm type-check
```

## Future Enhancements

- [ ] Document-scoped search (select which docs to search)
- [ ] Export chat history
- [ ] Support for more file formats
- [ ] Collaborative sessions
- [ ] Advanced chunking strategies
