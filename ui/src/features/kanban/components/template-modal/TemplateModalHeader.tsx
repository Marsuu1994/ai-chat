import { XMarkIcon } from "@heroicons/react/24/outline";

interface TemplateModalHeaderProps {
  mode: "create" | "edit";
  onClose: () => void;
}

export default function TemplateModalHeader({ mode, onClose }: TemplateModalHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
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
