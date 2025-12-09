import { ArrowRightIcon, PaperClipIcon } from "@heroicons/react/16/solid";

export function ChatInput() {
  return (
    <div className="py-4">
      <div className="mx-auto max-w-3xl flex flex-col px-4 py-4 bg-base-200 border border-primary/40 hover:border-primary focus-within:border-primary rounded-lg">
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

