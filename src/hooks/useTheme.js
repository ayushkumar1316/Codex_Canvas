import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

function getSystemTheme() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  const root = document.documentElement;
  const resolved = theme === "system" ? getSystemTheme() : theme;

  root.classList.remove("light", "dark");
  root.classList.add(resolved);

  if (resolved === "dark") {
    root.style.backgroundColor = "#0a0a0e";
  } else {
    root.style.backgroundColor = "#ffffff";
  }
}

export default function useTheme() {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    applyTheme(theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);
}
