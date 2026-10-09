import type { Metadata } from "next";
import { DemoShell, demoMetadata } from "@/components/demo/DemoShell";
import RegistryBrowser from "@/components/demo/showcase/RegistryBrowser";

const PATH = "/demo/registry/";

export const metadata: Metadata = demoMetadata(
  PATH,
  "Asset registry with eval-gated promotion — NovaFabric demo",
  "A NovaFabric asset registry fixture: name@version identity for models, prompts, tools and datasets, and why a failed eval blocks a promotion.",
);

export default function RegistryDemoPage() {
  return (
    <DemoShell
      path={PATH}
      name="Asset registry"
      title="Asset registry"
      subtitle="Every model, agent, prompt, tool, dataset and evaluation suite gets a name@version identity. Promotion toward production is gated by eval results."
      cli={[
        "nova register code-review-prompt-0.2.0.yaml",
        "nova eval agent code-review-prompt@0.2.0",
        "nova promote direct code-review-prompt@0.2.0 --to production",
        "nova list --type prompt",
      ]}
    >
      <RegistryBrowser />
      <aside className="mt-8 max-w-3xl rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-5 text-sm text-[var(--color-text-muted)] leading-relaxed">
        <p className="text-[var(--color-text)] font-medium mb-2">Where to look</p>
        <p>
          Select <code className="font-mono">code-review-prompt@0.2.0</code>. Its{" "}
          <strong>edge-case-coverage</strong> suite failed, which is why 0.1.0 is still the promoted version.
          On the CLI, <code className="font-mono">nova promote direct</code> refuses the same promotion unless
          you pass <code className="font-mono">--force</code>.
        </p>
      </aside>
    </DemoShell>
  );
}
