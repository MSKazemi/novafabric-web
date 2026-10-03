"use client";

import { useEffect, useState } from "react";

const TERMINAL_LINES: { text: string; type: string; delay: number }[] = [
  { text: "$ nova capture python ./examples/agent.py", type: "cmd", delay: 400 },
  { text: "", type: "blank", delay: 650 },
  { text: "  capturing ─ python ./examples/agent.py", type: "info", delay: 900 },
  { text: "  capsule   ─ 9cf2a31b", type: "info", delay: 1100 },
  { text: "             runs/2025-01-15T09:42:00Z", type: "dim", delay: 1250 },
  { text: "", type: "blank", delay: 1400 },
  { text: "  manifest.json          ✓", type: "ok", delay: 1600 },
  { text: "  environment.json       ✓", type: "ok", delay: 1780 },
  { text: "  trace.jsonl            ✓   2,847 spans", type: "ok", delay: 1960 },
  { text: "  model-calls/           ✓   14 LLM calls", type: "ok", delay: 2140 },
  { text: "  mcp-exchanges/         ✓   7 tool calls", type: "ok", delay: 2320 },
  { text: "", type: "blank", delay: 2500 },
  { text: "  sealing ─ NovaSeal ...", type: "info", delay: 2700 },
  { text: "  dsse signature         ✓", type: "ok", delay: 3000 },
  { text: "  rfc-3161 timestamp     ✓", type: "ok", delay: 3200 },
  { text: "", type: "blank", delay: 3400 },
  { text: "● capsule 9cf2a31b sealed   847ms", type: "done", delay: 3600 },
];

const LINE_COLORS: Record<string, string> = {
  cmd:   "var(--color-amber)",
  info:  "var(--color-muted)",
  dim:   "var(--color-faint)",
  ok:    "var(--color-jade)",
  done:  "var(--color-amber-2)",
  blank: "transparent",
};

export default function NovaTerminal() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    TERMINAL_LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleCount(i + 1);
        if (i === TERMINAL_LINES.length - 1) setDone(true);
      }, line.delay);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      data-theme="dark"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-edge-2)",
        borderRadius: "8px",
        overflow: "hidden",
        fontFamily: "var(--font-code), monospace",
        fontSize: "13px",
        lineHeight: "1.7",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--color-surface-2)",
          borderBottom: "1px solid var(--color-edge)",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ff5f57" }} />
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#febc2e" }} />
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#28c840" }} />
        <span style={{ marginLeft: "8px", color: "var(--color-faint)", fontSize: "11px", letterSpacing: "0.05em" }}>
          nova — bash
        </span>
      </div>
      <div style={{ padding: "16px 18px", minHeight: "320px" }}>
        {TERMINAL_LINES.slice(0, visibleCount).map((line, i) => (
          <div
            key={i}
            style={{
              color: LINE_COLORS[line.type] ?? "var(--color-ink)",
              animation: "lineIn 0.15s ease both",
              whiteSpace: "pre",
              minHeight: line.type === "blank" ? "8px" : undefined,
              fontWeight: line.type === "done" ? 500 : 400,
            }}
          >
            {line.text}
          </div>
        ))}
        {!done && <span className="cursor-blink" />}
      </div>
    </div>
  );
}
