import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { DemoShell, demoMetadata } from "@/components/demo/DemoShell";
import CapsuleFileBrowser, { type CapsuleFile } from "@/components/demo/CapsuleFileBrowser";
import CapsuleValidator from "@/components/demo/CapsuleValidator";

const PATH = "/demo/capsule/";

export const metadata: Metadata = demoMetadata(
  PATH,
  "Inside a Run Capsule, with a schema check — NovaFabric demo",
  "The files one captured AI-agent run leaves behind: manifest, execution spans, model calls and tool calls. Validate the manifest against the shipped JSON Schema in your browser.",
);

const DIR = join(process.cwd(), "lib", "data", "demo", "fixtures", "capsules", "RUN_A");

// Read at build time, so the page shows the fixture's bytes and nothing else.
const FILES: CapsuleFile[] = [
  { name: "capsule.yaml", note: "run manifest: id, status, command, timing" },
  { name: "trace.jsonl", note: "execution spans" },
  { name: "model-calls.jsonl", note: "one record per LLM call" },
  { name: "tool-calls.jsonl", note: "one record per tool call" },
].map((f) => ({ ...f, content: readFileSync(join(DIR, f.name), "utf8") }));

const RUN_ID = FILES[0].content.match(/^run_id:\s*"?([0-9A-Z]{26})"?/m)?.[1] ?? "";

export default function CapsuleDemoPage() {
  return (
    <DemoShell
      path={PATH}
      name="Run Capsule"
      title="Inside a Run Capsule"
      subtitle="A NovaFabric Run Capsule is a portable execution-evidence artifact you own: a directory of plain files. These are four of the files from one captured run, unedited."
      cli={[
        "nova capture python review.py --diff examples/sample.diff",
        "nova validate <run-id>",
        "nova replay <run-id> --mode forensic",
      ]}
    >
      <CapsuleFileBrowser runId={RUN_ID} files={FILES} />
      <p className="mt-4 max-w-3xl text-[13px] text-[var(--color-text-muted)] leading-relaxed">
        A full capture also writes <code className="font-mono">env.lock</code>,{" "}
        <code className="font-mono">redaction-proof.json</code>, <code className="font-mono">replay.yaml</code>,{" "}
        <code className="font-mono">lineage.jsonl</code> and the run&apos;s inputs and outputs; this fixture
        keeps the four shown here.{" "}
        <Link href="/docs/architecture/run-capsule/" className="text-[var(--color-accent)]">
          Every file, one by one →
        </Link>
      </p>

      <section className="mt-14">
        <h2 className="font-display text-[26px] text-[var(--color-text)] mb-3">Check the manifest against the schema</h2>
        <p className="text-[15px] text-[var(--color-text-muted)] leading-relaxed max-w-2xl mb-6">
          The manifest above, as JSON, validated against the{" "}
          <Link href="/spec/" className="text-[var(--color-accent)]">
            run-capsule JSON Schema
          </Link>{" "}
          that an installed CLI uses. Break it on purpose: the check has to turn red.
        </p>
        <CapsuleValidator />
      </section>
    </DemoShell>
  );
}
