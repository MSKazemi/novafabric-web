import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import Footer from "@/components/Footer";
import CopyButton from "@/components/CopyButton";
import NovaTerminal from "@/components/NovaTerminal";
import InteractiveCapsule from "@/components/InteractiveCapsule";
import JsonLd from "@/components/JsonLd";
import { INSTALL_COMMAND, REQUIRES_PYTHON } from "@/lib/version";

export const metadata: Metadata = {
  title: "NovaFabric CLI — capture, replay & audit AI agent runs",
  description:
    "Capture AI-agent runs as portable, secret-scanned Run Capsules you can seal, then replay, diff and audit them. Open-source CLI.",
  alternates: { canonical: "https://novafabric.ai/novafabric/" },
  openGraph: {
    title: "NovaFabric CLI — capture, replay & audit AI agent runs",
    description:
      "Open-source, self-hosted replay and evidence infrastructure for AI agents. Capture runs as portable Run Capsules you own.",
    url: "https://novafabric.ai/novafabric/",
    images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
  },
};

// The software has one entity, declared once in app/layout.tsx (#software). This
// page describes it rather than re-declaring a second, partly different
// SoftwareApplication (different name casing, an unverified OS list) — two
// entities for one product is what entity resolvers report as a conflict.
const productPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://novafabric.ai/novafabric/#webpage",
  url: "https://novafabric.ai/novafabric/",
  name: "NovaFabric CLI — capture, replay and audit AI agent runs",
  isPartOf: { "@id": "https://novafabric.ai/#website" },
  about: { "@id": "https://novafabric.ai/#software" },
  mainEntity: { "@id": "https://novafabric.ai/#software" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do you capture and replay an AI agent run?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Wrap the agent with NovaFabric. Running `nova capture python my_agent.py` records the environment and the model calls and tool invocations it can see as a portable Run Capsule. Wrapping needs no code changes; model calls are captured automatically for Python workloads, and `nova api-proxy` covers other clients. Each capsule holds an OpenTelemetry-compatible execution trace you can inspect, replay, diff, and audit locally.",
      },
    },
    {
      "@type": "Question",
      name: "What does novafabric capture from an AI-agent run?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Model-call evidence (model name, prompt, completion, token counts, latency), tool invocations (MCP exchanges, function calls, shell commands), an environment snapshot, OpenTelemetry-compatible execution spans, and a record of the built-in secret scan. When you configure a signing key, a capsule can also be sealed (DSSE signature, optional RFC 3161 timestamp) and verified offline.",
      },
    },
    {
      "@type": "Question",
      name: "Can you replay an AI-agent execution for debugging?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. `nova replay` has five modes. Forensic mode is read-only inspection. Mocked mode re-runs a Python workload and serves recorded model responses from the capsule for supported calls (in v0.104.0, synchronous non-streaming OpenAI chat completions and Anthropic messages); tool calls still run live. Semantic and exact modes do not re-run anything: they score the recorded responses and report whether a byte-exact re-run is possible. Intervention mode is experimental.",
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
        text: "novafabric captures runs via CLI wrapping, an SDK decorator, an API/MCP proxy, and OpenTelemetry GenAI semantic conventions — so agents built on common frameworks and model providers can be captured and replayed without rewriting them. The 11 framework adapters are experimental.",
      },
    },
  ],
};

const CAPSULE_TREE = [
  { path: "~/.novafabric/capsules/01HXAY7M5JZ8R7K4P9DPBYK2WX/", type: "dir" },
  { path: "  capsule.yaml", note: "run manifest — id, status, timing", type: "file" },
  { path: "  trace.jsonl", note: "execution spans", type: "file" },
  { path: "  model-calls.jsonl", note: "LLM calls captured", type: "file" },
  { path: "  tool-calls.jsonl", note: "tool invocations captured", type: "file" },
  { path: "  env.lock", note: "environment snapshot", type: "file" },
  { path: "  redaction-proof.json", note: "record of the secret scan", type: "file" },
  { path: "  replay.yaml", note: "replay policy", type: "file" },
  { path: "  lineage.jsonl", note: "lineage edges for this run", type: "file" },
  { path: "  inputs/", type: "dir" },
  { path: "  outputs/", type: "dir" },
  { path: "    stdout.txt", type: "file" },
  { path: "    stderr.txt", type: "file" },
];

const COMMANDS = [
  {
    cmd: "nova capture python my_agent.py",
    desc: "Wrap any command — script, agent, training run. No code changes; model calls are captured automatically for Python workloads (nova api-proxy for other clients).",
  },
  {
    cmd: "nova replay <run-id> --mode forensic",
    desc: "Replay a capsule. Forensic mode is read-only. Mocked mode re-runs the command against the recorded responses of supported OpenAI and Anthropic calls; tools run live.",
  },
  {
    cmd: "nova diff <run-a> <run-b>",
    desc: "Compare two capsules structurally: what changed in the outputs and the environment.",
  },
  {
    cmd: "nova verify ~/.novafabric/capsules/<run-id>/",
    desc: "Verify a sealed capsule's signature, timestamp and Merkle-log inclusion. Needs only the capsule; works offline.",
  },
];

