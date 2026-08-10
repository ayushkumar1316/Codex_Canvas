import { diffTrees, applyDeltas } from "./treeDiff";

const MAX_HISTORY_SIZE = 100;
const BATCH_DELAY_MS = 300;

export function createHistoryEngine() {
  let historyStack = [];
  let futureStack = [];
  let batchTimer = null;
  let pendingSnapshot = null;
  let baseTree = null;

  function cloneTree(tree) {
    try {
      return JSON.parse(JSON.stringify(tree));
    } catch (e) {
      console.error("[historyEngine] cloneTree failed, returning empty tree", e);
      return { id: "root", type: "root", props: {}, styles: {}, children: [] };
    }
  }

  function canUndo() {
    return historyStack.length > 0 || pendingSnapshot !== null;
  }

  function canRedo() {
    return futureStack.length > 0;
  }

  function pushSnapshot(tree, action = "edit") {
    const snapshot = {
      tree: cloneTree(tree),
      action,
      timestamp: Date.now(),
    };

    historyStack.push(snapshot);

    if (historyStack.length > MAX_HISTORY_SIZE) {
      historyStack.shift();
    }

    futureStack = [];
  }

  function pushBatchedSnapshot(tree, action = "edit") {
    if (batchTimer) {
      clearTimeout(batchTimer);
    }

    pendingSnapshot = {
      tree: cloneTree(tree),
      action,
      timestamp: Date.now(),
    };

    batchTimer = setTimeout(() => {
      if (pendingSnapshot) {
        historyStack.push(pendingSnapshot);

        if (historyStack.length > MAX_HISTORY_SIZE) {
          historyStack.shift();
        }

        futureStack = [];
        pendingSnapshot = null;
      }
      batchTimer = null;
    }, BATCH_DELAY_MS);
  }

  function flushPendingSnapshot() {
    if (batchTimer) {
      clearTimeout(batchTimer);
      batchTimer = null;
    }

    if (pendingSnapshot) {
      historyStack.push(pendingSnapshot);

      if (historyStack.length > MAX_HISTORY_SIZE) {
        historyStack.shift();
      }

      futureStack = [];
      pendingSnapshot = null;
    }
  }

  function undo(currentTree) {
    flushPendingSnapshot();

    if (historyStack.length === 0) return null;

    const snapshot = historyStack.pop();

    futureStack.push({
      tree: cloneTree(currentTree),
      action: "undo",
      timestamp: Date.now(),
    });

    return snapshot.tree;
  }

  function redo(currentTree) {
    if (futureStack.length === 0) return null;

    const snapshot = futureStack.pop();

    historyStack.push({
      tree: cloneTree(currentTree),
      action: "redo",
      timestamp: Date.now(),
    });

    return snapshot.tree;
  }

  function clear() {
    historyStack = [];
    futureStack = [];
    if (batchTimer) {
      clearTimeout(batchTimer);
      batchTimer = null;
    }
    pendingSnapshot = null;
    baseTree = null;
  }

  function getHistorySize() {
    return historyStack.length;
  }

  function getFutureSize() {
    return futureStack.length;
  }

  function toDeltaStorage() {
    if (historyStack.length === 0) return null;

    const base = historyStack[0].tree;
    const deltas = [];

    for (let i = 1; i < historyStack.length; i++) {
      const prevTree = historyStack[i - 1].tree;
      const currTree = historyStack[i].tree;
      const delta = diffTrees(prevTree, currTree);
      if (delta.length > 0) {
        deltas.push({
          action: historyStack[i].action,
          changes: delta,
        });
      }
    }

    return {
      baseTree: base,
      deltas,
      lastTree: historyStack[historyStack.length - 1].tree,
    };
  }

  function fromDeltaStorage(storage) {
    if (!storage || !storage.baseTree) return;

    clear();
    baseTree = cloneTree(storage.baseTree);

    let currentTree = cloneTree(baseTree);
    historyStack.push({
      tree: cloneTree(currentTree),
      action: "initial",
      timestamp: Date.now(),
    });

    for (const entry of storage.deltas) {
      currentTree = applyDeltas(currentTree, entry.changes);
      historyStack.push({
        tree: cloneTree(currentTree),
        action: entry.action,
        timestamp: Date.now(),
      });
    }
  }

  function getStorageSize() {
    const str = JSON.stringify(toDeltaStorage());
    return {
      bytes: str.length,
      kb: (str.length / 1024).toFixed(1),
      entries: historyStack.length,
    };
  }

  function getSnapshotSize() {
    let totalBytes = 0;
    for (const snap of historyStack) {
      totalBytes += JSON.stringify(snap.tree).length;
    }
    return {
      bytes: totalBytes,
      kb: (totalBytes / 1024).toFixed(1),
      entries: historyStack.length,
    };
  }

  return {
    canUndo,
    canRedo,
    pushSnapshot,
    pushBatchedSnapshot,
    flushPendingSnapshot,
    undo,
    redo,
    clear,
    getHistorySize,
    getFutureSize,
    toDeltaStorage,
    fromDeltaStorage,
    getStorageSize,
    getSnapshotSize,
  };
}
