import type { Metadata } from "next";
import Nav from "@/components/Nav";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import Footer from "@/components/Footer";
import { PageHero, SectionHeader, AnimatedSection } from "@/components/ui";
import StudyCard from "@/components/research/StudyCard";
import { RESEARCH_AREAS } from "@/lib/data/research";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Research — NovaFabric Lab",
  description:
    "Research areas and open problems from NovaFabric Lab: monitoring, observability, reproducibility, evidence infrastructure, and audit for AI agents and agentic systems.",
  alternates: { canonical: "https://novafabric.ai/research/" },
  openGraph: {
    title: "Research — NovaFabric Lab",
    description:
      "Open problems in AI-agent reproducibility, evidence infrastructure, and audit. Active investigations.",
    url: "https://novafabric.ai/research/",
    images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
  },
};

const researchSchema = {
  "@context": "https://schema.org",
  "@type": "ResearchProject",
  name: "NovaFabric Lab Research",
  url: "https://novafabric.ai/research",
  description:
    "Open problems in AI-agent reproducibility, evidence infrastructure, and audit. Active investigations into run capsules, lineage graphs, and tamper-evident execution records.",
  keywords: [
    "AI agent monitoring",
    "AI agent observability",
    "AI agent reproducibility",
    "evidence infrastructure",
    "run capsule",
    "agent lineage",
    "AI audit",
  ],
  founder: { "@type": "Person", name: "Mohsen Seyedkazemi Ardebili" },
};

const paperSchema = {
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  headline: "NovaFabric: Tamper-Evident, Replayable Evidence for Autonomous AI Agent Runs",
  author: { "@type": "Person", name: "Mohsen Seyedkazemi Ardebili" },
  datePublished: "2026-09-11",
  url: "https://arxiv.org/abs/2609.12582",
  identifier: "arXiv:2609.12582",
  publisher: { "@type": "Organization", name: "arXiv" },
  about: { "@type": "SoftwareApplication", name: "NovaFabric", url: "https://novafabric.ai/novafabric/" },
};

export default function ResearchPage() {
  return (
    <>
      <JsonLd data={researchSchema} />
      <JsonLd data={paperSchema} />
      <Nav />
      <BreadcrumbJsonLd trail={[{ name: "Research", path: "/research/" }]} />

      <PageHero
        section="research"
        title="Research"
        subtitle="Open problems in AI-agent reproducibility, evidence infrastructure, and audit."
        status="research"
      />

      <main className="page-max-w py-16">
        {/* 01 — Publications */}
        <SectionHeader
          number="01"
          title="Publications"
          description="Peer-reviewable write-ups of the system and its measured results."
        />
        <article className="max-w-2xl mb-20">
          <h3 className="text-lg font-semibold leading-snug">
            <a href="https://arxiv.org/abs/2609.12582" className="underline underline-offset-4">
              NovaFabric: Tamper-Evident, Replayable Evidence for Autonomous AI Agent Runs
            </a>
          </h3>
          <p className="text-muted mt-1">
            Mohsen Seyedkazemi Ardebili · arXiv:2609.12582 · 2026
          </p>
          <p className="text-muted leading-relaxed mt-3">
            The design, threat model and evaluation of NovaFabric: eight research questions at
            measured scope, including replay, tamper rejection, redaction, lineage queries over
            100M edges, and a 314-machine, ten-region ingest run.
          </p>
        </article>

        {/* 02 — Research Areas */}
        <SectionHeader
          number="02"
          title="Research Areas"
          description="Active investigations across reproducibility, audit, and provenance."
        />
        <div className="grid md:grid-cols-2 gap-6">
          {RESEARCH_AREAS.map((area, index) => (
            <AnimatedSection key={area.id} variant="fadeUp" delay={index * 0.08}>
              <StudyCard area={area} />
            </AnimatedSection>
          ))}
        </div>

        {/* 03 — Open Problems */}
        <SectionHeader number="03" title="Open Problems" className="mt-20" />
        <p className="text-muted leading-relaxed max-w-2xl">
          The core open problem: given an AI-agent run, can we produce a verifiable certificate
          that another researcher can independently verify? NovaFabric explores sealed capsules
          as the atomic unit of evidence, with DSSE signing and RFC 3161 timestamping.
          We are actively investigating: (1) capsule deduplication at scale, (2) semantic
          equivalence for replay validation, (3) lineage graph query languages for provenance
          forensics.
        </p>
      </main>

      <Footer />
    </>
  );
}
