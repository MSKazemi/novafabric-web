"use client";

import { useState, useEffect } from "react";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export default function KonamiHandler() {
  const [active, setActive] = useState(false);
  const sequenceRef = useState<string[]>([])[1];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      sequenceRef((prev) => {
        const next = [...prev, e.key].slice(-KONAMI.length);
        if (next.length === KONAMI.length && next.every((k, i) => k === KONAMI[i])) {
          setActive(true);
          return [];
        }
        return next;
      });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sequenceRef]);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setActive(false), 3000);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        backgroundColor: "rgba(7,7,10,0.95)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      onClick={() => setActive(false)}
    >
      <div style={{ textAlign: "center", fontFamily: "var(--font-code), monospace" }}>
        <p
          style={{
            fontSize: "11px",
            color: "var(--color-faint)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          ↑↑↓↓←→←→BA
        </p>
        <p
          style={{
            fontSize: "clamp(32px, 5vw, 64px)",
            color: "var(--color-amber)",
            marginBottom: "8px",
          }}
        >
          ◆ nova mode activated
        </p>
        <p
          style={{
            fontSize: "14px",
            color: "var(--color-muted)",
            marginBottom: "32px",
          }}
        >
          You found it. The time machine is real.
        </p>
        <p style={{ fontSize: "11px", color: "var(--color-faint)" }}>click to dismiss</p>
      </div>
    </div>
  );
}
