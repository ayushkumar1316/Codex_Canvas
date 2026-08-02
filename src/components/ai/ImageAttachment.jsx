import { X } from "lucide-react";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageAttachment({ image, onRemove }) {
  if (!image) return null;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2 py-1.5">
      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
        <img
          src={image.preview}
          alt={image.name}
          className="size-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-zinc-200">
          {image.name}
        </p>
        <p className="text-[10px] text-zinc-500">
          {formatSize(image.size)}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="flex size-6 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/[0.08] hover:text-zinc-200"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
