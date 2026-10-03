"use client";

import type { ReactNode } from "react";

interface TerminalFrameProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function TerminalFrame({ title = "nova — bash", children, className = "" }: TerminalFrameProps) {
  return (
    <div
      // Terminals render as a deliberate dark "device" even on the light site
      // (Stripe/Vercel/Linear convention). The local dark stage re-themes all
      // token-based children; elevation lifts it off the light canvas.
      data-theme="dark"
      className={`rounded-lg overflow-hidden border border-edge-2 font-code text-[13px] leading-relaxed text-ink shadow-card-md ${className}`}
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      {/* Traffic-light title bar */}
      <div
        className="flex items-center gap-2 px-3.5 py-2 border-b border-edge"
        style={{ backgroundColor: "var(--color-surface-2)" }}
      >
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#ff5f57" }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#febc2e" }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#28c840" }} />
        <span className="ml-2 text-faint text-[11px] tracking-[0.05em]">{title}</span>
      </div>
      {/* Body */}
      <div className="p-4">{children}</div>
    </div>
  );
}
