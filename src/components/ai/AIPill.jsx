import { useCallback } from "react";
import {
  ArrowUp,
  Image,
  Mic,
  MicOff,
  Sparkles,
  X,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import useImageAttachment from "@/hooks/useImageAttachment";
import AutoResizeTextarea from "./AutoResizeTextarea";
import RotatingPlaceholder from "./RotatingPlaceholder";
import AIStatus from "./AIStatus";
import ImageAttachment from "./ImageAttachment";

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

  const handleVoiceResult = useCallback(
    (transcript) => {
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

    submitAICommand({
      prompt,
      scope: selectedComponentId ? "component" : "page",
      selectedComponentId,
      componentTree,
      timestamp: new Date().toISOString(),
      editorMode,
      referenceImage: image
        ? { name: image.name, type: image.type, size: image.size }
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

  return (
    <div
      className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2"
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
        className={`rounded-2xl border p-[3px] shadow-[0_18px_55px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition-all duration-300 ${
          isListening
            ? "border-red-500/30 shadow-[0_18px_60px_rgba(239,68,68,0.15)]"
            : isProcessing
              ? "border-violet-500/30 shadow-[0_18px_60px_rgba(109,40,217,0.2)]"
              : isError
                ? "border-red-500/20"
                : "border-white/[0.1] bg-white/[0.04] focus-within:border-purple-500/40 focus-within:bg-white/[0.06] focus-within:shadow-[0_18px_60px_rgba(109,40,217,0.24)]"
        }`}
      >
        {hasImage && (
          <div className="px-2 pt-2">
            <ImageAttachment image={image} onRemove={removeImage} />
          </div>
        )}

        <div className="flex items-end gap-2 rounded-[17px] bg-gradient-to-b from-white/[0.03] to-transparent px-3 py-2.5">
          <div className="mb-0.5 flex shrink-0 items-center gap-1.5 rounded-full border border-purple-400/15 bg-purple-500/[0.08] px-2.5 py-1.5 text-xs font-medium text-purple-200 transition-colors duration-200 hover:bg-purple-500/[0.12]">
            <Sparkles className="size-3.5" />
            <span className="hidden sm:inline">
              {selectedComponentId ? "Selected" : "Entire Page"}
            </span>
          </div>

          <div className="relative flex-1">
            {isIdle && !hasPrompt && !isListening && !hasImage && (
              <RotatingPlaceholder
                isPaused={false}
                className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-sm text-zinc-500"
              />
            )}
            {isListening && !hasPrompt && (
              <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-sm text-red-400">
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
            />
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {(hasPrompt || hasImage) && isIdle && !isListening && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear prompt and image"
                className="flex size-8 items-center justify-center rounded-xl text-zinc-500 transition-all duration-200 hover:bg-white/[0.07] hover:text-zinc-200"
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
                  : "text-zinc-500 hover:bg-white/[0.07] hover:text-zinc-200"
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
                  : "text-zinc-500 hover:bg-white/[0.07] hover:text-zinc-200"
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
                    : "bg-white/[0.06] text-zinc-500"
              } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none`}
            >
              <ArrowUp className="size-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="flex min-h-[28px] items-center justify-between px-3 py-1.5">
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
            <AIStatus phase={aiPhase} />
          )}

          {(isError || voiceError || imageError) && (
            <button
              type="button"
              onClick={handleDismissError}
              className="text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Dismiss
            </button>
          )}

          {isSuccess && (
            <button
              type="button"
              onClick={() => useAppStore.setState({ aiPhase: "idle" })}
              className="text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Dismiss
            </button>
          )}

          {isIdle && !aiError && !voiceError && !imageError && !isListening && (
            <span className="text-[11px] text-zinc-600">
              {hasImage ? "Describe the changes you want" : isSupported ? "Tip: Attach a screenshot or use voice" : "Press Enter to send"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
