import type { Metadata } from "next";
import Nav from "@/components/Nav";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import Footer from "@/components/Footer";
import Link from "next/link";
import { PageHero, SectionHeader } from "@/components/ui";
import PrimitiveExplorer from "@/components/primitives/PrimitiveExplorer";
import { PRIMITIVES } from "@/lib/data/primitives";
import { VERSION_TAG } from "@/lib/version";

export const metadata: Metadata = {
  title: "NovaFabric primitives: Run Capsule, replay, lineage, evidence",
  description:
    "The five NovaFabric primitives: Asset Registry, Run Capsule, Replay Engine, Lineage Graph and Evidence Bundle, plus the five replay modes.",
  alternates: { canonical: "https://novafabric.ai/primitives/" },
  openGraph: {
    title: "NovaFabric primitives: Run Capsule, replay, lineage, evidence",
    description:
      "Five composable building blocks to capture, replay, and audit AI-agent activity: Asset Registry, Run Capsule, Replay Engine, Lineage Graph, and Evidence Bundle.",
    url: "https://novafabric.ai/primitives/",
    images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
  },
};

// What each replay mode does, as `nova replay --help` states it (v0.104.0). This
// section absorbed the former /concepts/ page, which still has a redirect stub.
const REPLAY_MODES: { mode: string; reruns: string; desc: string }[] = [
  { mode: "forensic", reruns: "no", desc: "Read-only inspection of what the capsule recorded. Runs nothing; the audit mode." },
  { mode: "mocked", reruns: "yes", desc: "Re-runs the command and serves the recorded model replies from the capsule, so no model call is made. Tool calls are not substituted: they run live." },
  { mode: "semantic", reruns: "no", desc: "Scores how similar the capsule's recorded model responses are to each other (0.0–1.0). No judge model is called." },
  { mode: "exact", reruns: "no", desc: "Reports whether a byte-exact re-run is possible (deterministic env.lock, seeds, no schema drift) and names every condition that fails." },
  { mode: "intervention", reruns: "yes", desc: "Experimental. Substitutes one captured event, re-runs downstream under mocked semantics, and writes a counterfactual capsule you can diff." },
];

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

        <section id="replay-modes" className="mt-20 scroll-mt-24">
          <SectionHeader
            number="03"
            title="Five replay modes"
            description="Each mode states what it reuses from the capsule and what runs live. You always know what was recorded and what was reconstructed."
          />
          <div className="overflow-x-auto max-w-4xl">
            <table className="w-full text-[14px] border-collapse">
              <thead>
                <tr className="text-left text-ink">
                  <th className="py-2 pr-4 border-b border-edge-2 font-semibold">Mode</th>
                  <th className="py-2 pr-4 border-b border-edge-2 font-semibold whitespace-nowrap">Re-runs?</th>
                  <th className="py-2 border-b border-edge-2 font-semibold">What it does</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {REPLAY_MODES.map((m) => (
                  <tr key={m.mode}>
                    <td className="py-2.5 pr-4 border-b border-edge align-top">
                      <code className="font-code text-amber">{m.mode}</code>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-edge align-top">{m.reruns}</td>
                    <td className="py-2.5 border-b border-edge leading-relaxed">{m.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted text-[14px] leading-relaxed mt-5 max-w-2xl">
            NovaFabric does not claim byte-exact replay of remote model calls. See{" "}
            <Link href="/docs/architecture/replay-modes/" className="text-amber">
              replay modes in depth
            </Link>{" "}
            or try them in the{" "}
            <Link href="/demo/replay/" className="text-amber">
              replay demo
            </Link>
            .
          </p>
        </section>

        <section id="boundaries" className="mt-20 scroll-mt-24 max-w-3xl">
          <SectionHeader number="04" title="Boundaries" />
          <h3 className="text-ink text-[17px] font-semibold mb-2">Why self-hosted</h3>
          <p className="text-muted text-[15px] leading-relaxed mb-8">
            Agent runs accumulate sensitive data: prompts, intermediate reasoning, documents pulled in by tools.
            NovaFabric runs in your own infrastructure instead of a hosted service: on your machine for a single
            user, or in a self-hosted server for teams (server mode is experimental). Run Capsules stay where you
            put them unless you choose to move them. No account, no telemetry.
          </p>
          <h3 className="text-ink text-[17px] font-semibold mb-2">Why CLI-first</h3>
          <p className="text-muted text-[15px] leading-relaxed">
            The <code className="font-code text-ink">nova</code> CLI is the canonical automation surface and emits
            machine-readable output, so every step can run in CI. A local dashboard (
            <code className="font-code text-ink">nova serve --experimental</code>) exists for browsing, with scoped
            authorization since v0.102.0; it is a view onto the same capsules, not a separate system of record.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
