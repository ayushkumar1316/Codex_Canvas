import { create } from "zustand";
import { persist } from "zustand/middleware";

const CHAT_STORAGE_KEY = "codex-canvas-chat";

export const useChatStore = create(
  persist(
    (set, get) => ({
      // Conversation messages
      messages: [],

      // Track the last targeted component for pronoun resolution
      lastTargetedNodeId: null,
      lastTargetedNodeType: null,

      // Track conversation context
      currentSessionId: null,
      conversationStartTime: null,

      // Add a new message to the conversation
      addMessage: (message) => {
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              timestamp: new Date().toISOString(),
              ...message,
            },
          ],
        }));
      },

      // Update the last targeted node (for pronoun resolution like "make it bigger")
      setLastTargetedNode: (nodeId, nodeType) => {
        set({
          lastTargetedNodeId: nodeId,
          lastTargetedNodeType: nodeType,
        });
      },

      // Get last N messages for context
      getRecentContext: (count = 4) => {
        const messages = get().messages;
        return messages.slice(-count);
      },

      // Get full conversation summary
      getConversationSummary: () => {
        const state = get();
        return {
          totalMessages: state.messages.length,
          lastTargetedNode: {
            id: state.lastTargetedNodeId,
            type: state.lastTargetedNodeType,
          },
          recentMessages: state.getRecentContext(3),
          conversationStartTime: state.conversationStartTime,
        };
      },

      // Initialize a new conversation session
      startNewSession: () => {
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        set({
          currentSessionId: sessionId,
          conversationStartTime: new Date().toISOString(),
          messages: [],
          lastTargetedNodeId: null,
          lastTargetedNodeType: null,
        });
        return sessionId;
      },

      // Clear conversation history
      clearHistory: () => {
        set({
          messages: [],
          lastTargetedNodeId: null,
          lastTargetedNodeType: null,
        });
      },

      // Export conversation for debugging/logging
      exportConversation: () => {
        const state = get();
        return {
          sessionId: state.currentSessionId,
          startTime: state.conversationStartTime,
          messages: state.messages,
          finalTargetedNode: {
            id: state.lastTargetedNodeId,
            type: state.lastTargetedNodeType,
          },
        };
      },
    }),
    {
      name: CHAT_STORAGE_KEY,
      partialize: (state) => ({
        messages: state.messages,
        currentSessionId: state.currentSessionId,
        conversationStartTime: state.conversationStartTime,
      }),
    }
  )
);
