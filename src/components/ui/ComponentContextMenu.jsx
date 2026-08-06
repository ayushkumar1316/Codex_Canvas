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
      className="fixed z-50 w-48 rounded-xl border border-white/[0.08] bg-[#12121a] p-1 shadow-xl"
      style={{ left: position.x, top: position.y }}
      role="menu"
    >
      <div className="px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          {node?.type || "Component"}
        </p>
        <p className="mt-0.5 truncate font-mono text-[10px] text-zinc-600">
          {componentId}
        </p>
      </div>

      <div className="my-1 h-px bg-white/[0.05]" />

      <button
        type="button"
        onClick={handleDuplicate}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-white/[0.06]"
        role="menuitem"
        aria-label="Duplicate component"
      >
        <Copy className="size-3.5" />
        Duplicate
        <span className="ml-auto text-[10px] text-zinc-600">Ctrl+D</span>
      </button>

      {!isRoot && (
        <button
          type="button"
          onClick={handleDelete}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
          role="menuitem"
          aria-label="Delete component"
        >
          <Trash2 className="size-3.5" />
          Delete
          <span className="ml-auto text-[10px] text-zinc-600">Del</span>
        </button>
      )}

      {parent && (
        <button
          type="button"
          onClick={handleSelectParent}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-white/[0.06]"
          role="menuitem"
          aria-label="Select parent component"
        >
          <ChevronUp className="size-3.5" />
          Select Parent
        </button>
      )}

      <div className="my-1 h-px bg-white/[0.05]" />

      <button
        type="button"
        onClick={handleCopyId}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-white/[0.06]"
        role="menuitem"
        aria-label="Copy component ID"
      >
        <ClipboardCopy className="size-3.5" />
        Copy Component ID
      </button>
    </div>
  );
}
