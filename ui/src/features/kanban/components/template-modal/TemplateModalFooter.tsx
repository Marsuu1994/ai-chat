import { PlusIcon, CheckIcon } from "@heroicons/react/24/outline";

interface TemplateModalFooterProps {
  mode: "create" | "edit";
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
}

export default function TemplateModalFooter({
  mode,
  isSubmitting,
  error,
  onClose,
}: TemplateModalFooterProps) {
  return (
    <>
      {error && <div className="alert alert-error text-sm">{error}</div>}
      <div className="modal-action">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="loading loading-spinner loading-sm" />
          ) : mode === "create" ? (
            <PlusIcon className="size-4" />
          ) : (
            <CheckIcon className="size-4" />
          )}
          {mode === "create" ? "Create Template" : "Save Changes"}
        </button>
      </div>
    </>
  );
}
