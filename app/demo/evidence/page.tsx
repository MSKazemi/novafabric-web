import type { Metadata } from "next";
import { DemoShell, demoMetadata } from "@/components/demo/DemoShell";
import EvidenceViewer from "@/components/demo/showcase/EvidenceViewer";

const PATH = "/demo/evidence/";

export const metadata: Metadata = demoMetadata(
  PATH,
  "Verify an Evidence Bundle in your browser — NovaFabric demo",
  "A signed NovaFabric Evidence Bundle manifest, verified with real Ed25519 (WebCrypto) in your browser. Tamper with one byte and verification fails.",
);

export default function EvidenceDemoPage() {
  return (
    <DemoShell
      path={PATH}
      name="Evidence Bundle"
      title="Evidence Bundle"
      subtitle="A portable, signed export of one run's evidence: an in-toto statement, the manifest of bundled files, and an Ed25519 signature over the canonicalised manifest. Verification below runs in your browser."
      cli={[
        "nova export-evidence ~/.novafabric/capsules/<run-id>/ -o evidence.zip",
        "nova verify evidence.zip",
        "# --timestamp adds an RFC 3161 token (opt-in)",
      ]}
    >
      <EvidenceViewer />
      <aside className="mt-8 max-w-3xl rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-5 text-sm text-[var(--color-text-muted)] leading-relaxed">
        <p className="text-[var(--color-text)] font-medium mb-2">Try to break it</p>
        <p>
          Click <strong>Verify signature</strong>: the result shows a real Ed25519 operation and how long it took.
          Then tick <strong>Tamper</strong> and verify again. One changed byte in the manifest and the signature
          no longer matches. A signature shows the manifest is unchanged since that key signed it; it does not
          show that the recorded run is complete or true.
        </p>
      </aside>
    </DemoShell>
  );
}
