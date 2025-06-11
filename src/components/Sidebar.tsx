"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { DocumentListSkeleton } from "./DocumentSkeleton";

interface SidebarProps {
  documents: any[];
  selectedDoc: string | null;
  onSelectDoc: (docId: string) => void;
  onUploadDoc: (file: File) => Promise<any>;
  onDeleteDoc: (docId: string) => Promise<void>;
  processingProgress: any;
  loading?: boolean;
}

export default function Sidebar({ documents, selectedDoc, onSelectDoc, onUploadDoc, onDeleteDoc, processingProgress, loading }: SidebarProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Process one file at a time
    for (const file of acceptedFiles) {
      try {
        await onUploadDoc(file);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  }, [onUploadDoc]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    }
  });

  return (
    <div className="w-80 bg-background border-r border-border flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold">DocuChat</h1>
        <p className="text-sm text-muted-foreground mt-1">AI Document Assistant</p>
      </div>

      {/* Upload Area */}
      <div className="p-4 space-y-4">
        <Card
          {...getRootProps()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors rounded-lg ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {isDragActive ? 'Drop files here...' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, DOC, DOCX, TXT
          </p>
        </Card>
        
        {/* Processing Progress */}
        {processingProgress && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">
                {processingProgress.message}
              </span>
              <span className="text-xs text-muted-foreground">
                {processingProgress.progress}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress.progress}%` }}
              />
            </div>
          </Card>
        )}
      </div>

      {/* Documents List */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Documents ({documents.length})
          </h3>
        </div>
        <div className="space-y-2 px-4 pb-4">
          {loading ? (
            <DocumentListSkeleton />
          ) : documents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No documents yet
            </p>
          ) : (
            documents.map((doc) => (
            <Card
              key={doc.id}
              className={`group flex items-center gap-3 p-3 transition-all cursor-pointer rounded-lg ${
                selectedDoc === doc.id
                  ? 'bg-primary/10 border-primary shadow-sm'
                  : 'hover:bg-muted border-transparent'
              }`}
            >
              <button
                onClick={() => onSelectDoc(doc.id)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">
                  {doc.filename}
                </span>
              </button>
              <Button
                onClick={() => onDeleteDoc(doc.id)}
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-8 w-8"
                title="Delete document"
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </Card>
          )))
          }
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Powered by Transformers.js & Groq
        </p>
      </div>
    </div>
  );
}