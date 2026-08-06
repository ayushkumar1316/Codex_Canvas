import Header from "@/editor/Header";
import LeftSidebar from "@/editor/LeftSidebar";
import Canvas from "@/editor/Canvas";
import RightPanel from "@/editor/RightPanel";
import AIPill from "@/components/ai/AIPill";
import AITimeline from "@/components/ai/AITimeline";
import SuccessToast from "@/components/ai/SuccessToast";
import { useAppStore } from "@/store/useAppStore";

export default function Layout() {
  const editorMode = useAppStore((state) => state.editorMode);

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#0a0a0e]">
      <Header />
      <div className="flex min-h-0 flex-1 overflow-hidden">
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
      <AITimeline />
      <SuccessToast />
    </div>
  );
}
