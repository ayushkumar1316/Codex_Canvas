import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/editor/Layout";
import { useAppStore } from "@/store/useAppStore";

export default function Editor() {
  const location = useLocation();
  const setAIPrompt = useAppStore((state) => state.setAIPrompt);

  useEffect(() => {
    const initialPrompt = location.state?.initialPrompt;
    if (initialPrompt) {
      setAIPrompt(initialPrompt);
      window.history.replaceState({}, "");
    }
  }, [location.state, setAIPrompt]);

  return <Layout />;
}
