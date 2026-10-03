"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "idle" | "capturing" | "complete";

interface CapsuleFile {
  id: string;
  label: string;
  connector: "├─" | "└─";
  detail: string; // shown next to progress bar while animating
  content: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const CAPSULE_ID = "4f8a1c2e";

const FILES: CapsuleFile[] = [
  {
    id: "capsule.yaml",
    label: "capsule.yaml",
    connector: "├─",
    detail: "manifest",
    content: `id: 01HXAY7M5JZ8R7K4P9DPBYK2WX
command: python agent.py
status: success  exit_code: 0
started:  2026-05-19T14:23:01Z
finished: 2026-05-19T14:26:12Z
duration: 3m 11s
nova_version: 0.24.0`,
  },
  {
    id: "trace.jsonl",
    label: "trace.jsonl",
    connector: "├─",
    detail: "1,203 spans",
    content: `{"span":"7f3a","op":"agent.run","dur_ms":191449}
{"span":"1b2c","op":"llm.call","model":"claude-3-5-sonnet","dur_ms":4821}
{"span":"9d4e","op":"tool.bash","cmd":"python preprocess.py","dur_ms":12043}
{"span":"3f7b","op":"llm.call","model":"claude-3-5-sonnet","dur_ms":3917}
{"span":"a1c5","op":"tool.write_file","path":"output/results.json"}
... 1,198 more spans`,
  },
  {
    id: "model-calls.jsonl",
    label: "model-calls.jsonl",
    connector: "├─",
    detail: "6 calls",
    content: `{"call":"c1","model":"claude-3-5-sonnet","in":4821,"out":312,"ms":4821}
{"call":"c2","model":"claude-3-5-sonnet","in":6103,"out":891,"ms":3917}
{"call":"c3","model":"claude-3-5-sonnet","in":7204,"out":224,"ms":2103}
... 3 more calls
total_input:  31,847 tokens
total_output:  4,102 tokens
cost:         $0.1284`,
  },
  {
    id: "tool-calls.jsonl",
    label: "tool-calls.jsonl",
    connector: "├─",
    detail: "14 calls",
    content: `{seq:1, tool:"bash",       cmd:"python preprocess.py", exit:0}
{seq:2, tool:"read_file",  path:"data/config.yaml"}
{seq:3, tool:"write_file", path:"output/results.json"}
{seq:4, tool:"bash",       cmd:"pytest tests/ -q",     exit:0}
... 10 more tool calls`,
  },
  {
    id: "env.lock",
    label: "env.lock",
    connector: "├─",
    detail: "locked",
    content: `python:   3.12.3
platform: Linux-6.14.0-x86_64
cpu:      16 cores

anthropic:   0.40.0
langchain:   0.3.14
numpy:       2.1.3
novafabric:  0.24.0

ANTHROPIC_API_KEY: [REDACTED]
HOME:              /home/nova`,
  },
  {
    id: "redaction-proof.json",
    label: "redaction-proof",
    connector: "├─",
    detail: "1 secret",
    content: `{
  "schema": "nova-redaction/v1",
  "secrets_found": 1,
  "secrets_redacted": 1,
  "capsule_clean": true,
  "proof": {
    "ANTHROPIC_API_KEY": {
      "redacted": true,
      "hmac": "a7f3c2e1d9..."
    }
  }
}`,
  },
  {
    id: "dsse.sig",
    label: "dsse signature",
    connector: "└─",
    detail: "ed25519",
    content: `{
  "payload_type": "nova.capsule+json",
  "signatures": [{
    "keyid": "nova-ed25519-2026-01",
    "sig": "MEYCIQDp3n8f..."
  }],
  "timestamp": {
    "tsa": "freetsa.org",
    "rfc3161": true,
    "verified": "2026-05-19T14:26:13Z"
  }
}`,
  },
];

// Per-file animation duration for the progress bar fill (ms)
const BAR_FILL_DURATION = 400;
// Delay between files starting their animation (ms)
const FILE_STAGGER = 500;
// Phase 1 idle hold before capture starts (ms)
const IDLE_HOLD = 800;

// ─── Syntax highlighting helpers ──────────────────────────────────────────────

/**
 * Renders a line of YAML or JSON-like content with minimal color:
 *   - keys (before ":" or inside quotes before ":") → amber
 *   - everything else → --color-ink
 * Returns an array of <span> elements.
 */
function HighlightedLine({
  line,
  index,
}: {
  line: string;
  index: number;
}): React.ReactElement {
  // YAML key: "key: value" or "key: value"
  const yamlMatch = line.match(/^(\s*)([\w-]+)(:)(.*)$/);
  if (yamlMatch) {
    const [, indent, key, colon, rest] = yamlMatch;
    return (
      <div key={index} style={{ whiteSpace: "pre", lineHeight: "1.75" }}>
        <span style={{ color: "var(--color-ink)" }}>{indent}</span>
        <span style={{ color: "var(--color-amber)" }}>{key}</span>
        <span style={{ color: "var(--color-muted)" }}>{colon}</span>
        <span style={{ color: "var(--color-ink)" }}>{rest}</span>
      </div>
    );
  }
  // JSON key: "key": value  or  "key":value
  const jsonMatch = line.match(/^(\s*)("[\w_-]+")(:\s*)(.*)$/);
  if (jsonMatch) {
    const [, indent, key, colon, rest] = jsonMatch;
    return (
      <div key={index} style={{ whiteSpace: "pre", lineHeight: "1.75" }}>
        <span style={{ color: "var(--color-ink)" }}>{indent}</span>
        <span style={{ color: "var(--color-amber)" }}>{key}</span>
        <span style={{ color: "var(--color-muted)" }}>{colon}</span>
        <span style={{ color: "var(--color-ink)" }}>{rest}</span>
      </div>
    );
  }
  // Bare line (comment, value-only, "... N more", totals)
  return (
    <div key={index} style={{ whiteSpace: "pre", lineHeight: "1.75", color: "var(--color-ink)" }}>
      {line}
    </div>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

function ProgressBar({ progress }: { progress: number }) {
  const clamped = Math.min(1, Math.max(0, progress));
  const isDone = clamped >= 1;
  return (
    <div
      style={{
        width: "120px",
        height: "6px",
        backgroundColor: "var(--color-edge)",
        borderRadius: "3px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: `${clamped * 100}%`,
          height: "100%",
          backgroundColor: isDone ? "var(--color-jade)" : "var(--color-amber)",
          borderRadius: "3px",
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
}

// ─── FileRow ──────────────────────────────────────────────────────────────────

function FileRow({
  file,
  progress,
  isComplete,
  isSelected,
  allComplete,
  onClick,
}: {
  file: CapsuleFile;
  progress: number; // 0–1
  isComplete: boolean;
  isSelected: boolean;
  allComplete: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const isAnimating = progress > 0 && !isComplete;

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "5px 6px",
    borderRadius: "3px",
    cursor: allComplete ? "pointer" : "default",
    borderLeft: isSelected
      ? "2px solid var(--color-amber)"
      : hovered && allComplete
      ? "2px solid color-mix(in srgb, var(--color-accent) 40%, transparent)"
      : "2px solid transparent",
    backgroundColor: isSelected
      ? "color-mix(in srgb, var(--color-accent) 9%, transparent)"
      : hovered && allComplete
      ? "color-mix(in srgb, var(--color-accent) 6%, transparent)"
      : "transparent",
    transition: "background-color 0.15s, border-color 0.15s",
    marginLeft: "-8px",
    marginRight: "-6px",
  };

  const connectorColor = "var(--color-faint)";

  return (
    <div
      style={rowStyle}
      onClick={allComplete ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* tree connector */}
      <span style={{ color: connectorColor, flexShrink: 0, userSelect: "none" }}>
        {file.connector}
      </span>

      {/* filename */}
      <span
        style={{
          color: isComplete ? "var(--color-ink)" : "var(--color-muted)",
          minWidth: "148px",
          flexShrink: 0,
          transition: "color 0.2s",
        }}
      >
        {file.label}
      </span>

      {/* progress bar */}
      <ProgressBar progress={progress} />

      {/* status label */}
      <span
        style={{
          color: isComplete
            ? "var(--color-jade)"
            : isAnimating
            ? "var(--color-amber)"
            : "var(--color-faint)",
          fontSize: "11px",
          flexShrink: 0,
          minWidth: "70px",
          transition: "color 0.2s",
        }}
      >
        {isComplete
          ? "done"
          : isAnimating
          ? file.detail
          : "pending"}
      </span>

      {/* view arrow — only when complete */}
      {allComplete && (
        <span
          style={{
            color: isSelected ? "var(--color-amber)" : "var(--color-faint)",
            fontSize: "11px",
            flexShrink: 0,
            transition: "color 0.15s",
            marginLeft: "auto",
            paddingRight: "4px",
          }}
        >
          view →
        </span>
      )}
    </div>
  );
}

// ─── FileContentPane ──────────────────────────────────────────────────────────

function FileContentPane({ file }: { file: CapsuleFile }) {
  const lines = file.content.split("\n");
  return (
    <div
      style={{
        backgroundColor: "var(--color-canvas)",
        border: "1px solid var(--color-edge-2)",
        borderRadius: "5px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: "220px",
      }}
    >
      {/* Pane header */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-edge)",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "var(--color-amber)", fontSize: "11px" }}>◈</span>
        <span
          style={{
            fontFamily: "var(--font-code), monospace",
            fontSize: "11px",
            color: "var(--color-muted)",
            letterSpacing: "0.04em",
          }}
        >
          {file.id}
        </span>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          padding: "14px 16px",
          overflowY: "auto",
          maxHeight: "320px",
          fontFamily: "var(--font-code), monospace",
          fontSize: "12px",
          lineHeight: "1.75",
        }}
      >
        {lines.map((line, i) => (
          <HighlightedLine key={i} line={line} index={i} />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function InteractiveCapsule() {
  const [phase, setPhase] = useState<Phase>("idle");
  // progress[i] = 0..1 fill fraction for file i
  const [progressArr, setProgressArr] = useState<number[]>(
    FILES.map(() => 0)
  );
  // which file indices are fully done
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());
  // selected file id for the detail pane
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rafRef = useRef<number | null>(null);
  const startTimes = useRef<(number | null)[]>(FILES.map(() => null));

  const allComplete = completedSet.size === FILES.length;

  // ── Animation driver ──────────────────────────────────────────────────────

  useEffect(() => {
    // Phase 1: idle hold
    const idleTimer = setTimeout(() => {
      setPhase("capturing");
    }, IDLE_HOLD);
    return () => clearTimeout(idleTimer);
  }, []);

  useEffect(() => {
    if (phase !== "capturing") return;

    // Schedule start times for each file
    FILES.forEach((_, i) => {
      startTimes.current[i] = performance.now() + i * FILE_STAGGER;
    });

    let animActive = true;

    function tick(now: number) {
      if (!animActive) return;

      setProgressArr((prev) => {
        const next = [...prev];
        let anyUpdated = false;
        FILES.forEach((_, i) => {
          const start = startTimes.current[i];
          if (start === null || now < start) return;
          const elapsed = now - start;
          const newProg = Math.min(1, elapsed / BAR_FILL_DURATION);
          if (newProg !== prev[i]) {
            next[i] = newProg;
            anyUpdated = true;
          }
        });
        return anyUpdated ? next : prev;
      });

      setCompletedSet((prev) => {
        const next = new Set(prev);
        FILES.forEach((_, i) => {
          const start = startTimes.current[i];
          if (start !== null && now >= start + BAR_FILL_DURATION) {
            next.add(i);
          }
        });
        if (next.size !== prev.size) return next;
        return prev;
      });

      // Keep ticking until all files are done
      const lastStart = startTimes.current[FILES.length - 1];
      if (lastStart !== null && now < lastStart + BAR_FILL_DURATION + 50) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Ensure everything is snapped to 1
        setProgressArr(FILES.map(() => 1));
        setCompletedSet(new Set(FILES.map((_, i) => i)));
        setPhase("complete");
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      animActive = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleFileClick(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const selectedFile = FILES.find((f) => f.id === selectedId) ?? null;

  return (
    <div
      data-theme="dark"
      style={{
        fontFamily: "var(--font-code), monospace",
        fontSize: "13px",
        lineHeight: "1.6",
        color: "var(--color-ink)",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-edge-2)",
        borderRadius: "10px",
        padding: "18px",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Outer wrapper — switches to row layout when a file is selected */}
      <div
        style={{
          display: "flex",
          flexDirection: selectedFile ? "row" : "column",
          gap: "16px",
          alignItems: "flex-start",
        }}
        className="capsule-outer"
      >
        {/* ── Left pane: terminal ─────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-edge-2)",
            borderRadius: "6px",
            overflow: "hidden",
            flex: selectedFile ? "0 0 auto" : "1 1 auto",
            width: selectedFile ? "auto" : "100%",
            minWidth: 0,
          }}
        >
          {/* Title bar */}
          <div
            style={{
              backgroundColor: "rgba(30,30,42,0.8)",
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
            <span
              style={{
                marginLeft: "8px",
                color: "var(--color-faint)",
                fontSize: "11px",
                letterSpacing: "0.05em",
              }}
            >
              nova — bash
            </span>
          </div>

          {/* Terminal body */}
          <div style={{ padding: "16px 18px" }}>
            {/* Phase 1: command prompt */}
            <div style={{ marginBottom: "12px" }}>
              <span style={{ color: "var(--color-amber)" }}>$ </span>
              <span style={{ color: "var(--color-ink)" }}>nova capture python agent.py</span>
              {phase === "idle" && (
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "14px",
                    backgroundColor: "var(--color-amber)",
                    marginLeft: "2px",
                    verticalAlign: "text-bottom",
                    animation: "capsuleCursorBlink 1s step-end infinite",
                  }}
                />
              )}
            </div>

            {/* Phase 2+: capturing block */}
            {phase !== "idle" && (
              <div>
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "10px",
                    color: "var(--color-muted)",
                    fontSize: "12px",
                  }}
                >
                  <span style={{ color: "var(--color-amber)", fontWeight: 500 }}>capturing</span>
                  <span style={{ color: "var(--color-edge-2)" }}>
                    {"─".repeat(32)}
                  </span>
                </div>

                {/* Capsule id */}
                <div style={{ marginBottom: "10px", paddingLeft: "2px" }}>
                  <span style={{ color: "var(--color-faint)" }}>  capsule id</span>
                  {"   "}
                  <span style={{ color: "var(--color-jade)" }}>{CAPSULE_ID}</span>
                </div>

                {/* File rows */}
                <div style={{ paddingLeft: "2px" }}>
                  {FILES.map((file, i) => (
                    <FileRow
                      key={file.id}
                      file={file}
                      progress={progressArr[i]}
                      isComplete={completedSet.has(i)}
                      isSelected={selectedId === file.id}
                      allComplete={allComplete}
                      onClick={() => handleFileClick(file.id)}
                    />
                  ))}
                </div>

                {/* Sealed line */}
                {allComplete && (
                  <div
                    style={{
                      marginTop: "14px",
                      paddingTop: "10px",
                      borderTop: "1px solid var(--color-edge)",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      animation: "capsuleSealFadeIn 0.4s ease both",
                    }}
                  >
                    <span style={{ color: "var(--color-jade)" }}>✓ capsule sealed</span>
                    <span style={{ color: "var(--color-faint)" }}>·</span>
                    <span style={{ color: "var(--color-faint)" }}>replay with:</span>
                    <span style={{ color: "var(--color-amber)" }}>
                      nova replay {CAPSULE_ID}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right pane: file content ─────────────────────────────────────── */}
        {selectedFile && (
          <div
            style={{
              flex: "1 1 280px",
              minWidth: "280px",
              animation: "capsulePaneSlideIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
            className="capsule-detail-pane"
          >
            <FileContentPane file={selectedFile} />
          </div>
        )}
      </div>

      {/* Keyframes injected once */}
      <style>{`
        @keyframes capsuleCursorBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes capsuleSealFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes capsulePaneSlideIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 767px) {
          .capsule-outer {
            flex-direction: column !important;
          }
          .capsule-detail-pane {
            width: 100% !important;
            min-width: 0 !important;
            animation: capsulePaneSlideInMobile 0.25s cubic-bezier(0.22,1,0.36,1) both !important;
          }
        }
        @keyframes capsulePaneSlideInMobile {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
