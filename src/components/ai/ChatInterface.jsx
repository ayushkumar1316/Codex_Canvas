import { useState } from "react";
import { X, MessageCircle, Send, Sparkles } from "lucide-react";
import { useChatContext } from "@/hooks/useChatContext";
import { useAppStore } from "@/store/useAppStore";
import { componentRegistry } from "@/registry/componentRegistry";

/**
 * Conversational Chat Interface
 * ChatGPT-style message view with streaming support
 */
export function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messages = useChatContext().messages || [];
  const { addUserMessage, updateTargetedNode } = useChatContext();
  const aiPhase = useAppStore((state) => state.aiPhase);
  const aiLoading = useAppStore((state) => state.aiLoading);
  const streamingProgress = useAppStore((state) => state.streamingProgress);
  const submitAICommand = useAppStore((state) => state.submitAICommand);
  const selectedComponentId = useAppStore((state) => state.selectedComponentId);

  const handleSendMessage = () => {
    if (!newMessage.trim() || aiLoading) return;

    addUserMessage(newMessage, {
      selectedComponentId,
      scope: selectedComponentId ? "component" : "page",
    });

    if (selectedComponentId) {
      updateTargetedNode(selectedComponentId, "component");
    }

    submitAICommand({
      prompt: newMessage,
      scope: selectedComponentId ? "component" : "page",
      selectedComponentId,
      registry: Object.keys(componentRegistry),
      timestamp: new Date().toISOString(),
    });

    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-lg transition-all hover:scale-105 active:scale-95"
        title="Open conversation"
      >
        <MessageCircle className="size-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 z-40 flex w-96 flex-col rounded-2xl border border-primary/20 bg-surface-1 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <span className="font-semibold text-text-primary">Conversation</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-lg p-1 transition-colors hover:bg-surface-2"
        >
          <X className="size-4 text-text-muted" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex h-96 flex-col gap-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-center text-sm text-text-muted">
              Start editing to see conversation history
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary/20 text-primary"
                    : "bg-surface-2 text-text-primary"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {(aiPhase === "understanding" || aiPhase === "planning" || aiPhase === "applying") && (
          <div className="flex gap-1">
            <div className="size-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
            <div className="size-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
            <div className="size-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
          </div>
        )}

        {streamingProgress?.status === "streaming" && (
          <div className="text-xs text-text-muted">
            Generating... {streamingProgress.operationCount} operations
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border-subtle px-4 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for changes..."
            disabled={aiLoading}
            className="flex-1 rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={aiLoading || !newMessage.trim()}
            className="rounded-lg bg-primary/20 p-2 transition-colors hover:bg-primary/30 disabled:opacity-50"
          >
            <Send className="size-4 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
