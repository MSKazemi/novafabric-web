import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import JsonLd from "@/components/JsonLd";
import { PageHero, SectionHeader, TerminalFrame } from "@/components/ui";
import CapsuleValidator from "@/components/demo/CapsuleValidator";
import { INSTALL_COMMAND } from "@/lib/version";

const DESCRIPTION =
  "A guided NovaFabric tour: capture a command, validate the capsule against its real schema in your browser, replay it, diff two runs and export signed evidence.";

export const metadata: Metadata = {
  title: "Demo — see everything NovaFabric does",
  description: DESCRIPTION,
  alternates: { canonical: "https://novafabric.ai/demo/" },
  openGraph: {
    title: "Demo — see everything NovaFabric does",
    description: DESCRIPTION,
    url: "https://novafabric.ai/demo/",
    images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
  },
};

/** Maturity label. The project labels every feature and this page is not an exception. */
function Tag({ kind }: { kind: "works today" | "experimental" }) {
  const today = kind === "works today";
  return (
    <span
      className="font-code"
      style={{
        fontSize: "10px",
        letterSpacing: "0.06em",
        padding: "2px 7px",
        borderRadius: "3px",
        whiteSpace: "nowrap",
        color: today ? "var(--color-jade)" : "var(--color-amber-true)",
        border: `1px solid ${today ? "var(--color-jade)" : "var(--color-amber-true)"}40`,
      }}
    >
      {kind}
    </span>
  );
}

function Step({
  n,
  title,
  kind,
  children,
}: {
  n: string;
  title: string;
  kind: "works today" | "experimental";
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "72px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
        <span className="section-number">{n}/</span>
        <h2 className="font-display" style={{ fontSize: "26px", color: "var(--color-ink)" }}>
          {title}
        </h2>
        <Tag kind={kind} />
      </div>
      {children}
    </section>
  );
}

const P: React.CSSProperties = {
  fontSize: "15px",
  color: "var(--color-muted)",
  lineHeight: 1.8,
  maxWidth: "680px",
  marginBottom: "18px",
};

