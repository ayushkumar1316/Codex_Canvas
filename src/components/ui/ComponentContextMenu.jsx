import { useEffect, useRef, useCallback } from "react";
import {
  Copy,
  Trash2,
  ChevronUp,
  ClipboardCopy,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function ComponentContextMenu({
  isOpen,
  onClose,
  position,
  componentId,
}) {
  const menuRef = useRef(null);

  const duplicateComponent = useAppStore((state) => state.duplicateComponent);
  const deleteComponent = useAppStore((state) => state.deleteComponent);
  const selectParentComponent = useAppStore((state) => state.selectParentComponent);
  const componentTree = useAppStore((state) => state.componentTree);

  const isRoot = componentId === "root";

  const findNodeById = (node, id) => {
    if (!node) return null;
    if (node.id === id) return node;
    for (const child of node.children ?? []) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
    return null;
  };

  const findParentNode = (node, id, parent = null) => {
    if (!node) return null;
    if (node.id === id) return parent;
    for (const child of node.children ?? []) {
      const found = findParentNode(child, id, node);
      if (found) return found;
    }
    return null;
  };

  const handleDuplicate = useCallback(() => {
    if (componentId) {
      duplicateComponent(componentId);
    }
    onClose();
  }, [componentId, duplicateComponent, onClose]);

  const handleDelete = useCallback(() => {
    if (componentId && !isRoot) {
      deleteComponent(componentId);
    }
    onClose();
  }, [componentId, isRoot, deleteComponent, onClose]);

  const handleSelectParent = useCallback(() => {
    if (componentId) {
      selectParentComponent(componentId);
    }
    onClose();
  }, [componentId, selectParentComponent, onClose]);

  const handleCopyId = useCallback(() => {
    if (componentId) {
      navigator.clipboard.writeText(componentId).catch(() => {});
    }
    onClose();
  }, [componentId, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen || !componentId) return null;

  const node = findNodeById(componentTree, componentId);
  const parent = findParentNode(componentTree, componentId);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-48 rounded-xl border border-border-subtle dark:border-[rgba(139,92,246,0.12)] bg-surface-1 dark:bg-surface-2 p-1 shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      style={{ left: position.x, top: position.y }}
      role="menu"
    >
      <div className="px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          {node?.type || "Component"}
        </p>
        <p className="mt-0.5 truncate font-mono text-xs text-text-muted">
          {componentId}
        </p>
      </div>

      <div className="my-1 h-px bg-border-subtle" />

      <button
        type="button"
        onClick={handleDuplicate}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-text-primary transition-colors hover:bg-hover-surface"
        role="menuitem"
        aria-label="Duplicate component"
      >
        <Copy className="size-3.5" />
        Duplicate
        <span className="ml-auto text-xs text-text-muted">Ctrl+D</span>
      </button>

      {!isRoot && (
        <button
          type="button"
          onClick={handleDelete}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-500 transition-colors hover:bg-red-50"
          role="menuitem"
          aria-label="Delete component"
        >
          <Trash2 className="size-3.5" />
          Delete
          <span className="ml-auto text-xs text-text-muted">Del</span>
        </button>
      )}

      {parent && (
        <button
          type="button"
          onClick={handleSelectParent}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-text-primary transition-colors hover:bg-hover-surface"
          role="menuitem"
          aria-label="Select parent component"
        >
          <ChevronUp className="size-3.5" />
          Select Parent
        </button>
      )}

      <div className="my-1 h-px bg-border-subtle" />

      <button
        type="button"
        onClick={handleCopyId}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-text-primary transition-colors hover:bg-hover-surface"
        role="menuitem"
        aria-label="Copy component ID"
      >
        <ClipboardCopy className="size-3.5" />
        Copy Component ID
      </button>
    </div>
  );
}
