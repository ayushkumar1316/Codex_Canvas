import { useEffect, useRef, useCallback } from "react";

export default function AutoResizeTextarea({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
  className,
  ...props
}) {
  const textareaRef = useRef(null);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      rows={1}
      className={`max-h-36 min-h-[34px] flex-1 resize-none border-0 bg-transparent py-1.5 text-sm leading-5 text-zinc-100 outline-none placeholder:text-zinc-500 disabled:opacity-50 ${className ?? ""}`}
      {...props}
    />
  );
}
