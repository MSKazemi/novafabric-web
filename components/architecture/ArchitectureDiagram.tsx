"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LayerPanel, { type ArchLayer } from "./LayerPanel";

const LAYERS: ArchLayer[] = [
  {
    id: "compute",
    number: "P1",
    name: "Compute Plane",
    subtitle: "Where AI agents run",
    color: "var(--color-amber)",
    techStack: ["Python nova CLI", "Go event collector", "DSSE signing"],
    metrics: "295K events/sec batch signing",
    cliCommand: "nova capture python agent.py",
    description:
      "The nova CLI wraps any command, capturing all tool calls, model interactions, and environment state. The Go collector handles high-throughput event ingestion with crash-safe spooling.",
  },
  {
    id: "node",
    number: "P2",
    name: "Node Collector",
    subtitle: "Per-machine aggregation",
    color: "#4a9eff",
    techStack: ["Go daemon", "SQLite spool", "RFC 3161 timestamps"],
    metrics: "Crash-safe spool, sub-ms local latency",
    cliCommand: "nova collector start --spool-dir /var/nova",
    description:
      "Each machine runs a lightweight Go daemon that aggregates spans from all local nova processes, applies RFC 3161 timestamps, and forwards to the cluster collector.",
  },
  {
    id: "cluster",
    number: "P3",
    name: "Cluster Collector",
    subtitle: "Team-level evidence store",
    color: "#a87fff",
    techStack: ["Postgres + pgBouncer", "Object store (S3/local)", "RLS isolation"],
    metrics: "p99 benchmark exists, not CI-gated",
    cliCommand: "nova server start --postgres $DATABASE_URL",
    description:
      "The cluster collector ingests from multiple node collectors, stores capsule metadata in Postgres with row-level security, and routes capsule objects to the configured object store.",
  },
  {
    id: "regional",
    number: "P4",
    name: "Regional Evidence Store",
    subtitle: "Cross-team provenance",
    color: "var(--color-jade)",
    techStack: ["KuzuDB lineage graphs", "Cross-cluster federation", "Provenance queries"],
    metrics: "Prototype — largest test: 5 edges",
    description:
      "Federates evidence across cluster collectors. Lineage graphs in KuzuDB enable cross-team provenance queries: trace which capsules descend from a given asset or model version.",
  },
  {
    id: "global",
    number: "P5",
    name: "Global Query Plane",
    subtitle: "Fleet-wide audit and replay",
    color: "#ff8c42",
    techStack: ["NovaSeal verification", "Replay Engine", "Audit dashboard"],
    cliCommand: "nova replay --capsule 4f8a1c2e --mode forensic",
    description:
      "The global query plane exposes replay, audit, and verification across all evidence. Any capsule can be inspected or replayed in forensic, mocked, semantic, or exact mode for debugging or audit input.",
  },
];

export default function ArchitectureDiagram() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setActiveId("compute");
    }
  }, []);

  const activeLayer = LAYERS.find((l) => l.id === activeId);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left: layer list */}
      <div className="bg-surface border border-edge-2 rounded-md overflow-hidden md:w-64 shrink-0">
        {LAYERS.map((layer) => {
          const isActive = activeId === layer.id;
          return (
            <div
              key={layer.id}
              onClick={() => setActiveId(layer.id)}
              className={`cursor-pointer select-none px-4 py-4 transition-colors ${
                isActive
                  ? "bg-surface-2"
                  : "border-l border-transparent hover:bg-surface"
              }`}
              style={
                isActive
                  ? { borderLeft: `3px solid ${layer.color}` }
                  : undefined
              }
            >
              <div
                className="font-code text-[11px] tracking-widest uppercase mb-0.5"
                style={{ color: layer.color }}
              >
                {layer.number}
              </div>
              <div className="font-display text-lg text-ink leading-tight">
                {layer.name}
              </div>
              <div className="text-muted text-[15px] md:text-sm">{layer.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Right: detail panel */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeLayer ? (
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <LayerPanel layer={activeLayer} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-code text-[13px] text-faint text-center py-12"
            >
              ← select a plane
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
