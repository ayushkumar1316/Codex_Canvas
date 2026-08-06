import { useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Cloud,
  Clock3,
  Copy,
  FolderOpen,
  Globe,
  Image,
  ImagePlus,
  Layers3,
  LayoutDashboard,
  Mic,
  MicOff,
  MoreVertical,
  Paintbrush,
  Search,
  SquarePen,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import useImageAttachment from "@/hooks/useImageAttachment";
import { useAppStore } from "@/store/useAppStore";
import DeleteConfirmationDialog from "@/components/ui/DeleteConfirmationDialog";

const features = [
  {
    title: "Start from a Screenshot",
    description: "Upload any image and let AI rebuild it as editable components.",
    icon: ImagePlus,
    color: "text-violet-400",
  },
  {
    title: "Shape a Wireframe",
    description: "Describe your layout and watch it come to life instantly.",
    icon: Wand2,
    color: "text-sky-400",
  },
  {
    title: "Create with your Voice",
    description: "Speak your design vision — no typing required.",
    icon: Mic,
    color: "text-amber-400",
  },
];

const templates = [
  { label: "SaaS Landing Page", prompt: "Build a modern SaaS landing page with hero, features, pricing, and testimonials", icon: Cloud, color: "text-blue-400" },
  { label: "Portfolio", prompt: "Create a sleek developer portfolio with project showcase and about section", icon: Paintbrush, color: "text-purple-400" },
  { label: "Dashboard", prompt: "Design an analytics dashboard with charts, metrics sidebar, and data tables", icon: LayoutDashboard, color: "text-emerald-400" },
  { label: "Apple-Style Homepage", prompt: "Make my homepage look like Apple — clean typography, large imagery, smooth layout", icon: Globe, color: "text-amber-400" },
  { label: "From Screenshot", prompt: "Improve this website using the attached screenshot — modernize the layout and refine spacing", icon: Sparkles, color: "text-fuchsia-400" },
];

function formatRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function countComponents(node) {
  if (!node) return 0;
  let count = 1;
  for (const child of node.children ?? []) {
    count += countComponents(child);
  }
  return count;
}

export default function Landing() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [canvasToDelete, setCanvasToDelete] = useState(null);
  const [editingCanvasId, setEditingCanvasId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [contextMenuCanvasId, setContextMenuCanvasId] = useState(null);

  const canvases = useAppStore((state) => state.canvases);
  const setActiveCanvas = useAppStore((state) => state.setActiveCanvas);
  const renameCanvas = useAppStore((state) => state.renameCanvas);
  const duplicateCanvas = useAppStore((state) => state.duplicateCanvas);
  const deleteCanvas = useAppStore((state) => state.deleteCanvas);

  const recentCanvases = useMemo(() => {
    let filtered = canvases;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(query)
      );
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "updatedAt") {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
      if (sortBy === "createdAt") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [canvases, searchQuery, sortBy]);

  const handleVoiceResult = useCallback(
    (transcript) => {
      setPrompt((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${transcript}` : transcript;
      });
    },
    []
  );

  const {
    state: voiceState,
    error: voiceError,
    isSupported,
    start: startListening,
    stop: stopListening,
  } = useSpeechRecognition({ onResult: handleVoiceResult });

  const {
    image,
    error: imageError,
    inputRef,
    hasImage,
    handleFileSelect,
    handleDrop,
    handlePaste,
    removeImage,
    openFilePicker,
  } = useImageAttachment();

  const isListening = voiceState === "listening";
  const hasPrompt = prompt.trim().length > 0;

  const handleTemplateClick = (templatePrompt) => {
    setPrompt(templatePrompt);
  };

  const handleCreate = () => {
    if (!prompt.trim() && !hasImage) return;
    const promptToSend = prompt.trim() || null;
    const imageToSend = hasImage
      ? { name: image.name, type: image.type, size: image.size, preview: image.preview }
      : null;
    setPrompt("");
    removeImage();
    navigate("/editor", {
      state: {
        initialPrompt: promptToSend,
        initialImage: imageToSend,
      },
    });
  };

  const handleOpenEditor = () => {
    navigate("/editor");
  };

  const handleOpenCanvas = (canvasId) => {
    setActiveCanvas(canvasId);
    navigate("/editor");
  };

  const handleRenameCanvas = (canvasId) => {
    if (editingName.trim()) {
      renameCanvas(canvasId, editingName.trim());
    }
    setEditingCanvasId(null);
    setEditingName("");
  };

  const handleDuplicateCanvas = (canvasId) => {
    const newId = duplicateCanvas(canvasId);
    if (newId) {
      setActiveCanvas(newId);
      navigate("/editor");
    }
  };

  const handleDeleteCanvas = (canvasId) => {
    deleteCanvas(canvasId);
    setCanvasToDelete(null);
  };

  const handleStartRename = (canvas) => {
    setEditingCanvasId(canvas.id);
    setEditingName(canvas.name);
    setContextMenuCanvasId(null);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-purple-400/30"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onPaste={handlePaste}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-zinc-950/80 to-zinc-950" />
      <div className="pointer-events-none absolute left-[-18rem] top-[28rem] size-[38rem] rounded-full bg-fuchsia-600/6 blur-[140px]" />
      <div className="pointer-events-none absolute right-[-14rem] top-[16rem] size-[32rem] rounded-full bg-sky-500/6 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:48px_48px]" />

      <nav className="relative z-10 mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="/" className="group flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-violet-950/40 transition-transform duration-300 group-hover:scale-105">
            <Layers3 className="size-[18px] text-white" strokeWidth={2} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.03em] text-white">
            Codex Canvas
          </span>
        </a>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenEditor}
            className="group inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 py-1.5 pl-2.5 pr-3.5 text-xs font-medium text-purple-200 shadow-lg shadow-purple-950/20 backdrop-blur-xl transition-all duration-300 hover:border-purple-400/30 hover:bg-purple-500/15 hover:shadow-purple-500/20"
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-purple-500/25">
              <Sparkles className="size-3" />
            </span>
            The new creative workspace
            <ChevronRight className="size-3.5 text-purple-300/60 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-purple-200" />
          </button>
        </div>
      </nav>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
        <h1 className="max-w-4xl text-balance text-4xl font-extrabold leading-[1.06] tracking-tight text-white md:text-6xl">
          Design with anything.
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Refine naturally.
          </span>
        </h1>

        <p className="mt-7 max-w-2xl text-pretty text-base font-normal leading-7 tracking-[-0.01em] text-zinc-400 sm:text-lg">
          Describe your idea, attach a screenshot, or speak it aloud. Codex
          Canvas turns your input into polished, editable interfaces — instantly.
        </p>

        <div
          id="create"
          className={`mt-10 w-full max-w-3xl rounded-2xl border p-[3px] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.75)] backdrop-blur-2xl transition-all duration-500 ${
            isFocused
              ? "border-purple-500/40 bg-white/[0.06] shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]"
              : "border-white/[0.08] bg-white/[0.04] hover:border-white/[0.14] hover:shadow-[0_28px_90px_-22px_rgba(139,92,246,0.15)]"
          }`}
        >
          <div className="rounded-[17px] bg-gradient-to-b from-white/[0.03] to-transparent p-4">
            {hasImage && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2 py-1.5">
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
                    {image.size < 1024
                      ? `${image.size} B`
                      : image.size < 1024 * 1024
                        ? `${(image.size / 1024).toFixed(1)} KB`
                        : `${(image.size / (1024 * 1024)).toFixed(1)} MB`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="Remove image"
                  className="flex size-6 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/[0.08] hover:text-zinc-200"
                >
                  <X className="size-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                isFocused
                  ? "bg-purple-500/20 text-purple-300 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                  : "bg-white/[0.06] text-zinc-400"
              }`}>
                <SquarePen className="size-[18px]" />
              </div>

              <div className="relative flex-1">
                {isListening && !hasPrompt && (
                  <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-sm text-red-400">
                    Listening...
                  </span>
                )}
                <Input
                  aria-label="Describe what you want to create"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={isListening ? "" : "Design a modern SaaS landing page..."}
                  className="h-auto border-0 bg-transparent p-0 text-[15px] text-white shadow-none outline-none placeholder:text-zinc-500 transition-colors duration-300 focus:border-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <button
                type="button"
                onClick={handleCreate}
                disabled={!hasPrompt && !hasImage}
                aria-label="Create"
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                  hasPrompt || hasImage
                    ? "bg-purple-600 text-white shadow-[0_2px_12px_rgba(139,92,246,0.4)] hover:bg-purple-500 hover:shadow-[0_4px_16px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95"
                    : "bg-white/[0.06] text-zinc-500"
                } disabled:cursor-not-allowed`}
              >
                <ArrowRight className="size-[18px]" strokeWidth={2} />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-1.5 border-t border-white/[0.05] pt-3">
              <button
                type="button"
                onClick={openFilePicker}
                aria-label="Attach image"
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] transition-all duration-200 ${
                  hasImage
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200"
                }`}
              >
                <Image className="size-3.5" />
                <span>{hasImage ? "Change" : "Attach"}</span>
              </button>
              <button
                type="button"
                onClick={handleMicClick}
                disabled={!isSupported}
                aria-label={isListening ? "Stop listening" : "Use voice prompt"}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] transition-all duration-200 ${
                  isListening
                    ? "bg-red-500/20 text-red-400"
                    : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {isListening ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
                <span>{isListening ? "Stop" : "Mic"}</span>
              </button>
            </div>

            {(voiceError || imageError) && (
              <div className="mt-2 text-[11px] text-amber-400">
                {voiceError || imageError}
              </div>
            )}
          </div>
        </div>

        <p className="mt-5 flex items-center gap-1.5 text-xs text-zinc-500">
          <Sparkles className="size-3 text-purple-400/60" />
          Tip: Attach a screenshot and describe the changes you want
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.label}
                type="button"
                onClick={() => handleTemplateClick(template.prompt)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition-all duration-200 hover:border-purple-500/50 hover:bg-white/10 hover:text-white"
              >
                <Icon className={`size-4 ${template.color}`} />
                {template.label}
              </button>
            );
          })}
        </div>
      </section>

      <section id="features" className="relative z-10 border-t border-white/[0.07]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-10 text-center">
            <div className="mb-3 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-violet-300">
              <Sparkles className="size-3.5" />
              Core Capabilities
            </div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
              Three ways to start building
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.055]"
                >
                  <div className={`mb-4 flex size-10 items-center justify-center rounded-xl bg-white/[0.06] ${feature.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-100">{feature.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="canvases" className="relative z-10 border-t border-white/[0.07]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-9">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-violet-300">
              <Layers3 className="size-3.5" />
              Your Canvases
            </div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
              Recent canvases
            </h2>
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search canvases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 border-white/[0.08] bg-white/[0.03] pl-9 text-sm text-zinc-200 placeholder:text-zinc-500 focus-visible:border-violet-400/40 focus-visible:ring-1 focus-visible:ring-violet-400/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Sort by:</span>
              <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
                {[
                  { value: "updatedAt", label: "Recent" },
                  { value: "name", label: "Name" },
                  { value: "createdAt", label: "Created" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortBy(option.value)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-all duration-150 ${
                      sortBy === option.value
                        ? "bg-white/[0.08] text-zinc-100"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {recentCanvases.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentCanvases.map((canvas) => (
                <div
                  key={canvas.id}
                  className="group relative rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.06]"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      {editingCanvasId === canvas.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => handleRenameCanvas(canvas.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleRenameCanvas(canvas.id);
                            } else if (e.key === "Escape") {
                              setEditingCanvasId(null);
                              setEditingName("");
                            }
                          }}
                          className="w-full border-0 bg-transparent text-sm font-medium text-zinc-100 outline-none focus:ring-0"
                          autoFocus
                        />
                      ) : (
                        <p className="truncate text-sm font-medium text-zinc-100">
                          {canvas.name}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setContextMenuCanvasId(
                            contextMenuCanvasId === canvas.id ? null : canvas.id
                          )
                        }
                        className="rounded-lg p-1 text-zinc-500 opacity-0 transition-all duration-150 hover:bg-white/[0.08] hover:text-zinc-300 group-hover:opacity-100"
                        aria-label="Canvas actions"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                      {contextMenuCanvasId === canvas.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-xl border border-white/[0.08] bg-[#12121a] p-1 shadow-xl">
                          <button
                            type="button"
                            onClick={() => handleStartRename(canvas)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-white/[0.06]"
                          >
                            <SquarePen className="size-3.5" />
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleDuplicateCanvas(canvas.id);
                              setContextMenuCanvasId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-white/[0.06]"
                          >
                            <Copy className="size-3.5" />
                            Duplicate
                          </button>
                          {canvases.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setCanvasToDelete(canvas);
                                setContextMenuCanvasId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                            >
                              <Trash2 className="size-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <Clock3 className="size-3" />
                      {formatRelativeTime(canvas.updatedAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers3 className="size-3" />
                      {canvas.componentTree
                        ? countComponents(canvas.componentTree)
                        : 0}{" "}
                      components
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenCanvas(canvas.id)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300 transition-all duration-200 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-200"
                    >
                      <FolderOpen className="size-3" />
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] py-20 text-center">
              <div className="mb-6 w-40">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <div className="flex gap-1.5">
                    <span className="size-1.5 rounded-full bg-white/[0.12]" />
                    <span className="size-1.5 rounded-full bg-white/[0.08]" />
                    <span className="size-1.5 rounded-full bg-white/[0.06]" />
                  </div>
                  <div className="mt-3 grid grid-cols-[0.6fr_1.4fr] gap-2">
                    <div className="space-y-2">
                      <div className="h-8 rounded-md bg-white/[0.06]" />
                      <div className="h-5 rounded-md bg-white/[0.04]" />
                      <div className="h-5 rounded-md bg-white/[0.04]" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-3/4 rounded bg-white/[0.08]" />
                      <div className="h-2 w-full rounded bg-white/[0.05]" />
                      <div className="h-2 w-2/3 rounded bg-white/[0.05]" />
                      <div className="mt-3 grid grid-cols-2 gap-1.5">
                        <div className="h-6 rounded bg-white/[0.04]" />
                        <div className="h-6 rounded bg-white/[0.04]" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-center">
                  <span className="rounded-md border border-dashed border-white/[0.08] px-2 py-0.5 text-[8px] text-white/[0.15]">
                    empty canvas
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-zinc-300">
                {searchQuery ? "No canvases found" : "No canvases yet"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {searchQuery
                  ? "Try a different search term"
                  : "Your AI-generated projects will appear here."}
              </p>
            </div>
          )}
        </div>
      </section>

      <footer
        id="about"
        className="relative z-10 mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/[0.07] px-5 py-7 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-8"
      >
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-md bg-white/[0.06]">
            <Layers3 className="size-3 text-zinc-400" />
          </span>
          Codex Canvas
        </div>
        <div className="flex items-center gap-1.5">
          <Clock3 className="size-3.5" />
          Built for ideas in motion
        </div>
      </footer>

      <DeleteConfirmationDialog
        isOpen={!!canvasToDelete}
        onClose={() => setCanvasToDelete(null)}
        onConfirm={() => handleDeleteCanvas(canvasToDelete?.id)}
        title="Delete Canvas"
        description={`Are you sure you want to delete "${canvasToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </main>
  );
}
