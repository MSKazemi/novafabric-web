#!/usr/bin/env node
/**
 * Fails the build when an exported page links to an internal URL that does not exist.
 *
 * This exists because of a real outage of the quiet kind: `lib/docs.ts` rewrote
 * relative markdown links by file extension, so links to non-markdown files and to
 * directories were passed through untouched and resolved against `/docs/<slug>/`,
 * and links into the EXCLUDEd `releases/` tree were handed `/docs/` URLs for pages
 * the build never generates. Thirty dead links shipped, and the first report of it
 * was a Google Search Console "Not found (404)" notice weeks later.
 *
 * A unit test over the rewriter would only cover the cases someone thought of. This
 * walks what actually shipped, so a new doc that invents a new link shape is caught
 * by the same check.
 *
 * It checks `src` as well as `href` (img, source, script, iframe). It did not until
 * 2026-10-09: every architecture diagram in the docs was a relative `<img src>` that
 * resolved against the page URL and 404'd on the live site, and this check passed,
 * because it only ever looked at links.
 *
 * Same-host absolute URLs (https://novafabric.ai/…) are checked like site paths, and
 * every `#fragment` must name an id or name on the page it points to. The split CLI
 * reference rewrote hundreds of anchors; a fragment that misses lands the reader at
 * the top of a long page, which is a broken link that returns 200.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// `node scripts/check-links.mjs [dir]`. With no argument it checks the Next.js export
// (out/), which does not contain the Astro-served pages; with a directory (the merged
// site in CI) every link must resolve for real.
const ARG = process.argv[2];
const OUT = ARG ? resolve(ARG) : join(ROOT, "out");

/**
 * Paths served by the separate Astro build (see lib/site-nav.ts, `astro: true`). They
 * are absent from out/ by design, so the Next-only check accepts them; the merged-site
 * check (ARG given) does not, and fails if one is really missing.
 */
const ASTRO_PAGES = ARG
  ? []
  : [...readFileSync(join(ROOT, "lib", "site-nav.ts"), "utf8").matchAll(/href:\s*"([^"]+)"[^}]*astro:\s*true/g)].map((m) => m[1]);
const isAstroPage = (url) => ASTRO_PAGES.some((p) => url === p || url === p.replace(/\/$/, ""));

const SITE = "https://novafabric.ai";
/** Every spelling of this site's own origin that should be checked like a site path. */
const OWN_ORIGIN = /^(?:https?:)?\/\/(?:www\.)?novafabric\.ai(?=\/|$|[?#])/i;

/**
 * Fragment misses that come from the product's own markdown (rendered here, edited
 * in MSKazemi/novafabric). Each entry is exact and must say where the fix belongs.
 * An entry that no longer occurs is reported as a warning (remove it), not a failure:
 * the product fixing its own anchor must not block a website deploy.
 */
const KNOWN_UPSTREAM_FRAGMENTS = new Map([
  [
    "/docs/cli-reference/ -> #nova-eval-agentversion",
    "docs/cli-reference.md links #nova-eval-agentversion; the heading is `### nova eval agent` (broken on GitHub too)",
  ],
]);

/** Non-page assets that legitimately have no .html file behind them. */
const ASSET = /\.(?:png|jpe?g|gif|svg|webp|ico|css|js|json|xml|txt|pdf|woff2?|ttf|zip|yaml|yml|toml|cff)$/i;

function walk(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full));
    else if (entry.name.endsWith(".html")) found.push(full);
  }
  return found;
}

/** Does `url` correspond to something the export actually contains? */
function exists(url) {
  const path = decodeURIComponent(url.split("#")[0].split("?")[0]);
  const local = join(OUT, path);
  if (existsSync(local) && statSync(local).isFile()) return true;
  if (existsSync(join(local, "index.html"))) return true;
  if (existsSync(`${local.replace(/\/$/, "")}.html`)) return true;
  return ASSET.test(path) && existsSync(local);
}

if (!existsSync(OUT)) {
  console.error(`No export found at ${OUT}. Run "npm run build" first.`);
  process.exit(1);
}

const pages = walk(OUT);
const broken = [];

/** ids and names per exported page, keyed by its URL path ("/docs/x/"). */
const anchors = new Map();
const pathOf = (file) => (file.slice(OUT.length).replace(/index\.html$/, "").replace(/\.html$/, "/") || "/");
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  // id on any element; name only on anchors (a <meta name="description"> is not a target)
  const targets = [
    ...[...html.matchAll(/<[a-z][^>]*?\sid="([^"]+)"/gi)].map((m) => m[1]),
    ...[...html.matchAll(/<a\b[^>]*?\sname="([^"]+)"/gi)].map((m) => m[1]),
  ];
  anchors.set(pathOf(page), new Set(targets));
}
const seenUpstream = new Set();
const fragmentMisses = (from, url) => {
  const [path, fragment] = url.split("#");
  if (!fragment || fragment.startsWith(":~:")) return false; // text fragments are not ids
  const target = (path || from).split("?")[0].replace(/([^/])$/, "$1/");
  const ids = anchors.get(target);
  if (!ids) return false; // not a page (asset), or reported as missing already
  let id = fragment;
  try { id = decodeURIComponent(fragment); } catch { /* keep raw */ }
  if (ids.has(id) || ids.has(fragment) || id === "top") return false;
  const key = `${from} -> ${url}`;
  if (KNOWN_UPSTREAM_FRAGMENTS.has(key)) { seenUpstream.add(key); return false; }
  return true;
};

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const from = page.slice(OUT.length) || "/";
  const fromPath = pathOf(page);
  for (const [, attr, raw] of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    const href = raw.replace(/&amp;/g, "&");
    // Same-page fragments: the id must exist here.
    if (href.startsWith("#")) {
      if (attr === "href" && fragmentMisses(fromPath, href)) broken.push({ from, href, why: "no element with that id on this page" });
      continue;
    }
    // Same-host absolute URLs are internal links written the long way.
    const own = OWN_ORIGIN.exec(href);
    const url = own ? href.slice(own[0].length) || "/" : href;
    // Only site-internal paths. Relative URLs surviving to the export are
    // themselves the bug this check was written for, so they are flagged too.
    if (/^(?:[a-z]+:|\/\/)/i.test(url)) continue;
    if (!url.startsWith("/")) { broken.push({ from, href, why: `relative ${attr} in exported HTML` }); continue; }
    if (!exists(url) && !isAstroPage(url)) { broken.push({ from, href, why: `${attr}: no such page or asset in out/` }); continue; }
    if (attr === "href" && fragmentMisses(fromPath, url)) broken.push({ from, href, why: "target page has no element with that id" });
  }
}

for (const [key, reason] of KNOWN_UPSTREAM_FRAGMENTS) {
  if (!anchors.has(key.split(" -> ")[0])) continue; // that page is not in this export (fixtures)
  if (!seenUpstream.has(key)) console.warn(`warning: KNOWN_UPSTREAM_FRAGMENTS entry no longer occurs, remove it: ${key} (${reason})`);
}

console.log(`checked ${pages.length} exported pages (links, sources, same-host URLs and fragments)`);
if (broken.length) {
  console.error(`\n${broken.length} broken internal link(s) or source(s):\n`);
  for (const b of broken) console.error(`  ${b.from}\n    -> ${b.href}   (${b.why})`);
  process.exit(1);
}
console.log("no broken internal links or sources");
