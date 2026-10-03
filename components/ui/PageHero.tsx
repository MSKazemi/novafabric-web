"use client";

import type { Status } from "@/lib/types";
import StatusChip from "./StatusChip";

interface PageHeroProps {
  section: string;
  title: string;
  subtitle?: string;
  status?: Status;
  tag?: string;
  children?: React.ReactNode;
}

export default function PageHero({ section, title, subtitle, status, tag, children }: PageHeroProps) {
  return (
    <section className="pb-16 border-b border-edge" style={{ paddingTop: "5rem" }}>
      <div className="page-max-w">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <span className="font-code text-[11px] text-muted tracking-widest uppercase">
            novafabric.ai
          </span>
          <span className="text-faint text-xs">/</span>
          <span className="font-code text-[11px] text-amber tracking-widest uppercase">
            {section}
          </span>
        </div>

        {/* Title row */}
        <div className="flex flex-wrap items-start gap-4 mb-4">
          <h1 className="font-display text-5xl md:text-6xl text-ink leading-[1.05]">{title}</h1>
          <div className="flex items-center gap-2 mt-2">
            {status && <StatusChip status={status} />}
            {tag && (
              <span className="font-code text-[11px] text-muted border border-edge px-2 py-0.5 rounded tracking-widest uppercase">
                {tag}
              </span>
            )}
          </div>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-muted text-lg max-w-2xl leading-relaxed">{subtitle}</p>
        )}

        {/* Optional slot for CTAs or supplemental content */}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
