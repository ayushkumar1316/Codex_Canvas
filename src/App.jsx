import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import useTheme from "@/hooks/useTheme";
import Landing from "@/pages/Landing";
import Editor from "@/pages/Editor";

function App() {
  useTheme();

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/editor" element={<Editor />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
