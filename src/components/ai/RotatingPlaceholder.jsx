import { useEffect, useState } from "react";

const suggestions = [
  "Make the hero section more premium...",
  "Add a pricing section with 3 tiers...",
  "Redesign the nav to match Linear...",
  "Improve spacing and typography...",
  "Create a testimonials carousel...",
  "Make the CTA button stand out more...",
  "Add a features grid below the hero...",
  "Refine the footer layout...",
];

export default function RotatingPlaceholder({ isPaused, className }) {
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    let timeoutId;
    const interval = setInterval(() => {
      setIsFading(true);
      timeoutId = setTimeout(() => {
        setIndex((prev) => (prev + 1) % suggestions.length);
        setIsFading(false);
      }, 200);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [isPaused]);

  return (
    <span
      className={`transition-opacity duration-200 ${isFading ? "opacity-0" : "opacity-100"} ${className ?? ""}`}
    >
      {suggestions[index]}
    </span>
  );
}
