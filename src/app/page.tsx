"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import { useDocuments } from "@/hooks/useDocuments";
import { useChat } from "@/hooks/useChat";
import { initializeSession } from "@/lib/supabase";

export default function Home() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const { documents, uploadDocument, deleteDocument, processingProgress } = useDocuments();
  const { messages, sendMessage, sending } = useChat();

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        documents={documents}
        selectedDoc={selectedDoc}
        onSelectDoc={setSelectedDoc}
        onUploadDoc={uploadDocument}
        onDeleteDoc={deleteDocument}
        processingProgress={processingProgress}
      />
      
      {/* Main Chat Area */}
      <ChatArea 
        selectedDoc={selectedDoc}
        documents={documents}
        messages={messages}
        onSendMessage={sendMessage}
        sending={sending}
      />
    </div>
  );
}