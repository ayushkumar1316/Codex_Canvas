import Header from "@/editor/Header";
import LeftSidebar from "@/editor/LeftSidebar";
import Canvas from "@/editor/Canvas";
import RightPanel from "@/editor/RightPanel";
import AIPill from "@/components/ai/AIPill";
import AITimeline from "@/components/ai/AITimeline";
import SuccessToast from "@/components/ai/SuccessToast";
import StreamingProgress from "@/components/ai/StreamingProgress";
import ChatInterface from "@/components/ai/ChatInterface";
import FeedbackIndicators from "@/components/ai/FeedbackIndicators";
import InteractiveTutorial from "@/components/onboarding/InteractiveTutorial";
import { useAppStore } from "@/store/useAppStore";

export default function Layout() {
  const editorMode = useAppStore((state) => state.editorMode);

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-background transition-colors duration-300 page-enter">
      <Header />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {editorMode === "editor" && (
          <div className="hidden shrink-0 md:block">
            <LeftSidebar />
          </div>
        )}

        <Canvas />

        {editorMode === "editor" && (
          <div className="hidden shrink-0 lg:block">
            <RightPanel />
          </div>
        )}
      </div>

      <AIPill />
      <AITimeline />
      <SuccessToast />
      <StreamingProgress />
      <ChatInterface />
      <FeedbackIndicators />
      <InteractiveTutorial />
    </div>
  );
}
