import type { Metadata } from "next";
import Nav from "@/components/Nav";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import Footer from "@/components/Footer";
import { PageHero, SectionHeader } from "@/components/ui";
import PrimitiveExplorer from "@/components/primitives/PrimitiveExplorer";
import { PRIMITIVES } from "@/lib/data/primitives";
import { VERSION_TAG } from "@/lib/version";

export const metadata: Metadata = {
  title: "Primitives — NovaFabric",
  description:
    "The five NovaFabric primitives — Asset Registry, Run Capsule, Replay Engine, Lineage Graph and Evidence Bundle — for replaying and verifying AI-agent runs.",
  alternates: { canonical: "https://novafabric.ai/primitives/" },
  openGraph: {
    title: "Primitives — NovaFabric",
    description:
      "Five composable building blocks to capture, replay, and audit AI-agent activity: Asset Registry, Run Capsule, Replay Engine, Lineage Graph, and Evidence Bundle.",
    url: "https://novafabric.ai/primitives/",
    images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
  },
};

const COMPOSITION_ORDER = [
  { id: "01", label: "Asset Registry" },
  { id: "02", label: "Run Capsule" },
  { id: "05", label: "Evidence Bundle" },
  { id: "04", label: "Lineage Graph" },
  { id: "03", label: "Replay Engine" },
];

export default function PrimitivesPage() {
  return (
    <>
      <Nav />
      <BreadcrumbJsonLd trail={[{ name: "Primitives", path: "/primitives/" }]} />
      <PageHero
        section="primitives"
        title="Primitives"
        subtitle="Five composable building blocks to capture, replay, and audit AI-agent activity."
        tag={VERSION_TAG}
      />
      <main className="page-max-w py-16">
        <SectionHeader
          number="01"
          title="The Five Primitives"
          description="Each primitive is independent and composable."
        />

        <PrimitiveExplorer primitives={PRIMITIVES} />

        <SectionHeader
          number="02"
          title="How They Compose"
          className="mt-20"
        />

        <p className="text-muted text-[15px] md:text-sm leading-relaxed mb-8 max-w-2xl">
          Start with Asset Registry to declare what you&apos;re running. Wrap execution with Run
          Capsule. Seal and export tamper-evident evidence with the Evidence Bundle. Query history
          with Lineage Graph. Replay any capsule with Replay Engine. All five work together or
          independently.
        </p>

        {/* Static composition diagram */}
        <div className="flex flex-wrap items-center gap-2">
          {COMPOSITION_ORDER.map((item, index) => (
            <span key={item.id} className="flex items-center gap-2">
              <span className="bg-surface border border-amber/20 rounded px-3 py-2 text-center">
                <span className="font-code text-[11px] text-amber uppercase block">
                  {item.id}
                </span>
                <span className="text-muted text-[11px] font-code block mt-0.5">{item.label}</span>
              </span>
              {index < COMPOSITION_ORDER.length - 1 && (
                <span className="text-faint text-sm font-code">→</span>
              )}
            </span>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
