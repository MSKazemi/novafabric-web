"use client";

import type { Status } from "@/lib/types";

// Theme-aware: each status maps to a semantic hue token (defined per-theme in
// globals.css). Fills/borders are derived from the same token via color-mix so
// they stay legible on both light and dark canvases.
const STATUS_HUE: Record<Status, string> = {
  experimental: "var(--color-accent)",
  prototype: "var(--hue-blue)",
  research: "var(--hue-violet)",
  planned: "var(--hue-slate)",
  deprecated: "var(--hue-red)",
};

interface StatusChipProps {
  status: Status;
  className?: string;
}

export default function StatusChip({ status, className = "" }: StatusChipProps) {
  const hue = STATUS_HUE[status];
  return (
    <span
      className={`font-code text-[11px] tracking-widest uppercase px-2 py-0.5 rounded ${className}`}
      style={{
        color: hue,
        backgroundColor: `color-mix(in srgb, ${hue} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${hue} 32%, transparent)`,
      }}
    >
      {status}
    </span>
  );
}
