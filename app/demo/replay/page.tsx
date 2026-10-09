import type { Metadata } from "next";
import { DemoShell, demoMetadata } from "@/components/demo/DemoShell";
import ReplayViewer from "@/components/demo/showcase/ReplayViewer";

const PATH = "/demo/replay/";

export const metadata: Metadata = demoMetadata(
  PATH,
  "Replay modes and structural diff — NovaFabric demo",
  "What each of the five NovaFabric replay modes does (intervention is experimental; tools run live in mocked replay), plus a structural diff of two runs.",
);

export default function ReplayDemoPage() {
  return (
    <DemoShell
      path={PATH}
      name="Replay & diff"
      title="Replay & structural diff"
      subtitle="Pick a replay mode and read what it guarantees. Below, a structural diff of two runs of the same agent with a different prompt version and a different output."
      cli={[
        "nova replay <run-id> --mode forensic",
        "nova replay <run-id> --mode mocked",
        "nova diff <run-a> <run-b>",
        "nova diff <run-a> <run-b> --output-format github-annotation",
      ]}
    >
      <ReplayViewer />
      <aside className="mt-12 max-w-3xl rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-5 text-sm text-[var(--color-text-muted)] leading-relaxed">
        <p className="text-[var(--color-text)] font-medium mb-2">Where to look</p>
        <p>
          Open the <strong>Exact</strong> tab. It replays nothing: it checks whether a byte-exact re-run is even
          possible, and for a run against a remote model the answer is no, with the reasons. Then open{" "}
          <strong>Mocked</strong>: model replies come from the capsule, and the tool calls that ran live are marked
          as such. In CI, <code className="font-mono">nova diff --assert-no-regressions</code> exits 1 on any
          structural change, including added or removed calls.
        </p>
      </aside>
    </DemoShell>
  );
}
