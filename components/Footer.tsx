"use client";

import { VERSION_TAG } from "@/lib/version";
import { MORE_GROUPS } from "@/lib/site-nav";

const LINKS = {
  product: [
    { label: "novafabric", href: "/novafabric" },
    { label: "research", href: "/research" },
    { label: "primitives", href: "/primitives" },
    { label: "architecture", href: "/architecture" },
    { label: "changelog", href: "/changelog" },
    { label: "capsules", href: "/capsules" },
  ],
  primitives: [
    { label: "asset registry", href: "/primitives#asset-registry" },
    { label: "run capsule", href: "/primitives#run-capsule" },
    { label: "replay engine", href: "/primitives#replay-engine" },
    { label: "lineage graph", href: "/primitives#lineage-graph" },
    { label: "evidence bundle", href: "/primitives#evidence-bundle" },
  ],
  project: [
    { label: "GitHub", href: "https://github.com/MSKazemi/novafabric" },
    // These two now have real pages on this site; sending readers to raw
    // markdown on GitHub spent the traffic somewhere it could not be measured
    // or indexed as ours.
    { label: "Documentation", href: "/docs/" },
    { label: "Getting Started", href: "/docs/getting-started/" },
    { label: "CLI Reference", href: "/docs/cli-reference/" },
    { label: "Contributing", href: "https://github.com/MSKazemi/novafabric/blob/main/CONTRIBUTING.md" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      style={{
        backgroundColor: "var(--color-canvas)",
        borderTop: "1px solid var(--color-edge)",
        padding: "72px 0 40px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* Top: logo + links grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            gap: "48px",
            marginBottom: "64px",
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <div
              className="font-code"
              style={{
                fontSize: "18px",
                color: "var(--color-ink)",
                marginBottom: "16px",
                letterSpacing: "-0.02em",
              }}
            >
              nova<span style={{ color: "var(--color-amber)" }}>fabric</span>
              <span style={{ color: "var(--color-amber)", opacity: 0.5 }}>.</span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--color-muted)", lineHeight: "1.7", maxWidth: "280px", marginBottom: "24px" }}>
              Replay and evidence infrastructure for AI agents.
              Self-hosted capture, replay, diff, lineage, and audit. Apache-2.0.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <a
                href="https://github.com/MSKazemi/novafabric"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-code), monospace",
                  fontSize: "11px",
                  color: "var(--color-canvas)",
                  backgroundColor: "var(--color-amber)",
                  padding: "6px 12px",
                  borderRadius: "3px",
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                }}
              >
                github ↗
              </a>
              <a
                href="/contact"
                style={{
                  fontFamily: "var(--font-code), monospace",
                  fontSize: "11px",
                  color: "var(--color-muted)",
                  border: "1px solid var(--color-edge-2)",
                  padding: "6px 12px",
                  borderRadius: "3px",
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                }}
              >
                contact
              </a>
            </div>
          </div>

          {/* Lab + primitives + project links */}
          <FooterLinkGroup title="product" links={LINKS.product} />
          <FooterLinkGroup title="learn" links={MORE_GROUPS.find((g) => g.title === "learn")?.links ?? []} />
          <FooterLinkGroup title="primitives" links={LINKS.primitives} />
          <FooterLinkGroup title="project" links={LINKS.project} />
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--color-edge)", marginBottom: "24px" }} />

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <span className="font-code" style={{ fontSize: "11px", color: "var(--color-faint)" }}>
            © {year} NovaFabric · Apache-2.0
          </span>
          <div style={{ display: "flex", gap: "20px" }}>
            {[
              { label: VERSION_TAG, href: "/changelog" },
              { label: "experimental", href: "/novafabric" },
            ].map((b) => (
              <a
                key={b.label}
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-code"
                style={{
                  fontSize: "10px",
                  color: "var(--color-faint)",
                  textDecoration: "none",
                  letterSpacing: "0.06em",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--color-muted)")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--color-faint)")}
              >
                {b.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div
        className="font-code"
        style={{
          fontSize: "10px",
          color: "var(--color-faint)",
          letterSpacing: "0.1em",
          marginBottom: "16px",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
            style={{
              fontSize: "13px",
              color: "var(--color-muted)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--color-ink)")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--color-muted)")}
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
