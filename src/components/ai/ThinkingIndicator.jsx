import { useEffect, useState } from "react";

export default function ThinkingIndicator({ className }) {
  const [dots, setDots] = useState([false, false, false]);

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      setDots((prev) => {
        const next = [...prev];
        next[step % 3] = true;
        if (step > 0) next[(step - 1) % 3] = false;
        return next;
      });
      step++;
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`inline-flex items-center gap-[3px] ${className ?? ""}`}>
      {dots.map((active, i) => (
        <span
          key={i}
          className={`inline-block size-[5px] rounded-full transition-all duration-300 ${
            active
              ? "scale-100 bg-violet-400 opacity-100"
              : "scale-75 bg-zinc-600 opacity-40"
          }`}
        />
      ))}
    </span>
  );
}
