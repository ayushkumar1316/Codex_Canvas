import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { initialComponentTree } from "@/utils/initialComponentTree";
import { executeAICommand } from "@/ai/aiService";
import { createHistoryEngine } from "@/utils/historyEngine";

const CANVAS_STORAGE_KEY = "codex-canvas-workspace";

function createCanvasId() {
  if (globalThis.crypto?.randomUUID) {
    return `canvas-${globalThis.crypto.randomUUID()}`;
  }
  return `canvas-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createComponentId(type) {
  if (globalThis.crypto?.randomUUID) {
    return `${type}-${globalThis.crypto.randomUUID()}`;
  }
  return `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneInitialTree() {
  return JSON.parse(JSON.stringify(initialComponentTree));
}

function generateCanvasName(canvases) {
  const base = "Untitled Canvas";
  const existingNames = new Set(canvases.map((c) => c.name));
  if (!existingNames.has(base)) return base;
  let n = 2;
  while (existingNames.has(`${base} ${n}`)) n++;
  return `${base} ${n}`;
}

function updateComponentNode(node, componentId, update) {
  if (!node) return false;
  if (node.id === componentId) {
    update(node);
    return true;
  }
  return (node.children ?? []).some((child) =>
    updateComponentNode(child, componentId, update)
  );
}

function findParentNode(node, componentId, parent = null) {
  if (!node) return null;
  if (node.id === componentId) return parent;
  for (const child of node.children ?? []) {
    const found = findParentNode(child, componentId, node);
    if (found) return found;
  }
  return null;
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

function findNodeById(node, id) {
  if (!node) return null;
  if (node.id === id) return node;
  for (const child of node.children ?? []) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

function findComponentById(node, id) {
  return findNodeById(node, id);
}

const componentDefaults = {
  container: {
    props: {},
    styles: { padding: "24px", gap: "16px" },
  },
  heading: {
    props: { text: "Heading" },
    styles: {
      color: "#0f172a",
      fontSize: "36px",
      fontWeight: "700",
      lineHeight: "1.2",
      letterSpacing: "-0.01em",
      width: "fit-content",
    },
  },
  text: {
    props: { text: "Paragraph" },
    styles: {
      color: "#334155",
      fontSize: "16px",
      lineHeight: "1.7",
      width: "fit-content",
    },
  },
  button: {
    props: { text: "Button" },
    styles: {
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      padding: "12px 24px",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "600",
      border: "none",
      cursor: "pointer",
      minHeight: "44px",
      width: "fit-content",
    },
  },
  input: {
    props: { placeholder: "Enter text..." },
    styles: {
      backgroundColor: "#ffffff",
      color: "#0f172a",
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: "8px",
      padding: "12px 16px",
      fontSize: "16px",
      width: "280px",
      outline: "none",
    },
  },
  textarea: {
    props: { placeholder: "Type here..." },
    styles: {
      backgroundColor: "#ffffff",
      color: "#0f172a",
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: "8px",
      padding: "12px 16px",
      fontSize: "16px",
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
      borderRadius: "12px",
      maxWidth: "100%",
      display: "block",
    },
  },
  card: {
    props: {},
    styles: {
      backgroundColor: "#ffffff",
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: "16px",
      padding: "24px",
      width: "fit-content",
      minWidth: "200px",
    },
  },
};

function saveCanvasById(state) {
  if (!state.activeCanvasId) return;
  const idx = state.canvases.findIndex((c) => c.id === state.activeCanvasId);
  if (idx === -1) return;
  state.canvases[idx].componentTree = JSON.parse(JSON.stringify(state.componentTree));
  state.canvases[idx].updatedAt = new Date().toISOString();
}

const historyEngine = createHistoryEngine();

export const useAppStore = create(
  persist(
    immer((set, get) => ({
      canvases: [],
      activeCanvasId: null,

      editorMode: "editor",
      selectedComponentId: null,
      componentTree: cloneInitialTree(),

      aiLoading: false,
      aiError: null,
      aiPrompt: "",
      aiPhase: "idle",
      aiProvider: "auto",
      aiModel: null,
      aiActiveProvider: null,

      canUndo: false,
      canRedo: false,

      initializeWorkspace: () => {
        const state = get();

        if (state.canvases.length === 0) {
          const now = new Date().toISOString();
          const canvas = {
            id: createCanvasId(),
            name: "Untitled Canvas",
            createdAt: now,
            updatedAt: now,
            componentTree: cloneInitialTree(),
          };
          set((s) => {
            s.canvases = [canvas];
            s.activeCanvasId = canvas.id;
            s.componentTree = cloneInitialTree();
          });
        } else if (!state.activeCanvasId || !state.canvases.find((c) => c.id === state.activeCanvasId)) {
          const last = state.canvases[state.canvases.length - 1];
          set((s) => {
            s.activeCanvasId = last.id;
            s.componentTree = JSON.parse(JSON.stringify(last.componentTree));
          });
        } else {
          const active = state.canvases.find((c) => c.id === state.activeCanvasId);
          if (active) {
            set((s) => {
              s.componentTree = JSON.parse(JSON.stringify(active.componentTree));
            });
          }
        }
      },

      createCanvas: (name) => {
        const state = get();
        const now = new Date().toISOString();
        const canvas = {
          id: createCanvasId(),
          name: name || generateCanvasName(state.canvases),
          createdAt: now,
          updatedAt: now,
          componentTree: cloneInitialTree(),
        };
        set((s) => {
          s.canvases.push(canvas);
          s.activeCanvasId = canvas.id;
          s.componentTree = cloneInitialTree();
          s.selectedComponentId = null;
        });
        return canvas.id;
      },

      setActiveCanvas: (id) => {
        const state = get();
        const canvas = state.canvases.find((c) => c.id === id);
        if (!canvas) return;
        set((s) => {
          s.activeCanvasId = id;
          s.componentTree = JSON.parse(JSON.stringify(canvas.componentTree));
          s.selectedComponentId = null;
        });
      },

      renameCanvas: (id, name) => {
        set((state) => {
          const canvas = state.canvases.find((c) => c.id === id);
          if (canvas) {
            canvas.name = name || "Untitled Canvas";
            canvas.updatedAt = new Date().toISOString();
          }
        });
      },

      duplicateCanvas: (id) => {
        const state = get();
        const canvas = state.canvases.find((c) => c.id === id);
        if (!canvas) return;

        const now = new Date().toISOString();
        const newCanvas = {
          id: createCanvasId(),
          name: `${canvas.name} (Copy)`,
          createdAt: now,
          updatedAt: now,
          componentTree: JSON.parse(JSON.stringify(canvas.componentTree)),
        };

        set((s) => {
          s.canvases.push(newCanvas);
        });

        return newCanvas.id;
      },

      deleteCanvas: (id) => {
        const state = get();
        if (state.canvases.length <= 1) return false;

        const idx = state.canvases.findIndex((c) => c.id === id);
        if (idx === -1) return false;

        set((s) => {
          s.canvases.splice(idx, 1);

          if (s.activeCanvasId === id) {
            const nextCanvas = s.canvases[Math.min(idx, s.canvases.length - 1)];
            if (nextCanvas) {
              s.activeCanvasId = nextCanvas.id;
              s.componentTree = JSON.parse(
                JSON.stringify(nextCanvas.componentTree)
              );
              s.selectedComponentId = null;
            }
          }
        });

        return true;
      },

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
        if (!defaults) return;

        const component = {
          id: createComponentId(type),
          type,
          props: { ...defaults.props },
          styles: { ...defaults.styles },
          children: [],
        };

        historyEngine.flushPendingSnapshot();
        historyEngine.pushSnapshot(get().componentTree, "add-component");

        set((state) => {
          state.componentTree.children ??= [];
          state.componentTree.children.push(component);
          state.selectedComponentId = component.id;
          state.canUndo = historyEngine.canUndo();
          state.canRedo = historyEngine.canRedo();
          saveCanvasById(state);
        });

        return component.id;
      },

      updateComponentProps: (id, props) => {
        historyEngine.pushBatchedSnapshot(get().componentTree, "update-props");

        set((state) => {
          updateComponentNode(state.componentTree, id, (node) => {
            node.props = { ...(node.props ?? {}), ...props };
          });
          state.canUndo = historyEngine.canUndo();
          state.canRedo = historyEngine.canRedo();
          saveCanvasById(state);
        });
      },

      updateComponentStyles: (id, styles) => {
        historyEngine.pushBatchedSnapshot(get().componentTree, "update-styles");

        set((state) => {
          updateComponentNode(state.componentTree, id, (node) => {
            node.styles = { ...(node.styles ?? {}), ...styles };
          });
          state.canUndo = historyEngine.canUndo();
          state.canRedo = historyEngine.canRedo();
          saveCanvasById(state);
        });
      },

      deleteComponent: (id) => {
        if (!id || id === "root") return;

        historyEngine.flushPendingSnapshot();
        historyEngine.pushSnapshot(get().componentTree, "delete-component");

        set((state) => {
          const wasDeleted = removeComponentNode(state.componentTree, id);
          if (wasDeleted) {
            const parent = findParentNode(state.componentTree, id);
            state.selectedComponentId = parent?.id ?? null;
            state.canUndo = historyEngine.canUndo();
            state.canRedo = historyEngine.canRedo();
            saveCanvasById(state);
          }
        });
      },

      duplicateComponent: (id) => {
        if (!id || id === "root") return;

        const state = get();
        const sourceNode = findComponentById(state.componentTree, id);
        if (!sourceNode) return;

        historyEngine.flushPendingSnapshot();
        historyEngine.pushSnapshot(state.componentTree, "duplicate-component");

        const newId = createComponentId(sourceNode.type);
        const newNode = JSON.parse(JSON.stringify(sourceNode));
        newNode.id = newId;

        const parent = findParentNode(state.componentTree, id);
        if (parent) {
          set((state) => {
            const parentNode = findNodeById(state.componentTree, parent.id);
            if (parentNode) {
              const childIndex = parentNode.children.findIndex(
                (c) => c.id === id
              );
              if (childIndex !== -1) {
                parentNode.children.splice(childIndex + 1, 0, newNode);
              } else {
                parentNode.children.push(newNode);
              }
            }
            state.selectedComponentId = newId;
            state.canUndo = historyEngine.canUndo();
            state.canRedo = historyEngine.canRedo();
            saveCanvasById(state);
          });
        } else {
          set((state) => {
            state.componentTree.children ??= [];
            const childIndex = state.componentTree.children.findIndex(
              (c) => c.id === id
            );
            if (childIndex !== -1) {
              state.componentTree.children.splice(childIndex + 1, 0, newNode);
            } else {
              state.componentTree.children.push(newNode);
            }
            state.selectedComponentId = newId;
            state.canUndo = historyEngine.canUndo();
            state.canRedo = historyEngine.canRedo();
            saveCanvasById(state);
          });
        }

        return newId;
      },

      resetSelection: () => {
        set((state) => {
          state.selectedComponentId = null;
        });
      },

      selectParentComponent: (componentId) => {
        const state = get();
        const parent = findParentNode(state.componentTree, componentId);
        if (parent) {
          set((state) => {
            state.selectedComponentId = parent.id;
          });
        }
      },

      undo: () => {
        const state = get();
        const restoredTree = historyEngine.undo(state.componentTree);
        if (restoredTree) {
          set((s) => {
            s.componentTree = restoredTree;
            s.selectedComponentId = null;
            s.canUndo = historyEngine.canUndo();
            s.canRedo = historyEngine.canRedo();
            saveCanvasById(s);
          });
        }
      },

      redo: () => {
        const state = get();
        const restoredTree = historyEngine.redo(state.componentTree);
        if (restoredTree) {
          set((s) => {
            s.componentTree = restoredTree;
            s.selectedComponentId = null;
            s.canUndo = historyEngine.canUndo();
            s.canRedo = historyEngine.canRedo();
            saveCanvasById(s);
          });
        }
      },

      pushHistorySnapshot: (action = "edit") => {
        const state = get();
        historyEngine.pushSnapshot(state.componentTree, action);
        set((s) => {
          s.canUndo = historyEngine.canUndo();
          s.canRedo = historyEngine.canRedo();
        });
      },

      pushBatchedHistorySnapshot: (action = "edit") => {
        const state = get();
        historyEngine.pushBatchedSnapshot(state.componentTree, action);
        set((s) => {
          s.canUndo = historyEngine.canUndo();
          s.canRedo = historyEngine.canRedo();
        });
      },

      setAIPrompt: (prompt) => {
        set((state) => {
          state.aiPrompt = prompt;
        });
      },

      setAIProvider: (provider) => {
        set((state) => {
          state.aiProvider = provider;
          if (provider !== "auto") {
            state.aiModel = null;
          }
        });
      },

      setAIModel: (model) => {
        set((state) => {
          state.aiModel = model;
        });
      },

      setAIActiveProvider: (provider) => {
        set((state) => {
          state.aiActiveProvider = provider;
        });
      },

      submitAICommand: async (command) => {
        if (get().aiLoading) return;

        const originCanvasId = get().activeCanvasId;

        historyEngine.flushPendingSnapshot();
        historyEngine.pushSnapshot(get().componentTree, "ai-generation");

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
              state.canUndo = historyEngine.canUndo();
              state.canRedo = historyEngine.canRedo();

              if (state.activeCanvasId === originCanvasId) {
                saveCanvasById(state);
              } else {
                const idx = state.canvases.findIndex(
                  (c) => c.id === originCanvasId
                );
                if (idx !== -1) {
                  state.canvases[idx].componentTree = JSON.parse(
                    JSON.stringify(result.componentTree)
                  );
                  state.canvases[idx].updatedAt = new Date().toISOString();
                }
              }
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
            state.aiError = {
              type: "unknown",
              message: error.message ?? "Unexpected error",
            };
            state.aiPhase = "error";
          });
        }
      },
    })),
    {
      name: CANVAS_STORAGE_KEY,
      partialize: (state) => ({
        canvases: state.canvases,
        activeCanvasId: state.activeCanvasId,
        selectedComponentId: state.selectedComponentId,
        editorMode: state.editorMode,
        aiProvider: state.aiProvider,
        aiModel: state.aiModel,
      }),
    }
  )
);
