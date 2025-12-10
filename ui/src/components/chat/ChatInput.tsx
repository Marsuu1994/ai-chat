import { ArrowRightIcon, PaperClipIcon } from "@heroicons/react/16/solid";

export function ChatInput() {
  return (
    <div className="py-4">
      <div className="mx-auto max-w-3xl flex flex-col px-4 py-4 bg-white/5 backdrop-blur-lg border border-primary/60 hover:not-focus-within:border-primary hover:not-focus-within:shadow-[0_0_20px_rgba(30,180,100,0.5)] shadow-[0_0_15px_rgba(30,180,100,0.3)] focus-within:border-primary focus-within:shadow-[0_0_25px_rgba(30,180,100,0.6)] rounded-lg transition-shadow">
        <textarea
          className="textarea textarea-ghost w-full resize-none"
          placeholder="Ask anything about the stack or your chat flow..."
          name="message"
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
        />
        <div className="flex justify-between">
          <button className="btn btn-ghost btn-circle" type="button">
            <PaperClipIcon className="size-6 -rotate-45" />
          </button>
          <button className="btn btn-ghost btn-circle" type="button">
            <ArrowRightIcon className="size-6 -rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
}

