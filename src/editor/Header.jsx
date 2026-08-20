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
import DevicePreview from "@/components/ui/DevicePreview";
import ThemeSelector from "@/components/ui/ThemeSelector";
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
  const previewDevice = useAppStore((state) => state.previewDevice);
  const setPreviewDevice = useAppStore((state) => state.setPreviewDevice);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
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

  const headerBtn = "inline-flex items-center justify-center rounded-lg border border-border-subtle bg-surface-1 p-1.5 text-text-secondary transition-all duration-150 hover:border-border-default hover:bg-surface-2 hover:text-text-primary hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border-subtle disabled:hover:bg-surface-1 disabled:hover:text-text-secondary disabled:hover:scale-100";
  const headerBtnLabeled = "inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-1 px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-all duration-150 hover:border-border-default hover:bg-surface-2 hover:text-text-primary hover:scale-105 active:scale-95";
  const menuItem = "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-text-primary transition-colors duration-150 hover:bg-hover-surface";
  const menuDivider = "my-1 h-px bg-border-subtle";

  return (
    <>
      <header className="sticky top-0 z-40 h-14 border-b border-border-subtle bg-surface-0/90 transition-colors duration-300 dark:panel-glass dark:border-[rgba(139,92,246,0.08)]">
        <div className="mx-auto flex h-full w-full items-center px-4 sm:px-5">
          <div className="flex shrink-0 items-center gap-2.5">
            <a href="/" className="group flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-violet-500/20 transition-transform duration-300 group-hover:scale-105">
                <Layers3 className="size-3.5 text-white" strokeWidth={2.3} />
              </span>
              <span className="hidden text-[13px] font-semibold tracking-[-0.03em] text-text-primary sm:block">
                Codex Canvas
              </span>
            </a>
            <span className="hidden h-3.5 w-px bg-border-subtle sm:block" />

            <span className="rounded-md border border-primary/15 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
              {editorMode === "editor" ? "Editor" : "Preview"}
            </span>

            <span className="hidden h-3.5 w-px bg-border-subtle sm:block" />

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
                className="w-40 border-0 bg-transparent text-[12px] font-medium text-text-primary outline-none focus:ring-0"
                autoFocus
              />
            ) : (
              <button
                type="button"
                onClick={handleStartRename}
                className="max-w-[160px] truncate text-[12px] font-medium text-text-muted transition-colors hover:text-text-primary"
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
                className={headerBtn}
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
              >
                <Undo2 className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                className={headerBtn}
                title="Redo (Ctrl+Shift+Z)"
                aria-label="Redo"
              >
                <Redo2 className="size-3.5" />
              </button>
            </div>

            <span className="hidden h-3.5 w-px bg-border-subtle sm:block" />

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={headerBtnLabeled}
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
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border-subtle dark:border-[rgba(139,92,246,0.12)] bg-surface-1 dark:bg-surface-2 p-1 shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    <button type="button" onClick={handleExportJSON} className={menuItem} aria-label="Export as JSON">
                      <FileJson className="size-3.5" />
                      Export JSON
                    </button>
                    <button type="button" onClick={handleExportHTML} className={menuItem} aria-label="Export as HTML">
                      <Globe className="size-3.5" />
                      Export HTML
                    </button>
                    <button type="button" onClick={handleExportReact} className={menuItem} aria-label="Export as React project">
                      <FileCode className="size-3.5" />
                      Export React
                    </button>
                    <div className={menuDivider} />
                    <button type="button" onClick={handleCopyJSON} className={menuItem} aria-label="Copy JSON to clipboard">
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
              className={headerBtnLabeled}
            >
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">New</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowContextMenu(!showContextMenu)}
                className={headerBtn}
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
                  <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-border-subtle bg-surface-1 p-1 shadow-xl">
                    <button type="button" onClick={handleStartRename} className={menuItem} aria-label="Rename canvas">
                      <SquarePen className="size-3.5" />
                      Rename
                    </button>
                    <button type="button" onClick={handleDuplicate} className={menuItem} aria-label="Duplicate canvas">
                      <Copy className="size-3.5" />
                      Duplicate
                    </button>
                    <button type="button" onClick={handleImport} className={menuItem} aria-label="Import components">
                      <Upload className="size-3.5" />
                      Import
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-500 transition-colors hover:bg-red-50"
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

            <div className="flex items-center gap-2">
              <ThemeSelector value={theme} onChange={setTheme} />
              <DevicePreview
                value={previewDevice}
                onChange={setPreviewDevice}
              />

              <div
                className="flex items-center rounded-lg border border-border-subtle bg-surface-1 p-0.5"
                aria-label="View mode"
              >
              <Button
                type="button"
                variant="ghost"
                aria-pressed={editorMode === "editor"}
                onClick={() => setEditorMode("editor")}
                className={`h-7 gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all duration-150 sm:px-3 ${
                  editorMode === "editor"
                    ? "bg-surface-3 text-text-primary shadow-sm"
                    : "text-text-secondary hover:bg-hover-surface hover:text-text-primary"
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
                className={`h-7 gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all duration-150 sm:px-3 ${
                  editorMode === "preview"
                    ? "bg-surface-3 text-text-primary shadow-sm"
                    : "text-text-secondary hover:bg-hover-surface hover:text-text-primary"
                }`}
              >
                <Eye className="size-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
            </div>
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
