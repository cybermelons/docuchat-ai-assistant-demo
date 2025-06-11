"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, Trash2 } from "lucide-react";

interface SidebarProps {
  documents: any[];
  selectedDoc: string | null;
  onSelectDoc: (docId: string) => void;
  onUploadDoc: (docs: any[]) => void;
}

export default function Sidebar({ documents, selectedDoc, onSelectDoc, onUploadDoc }: SidebarProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Process files here
    const newDocs = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      file: file,
      uploadedAt: new Date()
    }));
    onUploadDoc(newDocs);
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
            <button
              key={doc.id}
              onClick={() => onSelectDoc(doc.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                selectedDoc === doc.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate text-left flex-1">
                {doc.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Powered by OpenAI & Claude
        </p>
      </div>
    </div>
  );
}