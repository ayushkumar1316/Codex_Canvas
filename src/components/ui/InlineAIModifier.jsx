import { useState, useCallback, useRef, useEffect } from "react";
import { Sparkles, X, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useChatContext } from "@/hooks/useChatContext";
import { componentRegistry } from "@/registry/componentRegistry";

/**
 * Floating AI Modifier Widget
 * Appears on selected component for quick targeted edits
 */
export function InlineAIModifier() {
  const selectedComponentId = useAppStore((state) => state.selectedComponentId);
  const componentTree = useAppStore((state) => state.componentTree);
  const submitAICommand = useAppStore((state) => state.submitAICommand);
  const aiLoading = useAppStore((state) => state.aiLoading);
  const aiPhase = useAppStore((state) => state.aiPhase);

  const { addUserMessage, updateTargetedNode } = useChatContext();

  const [prompt, setPrompt] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Calculate position based on selected component
  useEffect(() => {
    if (!selectedComponentId) {
      setIsVisible(false);
      return;
    }

    // Find the DOM element for the selected component
    const element = document.querySelector(
      `[data-component-id="${selectedComponentId}"]`
    );

    if (element) {
      const rect = element.getBoundingClientRect();
      setPosition({
        top: rect.top - 60, // Above the element
        left: rect.left + rect.width / 2, // Centered
      });
      setIsVisible(true);

      // Focus input when visible
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } else {
      setIsVisible(false);
    }
  }, [selectedComponentId]);

  // Hide when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        !event.target.closest("[data-component-id]")
      ) {
        // Don't hide immediately, give time for selection
        setTimeout(() => {
          if (!document.querySelector(":focus")) {
            setIsVisible(false);
          }
        }, 200);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!prompt.trim() || aiLoading || !selectedComponentId) return;

    // Add to chat history
    addUserMessage(prompt, {
      selectedComponentId,
      scope: "component",
      isInlineEdit: true,
    });

    // Track targeted node for pronoun resolution
    updateTargetedNode(selectedComponentId, "component");

    // Submit AI command with targeted component
    submitAICommand({
      prompt,
      scope: "component",
      selectedComponentId,
      registry: Object.keys(componentRegistry),
      timestamp: new Date().toISOString(),
    });

    setPrompt("");
  }, [
    prompt,
    aiLoading,
    selectedComponentId,
    addUserMessage,
    updateTargetedNode,
    submitAICommand,
  ]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setPrompt("");
      setIsVisible(false);
    }
  };

  if (!isVisible || !selectedComponentId) return null;

  const isProcessing = aiPhase === "understanding" || aiPhase === "planning";

  return (
    <div
      ref={containerRef}
      className="fixed z-50 -translate-x-1/2 transform transition-all duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 px-3 py-2 shadow-lg backdrop-blur-sm">
        <Sparkles className="size-4 text-primary" />

        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe changes..."
          disabled={aiLoading}
          className="w-64 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
        />

        {isProcessing ? (
          <Loader2 className="size-4 animate-spin text-primary" />
        ) : (
          prompt.trim() && (
            <button
              onClick={handleSubmit}
              className="rounded-lg bg-primary/20 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/30"
            >
              Apply
            </button>
          )
        )}

        <button
          onClick={() => setIsVisible(false)}
          className="rounded-lg p-1 text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export default InlineAIModifier;
