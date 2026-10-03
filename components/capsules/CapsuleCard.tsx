"use client";

import type { CapsuleEntry } from "@/lib/types";
import { TerminalFrame } from "@/components/ui";

interface CapsuleCardProps {
  capsule: CapsuleEntry;
}

export default function CapsuleCard({ capsule }: CapsuleCardProps) {
  return (
    <div className="bg-surface border border-edge-2 rounded-md overflow-hidden flex flex-col">
      <TerminalFrame title={capsule.project}>
        <div className="space-y-0">
          {capsule.snippet.map((line, i) => {
            if (line === "") {
              return <div key={i} className="h-3" />;
            }
            if (line.startsWith("$")) {
              return (
                <div key={i} className="font-code text-[13px] leading-relaxed">
                  <span style={{ color: "var(--color-amber)" }}>$</span>
                  <span style={{ color: "var(--color-ink)" }}>{line.slice(1)}</span>
                </div>
              );
            }
            return (
              <div
                key={i}
                className="font-code text-[13px] leading-relaxed"
                style={{ color: "var(--color-ink)" }}
              >
                {line}
              </div>
            );
          })}
        </div>
      </TerminalFrame>

      <div className="p-5 flex flex-col flex-1">
        <div className="font-code text-[11px] text-amber uppercase tracking-widest mb-2">
          {capsule.project}
        </div>
        <p className="text-muted text-[15px] md:text-sm leading-relaxed mb-4 flex-1">{capsule.useCase}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {capsule.tags.map((tag) => (
            <span
              key={tag}
              className="font-code text-[11px] text-muted border border-edge px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <a
          href={capsule.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="font-code text-[12px] text-amber hover:text-amber-2 transition-colors"
        >
          view on github ↗
        </a>
      </div>
    </div>
  );
}
