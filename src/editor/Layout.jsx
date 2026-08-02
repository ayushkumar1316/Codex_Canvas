import Header from "@/editor/Header";
import LeftSidebar from "@/editor/LeftSidebar";
import Canvas from "@/editor/Canvas";
import RightPanel from "@/editor/RightPanel";
import AIPill from "@/components/ai/AIPill";
import { useAppStore } from "@/store/useAppStore";

export default function Layout() {
  const editorMode = useAppStore((state) => state.editorMode);

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#09090b]">
      <Header />
      <div className="flex min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
        {editorMode === "editor" && (
          <div className="shrink-0">
            <LeftSidebar />
          </div>
        )}

        <Canvas />

        {editorMode === "editor" && (
          <div className="shrink-0">
            <RightPanel />
          </div>
        )}
      </div>

      <AIPill />
    </div>
  );
}
