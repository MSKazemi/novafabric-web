#!/usr/bin/env node
// Merge the Next.js export (the core site) with the Astro build (extra pages).
// Rule: the Next.js export is copied first and NEVER overwritten. Files from the
// Astro build are added only where the path does not already exist, so no page
// of the core site is removed or replaced. That includes robots.txt, llms.txt and
// the sitemap files: this (Next.js) site owns the domain root, so its copies win.
// Astro's /docs/ output is never copied at all: Next.js owns that tree.
//
// Sitemaps are the one exception to "add what is missing": the Astro build's own
// sitemap-index.xml / sitemap-0.xml are NOT copied. Two competing sitemaps for one
// domain disagree about which URLs exist (the Search Console "Discovered pages"
// counts differed), so the Astro-only pages are folded into the single sitemap.xml
// instead, and sitemap-index.xml is rewritten as a thin index over that one file so a
// previously submitted sitemap-index.xml URL keeps resolving.
//
// usage: node scripts/merge-sites.mjs <next-out> <astro-dist> <target>
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const [nextOut, astroDist, target] = process.argv.slice(2);
if (!nextOut || !astroDist || !target) {
  console.error("usage: merge-sites.mjs <next-out> <astro-dist> <target>");
  process.exit(2);
}
for (const d of [nextOut, astroDist]) {
  if (!existsSync(join(d, "index.html"))) {
    console.error(`not a built site (no index.html): ${d}`);
    process.exit(2);
  }
}

rmSync(target, { recursive: true, force: true });
cpSync(nextOut, target, { recursive: true });

let added = 0;
let skipped = 0;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const src = join(dir, name);
    const rel = relative(astroDist, src);
    if (statSync(src).isDirectory()) {
      walk(src);
      continue;
    }
    if (/^sitemap-.*\.xml$/.test(rel)) continue; // folded into sitemap.xml below
    // /docs/ belongs to the Next.js render. The Astro build renders the same markdown
    // a second time; letting it fill paths Next deliberately skips republished
    // excluded pages (docs/rfcs/_template went live and into the sitemap that way).
    if (rel === "docs" || rel.startsWith("docs/")) {
      skipped++;
      continue;
    }
    const dest = join(target, rel);
    if (existsSync(dest)) {
      skipped++;
      continue;
    }
    mkdirSync(join(dest, ".."), { recursive: true });
    cpSync(src, dest);
    added++;
  }
}
walk(astroDist);

// --- one sitemap -------------------------------------------------------------
const SITE = "https://novafabric.ai";
const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1]);
const astroSitemap = join(astroDist, "sitemap-0.xml");
const mainSitemap = join(target, "sitemap.xml");
let folded = 0;
if (existsSync(astroSitemap) && existsSync(mainSitemap)) {
  let xml = readFileSync(mainSitemap, "utf8");
  const have = new Set(locs(xml));
  const extra = [];
  for (const loc of locs(readFileSync(astroSitemap, "utf8"))) {
    if (have.has(loc)) continue;
    const path = loc.startsWith(SITE) ? loc.slice(SITE.length) : null;
    // Only list URLs this merged site actually serves.
    if (path === null || !existsSync(join(target, path, "index.html"))) continue;
    extra.push(`<url><loc>${loc}</loc></url>`);
  }
  if (extra.length) {
    xml = xml.replace("</urlset>", `${extra.join("\n")}\n</urlset>`);
    writeFileSync(mainSitemap, xml);
    folded = extra.length;
  }
}
writeFileSync(
  join(target, "sitemap-index.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${SITE}/sitemap.xml</loc></sitemap></sitemapindex>\n`,
);

writeFileSync(join(target, ".nojekyll"), "");
console.log(`merged: ${added} files added from the Astro build, ${skipped} existing paths kept from the Next.js export, ${folded} Astro-only URLs folded into sitemap.xml`);
