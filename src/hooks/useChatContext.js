import { useCallback } from "react";
import { useChatStore } from "@/store/useChatStore";

/**
 * Hook to integrate chat history into React components
 * Manages conversation context and node targeting
 */
export function useChatContext() {
  const messages = useChatStore((state) => state.messages);
  const lastTargetedNodeId = useChatStore((state) => state.lastTargetedNodeId);
  const lastTargetedNodeType = useChatStore((state) => state.lastTargetedNodeType);
  const addMessage = useChatStore((state) => state.addMessage);
  const setLastTargetedNode = useChatStore((state) => state.setLastTargetedNode);
  const getRecentContext = useChatStore((state) => state.getRecentContext);
  const startNewSession = useChatStore((state) => state.startNewSession);
  const clearHistory = useChatStore((state) => state.clearHistory);

  // Add a user message to the conversation
  const addUserMessage = useCallback(
    (content, metadata = {}) => {
      addMessage({
        role: "user",
        content,
        metadata,
      });
    },
    [addMessage]
  );

  // Add an AI assistant message to the conversation
  const addAssistantMessage = useCallback(
    (content, metadata = {}) => {
      addMessage({
        role: "assistant",
        content,
        metadata,
      });
    },
    [addMessage]
  );

  // Update the targeted node when an edit is made
  const updateTargetedNode = useCallback(
    (nodeId, nodeType) => {
      setLastTargetedNode(nodeId, nodeType);
    },
    [setLastTargetedNode]
  );

  // Get conversation context for AI
  const getContextForAI = useCallback(() => {
    return {
      messages: getRecentContext(4),
      lastTargetedNode: {
        id: lastTargetedNodeId,
        type: lastTargetedNodeType,
      },
    };
  }, [getRecentContext, lastTargetedNodeId, lastTargetedNodeType]);

  return {
    messages,
    lastTargetedNodeId,
    lastTargetedNodeType,
    addUserMessage,
    addAssistantMessage,
    updateTargetedNode,
    getContextForAI,
    startNewSession,
    clearHistory,
  };
}

export default useChatContext;
