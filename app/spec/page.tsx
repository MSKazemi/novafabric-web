import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import JsonLd from "@/components/JsonLd";
import { PageHero } from "@/components/ui";
import { VERSION } from "@/lib/version";

const TITLE = "NovaFabric JSON Schemas — Run Capsule, Evidence Bundle, diff";
const DESCRIPTION =
  "The JSON Schemas (2020-12) an installed NovaFabric validates against: Run Capsule manifest, calls, environment, lineage, replay, Evidence Bundle and diff.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://novafabric.ai/spec/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://novafabric.ai/spec/",
    images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
  },
};

/*
 * The schemas an installed CLI validates against are the packaged copies under
 * src/novafabric/schemas/ ("IN FORCE" in their own $comment). The repository-root
 * schemas/run-capsule.schema.json is the v1.0 *target* and is not in force, so the
 * links below point at the packaged copies on purpose. Descriptions paraphrase each
 * schema's own `description` field.
 */
const PACKAGED = "https://github.com/MSKazemi/novafabric/blob/main/src/novafabric/schemas";
const V1_TARGET = "https://github.com/MSKazemi/novafabric/blob/main/schemas/run-capsule.schema.json";

const SCHEMAS: { file: string; title: string; holds: string; desc: string }[] = [
  { file: "run-capsule.schema.json", title: "RunCapsule", holds: "capsule.yaml", desc: "The top-level manifest of a Run Capsule: run id, status, command, timing, host, and references to every sub-file." },
  { file: "model-call.schema.json", title: "ModelCall", holds: "model-calls.jsonl", desc: "One record per LLM call, aligned with the OpenTelemetry GenAI semantic conventions." },
  { file: "tool-call.schema.json", title: "ToolCall", holds: "tool-calls.jsonl", desc: "One record per tool invocation: MCP-aligned, transport-agnostic, with a mutation class." },
  { file: "environment.schema.json", title: "EnvironmentLock", holds: "env.lock", desc: "The environment a replay needs to reconstruct: host, runtime, hardware, allow-listed variables, locale." },
  { file: "lineage-edge.schema.json", title: "LineageEdge", holds: "lineage.jsonl", desc: "One directed edge in the lineage graph between runs, assets and artifacts." },
  { file: "replay-policy.schema.json", title: "ReplayPolicy", holds: "replay.yaml", desc: "What replay may do with external resources and mutating tools." },
  { file: "replay-result.schema.json", title: "ReplayResult", holds: "replay_result.yaml", desc: "The output manifest of a replay: mode, status, policy flags used, environment warnings, what was mocked." },
  { file: "secret-redaction.schema.json", title: "RedactionProof", holds: "redaction-proof.json", desc: "What secret scanning detected, where, and how it was redacted, without storing the secrets themselves." },
  { file: "evidence-bundle.schema.json", title: "EvidenceBundle", holds: "manifest.json (bundle)", desc: "The manifest at the root of a signed Evidence Bundle, the second of the two formats NovaFabric defines." },
  { file: "diff-report.schema.json", title: "DiffReport", holds: "nova diff --output-format json", desc: "A structural diff between two Run Capsules: environment, model calls, tool calls and outputs." },
];

export default function SpecPage() {
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: "NovaFabric JSON Schemas",
    description: DESCRIPTION,
    url: "https://novafabric.ai/spec/",
    license: "https://www.apache.org/licenses/LICENSE-2.0",
    hasPart: SCHEMAS.map((s) => ({ "@type": "CreativeWork", name: s.file, url: `${PACKAGED}/${s.file}` })),
  };

  return (
    <>
      <JsonLd data={datasetSchema} />
      <Nav />
      <BreadcrumbJsonLd trail={[{ name: "Spec", path: "/spec/" }]} />
      <PageHero
        section="spec"
        title="Spec"
        subtitle="Every NovaFabric format is a JSON Schema 2020-12 document. NovaFabric defines two top-level formats, the Run Capsule and the Evidence Bundle; the rest describe the files inside them."
        tag={`v${VERSION}`}
      />
      <main className="page-max-w py-16">
        <div
          className="max-w-3xl rounded-md border border-edge p-4 mb-10 text-[14px] text-muted leading-relaxed"
          style={{ borderLeft: "3px solid var(--color-amber-true)" }}
        >
          <strong className="text-ink">Pre-1.0.</strong> These are the schemas an installed CLI validates
          against today (<code className="font-code text-ink">schema_version 0.1.0</code>). The format is
          documented but not frozen: the v1.0 freeze is a roadmap gate, and its{" "}
          <a href={V1_TARGET} className="text-amber">
            v1.0 target schema
          </a>{" "}
          is published separately and is not yet in force.
        </div>

        <ul className="grid gap-3 max-w-4xl">
          {SCHEMAS.map((s) => (
            <li key={s.file}>
              <a
                href={`${PACKAGED}/${s.file}`}
                className="flex items-start justify-between gap-4 rounded-lg border border-edge bg-surface p-5 hover:border-edge-2 transition-colors"
              >
                <span className="min-w-0">
                  <code className="font-code text-[14px] text-ink break-all">{s.file}</code>
                  <span className="ml-2 font-code text-[11px] text-faint">{s.title} · {s.holds}</span>
                  <span className="block mt-1.5 text-[14px] text-muted leading-relaxed">{s.desc}</span>
                </span>
                <span aria-hidden="true" className="text-faint shrink-0 mt-1">↗</span>
              </a>
            </li>
          ))}
        </ul>

        <section className="max-w-3xl mt-14">
          <h2 className="font-display text-[26px] text-ink mb-3">Check a capsule against them</h2>
          <p className="text-muted text-[15px] leading-relaxed mb-3">
            Locally, <code className="font-code text-ink">nova validate &lt;run-id&gt;</code> checks a capsule
            against these schemas, and <code className="font-code text-ink">nova validate --schemas</code> also
            checks each tool call&apos;s arguments and result against the schemas the tool declared.
          </p>
          <p className="text-muted text-[15px] leading-relaxed">
            In your browser, the{" "}
            <Link href="/demo/capsule/" className="text-amber">
              Run Capsule demo
            </Link>{" "}
            compiles <code className="font-code text-ink">run-capsule.schema.json</code> with Ajv and validates a
            captured manifest; break the manifest and it turns red. What each file holds is described file by
            file in{" "}
            <Link href="/docs/architecture/run-capsule/" className="text-amber">
              the Run Capsule docs
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
