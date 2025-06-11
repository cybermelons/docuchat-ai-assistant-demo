"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import Header from "@/components/Header";
import { ThemeToggle } from "@/components/theme-toggle";
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

  const sidebarProps = {
    documents,
    selectedDoc,
    onSelectDoc: setSelectedDoc,
    onUploadDoc: uploadDocument,
    onDeleteDoc: deleteDocument,
    processingProgress
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Mobile Header */}
      <div className="md:hidden">
        <Header {...sidebarProps} />
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar {...sidebarProps} />
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Desktop Header */}
          <div className="hidden md:block border-b">
            <div className="flex h-14 items-center px-6 justify-end">
              <ThemeToggle />
            </div>
          </div>
          
          <ChatArea 
            selectedDoc={selectedDoc}
            documents={documents}
            messages={messages}
            onSendMessage={sendMessage}
            sending={sending}
          />
        </div>
      </div>
    </div>
  );
}