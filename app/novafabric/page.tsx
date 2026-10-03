import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import Footer from "@/components/Footer";
import CopyButton from "@/components/CopyButton";
import NovaTerminal from "@/components/NovaTerminal";
import InteractiveCapsule from "@/components/InteractiveCapsule";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "novafabric — capture, replay & audit AI agents (CLI)",
  description:
    "novafabric captures AI-agent runs as portable, secret-redacted, tamper-evident capsules — every model call and tool invocation. Replay executions deterministically, validate, diff, trace lineage, and audit. Local-first evidence for agentic applications.",
  alternates: { canonical: "https://novafabric.ai/novafabric/" },
  openGraph: {
    title: "novafabric — capture, replay & audit AI agents (CLI)",
    description:
      "Capture, replay, and audit AI-agent and agentic application executions. Local-first evidence by default.",
    url: "https://novafabric.ai/novafabric/",
    images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "novafabric",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Linux, macOS, Windows",
  url: "https://novafabric.ai/novafabric/",
  description:
    "novafabric captures AI-agent runs as portable, secret-redacted, tamper-evident capsules. Monitor, replay, validate, diff, and audit executions.",
  keywords:
    "AI agent monitoring, AI agent observability, agentic application monitoring, LLM execution tracing, AI agent debugging, run capsule, AI agent audit trail, replay AI agent execution, AI agent lineage, AI agent reproducibility",
  author: { "@type": "Person", name: "Mohsen Seyedkazemi Ardebili" },
  // License must match the visible claim on the site (footer: Apache-2.0).
  license: "https://www.apache.org/licenses/LICENSE-2.0",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  codeRepository: "https://github.com/MSKazemi/novafabric",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do you monitor an AI agent or agentic application?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Wrap the agent with novafabric. Running `nova capture python my_agent.py` records every model call, tool invocation, and environment detail as a portable capsule — no code changes required. Each capsule holds an OpenTelemetry-compatible execution trace you can inspect, replay, diff, and audit locally.",
      },
    },
    {
      "@type": "Question",
      name: "What does novafabric capture from an AI-agent run?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Model-call evidence (model name, prompt, completion, token counts, latency), tool invocations (MCP exchanges, function calls, shell commands), a full environment snapshot with secrets redacted, OpenTelemetry-compatible execution spans, a cryptographic redaction proof, and a tamper-evident DSSE + RFC 3161 seal.",
      },
    },
    {
      "@type": "Question",
      name: "Can you replay an AI-agent execution for debugging?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. `nova replay` re-executes any captured capsule. Forensic mode is read-only for inspection; mocked mode replays recorded LLM responses for deterministic, offline debugging and regression testing.",
      },
    },
    {
      "@type": "Question",
      name: "Is novafabric local-first and open source?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. novafabric runs locally by default — capsules live on your machine in an open, human-readable format with no vendor lock-in. It is open source under the Apache-2.0 license. It is experimental and useful for local and research workflows today.",
      },
    },
    {
      "@type": "Question",
      name: "Does novafabric work with LangChain, MCP, OpenAI, and Anthropic?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "novafabric captures runs via CLI wrapping, an SDK decorator, an API/MCP proxy, and OpenTelemetry GenAI semantic conventions — so agents built on common frameworks and model providers can be monitored without rewriting them.",
      },
    },
  ],
};

const CAPSULE_TREE = [
  { path: ".novafabric/runs/01HXAY7M5JZ8R7K4P9DPBYK2WX/", type: "dir" },
  { path: "  capsule.yaml", note: "run manifest — id, status, timing", type: "file" },
  { path: "  trace.jsonl", note: "execution spans", type: "file" },
  { path: "  model-calls.jsonl", note: "every LLM call", type: "file" },
  { path: "  tool-calls.jsonl", note: "every tool invocation", type: "file" },
  { path: "  env.lock", note: "full environment snapshot", type: "file" },
  { path: "  redaction-proof.json", note: "proof no secrets leaked", type: "file" },
  { path: "  replay.yaml", note: "replay policy", type: "file" },
  { path: "  inputs/", type: "dir" },
  { path: "  outputs/", type: "dir" },
  { path: "    stdout.txt", type: "file" },
  { path: "    stderr.txt", type: "file" },
];

