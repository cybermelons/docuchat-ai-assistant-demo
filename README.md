# AI Document Assistant

An intelligent document assistant that helps you chat with your documents using AI. Upload documents, ask questions, and get instant answers based on your content.

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

## Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start
```
