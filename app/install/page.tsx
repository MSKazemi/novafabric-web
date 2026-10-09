import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import JsonLd from "@/components/JsonLd";
import CopyButton from "@/components/CopyButton";
import { PageHero, TerminalFrame } from "@/components/ui";
import { INSTALL_COMMAND, REQUIRES_PYTHON, VERSION } from "@/lib/version";

/*
 * Every command on this page is checked against `nova <cmd> --help` of the release
 * named by VERSION (read from the product's pyproject.toml at build time). Do not add
 * a flag here without finding it in that help text: an install page that fails on
 * the second command loses the reader for good.
 */

const TITLE = "Install NovaFabric — capture and replay AI agent runs";
const DESCRIPTION = `pip install novafabric (Python ${REQUIRES_PYTHON}), then capture, replay and diff your first AI agent run. No account, no telemetry; Run Capsules stay on your machine.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://novafabric.ai/install/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://novafabric.ai/install/",
    images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
  },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Install NovaFabric and capture a first AI agent run",
  description: DESCRIPTION,
  url: "https://novafabric.ai/install/",
  supply: [{ "@type": "HowToSupply", name: `Python ${REQUIRES_PYTHON}` }],
  tool: [{ "@type": "HowToTool", name: "pip or uv" }],
  step: [
    { "@type": "HowToStep", name: "Install", text: `Run ${INSTALL_COMMAND}, then nova --version.` },
    { "@type": "HowToStep", name: "Capture a run", text: "Wrap the command with nova capture, for example nova capture python your_agent.py." },
    { "@type": "HowToStep", name: "Validate and replay", text: "Run nova validate <run-id>, then nova replay <run-id> --mode forensic." },
    { "@type": "HowToStep", name: "Compare two runs", text: "Capture a second run and compare them with nova diff <run-a> <run-b>." },
  ],
};

function Cmd({ lines, title }: { lines: string[]; title?: string }) {
  return (
    <TerminalFrame title={title}>
      <div style={{ whiteSpace: "pre-wrap" }}>
        {lines.map((line) =>
          line.startsWith("#") ? (
            <div key={line} className="text-faint">
              {line}
            </div>
          ) : (
            <div key={line} className="flex items-start justify-between gap-3">
              <span>
                <span className="text-jade">$</span> {line}
              </span>
              <CopyButton text={line} />
            </div>
          ),
        )}
      </div>
    </TerminalFrame>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section id={`step-${n}`} className="mb-16 max-w-3xl">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="section-number">{n}/</span>
        <h2 className="font-display text-[28px] text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

const P = "text-muted text-[15px] leading-relaxed mb-5 max-w-2xl";
const CODE = "font-code text-[0.9em] text-ink";

export default function InstallPage() {
  return (
    <>
      <JsonLd data={howToSchema} />
      <Nav />
      <BreadcrumbJsonLd trail={[{ name: "Install", path: "/install/" }]} />
      <PageHero
        section="install"
        title="Install"
        subtitle="Three commands to a first replayable run. No account, no telemetry; Run Capsules stay on your machine."
        tag={`v${VERSION}`}
      />
      <main className="page-max-w py-16">
        <Step n="01" title="Install">
          <p className={P}>
            NovaFabric needs Python {REQUIRES_PYTHON}. Install it with pip, add it to a uv project, or install the
            CLI as an isolated tool so nothing leaks into a project&apos;s environment.
          </p>
          <Cmd lines={[INSTALL_COMMAND, "uv add novafabric", "uv tool install novafabric"]} />
          <p className={`${P} mt-5`}>Then check the CLI is on your path:</p>
          <Cmd lines={["nova --version"]} />
          <p className={`${P} mt-5 mb-0`}>
            <code className={CODE}>nova</code> and <code className={CODE}>novafabric</code> are the same
            command. The base install covers everything on this page; optional extras exist for the dashboard,
            server mode and other integrations, and <code className={CODE}>nova doctor --check-extras</code>{" "}
            lists which you have.
          </p>
        </Step>

        <Step n="02" title="Capture your first run">
          <p className={P}>
            Wrap any command with <code className={CODE}>nova capture</code>. Wrapping needs no code changes:
            for Python workloads, model calls are captured automatically; other clients can send their model
            traffic through <code className={CODE}>nova api-proxy</code>.
          </p>
          <Cmd lines={["nova capture python your_agent.py"]} />
          <p className={`${P} mt-5 mb-0`}>
            The command runs as usual and keeps its own exit code. NovaFabric prints a run id and writes a{" "}
            <Link href="/docs/architecture/run-capsule/" className="text-amber">
              Run Capsule
            </Link>{" "}
            to <code className={CODE}>~/.novafabric/capsules/&lt;run-id&gt;/</code>: the manifest, execution
            spans, the model and tool calls capture could see, an environment snapshot and a secret-scan record.
            Prompts and responses are stored in the capsule, on your machine.
          </p>
        </Step>

        <Step n="03" title="Validate, replay, compare">
          <p className={P}>
            <code className={CODE}>validate</code>, <code className={CODE}>replay</code> and{" "}
            <code className={CODE}>diff</code> take the run id that capture printed.
          </p>
          <Cmd
            lines={[
              "nova validate <run-id>",
              "nova replay <run-id> --mode forensic",
              "nova replay <run-id> --mode mocked",
              "nova diff <run-a> <run-b>",
            ]}
          />
          <p className={`${P} mt-5 mb-0`}>
            Forensic replay is read-only: it inspects the capsule and runs nothing. Mocked replay re-runs the
            command and serves the recorded model replies from the capsule, so no model call is made, but{" "}
            <strong className="text-ink">tool calls still run live</strong>. Use{" "}
            <code className={CODE}>nova replay --dry-run &lt;run-id&gt;</code> to see what would execute first.
            The{" "}
            <Link href="/docs/architecture/replay-modes/" className="text-amber">
              five replay modes
            </Link>{" "}
            are described in the docs; <code className={CODE}>intervention</code> is experimental. Every flag
            of <code className={CODE}>nova replay</code> and <code className={CODE}>nova diff</code> is in the{" "}
            <Link href="/docs/cli-reference/replay-and-diff/" className="text-amber">
              replay and diff command reference
            </Link>
            .
          </p>
        </Step>

        <Step n="04" title="Optional set-up">
          <p className={P}>
            <code className={CODE}>nova init</code> creates <code className={CODE}>~/.novafabric/</code> up front
            and generates a local Ed25519 key pair. It is optional: capture creates what it needs on first use.{" "}
            <code className={CODE}>nova doctor</code> checks the installation.
          </p>
          <Cmd lines={["nova init", "nova doctor"]} />
          <p className={`${P} mt-5 mb-0`}>
            A default capture is not sealed. To seal capsules with your own key and verify them offline later,
            configure <code className={CODE}>novaseal.yaml</code>; see{" "}
            <Link href="/docs/tutorials/prove-a-run-to-an-auditor/" className="text-amber">
              verify a sealed run for an auditor
            </Link>
            .
          </p>
        </Step>

        <Step n="05" title="Other ways to run it">
          <ul className="text-muted text-[15px] leading-relaxed space-y-3 max-w-2xl list-disc pl-5">
            <li>
              <strong className="text-ink">No internet access:</strong>{" "}
              <Link href="/docs/ops/air-gapped-install/" className="text-amber">
                air-gapped installation
              </Link>
              . The core workflow (capture, validate, replay, diff, lineage) needs no network.
            </li>
            <li>
              <strong className="text-ink">Container image</strong> for server mode:{" "}
              <code className={CODE}>docker pull ghcr.io/mskazemi/novafabric:{VERSION}</code>, with{" "}
              <Link href="/docs/ops/server-deployment/" className="text-amber">
                server deployment
              </Link>{" "}
              covering Compose, Helm and signature verification.
            </li>
            <li>
              <strong className="text-ink">Non-Python clients:</strong> how{" "}
              <Link href="/docs/tutorials/how-capture-works/" className="text-amber">
                capture works
              </Link>
              , including <code className={CODE}>nova api-proxy</code>.
            </li>
          </ul>
        </Step>

        <section className="max-w-3xl border-t border-edge pt-12">
          <h2 className="font-display text-[28px] text-ink mb-4">Next</h2>
          <p className={P}>
            The{" "}
            <Link href="/docs/getting-started/" className="text-amber">
              getting-started guide
            </Link>{" "}
            walks the whole loop in 10–15 minutes: capture, validate, a real LLM call, replay, diff, lineage and
            a signed Evidence Bundle. Prefer to look first? The{" "}
            <Link href="/demo/" className="text-amber">
              demo
            </Link>{" "}
            runs in your browser, no install needed.
          </p>
          <p className="text-faint text-[13px] leading-relaxed max-w-2xl">
            NovaFabric is pre-1.0 (v{VERSION}): the Run Capsule format is documented but not frozen, and
            several surfaces are labelled experimental. Something above does not work as written?{" "}
            <a href="https://github.com/MSKazemi/novafabric/issues/new/choose" className="text-amber">
              That is a bug; please report it
            </a>
            .
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
