import { useAppStore } from "@/store/useAppStore";

export function exportCanvas(canvasId) {
  const state = useAppStore.getState();
  const canvas = state.canvases.find((c) => c.id === canvasId);

  if (!canvas) {
    console.error("[Export] Canvas not found:", canvasId);
    return null;
  }

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    canvas: {
      id: canvas.id,
      name: canvas.name,
      createdAt: canvas.createdAt,
      updatedAt: canvas.updatedAt,
      componentTree: canvas.componentTree,
    },
  };

  return exportData;
}

export function downloadCanvas(canvasId) {
  const exportData = exportCanvas(canvasId);

  if (!exportData) {
    return { success: false, error: "Canvas not found" };
  }

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${exportData.canvas.name || "canvas"}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return {
    success: true,
    filename: a.download,
    size: json.length,
  };
}

export function importCanvas(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    if (!file.name.endsWith(".json")) {
      reject(new Error("Invalid file type. Please upload a .json file."));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const json = event.target.result;
        const data = JSON.parse(json);

        if (!data.version || !data.canvas) {
          reject(new Error("Invalid file format. Missing version or canvas data."));
          return;
        }

        if (!data.canvas.componentTree) {
          reject(new Error("Invalid file format. Missing component tree."));
          return;
        }

        const canvas = data.canvas;
        const state = useAppStore.getState();

        const newCanvas = {
          id: `imported-${Date.now()}`,
          name: canvas.name || "Imported Canvas",
          createdAt: canvas.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          componentTree: canvas.componentTree,
        };

        state.addCanvas(newCanvas);

        resolve({
          success: true,
          canvas: newCanvas,
          importedFrom: file.name,
        });
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

export function exportAllCanvases() {
  const state = useAppStore.getState();

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    type: "full-export",
    canvases: state.canvases,
    settings: {
      aiProvider: state.aiProvider,
      aiModel: state.aiModel,
      providerPriority: state.providerPriority,
    },
  };

  return exportData;
}

export function downloadAllCanvases() {
  const exportData = exportAllCanvases();
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `codex-canvas-all-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return {
    success: true,
    filename: a.download,
    size: json.length,
    canvasCount: exportData.canvases.length,
  };
}

export function importAllCanvases(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const json = event.target.result;
        const data = JSON.parse(json);

        if (!data.version) {
          reject(new Error("Invalid file format."));
          return;
        }

        const state = useAppStore.getState();
        let importedCount = 0;

        if (data.type === "full-export" && Array.isArray(data.canvases)) {
          for (const canvas of data.canvases) {
            if (canvas.componentTree) {
              state.addCanvas({
                id: `imported-${Date.now()}-${importedCount}`,
                name: canvas.name || `Imported ${importedCount + 1}`,
                createdAt: canvas.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                componentTree: canvas.componentTree,
              });
              importedCount++;
            }
          }
        } else if (data.canvas && data.canvas.componentTree) {
          state.addCanvas({
            id: `imported-${Date.now()}`,
            name: data.canvas.name || "Imported Canvas",
            createdAt: data.canvas.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            componentTree: data.canvas.componentTree,
          });
          importedCount = 1;
        }

        resolve({
          success: true,
          importedCount,
          importedFrom: file.name,
        });
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}
