"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Primitive } from "@/lib/types";
import TerminalFrame from "@/components/ui/TerminalFrame";

interface PrimitiveExplorerProps {
  primitives: Primitive[];
}

export default function PrimitiveExplorer({ primitives }: PrimitiveExplorerProps) {
  const [activeId, setActiveId] = useState<string>(primitives[0]?.id ?? "");

  useEffect(() => {
    function readHash() {
      const hash = window.location.hash.replace("#", "");
      const match = primitives.find((p) => p.id === hash);
      if (match) setActiveId(match.id);
    }
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, [primitives]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const currentIndex = primitives.findIndex((p) => p.id === activeId);
      const nextIndex =
        e.key === "ArrowLeft"
          ? (currentIndex - 1 + primitives.length) % primitives.length
          : (currentIndex + 1) % primitives.length;
      const next = primitives[nextIndex];
      setActiveId(next.id);
      window.history.pushState({}, "", "#" + next.id);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [primitives, activeId]);

  function selectPrimitive(id: string) {
    setActiveId(id);
    window.history.pushState({}, "", "#" + id);
  }

  const active = primitives.find((p) => p.id === activeId) ?? primitives[0];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid var(--color-edge-2)",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "var(--color-surface)",
      }}
      className="primitive-explorer"
    >
      {/* Tab row */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-edge)",
          overflowX: "auto",
        }}
        className="primitive-tabs"
      >
        {primitives.map((p) => {
          const isActive = p.id === activeId;
          return (
            <button
              key={p.id}
              onClick={() => selectPrimitive(p.id)}
              style={{
                padding: "14px 24px",
                borderRight: "1px solid var(--color-edge)",
                borderBottom: isActive ? "2px solid var(--color-amber)" : "2px solid transparent",
                backgroundColor: isActive ? "var(--color-surface-2, var(--color-canvas))" : "transparent",
                color: isActive ? "var(--color-ink)" : "var(--color-faint)",
                cursor: "pointer",
                fontFamily: "var(--font-code), monospace",
                fontSize: "12px",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                transition: "color 0.15s, background-color 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "16px", lineHeight: 1 }}>{p.icon}</span>
              <span>{p.name}</span>
              {p.shipped && (
                <span
                  style={{
                    fontSize: "9px",
                    color: "var(--color-jade)",
                    border: "1px solid color-mix(in srgb, var(--color-jade) 30%, transparent)",
                    borderRadius: "2px",
                    padding: "1px 5px",
                    letterSpacing: "0.06em",
                    fontFamily: "var(--font-code), monospace",
                  }}
                >
                  shipped
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content panel */}
      <div style={{ padding: "48px", minHeight: "360px" }} className="primitive-panel">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ display: "flex", flexDirection: "column", gap: "0" }}
          >
            {/* Name */}
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                fontStyle: "italic",
                letterSpacing: "-0.02em",
                color: "var(--color-ink)",
                lineHeight: 1.1,
                marginBottom: "12px",
              }}
            >
              {active.name}
            </h2>

            {/* Tagline */}
            <p
              style={{
                fontSize: "18px",
                color: "var(--color-muted)",
                marginBottom: "20px",
                lineHeight: "1.5",
              }}
            >
              {active.tagline}
            </p>

            {/* Description */}
            <p
              style={{
                fontSize: "15px",
                color: "var(--color-faint)",
                lineHeight: "1.75",
                marginBottom: "36px",
                maxWidth: "600px",
              }}
            >
              {active.description}
            </p>

            {/* CLI demo */}
            <div style={{ maxWidth: "560px" }}>
              <TerminalFrame title={active.name}>
                <span style={{ color: "var(--color-amber)" }}>$ </span>
                <span style={{ color: "var(--color-ink)" }}>{active.command}</span>
              </TerminalFrame>
            </div>

            {/* Keyboard hint */}
            <p
              className="font-code"
              style={{ fontSize: "11px", color: "var(--color-faint)", marginTop: "24px", opacity: 0.6 }}
            >
              ← → navigate primitives
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
