import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/editor/Layout";
import { useAppStore } from "@/store/useAppStore";
import { componentRegistry } from "@/registry/componentRegistry";
import { useEditorShortcuts } from "@/hooks/useUndoRedoShortcuts";
import CommandPalette from "@/components/ai/CommandPalette";
import ComponentContextMenu from "@/components/ui/ComponentContextMenu";

export default function Editor() {
  const location = useLocation();
  const hasAutoSubmitted = useRef(false);
  const hasInitialized = useRef(false);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    componentId: null,
  });

  const setAIPrompt = useAppStore((state) => state.setAIPrompt);
  const submitAICommand = useAppStore((state) => state.submitAICommand);
  const selectedComponentId = useAppStore((state) => state.selectedComponentId);
  const initializeWorkspace = useAppStore((state) => state.initializeWorkspace);

  const openCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  const openContextMenu = useCallback((event, componentId) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      componentId,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, componentId: null });
  }, []);

  useEditorShortcuts({ onOpenCommandPalette: openCommandPalette });

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initializeWorkspace();
    }
  }, [initializeWorkspace]);

  useEffect(() => {
    const initialPrompt = location.state?.initialPrompt;
    const initialImage = location.state?.initialImage;

    if (initialPrompt && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      setAIPrompt(initialPrompt);
      window.history.replaceState({}, "");

      setTimeout(() => {
        submitAICommand({
          prompt: initialPrompt,
          scope: "page",
          selectedComponentId: null,
          registry: Object.keys(componentRegistry),
          referenceImage: initialImage || null,
        });
      }, 100);
    }
  }, [location.state, setAIPrompt, submitAICommand, selectedComponentId]);

  useEffect(() => {
    const handleContextMenu = (event) => {
      const target = event.target.closest("[data-component-id]");
      if (target) {
        openContextMenu(event, target.dataset.componentId);
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [openContextMenu]);

  return (
    <>
      <Layout />
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />
      <ComponentContextMenu
        isOpen={contextMenu.isOpen}
        onClose={closeContextMenu}
        position={contextMenu.position}
        componentId={contextMenu.componentId}
      />
    </>
  );
}
