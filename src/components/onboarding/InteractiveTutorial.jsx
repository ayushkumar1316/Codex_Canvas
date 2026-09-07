import { useState, useEffect } from "react";
import { X, Sparkles, MousePointer, MessageSquare, Wand2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const STEPS = [
  {
    title: "Welcome to Codex Canvas V2",
    description:
      "Build websites with AI. Just describe what you want, and watch it appear.",
    icon: Sparkles,
    highlight: null,
  },
  {
    title: "Generate with AI",
    description:
      'Type a prompt like "Create a modern landing page" and press Enter. Watch components appear in real-time.',
    icon: Wand2,
    highlight: "[data-ai-pill]",
  },
  {
    title: "Edit with Context Menu",
    description:
      "Right-click any component to see quick actions and AI editing options.",
    icon: MousePointer,
    highlight: "[data-component-id]",
  },
  {
    title: "Chat for Refinements",
    description:
      'Use natural language like "make the hero darker" for iterative improvements.',
    icon: MessageSquare,
    highlight: null,
  },
];

/**
 * Interactive First-Time Tutorial
 * Guides users through V2 features
 */
export function InteractiveTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial
    const completed = localStorage.getItem("codex-canvas-tutorial-complete");
    if (!completed) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("codex-canvas-tutorial-complete", "true");
    setIsVisible(false);
    setHasCompleted(true);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible || hasCompleted) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-primary/20 bg-surface-1 p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20">
              <Icon className="size-5 text-primary" />
            </div>
            <span className="text-sm text-text-muted">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="rounded-lg p-1 text-text-muted transition-colors hover:bg-surface-2"
          >
            <X className="size-4" />
          </button>
        </div>

        <h2 className="mb-3 text-xl font-semibold text-text-primary">
          {step.title}
        </h2>
        <p className="mb-6 text-text-secondary">{step.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`size-2 rounded-full ${
                  i === currentStep
                    ? "bg-primary"
                    : i < currentStep
                    ? "bg-primary/40"
                    : "bg-surface-3"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="rounded-lg px-4 py-2 text-sm text-text-muted transition-colors hover:bg-surface-2"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              {currentStep === STEPS.length - 1 ? "Get Started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveTutorial;
