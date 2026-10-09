/**
 * The capsule gallery (/capsules/ and the home page's "Example capsules" section).
 *
 * Every number and file name below is read from real capsule files at build time.
 * Until 2026-10-09 this list was three hand-written snippets (span counts, call
 * counts, capsule ids) labelled "real-world community examples"; none came from a
 * recorded run and none was a community submission. Only capsules that exist as
 * files are listed here, and the text says what each one is.
 *
 * Sources:
 *   - examples/capsules/minimal-run/ in the product repository: a capture of
 *     examples/minimal-agent-run/agent.py committed by the maintainers. Read from
 *     the checkout scripts/sync-docs.mjs puts in place (or $NOVAFABRIC_DOCS/..).
 *   - lib/data/demo/fixtures/capsules/RUN_A/: the showcase fixture the in-browser
 *     demos read (a byte-for-byte copy of the product's fixture; see
 *     lib/demo/fixtures.ts). A fixture in the Run Capsule format, not a recording.
 *
 * Server-only (node:fs). Client components receive these entries as props.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { CapsuleEntry } from "../types";

const PRODUCT_ROOT = process.env.NOVAFABRIC_DOCS
  ? resolve(process.env.NOVAFABRIC_DOCS, "..")
  : resolve(process.cwd(), ".docs-src");
const TREE = "https://github.com/MSKazemi/novafabric/tree/main";

/** Non-empty lines of a JSONL file; 0 when the file is absent. */
function records(file: string): number {
  if (!existsSync(file)) return 0;
  return readFileSync(file, "utf8").split("\n").filter((line) => line.trim()).length;
}

/** A top-level `key: value` scalar from capsule.yaml (quoted or not). */
function scalar(yaml: string, key: string): string {
  const value = yaml.match(new RegExp(`^${key}:\\s*"?([^"\\n]*)"?\\s*$`, "m"))?.[1];
  if (!value) throw new Error(`capsule.yaml has no ${key}`);
  return value;
}

/** The `command:` list from capsule.yaml, in either block style the product writes. */
function command(yaml: string): string {
  const block = yaml.match(/^command:\s*\n((?:[ \t]*-[^\n]*\n?)+)/m)?.[1];
  if (!block) throw new Error("capsule.yaml has no command list");
  return block
    .split("\n")
    .map((line) => line.replace(/^[ \t]*-[ \t]*/, "").replace(/^"(.*)"$/, "$1").trim())
    .filter(Boolean)
    .join(" ");
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * `captured` is true only for a capsule known to come from `nova capture` (the
 * repository example's README says so). A fixture shows its recorded command as a
 * field instead of a `$ nova capture …` prompt, which would claim a run happened.
 */
function read(dir: string, captured: boolean) {
  const yaml = readFileSync(join(dir, "capsule.yaml"), "utf8");
  const spans = records(join(dir, "trace.jsonl"));
  const modelCalls = records(join(dir, "model-calls.jsonl"));
  const toolCalls = records(join(dir, "tool-calls.jsonl"));
  const has = (file: string) => existsSync(join(dir, file));
  const snippet = [
    captured ? `$ nova capture ${command(yaml)}` : `  command ${command(yaml)}`,
    "",
    `  run_id  ${scalar(yaml, "run_id")}`,
    `  capsule.yaml        ✓   status ${scalar(yaml, "status")}, written by novafabric ${scalar(yaml, "novafabric_version")}`,
    // Only files that exist get a line, so a missing file can never show a ✓.
    ...(has("trace.jsonl") ? [`  trace.jsonl         ✓   ${plural(spans, "span")}`] : []),
    ...(has("model-calls.jsonl") ? [`  model-calls.jsonl   ✓   ${plural(modelCalls, "model call")}`] : []),
    ...(has("tool-calls.jsonl") ? [`  tool-calls.jsonl    ✓   ${plural(toolCalls, "tool call")}`] : []),
    ...(has("env.lock") ? ["  env.lock            ✓   host, interpreter, packages"] : []),
    ...(has("replay.yaml") ? ["  replay.yaml         ✓   replay policy"] : []),
    ...(has("redaction-proof.json") ? ["  redaction-proof.json ✓  secret-scan record"] : []),
  ];
  const files = [
    "the manifest",
    has("trace.jsonl") && "the trace",
    has("env.lock") && "the environment lock",
    has("replay.yaml") && "the replay policy",
    has("redaction-proof.json") && "the secret-scan record",
  ].filter(Boolean) as string[];
  return { snippet, modelCalls, toolCalls, files };
}

function minimalRun(): CapsuleEntry {
  const dir = join(PRODUCT_ROOT, "examples", "capsules", "minimal-run");
  if (!existsSync(join(dir, "capsule.yaml"))) {
    throw new Error(`Example capsule not found at ${dir}. Run "npm run sync-docs" first.`);
  }
  const { snippet, modelCalls, toolCalls, files } = read(dir, true);
  const list = files.length > 1 ? `${files.slice(0, -1).join(", ")} and ${files[files.length - 1]}` : files.join("");
  const calls =
    modelCalls + toolCalls === 0
      ? "It makes no model or tool calls, so it shows the files a capture writes for any command"
      : `It records ${plural(modelCalls, "model call")} and ${plural(toolCalls, "tool call")}`;
  return {
    project: "minimal agent run",
    useCase: `A real capture committed to the NovaFabric repository: examples/minimal-agent-run/agent.py run under nova capture, with no code changes. ${calls}: ${list}.`,
    snippet,
    repo: `${TREE}/examples/capsules/minimal-run`,
    tags: ["repository example", "python", "no code changes"],
  };
}

function demoFixture(): CapsuleEntry {
  const dir = join(process.cwd(), "lib", "data", "demo", "fixtures", "capsules", "RUN_A");
  const { snippet, modelCalls, toolCalls } = read(dir, false);
  return {
    project: "code-review agent · demo fixture",
    useCase: `The capsule the in-browser demos on this site read: a code-review agent with ${plural(modelCalls, "model call")} and ${plural(toolCalls, "tool call")}, its trace, and the input diff and output review its manifest references. It is a showcase fixture in the Run Capsule format, not a recording of a real run.`,
    snippet,
    repo: `${TREE}/ui/dashboard/src/data/fixtures/capsules/RUN_A`,
    tags: ["demo fixture", "model calls", "tool calls"],
  };
}

export const CAPSULES: CapsuleEntry[] = [minimalRun(), demoFixture()];
