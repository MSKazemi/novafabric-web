import type { Metadata } from "next";
import Nav from "@/components/Nav";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import Footer from "@/components/Footer";
import { PageHero, SectionHeader } from "@/components/ui";
import ChangelogTimeline from "@/components/changelog/ChangelogTimeline";
import { MILESTONES, ROADMAP } from "@/lib/data/changelog";
import type { RoadmapEntry } from "@/lib/types";
import { VERSION_TAG } from "@/lib/version";

export const metadata: Metadata = {
  title: "Changelog — NovaFabric",
  description: "NovaFabric release history from v0.1 to the current version: shipped features, fixes and milestones on the road to the v1.0 format freeze.",
  alternates: { canonical: "https://novafabric.ai/changelog/" },
  openGraph: {
    title: "Changelog — NovaFabric",
    description: `Every version of novafabric from v0.1 to ${VERSION_TAG} — milestones, shipped features, and the road to v1.0.`,
    url: "https://novafabric.ai/changelog/",
    images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
  },
};

function RoadmapCard({ entry }: { entry: RoadmapEntry }) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-edge-2)",
        borderRadius: "6px",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <span
        className="font-code"
        style={{
          fontSize: "12px",
          color: entry.shipped ? "var(--color-jade)" : "var(--color-faint)",
          flexShrink: 0,
          width: "16px",
        }}
      >
        {entry.shipped ? "✓" : "○"}
      </span>
      <span
        className="font-code"
        style={{
          fontSize: "11px",
          color: "var(--color-faint)",
          flexShrink: 0,
          minWidth: "56px",
        }}
      >
        {entry.version}
      </span>
      <span
        style={{
          fontSize: "13px",
          color: entry.shipped ? "var(--color-ink)" : "var(--color-muted)",
          lineHeight: 1.4,
        }}
      >
        {entry.label}
      </span>
    </div>
  );
}

export default function ChangelogPage() {
  return (
    <>
      <Nav />
      <BreadcrumbJsonLd trail={[{ name: "Changelog", path: "/changelog/" }]} />
      <PageHero
        section="changelog"
        title="Changelog"
        subtitle="Every version of novafabric, from first commit to current."
        status="experimental"
        tag={VERSION_TAG}
      />

      <main className="page-max-w py-16">
        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "32px",
            marginBottom: "0",
          }}
          className="stats-grid"
        >
          {[
            { label: "versions", value: "31" },
            { label: "engineer", value: "1" },
            { label: "license", value: "Apache-2.0" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div
                className="font-code"
                style={{
                  fontSize: "11px",
                  color: "var(--color-amber)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                {label}
              </div>
              <div
                className="font-display"
                style={{
                  fontSize: "36px",
                  color: "var(--color-ink)",
                  lineHeight: 1.1,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Version History */}
        <SectionHeader number="01" title="Version History" className="mt-12" />
        <ChangelogTimeline milestones={MILESTONES} />

        {/* Roadmap */}
        <SectionHeader number="02" title="Roadmap" className="mt-20" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
          }}
          className="roadmap-grid"
        >
          {ROADMAP.map((entry) => (
            <RoadmapCard key={entry.version} entry={entry} />
          ))}
        </div>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .roadmap-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .roadmap-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
