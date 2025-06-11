"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatAreaProps {
  selectedDoc: string | null;
  documents: any[];
  messages: any[];
  onSendMessage: (message: string) => Promise<any>;
  sending: boolean;
}

export default function ChatArea({ selectedDoc, documents, messages, onSendMessage, sending }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const message = input;
    setInput("");
    
    await onSendMessage(message);
  };

  const selectedDocument = documents.find(doc => doc.id === selectedDoc);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-background border-b px-6 py-4">
        <h2 className="text-lg font-semibold">
          {selectedDocument ? selectedDocument.filename : 'Chat with your documents'}
        </h2>
        {selectedDocument && (
          <p className="text-sm text-muted-foreground">
            Ask questions about this document
          </p>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 bg-muted/10">
        {documents.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Welcome to DocuChat
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Upload a document and select it to start asking questions. 
                I'll help you understand and analyze your documents.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {messages.length === 0 && (
              <Card className="p-4">
                <p className="font-medium mb-2">Ready to help!</p>
                <p className="text-sm text-muted-foreground">Try asking questions like:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>What is the main topic of this document?</li>
                  <li>Summarize the key points</li>
                  <li>What are the important dates mentioned?</li>
                </ul>
              </Card>
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
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={message.role === 'assistant' ? 'bg-primary/10' : 'bg-muted'}>
                      {message.role === 'assistant' ? (
                        <Bot className="w-5 h-5" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <Card className={`px-4 py-2 ${
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : ''
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </Card>
                </div>
              </div>
            ))}
            
            {sending && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <Card className="px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      {documents.length > 0 && (
        <div className="bg-background border-t p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about the document..."
                className="flex-1"
                disabled={sending}
              />
              <Button
                type="submit"
                disabled={!input.trim() || sending}
                size="icon"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}