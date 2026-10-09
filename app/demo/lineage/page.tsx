import type { Metadata } from "next";
import { DemoShell, demoMetadata } from "@/components/demo/DemoShell";
import LineageGraph from "@/components/demo/showcase/LineageGraph";

const PATH = "/demo/lineage/";

export const metadata: Metadata = demoMetadata(
  PATH,
  "Lineage graph: provenance and blast radius — NovaFabric demo",
  "An interactive NovaFabric lineage graph over runs, assets and artifacts: provenance, blast radius and replay chain, as in the nova lineage CLI.",
);

export default function LineageDemoPage() {
  return (
    <DemoShell
      path={PATH}
      name="Lineage graph"
      title="Lineage graph"
      subtitle="Every run, asset and artifact is a node; every consumed, produced, replayed_from or evaluated_by relationship is an edge. The toolbar modes mirror the CLI."
      cli={[
        "nova lineage provenance <run-id>",
        "nova lineage blast-radius code-review-prompt@0.1.0",
        "nova lineage replay-chain <run-id>",
      ]}
    >
      {/* A local dark stage, like the site's terminals: the graph canvas is drawn for dark. */}
      <div data-theme="dark" className="nf-demo rounded-xl p-3" style={{ backgroundColor: "var(--color-canvas)" }}>
        <LineageGraph />
      </div>
      <aside className="mt-8 max-w-3xl rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-5 text-sm text-[var(--color-text-muted)] leading-relaxed">
        <p className="text-[var(--color-text)] font-medium mb-2">Where to look</p>
        <p>
          Click <code className="font-mono">code-review-prompt</code> and switch to <strong>Blast radius</strong>:
          every run that consumed that prompt version lights up. On the CLI the same query prints text or JSON.
        </p>
      </aside>
    </DemoShell>
  );
}
