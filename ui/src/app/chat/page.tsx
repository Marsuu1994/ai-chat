import { ChatInput } from "@/components/chat/ChatInput";
import { WelcomeMessage } from "@/components/chat/WelcomeMessage";

export default function NewChatPage() {
  return (
    <>
      <WelcomeMessage />
      <ChatInput />
    </>
  );
}