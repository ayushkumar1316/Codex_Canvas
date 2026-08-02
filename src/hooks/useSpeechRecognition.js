import { useCallback, useRef, useState } from "react";

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const SUPPORTED = !!SpeechRecognition;

export default function useSpeechRecognition({ onResult, onEnd }) {
  const [state, setState] = useState("idle");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const start = useCallback(() => {
    if (!SUPPORTED) {
      setState("error");
      setError("Voice input is not supported in this browser");
      return;
    }

    if (state === "listening") return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setState("listening");
      setError(null);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("")
        .trim();

      if (transcript) {
        onResult?.(transcript);
      }
      setState("processing");
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;

      let message;

      switch (event.error) {
        case "not-allowed":
          message = "Microphone access denied. Please allow microphone permissions.";
          break;
        case "no-speech":
          message = "No speech detected. Try again.";
          break;
        case "audio-capture":
          message = "No microphone found. Please connect a microphone.";
          break;
        case "network":
          message = "Voice service unavailable. Please type your prompt instead.";
          break;
        default:
          message = "Voice recognition failed. Please type your prompt.";
      }

      setState("error");
      setError(message);
    };

    recognition.onend = () => {
      setState("idle");
      onEnd?.();
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [state, onResult, onEnd]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setState("idle");
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  return {
    state,
    error,
    isSupported: SUPPORTED,
    isListening: state === "listening",
    start,
    stop,
    reset,
  };
}
