import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Canvas",
  description = "Are you sure you want to delete this canvas? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
}) {
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelButtonRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="relative w-full max-w-md rounded-2xl border border-border-subtle dark:border-[rgba(139,92,246,0.12)] bg-surface-1 dark:bg-surface-2 p-6 shadow-2xl dark:shadow-[0_16px_64px_rgba(0,0,0,0.6)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-text-muted transition-colors hover:bg-hover-surface hover:text-text-secondary"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
            <AlertTriangle className="size-5 text-red-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              id="delete-dialog-title"
              className="text-sm font-semibold text-text-primary"
            >
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            ref={cancelButtonRef}
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-9 rounded-lg px-4 text-sm font-medium text-text-muted hover:bg-hover-surface hover:text-text-primary"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="h-9 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-500"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
