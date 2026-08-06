import { useRef, useEffect, useReducer } from "react";

function collectAllIds(node, acc = new Set()) {
  if (!node) return acc;
  acc.add(node.id);
  (node.children ?? []).forEach((child) => collectAllIds(child, acc));
  return acc;
}

function trackerReducer(state, action) {
  switch (action.type) {
    case "TRACK":
      return { newIds: action.ids, prevIds: action.allIds };
    case "CLEAR":
      return { ...state, newIds: new Set() };
    default:
      return state;
  }
}

export function useNewComponentTracker(componentTree) {
  const [state, dispatch] = useReducer(trackerReducer, {
    newIds: new Set(),
    prevIds: null,
  });
  const timerRef = useRef(null);

  useEffect(() => {
    const currentIds = collectAllIds(componentTree);

    if (state.prevIds === null) {
      dispatch({ type: "TRACK", ids: new Set(), allIds: currentIds });
      return;
    }

    const newlyAdded = new Set();
    for (const id of currentIds) {
      if (!state.prevIds.has(id)) {
        newlyAdded.add(id);
      }
    }

    if (newlyAdded.size > 0) {
      dispatch({ type: "TRACK", ids: newlyAdded, allIds: currentIds });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => dispatch({ type: "CLEAR" }), 600);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [componentTree, state.prevIds]);

  return state.newIds;
}
