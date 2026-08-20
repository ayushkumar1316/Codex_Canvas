import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function SuccessToast() {
  const aiPhase = useAppStore((state) => state.aiPhase);
  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);
  const phaseRef = useRef(aiPhase);

  useEffect(() => {
    const prev = phaseRef.current;
    phaseRef.current = aiPhase;

    if (aiPhase === "success" && prev !== "success") {
      setShow(true);
      setExiting(false);
    }
  }, [aiPhase]);

  useEffect(() => {
    if (!show || reduced) return;

    const exitTimer = setTimeout(() => setExiting(true), 1600);
    const hideTimer = setTimeout(() => {
      setShow(false);
      setExiting(false);
    }, 2000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, [show, reduced]);

  if (!show) return null;

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-500/20 dark:border-emerald-500/30 bg-surface-1/90 dark:bg-surface-2/90 px-4 py-2.5 shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${
        !reduced ? (exiting ? "animate-toast-out" : "animate-toast-in") : ""
      }`}
    >
      <span className="flex size-6 items-center justify-center rounded-lg bg-emerald-500/15">
        <Sparkles className="size-3.5 text-emerald-400" />
      </span>
      <span className="text-[13px] font-medium text-text-primary">
        Canvas updated successfully
      </span>
    </div>
  );
}
