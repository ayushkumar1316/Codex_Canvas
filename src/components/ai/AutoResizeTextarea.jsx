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
    const scrollH = el.scrollHeight;
    el.style.height = `${Math.min(scrollH, 180)}px`;
    el.style.overflowY = scrollH > 180 ? "auto" : "hidden";
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

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const cleaned = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const currentValue = el.value;
    const newValue = currentValue.slice(0, start) + cleaned + currentValue.slice(end);

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    ).set;
    nativeInputValueSetter.call(el, newValue);
    el.dispatchEvent(new Event("input", { bubbles: true }));

    const cursorPos = start + cleaned.length;
    requestAnimationFrame(() => {
      el.selectionStart = cursorPos;
      el.selectionEnd = cursorPos;
    });
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      disabled={disabled}
      placeholder={placeholder}
      rows={1}
      className={`w-full min-h-[36px] max-h-[180px] resize-none border-0 bg-transparent px-0 pt-[9px] pb-[5px] text-[15px] leading-[1.6] outline-none placeholder:text-transparent disabled:opacity-50 ${className || "text-text-primary"}`}
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "var(--scrollbar-thumb) transparent",
        overflowY: "hidden",
      }}
      {...props}
    />
  );
}
