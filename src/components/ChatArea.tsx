"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatAreaProps {
  selectedDoc: string | null;
  documents: any[];
}

export default function ChatArea({ selectedDoc, documents }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedDoc) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm analyzing the document to answer your question. This is a demo response. In a real implementation, this would use RAG to search the document and provide a relevant answer with citations.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const selectedDocument = documents.find(doc => doc.id === selectedDoc);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {selectedDocument ? selectedDocument.name : 'Select a document to start'}
        </h2>
        {selectedDocument && (
          <p className="text-sm text-gray-600">
            Ask questions about this document
          </p>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {!selectedDoc ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to DocuChat
              </h3>
              <p className="text-gray-600 max-w-sm">
                Upload a document and select it to start asking questions. 
                I'll help you understand and analyze your documents.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                <p className="font-medium mb-2">Ready to help!</p>
                <p>Try asking questions like:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>What is the main topic of this document?</li>
                  <li>Summarize the key points</li>
                  <li>What are the important dates mentioned?</li>
                </ul>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div className={`flex gap-3 max-w-3xl ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'assistant' ? 'bg-blue-100' : 'bg-gray-200'
                  }`}>
                    {message.role === 'assistant' ? (
                      <Bot className="w-5 h-5 text-blue-600" />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div className={`rounded-lg px-4 py-2 ${
                    message.role === 'assistant' 
                      ? 'bg-white border border-gray-200' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      {selectedDoc && (
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about the document..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}