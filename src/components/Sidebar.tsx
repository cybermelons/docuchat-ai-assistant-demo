"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, Trash2 } from "lucide-react";

interface SidebarProps {
  documents: any[];
  selectedDoc: string | null;
  onSelectDoc: (docId: string) => void;
  onUploadDoc: (file: File) => Promise<any>;
  onDeleteDoc: (docId: string) => Promise<void>;
  processingProgress: any;
}

export default function Sidebar({ documents, selectedDoc, onSelectDoc, onUploadDoc, onDeleteDoc, processingProgress }: SidebarProps) {
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
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">DocuChat</h1>
        <p className="text-sm text-gray-600 mt-1">AI Document Assistant</p>
      </div>

      {/* Upload Area */}
      <div className="p-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            {isDragActive ? 'Drop files here...' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PDF, DOC, DOCX, TXT
          </p>
        </div>
        
        {/* Processing Progress */}
        {processingProgress && (
          <div className="mt-4 bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-700">
                {processingProgress.message}
              </span>
              <span className="text-xs text-blue-600">
                {processingProgress.progress}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Documents ({documents.length})
          </h3>
        </div>
        <div className="space-y-1 px-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                selectedDoc === doc.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-700'
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
              <button
                onClick={() => onDeleteDoc(doc.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                title="Delete document"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Powered by Transformers.js & Groq
        </p>
      </div>
    </div>
  );
}