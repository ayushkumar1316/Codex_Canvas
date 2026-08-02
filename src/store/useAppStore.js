import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { initialComponentTree } from "@/utils/initialComponentTree";
import { executeAICommand } from "@/ai/aiService";

const componentDefaults = {
  container: {
    props: {},
    styles: {
      padding: "16px",
    },
  },
  heading: {
    props: {
      text: "Heading",
    },
    styles: {
      color: "#FFFFFF",
      fontSize: "42px",
      fontWeight: "700",
      lineHeight: "1.2",
      width: "fit-content",
      background: "transparent",
    },
  },
  text: {
    props: {
      text: "Paragraph",
    },
    styles: {
      color: "#A1A1AA",
      fontSize: "16px",
      lineHeight: "1.7",
      width: "fit-content",
      background: "transparent",
    },
  },
  button: {
    props: {
      text: "Button",
    },
    styles: {
      backgroundColor: "#7C3AED",
      color: "#FFFFFF",
      padding: "10px 24px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
      border: "none",
      cursor: "pointer",
      width: "fit-content",
    },
  },
  input: {
    props: {
      placeholder: "Enter text...",
    },
    styles: {
      backgroundColor: "#18181B",
      color: "#E4E4E7",
      border: "1px solid #3F3F46",
      borderRadius: "8px",
      padding: "10px 14px",
      fontSize: "14px",
      width: "280px",
      outline: "none",
    },
  },
  textarea: {
    props: {
      placeholder: "Type here...",
    },
    styles: {
      backgroundColor: "#18181B",
      color: "#E4E4E7",
      border: "1px solid #3F3F46",
      borderRadius: "8px",
      padding: "10px 14px",
      fontSize: "14px",
      width: "280px",
      minHeight: "100px",
      resize: "vertical",
      outline: "none",
      fontFamily: "inherit",
    },
  },
  image: {
    props: {
      src: "https://placehold.co/600x400/png?text=Image",
      alt: "Image",
    },
    styles: {
      borderRadius: "8px",
      maxWidth: "100%",
      display: "block",
    },
  },
  card: {
    props: {},
    styles: {
      backgroundColor: "#1E1E22",
      border: "1px solid #27272A",
      borderRadius: "12px",
      padding: "24px",
      width: "fit-content",
      minWidth: "200px",
    },
  },
};

function createComponentId(type) {
  if (globalThis.crypto?.randomUUID) {
    return `${type}-${globalThis.crypto.randomUUID()}`;
  }
  return `${type}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function updateComponentNode(node, componentId, update) {
  if (!node) {
    return false;
  }
  if (node.id === componentId) {
    update(node);
    return true;
  }
  return (node.children ?? []).some((child) =>
    updateComponentNode(child, componentId, update)
  );
}

function removeComponentNode(node, componentId) {
  const childIndex = (node.children ?? []).findIndex(
    (child) => child.id === componentId
  );
  if (childIndex !== -1) {
    node.children.splice(childIndex, 1);
    return true;
  }
  return (node.children ?? []).some((child) =>
    removeComponentNode(child, componentId)
  );
}

export const useAppStore = create(
  immer((set) => ({
    editorMode: "editor",
    selectedComponentId: null,
    componentTree: initialComponentTree,

    setEditorMode: (mode) => {
      set((state) => {
        state.editorMode = mode;
      });
    },

    setSelectedComponent: (id) => {
      set((state) => {
        state.selectedComponentId = id;
      });
    },

    addComponent: (type) => {
      const defaults = componentDefaults[type];

      if (!defaults) {
        return;
      }

      const component = {
        id: createComponentId(type),
        type,
        props: { ...defaults.props },
        styles: { ...defaults.styles },
        children: [],
      };

      set((state) => {
        state.componentTree.children ??= [];
        state.componentTree.children.push(component);
        state.selectedComponentId = component.id;
      });
    },

    updateComponentProps: (id, props) => {
      set((state) => {
        updateComponentNode(state.componentTree, id, (node) => {
          node.props = {
            ...(node.props ?? {}),
            ...props,
          };
        });
      });
    },

    updateComponentStyles: (id, styles) => {
      set((state) => {
        updateComponentNode(state.componentTree, id, (node) => {
          node.styles = {
            ...(node.styles ?? {}),
            ...styles,
          };
        });
      });
    },

    deleteComponent: (id) => {
      if (!id || id === "root") {
        return;
      }

      set((state) => {
        const wasDeleted = removeComponentNode(state.componentTree, id);

        if (wasDeleted) {
          state.selectedComponentId = null;
        }
      });
    },

    resetSelection: () => {
      set((state) => {
        state.selectedComponentId = null;
      });
    },

    aiLoading: false,
    aiError: null,
    aiPrompt: "",
    aiPhase: "idle",

    setAIPrompt: (prompt) => {
      set((state) => {
        state.aiPrompt = prompt;
      });
    },

    submitAICommand: async (command) => {
      set((state) => {
        state.aiLoading = true;
        state.aiError = null;
        state.aiPhase = "understanding";
      });

      setTimeout(() => {
        set((state) => {
          if (state.aiPhase === "understanding") {
            state.aiPhase = "planning";
          }
        });
      }, 800);

      try {
        const result = await executeAICommand(command);

        if (result.success) {
          set((state) => {
            state.aiPhase = "success";
            state.aiLoading = false;
            state.aiError = null;
            state.componentTree = result.componentTree;
            state.aiPrompt = "";
          });

          setTimeout(() => {
            set((state) => {
              if (state.aiPhase === "success") {
                state.aiPhase = "idle";
              }
            });
          }, 2000);
        } else {
          set((state) => {
            state.aiLoading = false;
            state.aiError = result.error;
            state.aiPhase = "error";
          });
        }
      } catch (error) {
        set((state) => {
          state.aiLoading = false;
          state.aiError = { type: "unknown", message: error.message ?? "Unexpected error" };
          state.aiPhase = "error";
        });
      }
    },
  }))
);