const COMMANDS = [
  {
    cmd: "nova capture python my_agent.py",
    desc: "Wrap any command — script, agent, training run. No code changes required.",
  },
  {
    cmd: "nova replay runs/01HXAY7M5 --mode forensic",
    desc: "Re-execute any capsule. Forensic mode is read-only. Mocked mode uses recorded LLM responses.",
  },
  {
    cmd: "nova validate runs/01HXAY7M5",
    desc: "Validate a capsule against schema. Checks integrity, redaction proof, and signature.",
  },
  {
    cmd: "nova seal verify runs/01HXAY7M5",
    desc: "Verify DSSE signature and RFC 3161 timestamp. Works offline, forever.",
  },
];

const WHAT_IT_CAPTURES = [
  { icon: "⟶", label: "Model-call evidence", body: "Model name, prompt, completion, token counts, latency — for API calls where capture is enabled." },
  { icon: "▦", label: "Tool invocations", body: "MCP exchanges, function calls, shell commands — the tool-call chain where capture hooks are active." },
  { icon: "◎", label: "Environment snapshot", body: "Python version, installed packages, env vars (secrets redacted) — so you can reproduce the execution context." },
  { icon: "⊚", label: "Execution spans", body: "OpenTelemetry-compatible spans for the execution tree. Queryable, exportable, visualisable." },
  { icon: "◈", label: "Redaction proof", body: "Cryptographic proof that no secrets appear in the capsule. Auditable by anyone, no access to secrets required." },
  { icon: "⬡", label: "Tamper-evident seal", body: "DSSE signature + RFC 3161 timestamp. Designed for audit evidence workflows; regulatory fit requires independent review." },
];

