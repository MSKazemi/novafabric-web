"use client";

import Link from "next/link";
import { ROADMAP } from "@/lib/data/changelog";

const PRINCIPLES = [
  {
    icon: "◈",
    title: "Portable by design",
    body: "Run Capsules are portable directories designed to remain inspectable without a hosted service as the system of record.",
  },
  {
    icon: "◉",
    title: "Non-invasive capture",
    body: "Supported SDK and transport hooks can capture agent executions without requiring application code changes.",
  },
  {
    icon: "⬡",
    title: "Evidence-grade integrity",
    body: "Sealed evidence uses cryptographic signatures and trusted timestamps so integrity can be checked later. NovaFabric provides evidence, not compliance certification.",
  },
  {
    icon: "⟶",
    title: "Scale from laptop to cluster",
    body: "SQLite for local development. Postgres + RBAC for multi-user server mode. Go collector for SLURM/Kubernetes cluster deployments.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      style={{
        backgroundColor: "var(--color-canvas)",
        padding: "100px 0",
        borderTop: "1px solid var(--color-edge)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* Section header */}
        <div style={{ marginBottom: "70px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span className="font-code" style={{ color: "var(--color-amber)", fontSize: "11px", letterSpacing: "0.1em" }}>
              about/
            </span>
            <div style={{ height: "1px", width: "40px", backgroundColor: "var(--color-edge-2)" }} />
            <span className="font-code" style={{ color: "var(--color-faint)", fontSize: "11px", letterSpacing: "0.08em" }}>
              mission &amp; principles
            </span>
          </div>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              fontStyle: "italic",
              letterSpacing: "-0.02em",
              color: "var(--color-ink)",
              maxWidth: "680px",
              lineHeight: 1.1,
            }}
          >
            Keep the run.<br />
            Keep the evidence.
          </h2>
        </div>

        {/* Two-column: mission + principles */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", marginBottom: "80px" }}
          className="about-grid"
        >
          {/* Mission */}
          <div>
            <p style={{ fontSize: "17px", color: "var(--color-muted)", lineHeight: "1.8", marginBottom: "24px" }}>
              AI agents call models, tools, files, and APIs across environments that
              keep changing. When an important run fails or is questioned later, the
              output alone is not enough to explain what happened.
            </p>
            <p style={{ fontSize: "17px", color: "var(--color-muted)", lineHeight: "1.8", marginBottom: "24px" }}>
              NovaFabric captures those executions as portable Run Capsules so teams
              can replay, compare, trace, and verify past behavior without making a
              hosted dashboard the only record of what happened.
            </p>
            <p style={{ fontSize: "17px", color: "var(--color-muted)", lineHeight: "1.8" }}>
              Open source. Apache-2.0. Self-hosted. No account required. No telemetry.
            </p>

            <div style={{ marginTop: "36px" }}>
              <Link
                // north-star.md lives in the repository's private design/ tree
                // and has never been public — this link 404'd. /docs/tutorials/
                // why-novafabric/ is the public page that makes the same case.
                href="/docs/tutorials/why-novafabric/"
                className="font-code"
                style={{
                  fontSize: "12px",
                  color: "var(--color-amber)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  borderBottom: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
                  paddingBottom: "2px",
                }}
              >
                read the north star vision →
              </Link>
            </div>
          </div>

          {/* Principles */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-edge)",
                  borderRadius: "5px",
                  padding: "20px",
                }}
              >
                <span style={{ fontSize: "20px", color: "var(--color-amber)", display: "block", marginBottom: "10px" }}>
                  {p.icon}
                </span>
                <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-ink)", marginBottom: "8px" }}>
                  {p.title}
                </h4>
                <p style={{ fontSize: "13px", color: "var(--color-muted)", lineHeight: "1.65" }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
            <span className="font-code" style={{ color: "var(--color-faint)", fontSize: "11px", letterSpacing: "0.08em" }}>
              roadmap
            </span>
            <div style={{ height: "1px", flex: 1, backgroundColor: "var(--color-edge)" }} />
          </div>

          <div
            style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
          >
            {ROADMAP.map((r) => (
              <div
                key={r.version}
                className="font-code"
                style={{
                  fontSize: "11px",
                  padding: "5px 10px",
                  borderRadius: "3px",
                  border: r.shipped
                    ? "1px solid color-mix(in srgb, var(--color-jade) 22%, transparent)"
                    : "1px dashed var(--color-edge-2)",
                  backgroundColor: r.shipped ? "color-mix(in srgb, var(--color-jade) 8%, transparent)" : "transparent",
                  color: r.shipped ? "var(--color-jade)" : "var(--color-faint)",
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                }}
              >
                <span style={{ opacity: 0.6 }}>{r.version}</span>
                <span style={{ color: "var(--color-edge-2)" }}>·</span>
                <span>{r.label}</span>
                {!r.shipped && (
                  <span style={{ color: "var(--color-amber)", opacity: 0.5 }}>→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>
    </section>
  );
}
