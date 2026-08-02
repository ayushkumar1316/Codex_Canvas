import { useAppStore } from "@/store/useAppStore";
import Renderer from "@/renderer/Renderer";
import EmptyState from "@/editor/EmptyState";

export default function Canvas() {
  const componentTree = useAppStore((state) => state.componentTree);
  const hasChildren = (componentTree?.children?.length ?? 0) > 0;

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] min-w-0 flex-1 flex-col overflow-hidden bg-[#0c0c0f]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/[0.04] blur-[100px]" />

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        {hasChildren ? (
          <div className="h-full w-full overflow-y-auto p-8">
            <div className="mx-auto max-w-4xl">
              <Renderer tree={componentTree} />
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </main>
  );
}