export default function NovafabricPage() {
  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />
      <Nav />
      <BreadcrumbJsonLd trail={[{ name: "novafabric", path: "/novafabric/" }]} />
      <main>
        {/* Hero */}
        <section
          style={{
            backgroundColor: "var(--color-canvas)",
            paddingTop: "120px",
            paddingBottom: "80px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="dot-grid" style={{ position: "absolute", inset: 0, maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)" }} />

          <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "40px" }}>
              <Link href="/" style={{ fontFamily: "var(--font-code), monospace", fontSize: "12px", color: "var(--color-faint)", textDecoration: "none" }}>
                novafabric<span style={{ color: "var(--color-amber)" }}>.</span>ai
              </Link>
              <span style={{ color: "var(--color-faint)", fontSize: "12px" }}>/</span>
              <span style={{ fontFamily: "var(--font-code), monospace", fontSize: "12px", color: "var(--color-muted)" }}>novafabric</span>
            </div>

            {/* Maturity block */}
            <div
              style={{
                backgroundColor: "color-mix(in srgb, var(--color-accent) 8%, transparent)",
                border: "1px solid color-mix(in srgb, var(--color-accent) 22%, transparent)",
                borderRadius: "6px",
                padding: "16px 20px",
                marginBottom: "32px",
                maxWidth: "660px",
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <span
                className="font-code"
                style={{
                  fontSize: "9px",
                  color: "var(--color-accent)",
                  backgroundColor: "color-mix(in srgb, var(--color-accent) 12%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
                  borderRadius: "3px",
                  padding: "3px 8px",
                  letterSpacing: "0.07em",
                  flexShrink: 0,
                  alignSelf: "center",
                }}
              >
                experimental
              </span>
              <p className="font-code" style={{ fontSize: "12px", color: "var(--color-muted)", lineHeight: "1.7", margin: 0 }}>
                Use NovaFabric for local-first capture, replay, diff, validation, and audit evidence workflows.
                Interfaces and schemas may change before v1.0.
                Production-scale and compliance-sensitive deployments require independent validation.
                <span style={{ display: "block", marginTop: "6px", color: "var(--color-faint)" }}>
                  Not claimed: million-agent readiness · HSM/X.509 enterprise PKI · compliance guarantee · stable v1.0 schema
                </span>
              </p>
            </div>

            {/* Pain scenario */}
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-edge)",
                borderLeft: "3px solid var(--color-amber)",
                borderRadius: "0 6px 6px 0",
                padding: "24px 28px",
                marginBottom: "48px",
                maxWidth: "660px",
              }}
            >
              <p className="font-code" style={{ fontSize: "13px", color: "var(--color-muted)", lineHeight: "1.8", letterSpacing: "0.01em" }}>
                Your agent ran for 3 hours and failed at step 47. You have no trace, no
                replay, no way to know if it was the model call or the tool call or the
                prompt. You rerun it. It fails differently.
              </p>
              <p className="font-code" style={{ fontSize: "13px", color: "var(--color-amber)", marginTop: "12px", letterSpacing: "0.02em" }}>
                This is a novafabric problem.
              </p>
            </div>

            {/* Headline + terminal */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }} className="nova-hero-grid">
              <div>
                <h1 className="font-display" style={{ fontSize: "clamp(36px, 4.5vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.02em", fontStyle: "italic", marginBottom: "20px", color: "var(--color-ink)" }}>
                  Capture every run.
                  <br />
                  <span style={{ color: "var(--color-amber)" }}>Replay it</span> anywhere.
                </h1>
                <p style={{ fontSize: "16px", color: "var(--color-muted)", lineHeight: "1.75", marginBottom: "32px" }}>
                  Wrap any command. novafabric captures the environment, every model call, every tool exchange —
                  without touching your code. One command. A portable, secret-redacted, signed capsule.
                </p>

                {/* Install */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                  {[
                    { cmd: "pip install novafabric", label: "pip" },
                    { cmd: "uv add novafabric", label: "uv" },
                  ].map(({ cmd, label }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-edge-2)",
                        borderRadius: "5px",
                        padding: "10px 14px",
                      }}
                    >
                      <span className="font-code" style={{ color: "var(--color-amber)", fontSize: "12px" }}>$</span>
                      <span className="font-code" style={{ color: "var(--color-ink)", fontSize: "13px", flex: 1, userSelect: "all" }}>
                        {cmd}
                      </span>
                      <span className="font-code" style={{ fontSize: "10px", color: "var(--color-faint)" }}>{label}</span>
                      <CopyButton text={cmd} />
                    </div>
                  ))}
                  <p className="font-code" style={{ fontSize: "10px", color: "var(--color-faint)", paddingLeft: "4px" }}>
                    requires Python 3.12+
                  </p>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <a
                    href="https://github.com/MSKazemi/novafabric"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: "var(--font-code), monospace", fontSize: "13px", color: "var(--color-canvas)", backgroundColor: "var(--color-amber)", padding: "9px 20px", borderRadius: "4px", textDecoration: "none", fontWeight: 500 }}
                  >
                    github ↗
                  </a>
                  <a
                    href="https://github.com/MSKazemi/novafabric/blob/main/docs/getting-started.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: "var(--font-code), monospace", fontSize: "13px", color: "var(--color-muted)", border: "1px solid var(--color-edge-2)", padding: "9px 20px", borderRadius: "4px", textDecoration: "none" }}
                  >
                    docs →
                  </a>
                </div>
              </div>

              <NovaTerminal />
            </div>
          </div>
        </section>

        {/* What goes into a capsule */}
        <section style={{ backgroundColor: "var(--color-surface)", padding: "80px 0", borderTop: "1px solid var(--color-edge)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
              <span className="font-code" style={{ color: "var(--color-amber)", fontSize: "11px", letterSpacing: "0.1em" }}>01/</span>
              <div style={{ height: "1px", width: "40px", backgroundColor: "var(--color-edge-2)" }} />
              <span className="font-code" style={{ color: "var(--color-faint)", fontSize: "11px", letterSpacing: "0.08em" }}>what gets captured</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" }} className="capsule-grid">
              {/* Capsule directory tree */}
              <div>
                <h2 className="font-display" style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontStyle: "italic", letterSpacing: "-0.02em", color: "var(--color-ink)", lineHeight: 1.1, marginBottom: "24px" }}>
                  One command.<br />
                  <span style={{ color: "var(--color-amber)" }}>Everything</span> recorded.
                </h2>
                <p style={{ fontSize: "15px", color: "var(--color-muted)", lineHeight: "1.75", marginBottom: "28px" }}>
                  Every captured run produces a structured directory — a capsule — that contains everything
                  needed to understand, validate, and replay the execution. No instrumentation required.
                </p>
                <div
                  style={{
                    backgroundColor: "var(--color-canvas)",
                    border: "1px solid var(--color-edge-2)",
                    borderRadius: "6px",
                    overflow: "hidden",
                    fontFamily: "var(--font-code), monospace",
                    fontSize: "12px",
                    lineHeight: "1.9",
                  }}
                >
                  <div style={{ backgroundColor: "var(--color-surface-2)", borderBottom: "1px solid var(--color-edge)", padding: "8px 14px", display: "flex", gap: "8px", alignItems: "center" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ff5f57" }} />
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#febc2e" }} />
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#28c840" }} />
                    <span style={{ marginLeft: "8px", color: "var(--color-faint)", fontSize: "11px" }}>capsule structure</span>
                  </div>
                  <div style={{ padding: "16px 18px" }}>
                    {CAPSULE_TREE.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: "16px", alignItems: "baseline" }}>
                        <span style={{ color: item.type === "dir" ? "var(--color-amber)" : "var(--color-ink)", whiteSpace: "pre" }}>
                          {item.path}
                        </span>
                        {item.note && (
                          <span style={{ color: "var(--color-faint)", fontSize: "11px", whiteSpace: "nowrap" }}>
                            ← {item.note}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* What it captures grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {WHAT_IT_CAPTURES.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      backgroundColor: "var(--color-canvas)",
                      border: "1px solid var(--color-edge)",
                      borderRadius: "5px",
                      padding: "18px",
                    }}
                  >
                    <span style={{ fontSize: "18px", color: "var(--color-amber)", display: "block", marginBottom: "10px" }}>{item.icon}</span>
                    <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-ink)", marginBottom: "6px" }}>{item.label}</h4>
                    <p style={{ fontSize: "12px", color: "var(--color-muted)", lineHeight: "1.6" }}>{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive demo */}
        <section style={{ backgroundColor: "var(--color-canvas)", padding: "80px 0", borderTop: "1px solid var(--color-edge)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
              <span className="font-code" style={{ color: "var(--color-amber)", fontSize: "11px", letterSpacing: "0.1em" }}>02/</span>
              <div style={{ height: "1px", width: "40px", backgroundColor: "var(--color-edge-2)" }} />
              <span className="font-code" style={{ color: "var(--color-faint)", fontSize: "11px", letterSpacing: "0.08em" }}>interactive demo</span>
            </div>
            <h2 className="font-display" style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontStyle: "italic", color: "var(--color-ink)", lineHeight: 1.1, marginBottom: "12px" }}>
              See what a capsule contains.
            </h2>
            <p style={{ fontSize: "15px", color: "var(--color-muted)", lineHeight: "1.75", marginBottom: "40px", maxWidth: "520px" }}>
              Click &quot;run&quot; to simulate a capture. Explore the files a capsule produces.
            </p>
            <InteractiveCapsule />
          </div>
        </section>

        {/* Replay modes */}
        <section style={{ backgroundColor: "var(--color-surface)", padding: "80px 0", borderTop: "1px solid var(--color-edge)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            {/* Section label */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
              <span className="font-code" style={{ color: "var(--color-amber)", fontSize: "11px", letterSpacing: "0.1em" }}>03/</span>
              <div style={{ height: "1px", width: "40px", backgroundColor: "var(--color-edge-2)" }} />
              <span className="font-code" style={{ color: "var(--color-faint)", fontSize: "11px", letterSpacing: "0.08em" }}>replay modes</span>
            </div>

            <h2 className="font-display" style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontStyle: "italic", color: "var(--color-ink)", lineHeight: 1.1, marginBottom: "40px" }}>
              Four ways to replay.
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }} className="replay-grid">
              {[
                {
                  mode: "forensic",
                  cmd: "nova replay --mode forensic",
                  desc: "Read-only. Replays the exact execution environment without re-running model calls. Safe for debugging, auditing, and forensic investigation.",
                  color: "var(--color-jade)",
                },
                {
                  mode: "mocked",
                  cmd: "nova replay --mode mocked",
                  desc: "Uses recorded LLM responses. No API calls, no cost. Deterministic replay for CI pipelines and regression testing.",
                  color: "var(--color-amber)",
                },
                {
                  mode: "semantic",
                  cmd: "nova replay --mode semantic",
                  desc: "Re-runs with live model calls but validates that outputs are semantically equivalent. Detects prompt drift and model behavior changes.",
                  color: "var(--hue-blue)",
                },
                {
                  mode: "exact",
                  cmd: "nova replay --mode exact",
                  desc: "Full re-execution. Every tool call, every model call, live. Compares outputs byte-for-byte. Strictest reproduction guarantee.",
                  color: "var(--hue-violet)",
                },
              ].map(({ mode, cmd, desc, color }) => (
                <div
                  key={mode}
                  style={{
                    backgroundColor: "var(--color-canvas)",
                    border: "1px solid var(--color-edge)",
                    borderTop: `2px solid ${color}`,
                    borderRadius: "6px",
                    padding: "24px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span className="font-code" style={{ fontSize: "11px", color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{mode}</span>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-code), monospace",
                      fontSize: "12px",
                      backgroundColor: "var(--color-surface-2)",
                      border: "1px solid var(--color-edge)",
                      borderRadius: "4px",
                      padding: "8px 12px",
                      marginBottom: "14px",
                      color: "var(--color-ink)",
                    }}
                  >
                    <span style={{ color: "var(--color-amber)" }}>$ </span>{cmd}
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--color-muted)", lineHeight: "1.6" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key commands */}
        <section style={{ backgroundColor: "var(--color-canvas)", padding: "80px 0", borderTop: "1px solid var(--color-edge)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
              <span className="font-code" style={{ color: "var(--color-amber)", fontSize: "11px", letterSpacing: "0.1em" }}>04/</span>
              <div style={{ height: "1px", width: "40px", backgroundColor: "var(--color-edge-2)" }} />
              <span className="font-code" style={{ color: "var(--color-faint)", fontSize: "11px", letterSpacing: "0.08em" }}>four commands</span>
            </div>

            <h2 className="font-display" style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontStyle: "italic", letterSpacing: "-0.02em", color: "var(--color-ink)", lineHeight: 1.1, marginBottom: "40px" }}>
              The complete lifecycle.
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {COMMANDS.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "32px",
                    alignItems: "center",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-edge)",
                    borderRadius: "6px",
                    padding: "20px 24px",
                  }}
                  className="cmd-row"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="font-code" style={{ color: "var(--color-amber)", fontSize: "12px", flexShrink: 0 }}>$</span>
                    <span className="font-code" style={{ fontSize: "13px", color: "var(--color-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.cmd}
                    </span>
                    <CopyButton text={item.cmd} />
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--color-muted)", lineHeight: "1.6" }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Docs CTA */}
            <div style={{ marginTop: "48px", display: "flex", justifyContent: "center" }}>
              <a
                href="https://github.com/MSKazemi/novafabric/blob/main/docs/getting-started.md"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-code), monospace",
                  fontSize: "13px",
                  color: "var(--color-muted)",
                  border: "1px solid var(--color-edge-2)",
                  padding: "12px 28px",
                  borderRadius: "5px",
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                }}
              >
                full documentation on GitHub →
              </a>
            </div>
          </div>
        </section>

        {/* Back to lab */}
        <section style={{ backgroundColor: "var(--color-surface)", padding: "48px 0", borderTop: "1px solid var(--color-edge)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div className="font-code" style={{ fontSize: "11px", color: "var(--color-faint)", marginBottom: "6px" }}>novafabric</div>
              <p style={{ fontSize: "14px", color: "var(--color-muted)" }}>
                The flagship system: capture, replay, validate, and govern AI agent executions.
              </p>
            </div>
            <Link
              href="/"
              style={{ fontFamily: "var(--font-code), monospace", fontSize: "12px", color: "var(--color-faint)", textDecoration: "none", border: "1px solid var(--color-edge)", padding: "8px 16px", borderRadius: "4px" }}
            >
              ← back to lab
            </Link>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .nova-hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .capsule-grid { grid-template-columns: 1fr !important; }
          .cmd-row { grid-template-columns: 1fr !important; }
          .replay-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
