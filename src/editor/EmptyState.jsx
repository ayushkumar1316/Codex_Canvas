import {
  Cloud,
  Globe,
  LayoutDashboard,
  Paintbrush,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const templates = [
  { label: "SaaS Landing", prompt: "Build a modern SaaS landing page with hero, features, pricing, and testimonials", icon: Cloud, color: "text-blue-400" },
  { label: "Portfolio", prompt: "Create a sleek developer portfolio with project showcase and about section", icon: Paintbrush, color: "text-purple-400" },
  { label: "Dashboard", prompt: "Design an analytics dashboard with charts, metrics sidebar, and data tables", icon: LayoutDashboard, color: "text-emerald-400" },
  { label: "Agency Site", prompt: "Build an agency website with services, testimonials, and contact form", icon: Globe, color: "text-amber-400" },
];

export default function EmptyState() {
  const setAIPrompt = useAppStore((state) => state.setAIPrompt);

  const handleTemplateClick = (templatePrompt) => {
    setAIPrompt(templatePrompt);
  };

  return (
    <section className="relative flex w-full max-w-2xl flex-col items-center text-center">
      <div className="pointer-events-none absolute inset-0 opacity-[0.02] [background-image:radial-gradient(circle,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative inline-flex items-center gap-2 rounded-full border border-purple-400/15 bg-purple-500/[0.08] px-3.5 py-1.5 text-[11px] font-medium text-purple-200">
        <Sparkles className="size-3" />
        Welcome to Codex Canvas
      </div>

      <h1 className="relative mt-5 max-w-lg text-balance text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-2xl">
        What would you like to build?
      </h1>

      <p className="relative mt-2.5 max-w-md text-[13px] leading-6 text-zinc-500">
        Describe your idea, attach a screenshot, or use your voice.
        AI handles the rest.
      </p>

      <div className="relative mt-8 w-full max-w-lg">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          <Sparkles className="size-3 text-purple-400/60" />
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
                className="group flex flex-col items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/20"
              >
                <span className="flex size-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.05] transition-colors duration-200 group-hover:bg-white/[0.1]">
                  <Icon className={`size-4 ${template.color}`} />
                </span>
                <span className="text-[12px] font-medium text-zinc-300 transition-colors duration-200 group-hover:text-white">
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
