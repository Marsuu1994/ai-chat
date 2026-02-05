import { useRouter } from 'next/navigation';
import { useChatStore, Message } from '@/store/chatStore';

// Helper to persist message to database
async function persistMessage(
  chatId: string,
  role: 'user' | 'assistant',
  content: string
) {
  const response = await fetch(`/api/chats/${chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, content }),
  });

  if (!response.ok) {
    console.error('Failed to persist message');
  }

  return response.json();
}

// Helper to create a new chat
async function createNewChat(title: string): Promise<string> {
  const response = await fetch('/api/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error('Failed to create chat');
  }

  const chat = await response.json();
  return chat.id;
}

export function useChat() {
  const router = useRouter();
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);
  const currentChatId = useChatStore((state) => state.currentChatId);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateLastMessage = useChatStore((state) => state.updateLastMessage);
  const finishStreaming = useChatStore((state) => state.finishStreaming);
  const setLoading = useChatStore((state) => state.setLoading);
  const setCurrentChat = useChatStore((state) => state.setCurrentChat);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message to UI immediately (optimistic update)
    addMessage({ content, role: 'user' });
    setLoading(true);

    // Track whether this is a new chat so we can update URL after streaming
    let chatId = currentChatId;
    const isNewChat = !chatId;

    try {
      // If no current chat, create one first
      if (!chatId) {
        chatId = await createNewChat('New Chat 123');
        setCurrentChat(chatId);
      }

      // Persist user message to DB (fire and forget)
      persistMessage(chatId, 'user', content);

      // Add empty assistant message placeholder with streaming flag
      addMessage({ content: '', role: 'assistant', isStreaming: true });

      // Get current messages (excluding the empty streaming placeholder)
      const currentMessages = useChatStore.getState().messages;
      const messagesToSend: Message[] = currentMessages.filter(
        (msg) => !(msg.isStreaming && msg.content === '')
      );

      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesToSend }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        updateLastMessage(accumulated);
      }

      finishStreaming();

      // Persist assistant response to DB after streaming completes
      if (accumulated) {
        persistMessage(chatId, 'assistant', accumulated);
      }

      // For new chats: update URL then force server components to re-execute
      // router.replace updates the route, router.refresh re-runs the layout (fetches fresh chat list)
      // Zustand state is preserved because ChatContainer skips hydration when currentChatId matches
      if (isNewChat) {
        router.replace(`/chat/${chatId}`);
        router.refresh();
      }
    } catch (error) {
      console.error('Error streaming response:', error);
      updateLastMessage('Sorry, something went wrong.');
      finishStreaming();
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, isLoading, currentChatId };
}