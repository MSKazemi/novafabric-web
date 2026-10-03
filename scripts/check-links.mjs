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

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const from = page.slice(OUT.length) || "/";
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    // Only site-internal absolute paths. Relative hrefs surviving to the export are
    // themselves the bug this check was written for, so they are flagged too.
    if (/^(?:[a-z]+:|\/\/|#)/i.test(href)) continue;
    if (!href.startsWith("/")) { broken.push({ from, href, why: "relative href in exported HTML" }); continue; }
    if (!exists(href) && !isAstroPage(href)) broken.push({ from, href, why: "no such page or asset in out/" });
  }
}

console.log(`checked ${pages.length} exported pages`);
if (broken.length) {
  console.error(`\n${broken.length} broken internal link(s):\n`);
  for (const b of broken) console.error(`  ${b.from}\n    -> ${b.href}   (${b.why})`);
  process.exit(1);
}
console.log("no broken internal links");
