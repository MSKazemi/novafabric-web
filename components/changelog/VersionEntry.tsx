"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Milestone, MilestoneStatus } from "@/lib/types";

interface VersionEntryProps {
  milestone: Milestone;
  isLatest?: boolean;
  defaultOpen?: boolean;
}

function statusLabel(status: MilestoneStatus): { text: string; color: string } {
  switch (status) {
    case "shipped":
      return { text: "✓ shipped", color: "var(--color-jade)" };
    case "in-progress":
      return { text: "◆ active", color: "var(--color-amber)" };
    case "planned":
      return { text: "○ planned", color: "var(--color-muted)" };
  }
}

function borderColor(status: MilestoneStatus): string {
  switch (status) {
    case "shipped":
      return "var(--color-amber)";
    case "in-progress":
      return "var(--color-jade)";
    case "planned":
      return "var(--color-faint)";
  }
}

export default function VersionEntry({
  milestone,
  isLatest = false,
  defaultOpen = false,
}: VersionEntryProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { text: statusText, color: statusColor } = statusLabel(milestone.status);

  return (
    <div
      style={{
        borderLeft: `2px solid ${borderColor(milestone.status)}`,
        backgroundColor: "var(--color-surface)",
        border: `1px solid var(--color-edge-2)`,
        borderLeftWidth: "2px",
        borderLeftColor: borderColor(milestone.status),
        borderRadius: "6px",
        boxShadow: isLatest ? "0 0 16px color-mix(in srgb, var(--color-jade) 14%, transparent)" : undefined,
        overflow: "hidden",
      }}
    >
      {/* Clickable row */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "16px 20px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
          {/* Version */}
          <span
            className="font-code"
            style={{
              fontSize: "13px",
              color: "var(--color-amber)",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {milestone.version}
          </span>

          {/* Label */}
          <span
            className="font-display"
            style={{
              fontSize: "18px",
              color: "var(--color-ink)",
              lineHeight: 1.2,
            }}
          >
            {milestone.label}
          </span>
        </div>

        {/* Right side: status + chevron */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexShrink: 0,
          }}
        >
          <span
            className="font-code"
            style={{
              fontSize: "11px",
              color: statusColor,
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
            }}
          >
            {statusText}
          </span>

          {milestone.detail && (
            <span
              className="font-code"
              style={{
                fontSize: "12px",
                color: "var(--color-faint)",
                transition: "transform 0.2s",
                display: "inline-block",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ▾
            </span>
          )}
        </div>
      </button>

      {/* Expandable detail */}
      {milestone.detail && (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  padding: "0 20px 16px 20px",
                  borderTop: "1px solid var(--color-edge)",
                  paddingTop: "14px",
                }}
              >
                <p
                  className="font-code"
                  style={{
                    fontSize: "13px",
                    color: "var(--color-muted)",
                    lineHeight: 1.7,
                  }}
                >
                  {milestone.detail}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