export default function DemoPage() {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Capture, verify, and replay an AI run with NovaFabric",
    description: DESCRIPTION,
    url: "https://novafabric.ai/demo/",
    step: [
      { "@type": "HowToStep", name: "Capture any command", text: "Wrap the command with nova capture. No application code changes." },
      { "@type": "HowToStep", name: "Validate the capsule", text: "Check the capsule against the published JSON Schema." },
      { "@type": "HowToStep", name: "Replay it", text: "Inspect the run, or re-run it against its recorded model responses (tools still run live)." },
      { "@type": "HowToStep", name: "Diff two runs", text: "Compare capsules structurally to find what changed." },
      { "@type": "HowToStep", name: "Export signed evidence", text: "Produce a bundle verifiable offline with sha256sum and an ed25519 verifier." },
    ],
  };

  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "I tried to forge my AI agent's evidence — it caught me | NovaFabric",
    description:
      "A seven-minute walkthrough recorded live on an Azure VM against Azure OpenAI with an Azure Key Vault HSM signing key: nova capture, the seal, nova verify, two tamper attempts caught and named, and the same run in the dashboard.",
    thumbnailUrl: "https://i.ytimg.com/vi/uQatmJIJI68/maxresdefault.jpg",
    uploadDate: "2026-08-27",
    duration: "PT7M2S",
    embedUrl: "https://www.youtube.com/embed/uQatmJIJI68",
    contentUrl: "https://www.youtube.com/watch?v=uQatmJIJI68",
  };

  return (
    <>
      <JsonLd data={howToSchema} />
      <JsonLd data={videoSchema} />
      <Nav />
      <BreadcrumbJsonLd trail={[{ name: "Demo", path: "/demo/" }]} />

      <PageHero
        section="demo"
        title="See it work"
        subtitle="The whole capability surface, in order. One page, no signup, and the validation below runs in your browser against the real schema."
      />

      <main className="page-max-w py-16">
        <p style={{ ...P, fontSize: "16px" }}>
          Everything on this page uses artifacts from the repository — a real capture
          fixture and the published{" "}
          <code style={{ fontFamily: "var(--font-code)", fontSize: "0.9em" }}>
            run-capsule.schema.json
          </code>
          . Where something is <Tag kind="experimental" />, it says so. Nothing here is a
          mock-up of a feature that does not exist.
        </p>

        <section style={{ margin: "40px 0 48px" }}>
          <h2
            className="font-display"
            style={{ fontSize: "26px", color: "var(--color-ink)", marginBottom: "16px" }}
          >
            Watch it end to end
          </h2>
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "820px",
              aspectRatio: "16 / 9",
              border: "1px solid var(--color-edge)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <iframe
              src="https://www.youtube-nocookie.com/embed/uQatmJIJI68"
              title="I tried to forge my AI agent's evidence — it caught me | NovaFabric"
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            />
          </div>
          <p style={{ ...P, fontSize: "13.5px", marginTop: "16px", marginBottom: 0 }}>
            Seven minutes, recorded live on an Azure VM against Azure OpenAI with the signing key
            held in an Azure Key Vault HSM: capture, seal,{" "}
            <code style={{ fontFamily: "var(--font-code)", fontSize: "0.9em" }}>nova verify</code>,
            two tamper attempts caught and named, then the same run in the dashboard. The commands
            and their output are verbatim from that run — re-rendered on screen for legibility,
            not re-run or edited; the dashboard sections are real screenshots of the same run. The
            narration is a synthetic voice generated locally with Piper (MIT), not a cloud service.
          </p>
        </section>

        <div
          style={{
            border: "1px solid var(--color-edge)",
            borderLeft: "3px solid var(--color-accent)",
            borderRadius: "6px",
            padding: "14px 18px",
            margin: "28px 0 56px",
            maxWidth: "680px",
          }}
        >
          <p style={{ fontSize: "14px", color: "var(--color-muted)", lineHeight: 1.7, margin: 0 }}>
            <strong style={{ color: "var(--color-ink)" }}>Prefer your own terminal?</strong>{" "}
            <code style={{ fontFamily: "var(--font-code)", fontSize: "0.9em" }}>
              {INSTALL_COMMAND}
            </code>{" "}
            then{" "}
            <code style={{ fontFamily: "var(--font-code)", fontSize: "0.9em" }}>
              nova capture python your_agent.py
            </code>
            . The whole tour below takes about five minutes for real.
          </p>
        </div>

        <Step n="01" title="Capture any command" kind="works today">
          <p style={P}>
            NovaFabric wraps a process. Not a framework integration, not a decorator you
            add to every call site — a wrapper around whatever you already run. A shell
            script, a notebook cell, an agent, a SLURM training job.
          </p>
          <TerminalFrame>
            <div style={{ padding: "16px 18px", whiteSpace: "pre-wrap" }}>
              <span style={{ color: "var(--color-jade)" }}>$</span> nova capture python review.py --diff examples/sample.diff
              {"\n\n"}
              ✓ Capsule written: ~/.novafabric/capsules/01KR5SQZPDGTKE3MDP3ZRX8WP1{"\n"}
              {"  "}trace.jsonl{"          "}✓{"  "}spans recorded{"\n"}
              {"  "}model-calls.jsonl{"    "}✓{"  "}2 LLM calls{"\n"}
              {"  "}tool-calls.jsonl{"     "}✓{"  "}2 tool invocations{"\n"}
              {"  "}env.lock{"             "}✓{"  "}environment snapshot{"\n"}
              {"  "}redaction-proof.json{" "}✓{"  "}no secrets found
            </div>
          </TerminalFrame>
          <p style={{ ...P, marginTop: "18px", marginBottom: 0 }}>
            The run exits with its own exit code. If NovaFabric fails, your workload still
            runs — never blocking the user&apos;s work is an architectural invariant, not a
            setting.
          </p>
        </Step>

        <Step n="02" title="Inspect the capsule — and try to break it" kind="works today">
          <p style={P}>
            Below is the manifest from that capture, validated against the real
            JSON Schema 2020-12 file from the repository. Ajv compiles the schema in your
            browser and reports what it finds.
          </p>
          <p style={P}>
            A green check a website could have hard-coded proves nothing, so:{" "}
            <strong style={{ color: "var(--color-ink)" }}>break it.</strong> Delete a
            required field, change a type, put a nonsense value in an enum. If the check
            stayed green, this demo would be worthless — and for a project selling
            verifiable evidence, an unfalsifiable demo would be the wrong thing to ship.
          </p>
          <CapsuleValidator />
          <p style={{ ...P, marginTop: "18px", marginBottom: 0 }}>
            The same check runs locally as{" "}
            <code style={{ fontFamily: "var(--font-code)", fontSize: "0.9em" }}>
              nova validate &lt;run-id&gt;
            </code>
            .
          </p>
        </Step>

        <Step n="03" title="Replay it" kind="works today">
          <p style={P}>
            A replay inspects the capsule, or re-runs it with model calls served from the
            recording — and produces a new capsule, so you can diff a replay against the
            original. There are five modes; what each one does is below.
          </p>
          <div style={{ overflowX: "auto", maxWidth: "680px", marginBottom: "18px" }}>
            <table style={{ borderCollapse: "collapse", fontSize: "13.5px", width: "100%" }}>
              <thead>
                <tr>
                  {["Mode", "Re-runs the command?", "Best for"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        borderBottom: "1px solid var(--color-edge-2)",
                        color: "var(--color-ink)",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ color: "var(--color-muted)" }}>
                {[
                  ["forensic", "no — read-only", "Audit and post-incident inspection"],
                  ["mocked", "yes — model replies served from the capsule; tools run live", "CI and regression testing"],
                  ["semantic", "no — scores the recorded model responses", "Remote LLMs that drift"],
                  ["exact", "no — reports whether a byte-exact re-run is possible", "Local / on-prem models"],
                  ["intervention (experimental)", "yes — one captured event substituted", "Counterfactual root-cause"],
                ].map(([mode, net, use]) => (
                  <tr key={mode}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-edge)" }}>
                      <code style={{ fontFamily: "var(--font-code)", color: "var(--color-accent)" }}>{mode}</code>
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-edge)" }}>{net}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-edge)" }}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{
              border: "1px solid var(--color-edge)",
              borderLeft: "3px solid var(--color-amber-true)",
              borderRadius: "6px",
              padding: "14px 18px",
              maxWidth: "680px",
            }}
          >
            <p style={{ fontSize: "14px", color: "var(--color-muted)", lineHeight: 1.75, margin: 0 }}>
              <strong style={{ color: "var(--color-ink)" }}>The limitation, stated up front.</strong>{" "}
              NovaFabric does <em>not</em> claim byte-exact replay of remote LLM calls.
              That needs a deterministic environment and a per-call seed — realistic for a
              local model, not for a hosted endpoint that can change under you. For remote
              models that drift, <code style={{ fontFamily: "var(--font-code)" }}>semantic</code>{" "}
              mode scores how similar the recorded responses are on a 0.0–1.0 scale. If you have seen
              &ldquo;deterministic replay&rdquo; advertised for hosted models, this is what
              the honest version of that claim looks like.
            </p>
          </div>
        </Step>

        <Step n="04" title="Diff two runs" kind="works today">
          <p style={P}>
            Something changed between Tuesday and Wednesday and the git diff is empty.
            Structural diff compares two capsules — outputs, environment, recorded
            files — rather than diffing log text.
          </p>
          <TerminalFrame>
            <div style={{ padding: "16px 18px", whiteSpace: "pre-wrap" }}>
              <span style={{ color: "var(--color-jade)" }}>$</span> nova diff RUN_A RUN_B
              {"\n\n"}
              Diff: 01KR5SQZPDGTKE3MDP3ZRX8WP1 → 01KR5T2A9WKPN6M3T8VZCJDR4Y{"\n"}
              {"  "}changed=2  added=0  removed=0{"\n\n"}
              Outputs:{"\n"}
              {"  "}~ outputs/review.md{"\n"}
              {"  "}~ model-calls.jsonl
            </div>
          </TerminalFrame>
        </Step>

        <Step n="05" title="Trace lineage" kind="works today">
          <p style={P}>
            A directed provenance graph over runs, assets, and artifacts. It answers the
            three questions people actually ask:
          </p>
          <ul style={{ ...P, paddingLeft: "1.2em" }}>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "var(--color-ink)" }}>Provenance</strong> — what produced this artifact?
            </li>
            <li style={{ marginBottom: "6px" }}>
              <strong style={{ color: "var(--color-ink)" }}>Blast radius</strong> — if this dataset was wrong, what else is suspect?
            </li>
            <li>
              <strong style={{ color: "var(--color-ink)" }}>Replay chain</strong> — what must be re-run to regenerate this?
            </li>
          </ul>
          <p style={{ ...P, marginBottom: 0 }}>
            SQLite by default. Kuzu, Postgres, AGE, and JanusGraph backends exist for
            cluster scale and are <Tag kind="experimental" />.
          </p>
        </Step>

        <Step n="06" title="Export evidence anyone can verify" kind="works today">
          <p style={P}>
            The payoff. A signed bundle an auditor verifies <strong style={{ color: "var(--color-ink)" }}>offline, with
            no NovaFabric installed</strong> — only <code style={{ fontFamily: "var(--font-code)" }}>sha256sum</code>{" "}
            and an ed25519 verifier. Evidence only its own tool can check is not evidence;
            it is a database row.
          </p>
          <TerminalFrame>
            <div style={{ padding: "16px 18px", whiteSpace: "pre-wrap" }}>
              <span style={{ color: "var(--color-jade)" }}>$</span> nova export-evidence 01KR5SQZPDGTKE3MDP3ZRX8WP1
              {"\n"}
              ✓ evidence-01KR5SQZPD.zip{"  "}(in-toto DSSE + RFC 3161 timestamp){"\n\n"}
              <span style={{ color: "var(--color-jade)" }}>$</span> nova seal verify 01KR5SQZPDGTKE3MDP3ZRX8WP1
              {"\n"}
              ✓ signature valid{"    "}✓ timestamp valid{"    "}✓ redaction proof intact
            </div>
          </TerminalFrame>
        </Step>

        <div style={{ borderTop: "1px solid var(--color-edge)", paddingTop: "56px" }}>
          <SectionHeader
            number="07"
            title="the rest of the surface"
            description="Beyond the core loop. Everything below is implemented; the experimental label means the interface may still move, not that it is vapour."
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "18px",
            }}
          >
            {[
              { t: "Asset registry", k: "works today" as const, d: "Versioned models, prompts, datasets and agent configs as name@version, pinned to a git SHA, with eval-gated promotion." },
              { t: "HPC / SLURM capture", k: "works today" as const, d: "No daemon, no root, no privileged access. Compute-node hot paths write to a local spool, never a database." },
              { t: "Compliance exports", k: "experimental" as const, d: "EU AI Act Annex IV, NIST AI RMF, GDPR Art. 30, NIS2, HIPAA, CycloneDX AI-BOM. Evidence workflows — not legal certification." },
              { t: "Cost & energy attribution", k: "experimental" as const, d: "Per-run LLM cost from a local pricing catalog, and energy-anchored action receipts." },
              { t: "Local dashboard", k: "experimental" as const, d: "nova serve --experimental. Read-only, binds to 127.0.0.1 only." },
              { t: "Server mode", k: "experimental" as const, d: "Multi-user REST API, Postgres, object store, tenancy with row-level security." },
              { t: "Cluster-scale collector", k: "experimental" as const, d: "Node spools, parent/child capsules, object capsule store, four lineage backends." },
              { t: "Knowledge graph & diagnosis", k: "experimental" as const, d: "Capsule knowledge graph, causal-graph attribution, counterfactual root-cause search." },
            ].map((c) => (
              <div
                key={c.t}
                style={{
                  border: "1px solid var(--color-edge)",
                  borderRadius: "8px",
                  padding: "18px",
                  background: "var(--color-surface)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: "15px", color: "var(--color-ink)", fontWeight: 600 }}>{c.t}</h3>
                  <Tag kind={c.k} />
                </div>
                <p style={{ fontSize: "13.5px", color: "var(--color-muted)", lineHeight: 1.65 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: "72px",
            paddingTop: "40px",
            borderTop: "1px solid var(--color-edge)",
          }}
        >
          <h2 className="font-display" style={{ fontSize: "28px", color: "var(--color-ink)", marginBottom: "14px" }}>
            Run the whole thing yourself
          </h2>
          <TerminalFrame>
            <div style={{ padding: "16px 18px", whiteSpace: "pre-wrap" }}>
              <span style={{ color: "var(--color-jade)" }}>$</span> {INSTALL_COMMAND}{"\n"}
              <span style={{ color: "var(--color-jade)" }}>$</span> nova capture python my_agent.py{"\n"}
              <span style={{ color: "var(--color-jade)" }}>$</span> nova validate &lt;run-id&gt;{"\n"}
              <span style={{ color: "var(--color-jade)" }}>$</span> nova replay &lt;run-id&gt; --mode forensic{"\n"}
              <span style={{ color: "var(--color-jade)" }}>$</span> nova diff &lt;run-a&gt; &lt;run-b&gt;{"\n"}
              <span style={{ color: "var(--color-jade)" }}>$</span> nova export-evidence &lt;run-id&gt;
            </div>
          </TerminalFrame>
          <p style={{ ...P, marginTop: "22px" }}>
            If any of that does not work for you,{" "}
            <a href="https://github.com/MSKazemi/novafabric/issues/new/choose" style={{ color: "var(--color-accent)" }}>
              that is a bug and we want to hear about it
            </a>{" "}
            — not a sign you did it wrong.
          </p>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "10px" }}>
            <Link href="/docs/getting-started/" className="font-code" style={{ fontSize: "13px", color: "var(--color-accent)" }}>
              full walkthrough →
            </Link>
            <Link href="/docs/" className="font-code" style={{ fontSize: "13px", color: "var(--color-accent)" }}>
              documentation →
            </Link>
            <a
              href="https://github.com/MSKazemi/novafabric"
              className="font-code"
              style={{ fontSize: "13px", color: "var(--color-accent)" }}
            >
              source →
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
