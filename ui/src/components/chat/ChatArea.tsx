import { Message } from "@/app/home/page";
import { JSX } from "react";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { WelcomeMessage } from "@/components/chat/WelcomeMessage";
import { LoadingIndicator } from "@/components/chat/LoadingIndicator";

export interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatArea({ messages, isLoading }: ChatAreaProps): JSX.Element {
  const isEmpty = messages.length === 0 && !isLoading;

  if (isEmpty) {
    return <WelcomeMessage />;
  }

  return (
    <section className="flex-1">
      <div className="mx-auto flex h-full max-w-5xl flex-col gap-4 px-4 py-6">
        <div className="card h-full bg-white/5 backdrop-blur-lg border border-primary/60 shadow-[0_0_15px_rgba(30,180,100,0.3)] rounded-lg">
          <div className="card-body gap-4 overflow-y-auto">
            <div className="space-y-3">
              {messages.map((message, i) => (
                <ChatBubble key={`chat-bubble-key-${i}`} message={message} />
              ))}
              {isLoading && <LoadingIndicator />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}