import {
  Cloud,
  Globe,
  LayoutDashboard,
  Paintbrush,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const templates = [
  { label: "SaaS Landing", prompt: "Build a modern SaaS landing page with hero, features, pricing, and testimonials", icon: Cloud, color: "text-blue-500" },
  { label: "Portfolio", prompt: "Create a sleek developer portfolio with project showcase and about section", icon: Paintbrush, color: "text-purple-500" },
  { label: "Dashboard", prompt: "Design an analytics dashboard with charts, metrics sidebar, and data tables", icon: LayoutDashboard, color: "text-emerald-500" },
  { label: "Agency Site", prompt: "Build an agency website with services, testimonials, and contact form", icon: Globe, color: "text-amber-500" },
];

export default function EmptyState() {
  const setAIPrompt = useAppStore((state) => state.setAIPrompt);

  const handleTemplateClick = (templatePrompt) => {
    setAIPrompt(templatePrompt);
  };

  return (
    <section className="relative flex w-full max-w-2xl flex-col items-center text-center stagger-children">
      <div className="pointer-events-none absolute inset-0 opacity-100 [background-image:radial-gradient(circle,var(--canvas-dot)_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary">
        <Sparkles className="size-3" />
        Welcome to Codex Canvas
      </div>

      <h1 className="relative mt-5 max-w-lg text-balance text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-text-primary sm:text-2xl">
        What would you like to build?
      </h1>

      <p className="relative mt-2.5 max-w-md text-[13px] leading-6 text-text-muted">
        Describe your idea, attach a screenshot, or use your voice.
        AI handles the rest.
      </p>

      <div className="relative mt-8 w-full max-w-lg">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
          <Sparkles className="size-3 text-primary/60" />
          Popular Templates
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.label}
                type="button"
                onClick={() => handleTemplateClick(template.prompt)}
                className="glass-card group flex flex-col items-center gap-2.5 rounded-xl px-3 py-4 text-center"
              >
                <span className="flex size-9 items-center justify-center rounded-lg glass-subtle transition-colors duration-200 group-hover:bg-surface-3">
                  <Icon className={`size-4 ${template.color}`} />
                </span>
                <span className="text-[12px] font-medium text-text-secondary transition-colors duration-200 group-hover:text-text-primary">
                  {template.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
