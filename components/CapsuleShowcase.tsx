import { CAPSULES as DEFAULT_CAPSULES } from "@/lib/data/capsules";
import type { CapsuleEntry } from "@/lib/types";

interface CapsuleShowcaseProps {
  capsules?: CapsuleEntry[];
}

export default function CapsuleShowcase({ capsules = DEFAULT_CAPSULES }: CapsuleShowcaseProps) {
  return (
    <section
      id="capsules"
      style={{
        backgroundColor: "var(--color-canvas)",
        padding: "100px 0",
        borderTop: "1px solid var(--color-edge)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span className="font-code" style={{ color: "var(--color-amber)", fontSize: "11px", letterSpacing: "0.1em" }}>
              capsules/
            </span>
            <div style={{ height: "1px", width: "40px", backgroundColor: "var(--color-edge-2)" }} />
            <span className="font-code" style={{ color: "var(--color-faint)", fontSize: "11px", letterSpacing: "0.08em" }}>
              examples
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "end" }} className="showcase-header-grid">
            <h2
              className="font-display"
              style={{ fontSize: "clamp(32px, 4vw, 52px)", fontStyle: "italic", letterSpacing: "-0.02em", color: "var(--color-ink)", lineHeight: 1.1 }}
            >
              Example runs.
              <br />
              <span style={{ color: "var(--color-amber)" }}>Example capsules.</span>
            </h2>
            <div>
              <p style={{ fontSize: "15px", color: "var(--color-muted)", lineHeight: "1.75", marginBottom: "16px" }}>
                These are example capsules, not third-party deployments. Each snippet is read from
                the capsule files at build time; capture your own with nova capture.
              </p>
              <a
                href="https://github.com/MSKazemi/novafabric/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="font-code"
                style={{ fontSize: "12px", color: "var(--color-amber)", textDecoration: "none", borderBottom: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)", paddingBottom: "2px" }}
              >
                submit your capsule →
              </a>
            </div>
          </div>
        </div>

        {/* Showcase cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {capsules.map((c, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-edge)",
                borderRadius: "6px",
                overflow: "hidden",
              }}
              className="showcase-card"
            >
              {/* Left: project info */}
              <div style={{ padding: "28px 32px", borderRight: "1px solid var(--color-edge)" }}>
                <div className="font-code" style={{ fontSize: "10px", color: "var(--color-amber)", letterSpacing: "0.1em", marginBottom: "8px" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-ink)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
                  {c.project}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--color-muted)", lineHeight: "1.7", marginBottom: "20px" }}>
                  {c.useCase}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                  {c.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-code"
                      style={{ fontSize: "10px", color: "var(--color-faint)", backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-edge)", borderRadius: "3px", padding: "2px 8px" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={c.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-code"
                  style={{ fontSize: "11px", color: "var(--color-muted)", textDecoration: "none" }}
                >
                  view repo ↗
                </a>
              </div>

              {/* Right: capsule snippet */}
              <div
                style={{
                  backgroundColor: "var(--color-canvas)",
                  fontFamily: "var(--font-code), monospace",
                  fontSize: "12px",
                  lineHeight: "1.8",
                  padding: "28px 28px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                {c.snippet.map((line, j) => {
                  const isCmd = line.startsWith("$");
                  const isOk = line.includes("✓");
                  const isEmpty = line === "";
                  return (
                    <div
                      key={j}
                      style={{
                        color: isCmd ? "var(--color-amber)" : isOk ? "var(--color-jade)" : "var(--color-muted)",
                        minHeight: isEmpty ? "10px" : undefined,
                        whiteSpace: "pre",
                      }}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Community call-to-action */}
        <div
          style={{
            marginTop: "48px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            padding: "24px 28px",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-edge-2)",
            borderRadius: "6px",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-ink)", marginBottom: "6px" }}>
              Using novafabric on your project?
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-muted)" }}>
              Open a PR on GitHub — add your capsule snippet to the showcase.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a
              href="https://github.com/MSKazemi/novafabric/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: "var(--font-code), monospace", fontSize: "12px", color: "var(--color-canvas)", backgroundColor: "var(--color-amber)", padding: "9px 18px", borderRadius: "4px", textDecoration: "none", fontWeight: 500 }}
            >
              contributing guide ↗
            </a>
            <a
              href="/capsules/"
              style={{ fontFamily: "var(--font-code), monospace", fontSize: "12px", color: "var(--color-muted)", border: "1px solid var(--color-edge-2)", padding: "9px 18px", borderRadius: "4px", textDecoration: "none" }}
            >
              all capsules →
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .showcase-header-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .showcase-card { grid-template-columns: 1fr !important; }
          .showcase-card > div:first-child { border-right: none !important; border-bottom: 1px solid var(--color-edge); }
        }
      `}</style>
    </section>
  );
}
