import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Copy,
  FileText,
  Layers3,
  LayoutDashboard,
  Pencil,
  Redo2,
  Search,
  Sparkles,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const canvases = useAppStore((state) => state.canvases);
  const activeCanvasId = useAppStore((state) => state.activeCanvasId);
  const editorMode = useAppStore((state) => state.editorMode);
  const canUndo = useAppStore((state) => state.canUndo);
  const canRedo = useAppStore((state) => state.canRedo);

  const createCanvas = useAppStore((state) => state.createCanvas);
  const renameCanvas = useAppStore((state) => state.renameCanvas);
  const duplicateCanvas = useAppStore((state) => state.duplicateCanvas);
  const deleteCanvas = useAppStore((state) => state.deleteCanvas);
  const setActiveCanvas = useAppStore((state) => state.setActiveCanvas);
  const setEditorMode = useAppStore((state) => state.setEditorMode);
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);

  const commands = useMemo(() => {
    const activeCanvas = canvases.find((c) => c.id === activeCanvasId);
    const canvasCommands = [
      {
        id: "new-canvas",
        label: "New Canvas",
        icon: FileText,
        shortcut: null,
        action: () => {
          createCanvas();
          onClose();
        },
      },
      {
        id: "rename-canvas",
        label: "Rename Canvas",
        icon: Pencil,
        shortcut: null,
        action: () => {
          const newName = prompt("Enter new name:", activeCanvas?.name || "");
          if (newName && activeCanvasId) {
            renameCanvas(activeCanvasId, newName);
          }
          onClose();
        },
      },
      {
        id: "duplicate-canvas",
        label: "Duplicate Canvas",
        icon: Copy,
        shortcut: null,
        action: () => {
          if (activeCanvasId) {
            const newId = duplicateCanvas(activeCanvasId);
            if (newId) {
              setActiveCanvas(newId);
            }
          }
          onClose();
        },
      },
      {
        id: "delete-canvas",
        label: "Delete Canvas",
        icon: Trash2,
        shortcut: null,
        action: () => {
          if (activeCanvasId && canvases.length > 1) {
            if (confirm(`Delete "${activeCanvas?.name}"?`)) {
              deleteCanvas(activeCanvasId);
            }
          }
          onClose();
        },
        disabled: canvases.length <= 1,
      },
    ];

    const viewCommands = [
      {
        id: "toggle-preview",
        label: editorMode === "editor" ? "Switch to Preview" : "Switch to Editor",
        icon: LayoutDashboard,
        shortcut: null,
        action: () => {
          setEditorMode(editorMode === "editor" ? "preview" : "editor");
          onClose();
        },
      },
    ];

    const historyCommands = [
      {
        id: "undo",
        label: "Undo",
        icon: Undo2,
        shortcut: "Ctrl+Z",
        action: () => {
          undo();
          onClose();
        },
        disabled: !canUndo,
      },
      {
        id: "redo",
        label: "Redo",
        icon: Redo2,
        shortcut: "Ctrl+Shift+Z",
        action: () => {
          redo();
          onClose();
        },
        disabled: !canRedo,
      },
    ];

    const aiCommands = [
      {
        id: "focus-ai",
        label: "Focus AI Prompt",
        icon: Sparkles,
        shortcut: null,
        action: () => {
          const aiInput = document.querySelector('[aria-label="Describe what you want to change"]');
          if (aiInput) {
            aiInput.focus();
          }
          onClose();
        },
      },
    ];

    const canvasList = canvases.map((canvas) => ({
      id: `switch-${canvas.id}`,
      label: `Switch to: ${canvas.name}`,
      icon: Layers3,
      shortcut: null,
      action: () => {
        setActiveCanvas(canvas.id);
        onClose();
      },
      disabled: canvas.id === activeCanvasId,
    }));

    return [
      ...canvasCommands,
      ...viewCommands,
      ...historyCommands,
      ...aiCommands,
      ...canvasList,
    ];
  }, [
    canvases,
    activeCanvasId,
    editorMode,
    canUndo,
    canRedo,
    createCanvas,
    renameCanvas,
    duplicateCanvas,
    deleteCanvas,
    setActiveCanvas,
    setEditorMode,
    undo,
    redo,
    onClose,
  ]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lower) ||
        cmd.id.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected && !selected.disabled) {
          selected.action();
        }
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const handleBackdropClick = useCallback(
    (event) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#12121a] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/[0.05] px-4 py-3">
          <Search className="size-4 text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            aria-label="Search commands"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300"
            aria-label="Close command palette"
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          ref={listRef}
          className="max-h-[300px] overflow-y-auto p-1.5"
          role="listbox"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              No commands found
            </div>
          ) : (
            filteredCommands.map((command, index) => {
              const Icon = command.icon;
              return (
                <button
                  key={command.id}
                  type="button"
                  onClick={() => {
                    if (!command.disabled) {
                      command.action();
                    }
                  }}
                  disabled={command.disabled}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    index === selectedIndex
                      ? "bg-white/[0.08] text-zinc-100"
                      : "text-zinc-300 hover:bg-white/[0.04]"
                  } ${command.disabled ? "cursor-not-allowed opacity-40" : ""}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <Icon className="size-4 shrink-0 text-zinc-500" />
                  <span className="flex-1 text-left">{command.label}</span>
                  {command.shortcut && (
                    <span className="text-xs text-zinc-600">
                      {command.shortcut}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.05] px-4 py-2.5">
          <div className="flex items-center gap-2 text-[10px] text-zinc-600">
            <span className="rounded bg-white/[0.06] px-1.5 py-0.5">↑↓</span>
            <span>Navigate</span>
            <span className="rounded bg-white/[0.06] px-1.5 py-0.5">↵</span>
            <span>Select</span>
            <span className="rounded bg-white/[0.06] px-1.5 py-0.5">Esc</span>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
