import { useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useEditorShortcuts({ onOpenCommandPalette }) {
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);
  const canUndo = useAppStore((state) => state.canUndo);
  const canRedo = useAppStore((state) => state.canRedo);
  const selectedComponentId = useAppStore((state) => state.selectedComponentId);
  const duplicateComponent = useAppStore((state) => state.duplicateComponent);
  const deleteComponent = useAppStore((state) => state.deleteComponent);
  const resetSelection = useAppStore((state) => state.resetSelection);

  const handleKeyDown = useCallback(
    (event) => {
      const target = event.target;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      const isMod = event.metaKey || event.ctrlKey;

      if (isMod && event.key === "k") {
        event.preventDefault();
        onOpenCommandPalette?.();
        return;
      }

      if (isInput) return;

      if (isMod && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        if (canUndo) {
          undo();
        }
        return;
      }

      if (isMod && event.key === "z" && event.shiftKey) {
        event.preventDefault();
        if (canRedo) {
          redo();
        }
        return;
      }

      if (isMod && event.key === "y") {
        event.preventDefault();
        if (canRedo) {
          redo();
        }
        return;
      }

      if (isMod && event.key === "d") {
        event.preventDefault();
        if (selectedComponentId) {
          duplicateComponent(selectedComponentId);
        }
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedComponentId && selectedComponentId !== "root") {
          event.preventDefault();
          deleteComponent(selectedComponentId);
        }
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        resetSelection();
        return;
      }
    },
    [
      canUndo,
      canRedo,
      selectedComponentId,
      undo,
      redo,
      duplicateComponent,
      deleteComponent,
      resetSelection,
      onOpenCommandPalette,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export function useUndoRedoShortcuts() {
  useEditorShortcuts({ onOpenCommandPalette: () => {} });
}
