import type { Metadata } from "next";
import Nav from "@/components/Nav";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import Footer from "@/components/Footer";
import { PageHero, SectionHeader } from "@/components/ui";
import ArchitectureDiagram from "@/components/architecture/ArchitectureDiagram";
import ArchitectureExplorer from "@/components/architecture/ArchitectureExplorer";
import EvidenceSpine from "@/components/architecture/EvidenceSpine";
import { VERSION_TAG } from "@/lib/version";

export const metadata: Metadata = {
  title: "Architecture — NovaFabric",
  description:
    "The black-box recorder for AI agents: one verb chain — capture, seal, replay, diff, audit — across six subsystem domains. Self-contained on a single machine; the same capsule format scales out to clusters.",
  alternates: { canonical: "https://novafabric.ai/architecture/" },
  openGraph: {
    title: "Architecture — NovaFabric",
    description:
      "Capture → seal → replay → diff → audit. Self-contained on one machine, distributed-ready to clusters — the same format at every scale.",
    url: "https://novafabric.ai/architecture/",
    images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
  },
};

export default function ArchitecturePage() {
  return (
    <>
      <Nav />
      <BreadcrumbJsonLd trail={[{ name: "Architecture", path: "/architecture/" }]} />
      <PageHero
        section="architecture"
        title="Architecture"
        subtitle="The black-box recorder for AI agents. One verb chain — capture, seal, replay, diff, audit — self-contained on a single machine, and the same format scales out to clusters."
        tag={VERSION_TAG}
      />

      <main className="page-max-w py-16">
        {/* Section 01 — The Evidence Lifecycle (the real whole-system spine) */}
        <SectionHeader
          number="01"
          title="The Evidence Lifecycle"
          description="NovaFabric's strategic core is one verb chain. Every capability composes onto it."
        />
        <EvidenceSpine />

        {/* Section 02 — Cluster-Scale Ingestion Path (the distributed tier) */}
        <SectionHeader
          number="02"
          title="Cluster-Scale Ingestion Path"
          description="When you scale out, evidence flows through five planes — from the compute plane where agents run to the global query layer. This is the distributed tier (experimental); a single-machine install collapses it to the compute plane."
          className="mt-20"
        />
        <ArchitectureDiagram />

        {/* Section 03 — Subsystem Explorer */}
        <SectionHeader
          number="03"
          title="Subsystem Explorer"
          description="Every component and how it wires together, across the six subsystem domains. Click a box to drill in; hover to trace its connections."
          className="mt-20"
        />
        <ArchitectureExplorer />

        {/* Section 04 — Deployment Modes */}
        <SectionHeader
          number="04"
          title="Deployment Modes"
          className="mt-20"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Local Dev */}
          <div className="bg-surface border border-edge-2 rounded-md p-6">
            <p className="font-code text-[11px] text-amber uppercase tracking-widest mb-3">
              Local Dev
            </p>
            <ul className="space-y-1.5 list-none">
              <li className="text-muted text-[15px] md:text-sm leading-relaxed">Solo developer workflow</li>
              <li className="text-muted text-[15px] md:text-sm leading-relaxed">SQLite — zero config</li>
              <li className="text-muted text-[15px] md:text-sm leading-relaxed">No server required</li>
              <li className="text-muted text-[15px] md:text-sm leading-relaxed">nova CLI only</li>
            </ul>
          </div>

          {/* Team Server */}
          <div className="bg-surface border border-edge-2 rounded-md p-6">
            <p className="font-code text-[11px] text-amber uppercase tracking-widest mb-3">
              Team Server
            </p>
            <ul className="space-y-1.5 list-none">
              <li className="text-muted text-[15px] md:text-sm leading-relaxed">Shared Postgres instance</li>
              <li className="text-muted text-[15px] md:text-sm leading-relaxed">Cluster collector daemon</li>
              <li className="text-muted text-[15px] md:text-sm leading-relaxed">Web dashboard for audit</li>
              <li className="text-muted text-[15px] md:text-sm leading-relaxed">Row-level security isolation</li>
            </ul>
          </div>

          {/* HPC Cluster */}
          <div className="bg-surface border border-edge-2 rounded-md p-6">
            <p className="font-code text-[11px] text-amber uppercase tracking-widest mb-3">
              HPC Cluster
            </p>
            <ul className="space-y-1.5 list-none">
              <li className="text-muted text-[15px] md:text-sm leading-relaxed">SLURM prolog/epilog hooks</li>
              <li className="text-muted text-[15px] md:text-sm leading-relaxed">Node collectors per login node</li>
              <li className="text-muted text-[15px] md:text-sm leading-relaxed">Aggregated evidence store</li>
              <li className="text-muted text-[15px] md:text-sm leading-relaxed">Cross-job lineage queries</li>
            </ul>
          </div>
        </div>

        {/* Section 05 — Design Decisions */}
        <SectionHeader
          number="05"
          title="Design Decisions"
          className="mt-20"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ADR 1 */}
          <div className="bg-surface border border-edge-2 rounded-md p-6">
            <p className="font-code text-amber text-[13px] mb-2">SQLite → Postgres</p>
            <p className="text-muted text-[15px] md:text-sm leading-relaxed">
              Local SQLite for solo devs, zero-config. Postgres for teams with RLS isolation.
              Migration path is a single flag change.
            </p>
          </div>

          {/* ADR 2 */}
          <div className="bg-surface border border-edge-2 rounded-md p-6">
            <p className="font-code text-amber text-[13px] mb-2">Go collector</p>
            <p className="text-muted text-[15px] md:text-sm leading-relaxed">
              Python-based collection had &gt;5% overhead. Go daemon: 295K events/sec, &lt;1ms
              local latency, crash-safe WAL spool.
            </p>
          </div>

          {/* ADR 3 */}
          <div className="bg-surface border border-edge-2 rounded-md p-6">
            <p className="font-code text-amber text-[13px] mb-2">DSSE + RFC 3161</p>
            <p className="text-muted text-[15px] md:text-sm leading-relaxed">
              DSSE envelope for content signing. RFC 3161 for trusted timestamps. Both are
              standards-compliant and verifiable without novafabric installed.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
