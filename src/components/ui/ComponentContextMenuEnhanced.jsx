import { useState } from "react";
import {
  Sparkles,
  Copy,
  Trash2,
  MoreVertical,
  Palette,
  Type,
  Move,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

/**
 * Enhanced Component Context Menu
 * Quick actions + AI-powered inline editing
 */
export function ComponentContextMenuEnhanced({
  isOpen,
  onClose,
  position,
  componentId,
}) {
  const deleteComponent = useAppStore((state) => state.deleteComponent);
  const duplicateComponent = useAppStore((state) => state.duplicateComponent);
  const setSelectedComponent = useAppStore((state) => state.setSelectedComponent);
  const [showAIInput, setShowAIInput] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  if (!isOpen || !componentId) return null;

  const handleDelete = () => {
    deleteComponent(componentId);
    onClose();
  };

  const handleDuplicate = () => {
    duplicateComponent(componentId);
    onClose();
  };

  const handleAISubmit = (e) => {
    if (e.key === "Enter" && aiPrompt.trim()) {
      // Trigger inline AI edit
      setSelectedComponent(componentId);
      // The InlineAIModifier will pick up the selection
      setShowAIInput(false);
      setAiPrompt("");
      onClose();
    }
  };

  return (
    <div
      className="fixed z-50 min-w-[180px] rounded-xl border border-border-subtle bg-surface-1 py-2 shadow-lg backdrop-blur-sm"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      {!showAIInput ? (
        <>
          <button
            onClick={() => setShowAIInput(true)}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-text-primary transition-colors hover:bg-surface-2"
          >
            <Sparkles className="size-4 text-primary" />
            <span>AI Edit</span>
          </button>

          <button
            onClick={handleDuplicate}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-text-primary transition-colors hover:bg-surface-2"
          >
            <Copy className="size-4 text-text-muted" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={handleDelete}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
          >
            <Trash2 className="size-4" />
            <span>Delete</span>
          </button>

          <div className="my-2 border-t border-border-subtle" />

          <button
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-text-muted transition-colors hover:bg-surface-2"
          >
            <Palette className="size-4" />
            <span>Style</span>
          </button>

          <button
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-text-muted transition-colors hover:bg-surface-2"
          >
            <Type className="size-4" />
            <span>Edit Text</span>
          </button>
        </>
      ) : (
        <div className="px-3 py-2">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="text-sm font-medium text-text-primary">
              AI Edit
            </span>
          </div>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={handleAISubmit}
            placeholder="Describe changes..."
            className="w-full rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

export default ComponentContextMenuEnhanced;
