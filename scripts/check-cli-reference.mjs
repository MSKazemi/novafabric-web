#!/usr/bin/env node
/**
 * Fails the build when splitting the CLI reference loses or breaks anything.
 *
 * docs/cli-reference.md is one long document in the product repository; this site
 * publishes it as an index plus one page per command area (lib/cli-reference.ts).
 * A split like that fails quietly: a heading the grouping regexes stop matching, two
 * groups that share a slug, or an anchor that moved without a forward all render as
 * a perfectly normal page. This checks the export against the source:
 *
 *   sections   every heading of the source is a heading (same id) on the index or on
 *              a child page. Nothing is dropped.
 *   ids        no heading id appears twice on one page (the second is unreachable).
 *   slugs      the GROUPS table in lib/cli-reference.ts has no duplicate slug.
 *   bookmarks  every source heading id that is not on the index is in the index's
 *              forwarding map, and points at the child page that holds it, so an old
 *              /docs/cli-reference/#id link still arrives.
 *
 * `node scripts/check-cli-reference.mjs [outDir] [cli-reference.md]` — defaults to
 * out/ and the synced docs checkout. Heading ids come from lib/markdown.ts itself,
 * so this cannot drift from the renderer.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(process.argv[2] ?? join(ROOT, "out"));
const DOCS = process.env.NOVAFABRIC_DOCS ? resolve(process.env.NOVAFABRIC_DOCS) : join(ROOT, ".docs-src", "docs");
const SOURCE = resolve(process.argv[3] ?? join(DOCS, "cli-reference.md"));
const GROUPS_FILE = process.env.CLI_GROUPS_FILE ?? join(ROOT, "lib", "cli-reference.ts"); // overridable for tests
const INDEX = join(OUT, "docs", "cli-reference");

const { headingId } = await import(pathToFileURL(join(ROOT, "lib", "markdown.ts")).href);

for (const [what, path] of [["export", join(INDEX, "index.html")], ["source", SOURCE]]) {
  if (!existsSync(path)) {
    console.error(`No CLI reference ${what} at ${path}. Run "npm run build" first.`);
    process.exit(1);
  }
}

const problems = [];
const ids = (html) => [...html.matchAll(/<h[1-6]\b[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);

/** Source heading ids, in order, skipping fenced code. Inline `\<x\>` renders as `&lt;x&gt;`. */
const sourceIds = [];
let fence = null;
for (const line of readFileSync(SOURCE, "utf8").split("\n")) {
  const marker = line.match(/^\s*(```|~~~)/)?.[1];
  if (marker) { fence = fence === null ? marker : fence === marker ? null : fence; continue; }
  if (fence) continue;
  const heading = line.match(/^#{1,6}\s+(.+?)\s*$/);
  if (heading) {
    const text = heading[1]
      .replace(/\s+#+\s*$/, "") // closing hashes ("## Title ##")
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links and images render as their text
      .replace(/\\</g, "&lt;")
      .replace(/\\>/g, "&gt;");
    sourceIds.push(headingId(text));
  }
}

const pages = new Map([["cli-reference", readFileSync(join(INDEX, "index.html"), "utf8")]]);
for (const entry of readdirSync(INDEX, { withFileTypes: true })) {
  const file = join(INDEX, entry.name, "index.html");
  if (entry.isDirectory() && existsSync(file)) pages.set(`cli-reference/${entry.name}`, readFileSync(file, "utf8"));
}
const where = new Map();
for (const [slug, html] of pages) {
  const own = ids(html);
  const repeated = own.filter((id, i) => own.indexOf(id) !== i);
  for (const id of new Set(repeated)) problems.push(`/docs/${slug}/: heading id "${id}" appears more than once`);
  for (const id of own) if (!where.has(id)) where.set(id, slug);
}

// sections: each source heading id must occur on the pages at least as often as in
// the source. Repeats on one page are suffixed (-1, -2) by the renderer; repeats that
// the split put on different pages keep the plain id.
const need = new Map();
for (const id of sourceIds) need.set(id, (need.get(id) ?? 0) + 1);
const have = new Map();
for (const html of pages.values()) {
  for (const id of ids(html)) {
    const base = need.has(id) ? id : id.replace(/-\d+$/, "");
    have.set(base, (have.get(base) ?? 0) + 1);
  }
}
for (const [id, n] of need) {
  if ((have.get(id) ?? 0) < n) problems.push(`source heading "#${id}" occurs ${n}× in the source but ${have.get(id) ?? 0}× on the CLI reference pages (section lost in the split?)`);
}
const expected = [...need.keys()];

// slugs
const slugs = [...readFileSync(GROUPS_FILE, "utf8").matchAll(/\bslug:\s*"([^"]+)"/g)].map((m) => m[1]);
for (const slug of new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i))) {
  problems.push(`lib/cli-reference.ts: slug "${slug}" is used by more than one group`);
}

// bookmarks
const script = pages.get("cli-reference").match(/var d=(\{[\s\S]*?\});var h=location\.hash/);
const forward = script ? JSON.parse(script[1].replace(/\\u003c/g, "<")) : null;
if (!forward) problems.push("/docs/cli-reference/: no forwarding map for pre-split anchors");
const onIndex = new Set(ids(pages.get("cli-reference")));
let forwarded = 0;
for (const id of new Set(expected)) {
  if (onIndex.has(id) || !where.has(id)) continue;
  if (!forward) break;
  const index = forward.i[id];
  if (index === undefined) { problems.push(`#${id}: moved to /docs/${where.get(id)}/ but not forwarded from the index`); continue; }
  const target = forward.s[index];
  if (!ids(pages.get(target) ?? "").includes(id)) problems.push(`#${id}: forwarded to /docs/${target}/, which has no such heading`);
  forwarded += 1;
}

console.log(
  `checked the CLI reference: ${expected.length} source headings, ${pages.size} pages, ` +
    `${slugs.length} group slugs, ${forwarded} forwarded anchors`,
);
if (problems.length) {
  console.error(`\n${problems.length} CLI reference problem(s):\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log("no CLI reference problems");
