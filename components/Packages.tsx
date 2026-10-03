"use client";

// Every `command` below must be one a reader can paste and have work. Two of
// them previously could not: `pip install nova-worm-conformance` (never
// published to PyPI) and `go install github.com/novafabric/nova-collector@latest`
// (no such repository — the collector lives in the main repo under collector/).
// Both are real, working code; only the distribution channel was imagined. If
// either is published standalone later, restore the short form here.
const PACKAGES = [
  {
    name: "nova-worm-conformance",
    version: "0.1.0",
    language: "Python",
    langColor: "#3b82f6",
    description:
      "Behavioral test suite verifying object storage backends meet WORM requirements. 10 mandatory test cases covering immutability, retention locks, legal holds, and lifecycle exemptions.",
    tags: ["SEC 17a-4", "MiFID II", "CFTC 1.31", "FINRA 4370"],
    command:
      'pip install "git+https://github.com/MSKazemi/novafabric#subdirectory=packages/nova_worm_conformance"',
    backends: ["S3 / MinIO / Ceph", "Azure Blob"],
    status: "stable",
    icon: "⬟",
  },
  {
    name: "nova-collector",
    version: "0.1.0-alpha",
    language: "Go",
    langColor: "#00acd7",
    description:
      "Cluster-scale OpenTelemetry collector for capsule events, spans, and metrics. Deployable to Kubernetes via DaemonSet or SLURM via prolog/epilog. Handles millions of events per node.",
    tags: ["OpenTelemetry", "Kubernetes", "SLURM", "HPC"],
    command:
      "git clone https://github.com/MSKazemi/novafabric && go build ./novafabric/collector/cmd/novafabric-collector",
    backends: ["Kubernetes", "SLURM / HPC"],
    status: "alpha",
    icon: "⬡",
  },
  {
    name: "nova-dashboard",
    version: "experimental",
    language: "TypeScript",
    langColor: "#3178c6",
    description:
      "Web UI for capsule inspection, lineage visualization, and asset registry browsing. Ships embedded in nova serve. 13 tabs covering all major primitives.",
    tags: ["React 19", "Astro 5", "Tailwind v4"],
    command: "nova serve --experimental",
    backends: ["Embedded in nova serve"],
    status: "experimental",
    icon: "⊞",
  },
];

const STATUS_STYLES: Record<string, { bg: string; border: string; color: string; dot: string }> = {
  stable:       { bg: "color-mix(in srgb, var(--color-jade) 10%, transparent)",  border: "color-mix(in srgb, var(--color-jade) 22%, transparent)",  color: "var(--color-jade)", dot: "●" },
  alpha:        { bg: "color-mix(in srgb, var(--color-accent) 10%, transparent)",  border: "color-mix(in srgb, var(--color-accent) 22%, transparent)",  color: "var(--color-amber)", dot: "◉" },
  experimental: { bg: "color-mix(in srgb, var(--hue-slate) 12%, transparent)", border: "color-mix(in srgb, var(--hue-slate) 22%, transparent)", color: "var(--color-muted)", dot: "○" },
};

export default function Packages() {
  return (
    <section
      id="packages"
      style={{
        backgroundColor: "var(--color-surface)",
        padding: "100px 0",
        borderTop: "1px solid var(--color-edge)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* Section header */}
        <div style={{ marginBottom: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span className="font-code" style={{ color: "var(--color-amber)", fontSize: "11px", letterSpacing: "0.1em" }}>
              packages/
            </span>
            <div style={{ height: "1px", width: "40px", backgroundColor: "var(--color-edge-2)" }} />
            <span className="font-code" style={{ color: "var(--color-faint)", fontSize: "11px", letterSpacing: "0.08em" }}>
              standalone tools
            </span>
          </div>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              fontStyle: "italic",
              letterSpacing: "-0.02em",
              color: "var(--color-ink)",
              maxWidth: "560px",
              lineHeight: 1.1,
            }}
          >
            Standalone tools<br />
            in the ecosystem.
          </h2>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "20px",
          }}
        >
          {PACKAGES.map((pkg) => {
            const statusStyle = STATUS_STYLES[pkg.status];
            return (
              <div
                key={pkg.name}
                style={{
                  backgroundColor: "var(--color-canvas)",
                  border: "1px solid var(--color-edge)",
                  borderRadius: "6px",
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  transition: "border-color 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--color-edge-2)";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--color-edge)";
                  el.style.transform = "translateY(0)";
                }}
              >
                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "22px", color: "var(--color-amber)" }}>{pkg.icon}</span>
                    <div>
                      <div className="font-code" style={{ fontSize: "14px", color: "var(--color-ink)", fontWeight: 500 }}>
                        {pkg.name}
                      </div>
                      <div className="font-code" style={{ fontSize: "11px", color: "var(--color-faint)", marginTop: "2px" }}>
                        <span style={{ color: pkg.langColor }}>{pkg.language}</span>
                        {" "}· {pkg.version}
                      </div>
                    </div>
                  </div>
                  <span
                    className="font-code"
                    style={{
                      fontSize: "10px",
                      color: statusStyle.color,
                      backgroundColor: statusStyle.bg,
                      border: `1px solid ${statusStyle.border}`,
                      borderRadius: "3px",
                      padding: "2px 8px",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {statusStyle.dot} {pkg.status}
                  </span>
                </div>

                {/* Description */}
                <p style={{ fontSize: "14px", color: "var(--color-muted)", lineHeight: "1.7", flexGrow: 1 }}>
                  {pkg.description}
                </p>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {pkg.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-code"
                      style={{
                        fontSize: "10px",
                        color: "var(--color-faint)",
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-edge)",
                        borderRadius: "3px",
                        padding: "2px 8px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Command */}
                <div
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-edge)",
                    borderRadius: "4px",
                    padding: "9px 13px",
                    display: "flex",
                    gap: "9px",
                    alignItems: "center",
                  }}
                >
                  <span className="font-code" style={{ color: "var(--color-amber)", fontSize: "12px", flexShrink: 0 }}>$</span>
                  <span
                    className="font-code"
                    style={{
                      fontSize: "12px",
                      color: "var(--color-ink)",
                      opacity: 0.75,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {pkg.command}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
