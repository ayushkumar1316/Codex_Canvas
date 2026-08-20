import { useCallback, useRef, useState } from "react";
import {
  ArrowUp,
  ChevronDown,
  Image,
  Mic,
  MicOff,
  Sparkles,
  X,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { componentRegistry } from "@/registry/componentRegistry";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import useImageAttachment from "@/hooks/useImageAttachment";
import AutoResizeTextarea from "./AutoResizeTextarea";
import RotatingPlaceholder from "./RotatingPlaceholder";
import AIStatus from "./AIStatus";
import ImageAttachment from "./ImageAttachment";
import ProviderSelector from "./ProviderSelector";

function computeCanvasState(componentTree) {
  if (!componentTree) return "EMPTY";
  const hasChildren = (componentTree.children?.length ?? 0) > 0;
  return hasChildren ? "COMPLETE" : "PARTIAL";
}

export default function AIPill() {
  const editorMode = useAppStore((state) => state.editorMode);
  const selectedComponentId = useAppStore(
    (state) => state.selectedComponentId
  );
  const componentTree = useAppStore((state) => state.componentTree);
  const submitAICommand = useAppStore((state) => state.submitAICommand);
  const aiLoading = useAppStore((state) => state.aiLoading);
  const aiError = useAppStore((state) => state.aiError);
  const prompt = useAppStore((state) => state.aiPrompt);
  const setAIPrompt = useAppStore((state) => state.setAIPrompt);
  const aiPhase = useAppStore((state) => state.aiPhase);
  const aiProvider = useAppStore((state) => state.aiProvider);

  const [sendFlash, setSendFlash] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();
  const usedVoiceSinceLastClear = useRef(false);

  const isPreview = editorMode === "preview";

  const handleVoiceResult = useCallback(
    (transcript) => {
      usedVoiceSinceLastClear.current = true;
      const prev = useAppStore.getState().aiPrompt;
      const trimmed = prev.trim();
      setAIPrompt(trimmed ? `${trimmed} ${transcript}` : transcript);
    },
    [setAIPrompt]
  );

  const { state: voiceState, error: voiceError, isSupported, start: startListening, stop: stopListening, reset: resetVoice } =
    useSpeechRecognition({ onResult: handleVoiceResult });

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

  const hasPrompt = prompt.trim().length > 0;
  const isIdle = aiPhase === "idle";
  const isSuccess = aiPhase === "success";
  const isError = aiPhase === "error";
  const isProcessing = aiPhase === "understanding" || aiPhase === "planning" || aiPhase === "applying";
  const isListening = voiceState === "listening";

  const canSend = (hasPrompt || hasImage) && !aiLoading;

  const handleSend = () => {
    if (!canSend) return;

    if (!reduced) {
      setSendFlash(true);
      setTimeout(() => setSendFlash(false), 300);
    }

    const usedVoice = usedVoiceSinceLastClear.current;
    usedVoiceSinceLastClear.current = false;

    submitAICommand({
      prompt,
      scope: selectedComponentId ? "component" : "page",
      selectedComponentId,
      componentTree,
      registry: Object.keys(componentRegistry),
      timestamp: new Date().toISOString(),
      editorMode,
      aiProvider: aiProvider || "auto",
      hasVoice: usedVoice,
      canvasState: computeCanvasState(componentTree),
      referenceImage: image
        ? { name: image.name, type: image.type, size: image.size, preview: image.preview }
        : null,
    });
  };

  const handleClear = () => {
    setAIPrompt("");
    removeImage();
  };

  const handleDismissError = () => {
    useAppStore.setState({ aiError: null, aiPhase: "idle" });
    resetVoice();
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (isPreview && !expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border px-4 py-2.5 shadow-theme-lg transition-all duration-150 hover:shadow-theme-xl hover:scale-[1.03] active:scale-95 border-border-subtle dark:border-[rgba(139,92,246,0.15)] bg-surface-1 dark:bg-gradient-to-r dark:from-surface-1 dark:to-surface-2 hover:bg-surface-2`}
      >
        <span className="flex items-center gap-2 text-[13px] font-medium text-text-primary">
          <Sparkles className="size-3.5 text-primary" />
          Ask AI
          <ChevronDown className="size-3.5 text-text-muted" />
        </span>
      </button>
    );
  }

  const idleBorder = "border-border-subtle dark:border-[rgba(139,92,246,0.12)]";
  const idleBg = "bg-surface-1 dark:bg-gradient-to-b dark:from-surface-1 dark:to-surface-0";
  const focusBorder = "focus-within:border-primary/40 focus-within:bg-surface-2";
  const innerGradient = "bg-gradient-to-b from-surface-2/50 to-transparent";
  const textColor = "text-text-primary";
  const placeholderColor = "text-text-muted";
  const badgeBorder = "border-primary/15 dark:border-primary/25";
  const badgeBg = "bg-primary/8 dark:bg-primary/15";
  const badgeText = "text-primary";
  const iconMuted = "text-text-muted";
  const iconHover = "hover:bg-surface-3 hover:text-text-primary";
  const statusText = "text-text-muted";
  const dismissHover = "hover:text-text-secondary";
  const inactiveBtn = "bg-surface-2 dark:bg-surface-3 text-text-muted";

  return (
    <div
      data-ai-pill
      className="fixed bottom-8 left-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2"
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

      <div
        className={`rounded-2xl border p-[3px] shadow-theme-xl transition-all duration-300 dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] ${
          sendFlash && !reduced
            ? "border-primary/40 bg-surface-1 shadow-[0_0_30px_hsl(var(--primary)/0.2)] scale-[1.01]"
            : isListening
            ? "border-red-500/30 shadow-[0_8px_40px_rgba(239,68,68,0.12)]"
            : isProcessing
              ? "border-violet-500/30 shadow-[0_8px_40px_rgba(109,40,217,0.18)]"
              : isError
                ? "border-red-500/20"
                : `${idleBorder} ${idleBg} ${focusBorder} focus-within:shadow-[0_8px_40px_rgba(109,40,217,0.2)]`
        }`}
      >
        {hasImage && (
          <div className="px-2 pt-2">
            <ImageAttachment image={image} onRemove={removeImage} />
          </div>
        )}

        <div className={`flex items-center gap-2 rounded-[17px] px-3 py-2.5 ${innerGradient}`}>
          <div className={`flex shrink-0 items-center gap-1.5 rounded-full border ${badgeBorder} ${badgeBg} px-2.5 py-1.5 text-xs font-medium ${badgeText} transition-colors duration-200`}>
            <Sparkles className="size-3.5" />
            <span className="hidden sm:inline">
              {selectedComponentId ? "Selected" : "Entire Page"}
            </span>
          </div>

          <div className="relative min-h-[36px] flex-1 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
            {isIdle && !hasPrompt && !isListening && !hasImage && (
              <RotatingPlaceholder
                isPaused={false}
                className={`pointer-events-none absolute inset-0 flex items-center text-[15px] leading-[1.6] ${placeholderColor}`}
              />
            )}
            {isListening && !hasPrompt && (
              <span className="pointer-events-none absolute inset-0 flex items-center text-[15px] text-red-400">
                Listening...
              </span>
            )}
            <AutoResizeTextarea
              value={prompt}
              onChange={(e) => setAIPrompt(e.target.value)}
              onSubmit={handleSend}
              disabled={aiLoading}
              placeholder=""
              aria-label="Describe what you want to change"
              className={textColor}
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ProviderSelector variant="editor" />

            {isPreview && (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Collapse prompt"
                className={`flex size-8 items-center justify-center rounded-xl ${iconMuted} transition-all duration-200 ${iconHover}`}
              >
                <ChevronDown className="size-4 rotate-180" />
              </button>
            )}

            {(hasPrompt || hasImage) && isIdle && !isListening && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear prompt and image"
                className={`flex size-8 items-center justify-center rounded-xl ${iconMuted} transition-all duration-200 ${iconHover}`}
              >
                <X className="size-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleMicClick}
              disabled={!isSupported || aiLoading}
              aria-label={isListening ? "Stop listening" : "Use voice prompt"}
              className={`flex size-8 items-center justify-center rounded-xl transition-all duration-200 ${
                isListening
                  ? "bg-red-500/20 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse"
                  : `${iconMuted} ${iconHover}`
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {isListening ? (
                <MicOff className="size-4" />
              ) : (
                <Mic className="size-4" />
              )}
            </button>

            <button
              type="button"
              onClick={openFilePicker}
              disabled={aiLoading}
              aria-label="Attach image"
              className={`flex size-8 items-center justify-center rounded-xl transition-all duration-200 ${
                hasImage
                  ? "bg-purple-500/20 text-purple-400"
                  : `${iconMuted} ${iconHover}`
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <Image className="size-4" />
            </button>

            <button
              type="button"
              onClick={isError ? handleDismissError : handleSend}
              disabled={!canSend && !isError}
              aria-label={isError ? "Dismiss error" : "Send prompt"}
              className={`ml-1 flex size-8 items-center justify-center rounded-xl transition-all duration-200 ${
                isError
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : canSend
                    ? "bg-purple-600 text-white shadow-[0_2px_10px_rgba(139,92,246,0.4)] hover:bg-purple-500 hover:shadow-[0_4px_14px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95"
                    : inactiveBtn
              } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none`}
            >
              <ArrowUp className="size-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className={`flex min-h-[28px] items-center justify-between px-3 py-1.5 ${textColor}`}>
          {isListening ? (
            <div className="flex items-center gap-1.5 text-xs text-red-400">
              <span className="inline-flex gap-[2px]">
                <span className="inline-block size-[3px] animate-bounce rounded-full bg-red-400 [animation-delay:0ms]" />
                <span className="inline-block size-[3px] animate-bounce rounded-full bg-red-400 [animation-delay:150ms]" />
                <span className="inline-block size-[3px] animate-bounce rounded-full bg-red-400 [animation-delay:300ms]" />
              </span>
              <span>Listening</span>
            </div>
          ) : voiceError ? (
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <MicOff className="size-3" />
              <span>{voiceError}</span>
            </div>
          ) : imageError ? (
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <Image className="size-3" />
              <span>{imageError}</span>
            </div>
          ) : (
            <AIStatus phase={aiPhase} error={aiError} />
          )}

          {(isError || voiceError || imageError) && (
            <button
              type="button"
              onClick={handleDismissError}
              className={`text-xs ${statusText} transition-colors ${dismissHover}`}
            >
              Dismiss
            </button>
          )}

          {isSuccess && (
            <button
              type="button"
              onClick={() => useAppStore.setState({ aiPhase: "idle" })}
              className={`text-xs ${statusText} transition-colors ${dismissHover}`}
            >
              Dismiss
            </button>
          )}

          {isIdle && !aiError && !voiceError && !imageError && !isListening && (
            <span className={`text-xs ${statusText}`}>
              {hasImage ? "Describe the changes you want" : isSupported ? "Tip: Attach a screenshot or use voice" : "Press Enter to send"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
