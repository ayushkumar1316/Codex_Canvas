import { useState } from "react";
import {
  Code2,
  Copy,
  Download,
  Eye,
  FileCode,
  FileJson,
  Globe,
  Layers3,
  MoreVertical,
  Plus,
  Redo2,
  SquarePen,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import DeleteConfirmationDialog from "@/components/ui/DeleteConfirmationDialog";
import {
  exportToJSON,
  generateHTML,
  generateReactProject,
  downloadAsZIP,
  downloadFile,
  copyToClipboard,
  importFromJSON,
} from "@/utils/exportEngine";

export default function Header() {
  const editorMode = useAppStore((state) => state.editorMode);
  const setEditorMode = useAppStore((state) => state.setEditorMode);
  const createCanvas = useAppStore((state) => state.createCanvas);
  const canvases = useAppStore((state) => state.canvases);
  const activeCanvasId = useAppStore((state) => state.activeCanvasId);
  const renameCanvas = useAppStore((state) => state.renameCanvas);
  const duplicateCanvas = useAppStore((state) => state.duplicateCanvas);
  const deleteCanvas = useAppStore((state) => state.deleteCanvas);
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);
  const canUndo = useAppStore((state) => state.canUndo);
  const canRedo = useAppStore((state) => state.canRedo);
  const componentTree = useAppStore((state) => state.componentTree);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const activeCanvas = canvases.find((c) => c.id === activeCanvasId);
  const canvasName = activeCanvas?.name || "Untitled Canvas";
  const canDelete = canvases.length > 1;

  const handleNewCanvas = () => {
    createCanvas();
  };

  const handleStartRename = () => {
    setEditingName(canvasName);
    setIsEditingName(true);
    setShowContextMenu(false);
  };

  const handleSaveRename = () => {
    if (editingName.trim() && activeCanvasId) {
      renameCanvas(activeCanvasId, editingName.trim());
    }
    setIsEditingName(false);
  };

  const handleDuplicate = () => {
    if (activeCanvasId) {
      const newId = duplicateCanvas(activeCanvasId);
      if (newId) {
        useAppStore.getState().setActiveCanvas(newId);
      }
    }
    setShowContextMenu(false);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
    setShowContextMenu(false);
  };

  const handleConfirmDelete = () => {
    if (activeCanvasId) {
      deleteCanvas(activeCanvasId);
    }
    setShowDeleteDialog(false);
  };

  const handleExportJSON = () => {
    const json = exportToJSON(activeCanvas);
    downloadFile(json, `${canvasName}.json`, "application/json");
    setShowExportMenu(false);
  };

  const handleExportHTML = () => {
    const html = generateHTML(componentTree, canvasName);
    downloadFile(html, `${canvasName}.html`, "text/html");
    setShowExportMenu(false);
  };

  const handleExportReact = async () => {
    const files = generateReactProject(componentTree, canvasName);
    await downloadAsZIP(files, canvasName);
    setShowExportMenu(false);
  };

  const handleCopyJSON = async () => {
    const json = exportToJSON(activeCanvas);
    await copyToClipboard(json);
    setShowExportMenu(false);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const text = await file.text();
      const result = importFromJSON(text);

      if (result.success) {
        useAppStore.getState().setActiveCanvas(result.data.canvas.id);
        setShowContextMenu(false);
      } else {
        alert(`Import failed: ${result.error}`);
      }
    };
    input.click();
    setShowContextMenu(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-14 border-b border-white/[0.05] bg-[#0a0a0e]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full items-center px-4 sm:px-5">
          <div className="flex shrink-0 items-center gap-2.5">
            <a href="/" className="group flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-violet-950/40 transition-transform duration-300 group-hover:scale-105">
                <Layers3 className="size-3.5 text-white" strokeWidth={2.3} />
              </span>
              <span className="hidden text-[13px] font-semibold tracking-[-0.03em] text-white sm:block">
                Codex Canvas
              </span>
            </a>
            <span className="hidden h-3.5 w-px bg-white/[0.08] sm:block" />

            <span className="rounded-md border border-violet-400/[0.12] bg-violet-400/[0.06] px-2 py-0.5 text-[10px] font-medium text-violet-200">
              {editorMode === "editor" ? "Editor" : "Preview"}
            </span>

            <span className="hidden h-3.5 w-px bg-white/[0.08] sm:block" />

            {isEditingName ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={handleSaveRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveRename();
                  } else if (e.key === "Escape") {
                    setIsEditingName(false);
                  }
                }}
                className="w-40 border-0 bg-transparent text-[12px] font-medium text-zinc-200 outline-none focus:ring-0"
                autoFocus
              />
            ) : (
              <button
                type="button"
                onClick={handleStartRename}
                className="max-w-[160px] truncate text-[12px] font-medium text-zinc-400 transition-colors hover:text-zinc-200"
                title="Click to rename"
              >
                {canvasName}
              </button>
            )}
          </div>

          <div className="min-w-0 flex-1" />

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                className="inline-flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] p-1.5 text-zinc-400 transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/[0.08] disabled:hover:bg-white/[0.04] disabled:hover:text-zinc-400"
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
              >
                <Undo2 className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                className="inline-flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] p-1.5 text-zinc-400 transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/[0.08] disabled:hover:bg-white/[0.04] disabled:hover:text-zinc-400"
                title="Redo (Ctrl+Shift+Z)"
                aria-label="Redo"
              >
                <Redo2 className="size-3.5" />
              </button>
            </div>

            <span className="hidden h-3.5 w-px bg-white/[0.08] sm:block" />

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-zinc-200"
                title="Export project"
              >
                <Download className="size-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-white/[0.08] bg-[#12121a] p-1 shadow-xl">
                    <button
                      type="button"
                      onClick={handleExportJSON}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-white/[0.06]"
                      aria-label="Export as JSON"
                    >
                      <FileJson className="size-3.5" />
                      Export JSON
                    </button>
                    <button
                      type="button"
                      onClick={handleExportHTML}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-white/[0.06]"
                      aria-label="Export as HTML"
                    >
                      <Globe className="size-3.5" />
                      Export HTML
                    </button>
                    <button
                      type="button"
                      onClick={handleExportReact}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-white/[0.06]"
                      aria-label="Export as React project"
                    >
                      <FileCode className="size-3.5" />
                      Export React
                    </button>
                    <div className="my-1 h-px bg-white/[0.05]" />
                    <button
                      type="button"
                      onClick={handleCopyJSON}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-white/[0.06]"
                      aria-label="Copy JSON to clipboard"
                    >
                      <Copy className="size-3.5" />
                      Copy JSON
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleNewCanvas}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-zinc-200"
            >
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">New</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowContextMenu(!showContextMenu)}
                className="inline-flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] p-1.5 text-zinc-400 transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-zinc-200"
                aria-label="Canvas actions"
              >
                <MoreVertical className="size-3.5" />
              </button>
              {showContextMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowContextMenu(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-white/[0.08] bg-[#12121a] p-1 shadow-xl">
                    <button
                      type="button"
                      onClick={handleStartRename}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-white/[0.06]"
                      aria-label="Rename canvas"
                    >
                      <SquarePen className="size-3.5" />
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={handleDuplicate}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-white/[0.06]"
                      aria-label="Duplicate canvas"
                    >
                      <Copy className="size-3.5" />
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={handleImport}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-white/[0.06]"
                      aria-label="Import components"
                    >
                      <Upload className="size-3.5" />
                      Import
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                        aria-label="Delete canvas"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            <div
              className="flex items-center rounded-lg border border-white/[0.05] bg-white/[0.03] p-0.5"
              aria-label="View mode"
            >
              <Button
                type="button"
                variant="ghost"
                aria-pressed={editorMode === "editor"}
                onClick={() => setEditorMode("editor")}
                className={`h-7 gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-all duration-150 sm:px-3 ${
                  editorMode === "editor"
                    ? "bg-white/[0.08] text-zinc-100 shadow-sm hover:bg-white/[0.1] hover:text-white"
                    : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300"
                }`}
              >
                <Code2 className="size-3.5" />
                <span className="hidden sm:inline">Editor</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                aria-pressed={editorMode === "preview"}
                onClick={() => setEditorMode("preview")}
                className={`h-7 gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-all duration-150 sm:px-3 ${
                  editorMode === "preview"
                    ? "bg-white/[0.08] text-zinc-100 shadow-sm hover:bg-white/[0.1] hover:text-white"
                    : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300"
                }`}
              >
                <Eye className="size-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Canvas"
        description={`Are you sure you want to delete "${canvasName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
