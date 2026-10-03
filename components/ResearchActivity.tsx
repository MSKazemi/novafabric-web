import { RESEARCH_AREAS } from "@/lib/data/research";
import type { ResearchArea, Status } from "@/lib/types";

const STATUS_HUE: Record<Status, string> = {
  experimental: "var(--color-accent)",
  prototype: "var(--hue-blue)",
  research: "var(--hue-violet)",
  planned: "var(--hue-slate)",
  deprecated: "var(--hue-red)",
};

function StatusChip({ status }: { status: Status }) {
  const hue = STATUS_HUE[status];
  return (
    <span
      className="font-code"
      style={{
        fontSize: "9px",
        color: hue,
        backgroundColor: `color-mix(in srgb, ${hue} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${hue} 30%, transparent)`,
        borderRadius: "3px",
        padding: "2px 7px",
        letterSpacing: "0.07em",
        flexShrink: 0,
      }}
    >
      {status}
    </span>
  );
}

interface ResearchActivityProps {
  activities?: ResearchArea[];
  showAll?: boolean;
}

export default function ResearchActivity({ activities = RESEARCH_AREAS, showAll = false }: ResearchActivityProps) {
  const visibleActivities = showAll ? activities : activities.slice(0, 3);

  return (
    <section
      id="research"
      style={{
        backgroundColor: "var(--color-surface)",
        padding: "100px 0",
        borderTop: "1px solid var(--color-edge)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span className="font-code" style={{ color: "var(--color-amber)", fontSize: "11px", letterSpacing: "0.1em" }}>
              research/
            </span>
            <div style={{ height: "1px", width: "40px", backgroundColor: "var(--color-edge-2)" }} />
            <span className="font-code" style={{ color: "var(--color-faint)", fontSize: "11px", letterSpacing: "0.08em" }}>
              active areas
            </span>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "end" }}
            className="research-header-grid"
          >
            <h2
              className="font-display"
              style={{ fontSize: "clamp(30px, 4vw, 52px)", fontStyle: "italic", letterSpacing: "-0.02em", color: "var(--color-ink)", lineHeight: 1.1 }}
            >
              What the lab
              <br />
              <span style={{ color: "var(--color-amber)" }}>is building.</span>
            </h2>
            <div>
              <p style={{ fontSize: "15px", color: "var(--color-muted)", lineHeight: "1.75", marginBottom: "8px" }}>
                Six active research and engineering areas, each labeled with its current maturity.
                Labels come from the NovaFabric source-of-truth docs and are updated only when evidence changes.
              </p>
              <p className="font-code" style={{ fontSize: "11px", color: "var(--color-faint)" }}>
                no capability uses <span style={{ color: "var(--color-jade)" }}>stable</span> until v1.0 schema freeze
              </p>
            </div>
          </div>
        </div>

        {/* Activity grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}
          className="research-grid"
        >
          {visibleActivities.map((a) => (
            <div
              key={a.id}
              style={{
                backgroundColor: "var(--color-canvas)",
                border: "1px solid var(--color-edge)",
                borderRadius: "6px",
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
                <StatusChip status={a.status} />
                {a.secondaryStatus && <StatusChip status={a.secondaryStatus} />}
              </div>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-ink)", marginBottom: "10px", lineHeight: 1.3 }}>
                {a.title}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--color-muted)", lineHeight: "1.7", marginBottom: "16px" }}>
                {a.description}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {a.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-code"
                    style={{
                      fontSize: "10px",
                      color: "var(--color-faint)",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-edge)",
                      borderRadius: "3px",
                      padding: "2px 7px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!showAll && (
          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <a
              href="/research"
              style={{ fontFamily: "var(--font-code), monospace", fontSize: "12px", color: "var(--color-muted)", border: "1px solid var(--color-edge-2)", padding: "9px 20px", borderRadius: "4px", textDecoration: "none" }}
            >
              all research areas →
            </a>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .research-header-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .research-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .research-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
