'use client'

import { Header } from "@/components/common/Header";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatArea } from "@/components/chat/ChatArea";
import { useState } from "react";

export interface Message {
  content: string,
  type: 'user' | 'bot',
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = (content: string) => {
    const userMessage: Message = { content, type: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      const botMessage: Message = { content: 'automatic mock reply', type: 'bot' };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-base-300 text-base-content">
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-neutral to-base-100">
        <Header/>
        <ChatArea messages={messages} isLoading={isLoading} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </main>
  );
}


