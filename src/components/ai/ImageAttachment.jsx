import { X } from "lucide-react";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageAttachment({ image, onRemove }) {
  if (!image) return null;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-2 px-2 py-1.5">
      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-surface-3">
        <img
          src={image.preview}
          alt={image.name}
          className="size-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-text-primary">
          {image.name}
        </p>
        <p className="text-xs text-text-muted">
          {formatSize(image.size)}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="flex size-6 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-3 hover:text-text-primary"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