const WHAT_IT_CAPTURES = [
  { icon: "⟶", label: "Model-call evidence", body: "Model name, prompt, completion, token counts, latency — for API calls where capture is enabled." },
  { icon: "▦", label: "Tool invocations", body: "MCP exchanges, function calls, shell commands — the tool-call chain where capture hooks are active." },
  { icon: "◎", label: "Environment snapshot", body: "Python version, installed packages and environment variables, secret-scanned — so you can reproduce the execution context." },
  { icon: "⊚", label: "Execution spans", body: "OpenTelemetry-compatible spans for the execution tree. Queryable, exportable, visualisable." },
  { icon: "◈", label: "Secret-scan record", body: "Built-in secret scanning of captured evidence, with a record of what the scan checked and redacted. Rule-based: it catches known key and token formats, not every secret. PEM private keys, JWTs, passwords and connection strings are among the formats it does not detect." },
  { icon: "⬡", label: "Optional seal", body: "Seal a capsule with your own key (DSSE signature; RFC 3161 timestamp is opt-in) and verify it offline later. A seal shows the record is unchanged since it was signed — not that it is complete. Not a compliance certification." },
];

export default function NovafabricPage() {
  return (
    <>
      <JsonLd data={productPageSchema} />
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
                This is a NovaFabric problem.
              </p>
            </div>

            {/* Headline + terminal */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }} className="nova-hero-grid">
              <div>
                <h1 className="font-display" style={{ fontSize: "clamp(36px, 4.5vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.02em", fontStyle: "italic", marginBottom: "20px", color: "var(--color-ink)" }}>
                  Capture the run.
                  <br />
                  <span style={{ color: "var(--color-amber)" }}>Replay it</span> later.
                </h1>
                <p style={{ fontSize: "16px", color: "var(--color-muted)", lineHeight: "1.75", marginBottom: "32px" }}>
                  Wrap any command. NovaFabric captures the environment and the model calls and tool exchanges it
                  can see — automatically for Python workloads, through <code className="font-code">nova api-proxy</code> for
                  other clients. One command. A portable, secret-scanned Run Capsule you can seal.
                </p>

                {/* Install */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                  {[
                    { cmd: INSTALL_COMMAND, label: "pip" },
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
                    requires Python {REQUIRES_PYTHON}
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
                  <Link
                    href="/docs/getting-started/"
                    style={{ fontFamily: "var(--font-code), monospace", fontSize: "13px", color: "var(--color-muted)", border: "1px solid var(--color-edge-2)", padding: "9px 20px", borderRadius: "4px", textDecoration: "none" }}
                  >
                    docs →
                  </Link>
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
                  <span style={{ color: "var(--color-amber)" }}>The run</span>, recorded.
                </h2>
                <p style={{ fontSize: "15px", color: "var(--color-muted)", lineHeight: "1.75", marginBottom: "28px" }}>
                  Every captured run produces a structured directory — a NovaFabric Run Capsule, a portable
                  execution-evidence artifact you own — holding the evidence needed to inspect, compare and
                  replay the execution. No instrumentation for Python workloads; other clients go through{" "}
                  <code className="font-code">nova api-proxy</code>.
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
                    <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-ink)", marginBottom: "6px" }}>{item.label}</h3>
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
            <p style={{ marginTop: "24px" }}>
              <Link href="/docs/architecture/run-capsule/" style={{ fontFamily: "var(--font-code), monospace", fontSize: "13px", color: "var(--color-amber)", textDecoration: "none" }}>
                What is inside a Run Capsule, file by file →
              </Link>
            </p>
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
              Five ways to replay.
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }} className="replay-grid">
              {[
                {
                  mode: "forensic",
                  cmd: "nova replay --mode forensic",
                  desc: "Read-only. Inspects the capsule and runs nothing. Safe for debugging, auditing, and post-incident investigation.",
                  color: "var(--color-jade)",
                },
                {
                  mode: "mocked",
                  cmd: "nova replay --mode mocked",
                  desc: "Re-runs a Python workload and serves recorded model responses from the capsule. In v0.104.0 that covers synchronous, non-streaming OpenAI chat completions and Anthropic messages. Tool calls run live, so tools may have side effects. Async, streamed and Responses API calls and recorded MCP tool results are on main, unreleased.",
                  color: "var(--color-amber)",
                },
                {
                  mode: "semantic",
                  cmd: "nova replay --mode semantic",
                  desc: "Does not re-run. Scores how similar the capsule's recorded model responses are to each other (0.0–1.0).",
                  color: "var(--hue-blue)",
                },
                {
                  mode: "exact",
                  cmd: "nova replay --mode exact",
                  desc: "Does not re-run. Reports whether a byte-exact re-run is possible: deterministic environment, seeds, no schema drift. Not available for remote models that can change under you.",
                  color: "var(--hue-violet)",
                },
                {
                  mode: "intervention · experimental",
                  cmd: "nova replay --mode intervention",
                  desc: "Substitute one captured event, re-run downstream under mocked semantics, and record whether the outcome changes. Emits a diffable counterfactual capsule.",
                  color: "var(--color-faint)",
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
            <p style={{ marginTop: "32px" }}>
              <Link href="/docs/architecture/replay-modes/" style={{ fontFamily: "var(--font-code), monospace", fontSize: "13px", color: "var(--color-amber)", textDecoration: "none" }}>
                Replay modes in depth: what each one reuses and what runs live →
              </Link>
            </p>
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

            {/* Docs CTA: the guide is published on this site, so keep the reader here. */}
            <div style={{ marginTop: "48px", display: "flex", justifyContent: "center" }}>
              <Link
                href="/docs/getting-started/"
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
                read the getting-started guide →
              </Link>
            </div>
          </div>
        </section>

        {/* Why — absorbed the former /why/ page, which keeps a redirect stub to #why */}
        <section id="why" style={{ backgroundColor: "var(--color-canvas)", padding: "80px 0", borderTop: "1px solid var(--color-edge)", scrollMarginTop: "80px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
              <span className="font-code" style={{ color: "var(--color-amber)", fontSize: "11px", letterSpacing: "0.1em" }}>05/</span>
              <div style={{ height: "1px", width: "40px", backgroundColor: "var(--color-edge-2)" }} />
              <span className="font-code" style={{ color: "var(--color-faint)", fontSize: "11px", letterSpacing: "0.08em" }}>why replayable runs</span>
            </div>
            <h2 className="font-display" style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontStyle: "italic", letterSpacing: "-0.02em", color: "var(--color-ink)", lineHeight: 1.1, marginBottom: "32px" }}>
              The run happened. Then the world changed.
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px", maxWidth: "1000px" }}>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-ink)", marginBottom: "8px" }}>What changed</h3>
                <p style={{ fontSize: "14px", color: "var(--color-muted)", lineHeight: 1.75 }}>
                  Debugging an LLM call used to mean reading one prompt and one response. An agent run now chains
                  several model calls, tool invocations, MCP servers and retrieval steps, and any of them can drift
                  between Tuesday and Wednesday. When a run fails or is questioned later, a log of what scrolled past
                  is not enough: you need the run itself, as an artifact you can reopen, replay and compare.
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-ink)", marginBottom: "8px" }}>Who it is for</h3>
                <p style={{ fontSize: "14px", color: "var(--color-muted)", lineHeight: 1.75 }}>
                  Engineers building and shipping AI agents, first. Platform and MLOps teams who run them for others.
                  Researchers whose experiments have to reproduce. And whoever later has to answer for what an agent
                  did, who needs the record rather than a recollection.
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-ink)", marginBottom: "8px" }}>What it is not</h3>
                <p style={{ fontSize: "14px", color: "var(--color-muted)", lineHeight: 1.75 }}>
                  Not an observability platform: tracing shows a run while it happens; NovaFabric keeps it as an
                  artifact you can replay, compare and verify later, so the two are complementary. Not a hosted
                  service: no SaaS, no account. Not a scheduler: it captures what SLURM or Kubernetes runs. And a
                  NovaFabric failure never blocks your workload by default.{" "}
                  {/* docs/architecture.md is shadowed on this site by docs/architecture/README.md,
                      so its "What NovaFabric is not" section is linked on GitHub. */}
                  <a href="https://github.com/MSKazemi/novafabric/blob/main/docs/architecture.md#what-novafabric-is-not" style={{ color: "var(--color-amber)" }}>
                    The boundaries →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Back to home */}
        <section style={{ backgroundColor: "var(--color-surface)", padding: "48px 0", borderTop: "1px solid var(--color-edge)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div className="font-code" style={{ fontSize: "11px", color: "var(--color-faint)", marginBottom: "6px" }}>novafabric</div>
              <p style={{ fontSize: "14px", color: "var(--color-muted)" }}>
                The flagship system: capture, replay, diff, and verify AI agent executions.
              </p>
            </div>
            <Link
              href="/"
              style={{ fontFamily: "var(--font-code), monospace", fontSize: "12px", color: "var(--color-faint)", textDecoration: "none", border: "1px solid var(--color-edge)", padding: "8px 16px", borderRadius: "4px" }}
            >
              ← back to home
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
