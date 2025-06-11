"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";

export default function Home() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        documents={documents}
        selectedDoc={selectedDoc}
        onSelectDoc={setSelectedDoc}
        onUploadDoc={(docs) => setDocuments([...documents, ...docs])}
      />
      
      {/* Main Chat Area */}
      <ChatArea 
        selectedDoc={selectedDoc}
        documents={documents}
      />
    </div>
  );
}