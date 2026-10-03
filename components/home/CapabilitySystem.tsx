import Link from "next/link";
import CountUp from "@/components/ui/CountUp";

/**
 * "System at a glance" — an enterprise credibility + full-capability band.
 *
 * Metrics are the real repo's scale.
 * The six domains (Capture · Evidence · Analyze · Trust · Govern · Serve) and the
 * eight framework adapters match the NovaFabric architecture overview and the
 * /architecture explorer.
 */

const METRICS: { value: string; label: string }[] = [
  { value: "4", label: "replay modes" },
  { value: "220+", label: "decision records" },
  { value: "750+", label: "test suites" },
  { value: "81", label: "subpackages" },
  { value: "8", label: "framework adapters" },
  { value: "Apache-2.0", label: "open source" },
];

// The 8 real agent-framework adapters that ship in src/novafabric/adapters/.
const ADAPTERS = [
  "LangGraph",
  "AutoGen",
  "CrewAI",
  "DSPy",
  "OpenAI Agents",
  "Google ADK",
  "Bedrock AgentCore",
  "A2A",
];

const PILLARS: {
  key: string;
  icon: string;
  title: string;
  tagline: string;
  hue: string;
  subsystems: string[];
}[] = [
  {
    key: "capture",
    icon: "⚡",
    title: "Capture",
    tagline: "Wrap any subprocess. Record everything.",
    hue: "var(--color-amber-true)",
    subsystems: [
      "Framework Adapters",
      "Multi-Target Runners",
      "Capture Orchestrator",
      "Wire-Level Hooks",
      "Secret Scanner",
    ],
  },
  {
    key: "evidence",
    icon: "📦",
    title: "Evidence model",
    tagline: "The portable, self-contained unit of record.",
    hue: "var(--color-jade)",
    subsystems: [
      "Run Capsule",
      "Event Envelope v1",
      "Evidence Fabric",
      "Capsule Schemas",
    ],
  },
  {
    key: "analyze",
    icon: "🔬",
    title: "Analyze",
    tagline: "Replay, diff, trace lineage, evaluate.",
    hue: "var(--hue-violet)",
    subsystems: [
      "Replay Engine",
      "Diff Engine",
      "Lineage Graph",
      "Eval Suites",
      "Knowledge Graph",
    ],
  },
  {
    key: "trust",
    icon: "🔐",
    title: "Trust",
    tagline: "Sign, timestamp, and verify evidence.",
    hue: "var(--hue-orange)",
    subsystems: ["NovaSeal Signing", "Evidence Bundle", "Merkle Log"],
  },
  {
    key: "govern",
    icon: "⚖️",
    title: "Govern",
    tagline: "Policy gates, approvals, compliance.",
    hue: "var(--hue-gold)",
    subsystems: [
      "Promotion (Maker-Checker)",
      "Policy Engine (OPA)",
      "Compliance & Export",
      "Governance & Judge",
      "Asset Registry",
    ],
  },
  {
    key: "serve",
    icon: "🌐",
    title: "Serve",
    tagline: "Multi-user API, dashboard, topology.",
    hue: "var(--hue-blue)",
    subsystems: [
      "Storage Layer",
      "Server (REST API)",
      "Dashboard",
      "Live Topology",
    ],
  },
];

export default function CapabilitySystem() {
  return (
    <section className="py-24 border-t border-edge relative overflow-hidden">
      {/* faint blueprint grid backdrop */}
      <div
        className="blueprint-grid absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.5,
          maskImage:
            "radial-gradient(ellipse 90% 80% at 50% 30%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 50% 30%, black 30%, transparent 100%)",
        }}
      />

      <div className="page-max-w relative z-10">
        <p className="section-number mb-3">01 / THE SYSTEM</p>
        <h2 className="font-display text-4xl md:text-5xl text-ink leading-[1.05] mb-4 max-w-2xl">
          One fabric. <em>Six domains</em> of evidence.
        </h2>
        <p className="text-muted text-lg max-w-2xl leading-relaxed mb-14">
          NovaFabric is not a single tool — it&apos;s a coordinated system of{" "}
          <span className="text-ink">~425,000 lines</span> across six domains:
          capture, an evidence model, analysis, cryptographic trust, governance,
          and serving. Every piece composes.
        </p>

        {/* ── Metrics strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px rounded-lg overflow-hidden border border-edge-2 bg-edge-2 mb-16 shadow-card">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="bg-surface px-5 py-6 flex flex-col gap-1 items-start"
            >
              <span className="font-display text-3xl md:text-4xl text-ink leading-none">
                <CountUp value={m.value} />
              </span>
              <span className="font-code text-[11px] text-muted tracking-wide">
                {m.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Capability domains (6) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PILLARS.map((p) => (
            <div
              key={p.key}
              className="capability-card group bg-surface border border-edge-2 rounded-lg p-5 flex flex-col transition-all duration-200"
              style={{ ["--hue" as string]: p.hue }}
            >
              {/* colored top accent */}
              <div
                className="h-1 w-10 rounded-full mb-4"
                style={{ backgroundColor: p.hue }}
              />
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-lg" aria-hidden>
                  {p.icon}
                </span>
                <span
                  className="font-code text-[15px] font-semibold"
                  style={{ color: p.hue }}
                >
                  {p.title}
                </span>
              </div>
              <p className="text-muted text-[13.5px] md:text-[12.5px] leading-relaxed mb-4 min-h-[2.4em]">
                {p.tagline}
              </p>
              <ul className="flex flex-col gap-1.5 mt-auto">
                {p.subsystems.map((s) => (
                  <li
                    key={s}
                    className="font-code text-[11.5px] text-ink/85 flex items-center gap-2"
                  >
                    <span
                      className="inline-block w-1 h-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.hue }}
                    />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Framework adapters caption ── */}
        <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2">
          <span className="font-code text-[11px] text-faint tracking-wide uppercase mr-1">
            8 framework adapters
          </span>
          {ADAPTERS.map((a) => (
            <span
              key={a}
              className="font-code text-[11px] text-muted border border-edge rounded px-2 py-0.5 bg-surface"
            >
              {a}
            </span>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/architecture"
            className="font-code text-[13px] text-canvas px-5 py-2.5 rounded transition-colors"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            explore the full architecture →
          </Link>
          <Link
            href="/primitives"
            className="font-code text-[13px] border border-edge-2 text-muted px-5 py-2.5 rounded hover:text-ink hover:border-faint transition-colors"
          >
            the five primitives ↗
          </Link>
        </div>
      </div>

      <style>{`
        .capability-card:hover {
          border-color: color-mix(in srgb, var(--hue) 45%, transparent);
          box-shadow: var(--shadow-md);
          transform: translateY(-3px);
        }
      `}</style>
    </section>
  );
}
