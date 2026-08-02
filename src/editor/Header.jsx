import { Code2, Eye, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";

export default function Header() {
  const editorMode = useAppStore((state) => state.editorMode);
  const setEditorMode = useAppStore((state) => state.setEditorMode);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-white/[0.06] bg-[#09090b]/85 backdrop-blur-xl">
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
        </div>

        <div className="min-w-0 flex-1" />

        <div className="flex shrink-0 items-center gap-2">
          <div
            className="flex items-center rounded-lg border border-white/[0.06] bg-white/[0.03] p-0.5"
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
  );
}
