import { XMarkIcon } from "@heroicons/react/24/outline";

interface TemplateModalHeaderProps {
  mode: "create" | "edit";
  onClose: () => void;
}

export default function TemplateModalHeader({ mode, onClose }: TemplateModalHeaderProps) {
  return (
    <div className="flex items-center justify-between -mx-6 px-6 pb-4 mb-4 border-b border-base-content/10">
      <h3 className="font-bold text-lg">
        {mode === "create" ? "Create Task Template" : "Edit Task Template"}
      </h3>
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-square"
        onClick={onClose}
      >
        <XMarkIcon className="size-5" />
      </button>
    </div>
  );
}
