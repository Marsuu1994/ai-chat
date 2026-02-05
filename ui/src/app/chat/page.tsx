'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { ChatArea } from '@/components/chat/ChatArea';
import { ChatInput } from '@/components/chat/ChatInput';

export default function NewChatPage() {
  const clearMessages = useChatStore((state) => state.clearMessages);

  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  return (
    <>
      <ChatArea />
      <ChatInput />
    </>
  );
}