"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px 6px",
        borderRadius: "3px",
        color: copied ? "var(--color-jade)" : "var(--color-faint)",
        fontFamily: "var(--font-code), monospace",
        fontSize: "10px",
        letterSpacing: "0.04em",
        transition: "color 0.2s",
        flexShrink: 0,
      }}
      title="Copy to clipboard"
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}
