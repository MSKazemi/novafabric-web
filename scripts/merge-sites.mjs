#!/usr/bin/env node
// Merge the Next.js export (the core site) with the Astro build (extra pages).
// Rule: the Next.js export is copied first and NEVER overwritten. Files from the
// Astro build are added only where the path does not already exist, so no page
// of the core site is removed or replaced. That includes robots.txt, llms.txt and
// the sitemap files: this (Next.js) site owns the domain root, so its copies win.
//
// usage: node scripts/merge-sites.mjs <next-out> <astro-dist> <target>
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
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

writeFileSync(join(target, ".nojekyll"), "");
console.log(`merged: ${added} files added from the Astro build, ${skipped} existing paths kept from the Next.js export`);
