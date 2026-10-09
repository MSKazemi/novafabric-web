#!/usr/bin/env node
/**
 * Fails the build when the export breaks a search-indexing invariant.
 *
 * check-links.mjs proves every internal link resolves. This proves that what
 * those links reach tells crawlers one consistent story, checked on what actually
 * shipped (out/), not on the source:
 *
 *   sitemap.xml   every URL is a real page: exported, not a redirect stub, not
 *                 noindex, self-canonical, og:url equal to the canonical, one
 *                 <title>, one meta description, one <h1>, parseable JSON-LD.
 *   pages         every other indexable page is listed (nothing indexable is
 *                 left out of the sitemap).
 *   stubs         a retired URL (components/RedirectStub.tsx) is an instant meta
 *                 refresh whose canonical and og:url name its target. The target
 *                 is a listed page, never another stub (no chains). The stub is
 *                 not listed and carries no noindex (see RedirectStub.tsx).
 *   robots.txt    no group for *, Googlebot or bingbot disallows the site, and
 *                 it points at the sitemap.
 *   descriptions  at most 160 characters on a sitemap page (search engines cut
 *                 longer ones mid-sentence; seven pages did until 2026-10-09).
 *   claims        no rendered page and no llms.txt says what the product's claim
 *                 matrix marks unsafe: see CLAIMS below. Docs pages are rendered from the
 *                 product repository, so marketing-only wording is checked outside
 *                 /docs/ only.
 *
 * Every rule here exists because its failure is silent: a wrong canonical or a
 * stray noindex renders perfectly and shows up weeks later as a Search Console
 * "Excluded" row. The 2026-10-08 audit found stubs inheriting the home page's
 * og:url, which is how this file started.
 *
 * `node scripts/check-seo.mjs [dir]` checks out/ by default.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.argv[2] ? resolve(process.argv[2]) : join(ROOT, "out");
const BASE = "https://novafabric.ai";

/** Longest meta description a sitemap page may carry. */
const MAX_DESCRIPTION = 160;

/**
 * Wording the claim matrix marks "not safe", as rendered text. Each entry names the
 * matrix row it enforces. `marketing: true` = checked outside /docs/ only, where the
 * product docs use the word technically (e.g. the separate multi-tenant `nova
 * server` API) rather than as a claim.
 */
const CLAIMS = [
  { re: /\b(?:4|four|3|three)\s+(?:replay\s+modes|ways\s+to\s+replay)\b/i, row: "Replay: five modes" },
  { re: /\b(?:8|eight|13|thirteen)\s+(?:framework\s+)?(?:adapters|drop-in\s+wrappers)\b/i, row: "Adapters: 11, experimental" },
  { re: /proof\s+that\s+no\s+secrets|secret-redacted\s+capsules?/i, row: "Secret scanning: secret-scanned, not proof of absence" },
  { re: /\btamper-proof\b/i, row: "Evidence Bundle: tamper-evident, not tamper-proof" },
  { re: /\bcatch(?:es)?\s+regressions\b/i, row: "CI gate: fails on any change" },
  { re: /\bfive-layer\b/i, row: "Architecture: six domains (five planes is the ingestion path only)" },
  { re: /\bmulti-tenant\b/i, row: "Deployment: not multi-tenant", marketing: true },
  { re: /\bcommunity\s+examples?\b/i, row: "Capsule gallery: no third-party capsules yet", marketing: true },
];

/** Visible text of a page: scripts, styles and tags removed, entities decoded. */
const visibleText = (html) =>
  decode(
    html
      .replace(/<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  ).replace(/\s+/g, " ");

/** Framework error pages: served with a real 404 status, never meant for the index. */
const ERROR_PAGES = new Set(["/404/", "/_not-found/"]);

if (!existsSync(join(OUT, "sitemap.xml"))) {
  console.error(`No export with a sitemap found at ${OUT}. Run "npm run build" first.`);
  process.exit(1);
}

function walk(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full));
    else if (entry.name === "index.html") found.push(full);
  }
  return found;
}

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");

/** Reads the head-level SEO tags of one exported page. */
function inspect(file) {
  const html = readFileSync(file, "utf8");
  const head = html.split("</head>")[0];
  const all = (re) => [...head.matchAll(re)].map((m) => decode(m[1]));
  const metaContent = (attr, name) =>
    all(new RegExp(`<meta[^>]*\\b${attr}="${name}"[^>]*\\bcontent="([^"]*)"`, "g")).concat(
      all(new RegExp(`<meta[^>]*\\bcontent="([^"]*)"[^>]*\\b${attr}="${name}"`, "g")),
    );
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  return {
    text: visibleText(html.split("</head>").slice(1).join("</head>")),
    titles: all(/<title>([\s\S]*?)<\/title>/g),
    descriptions: metaContent("name", "description"),
    robots: metaContent("name", "robots").join(","),
    canonicals: all(/<link[^>]*\brel="canonical"[^>]*\bhref="([^"]*)"/g),
    ogUrls: metaContent("property", "og:url"),
    refresh: metaContent("http-equiv", "refresh")[0],
    h1: (html.match(/<h1[\s>]/g) || []).length,
    badJsonLd: jsonLd.filter((blob) => {
      try { JSON.parse(blob); return false; } catch { return true; }
    }).length,
  };
}

const problems = [];
const fail = (url, why) => problems.push({ url, why });

const sitemap = new Set([...readFileSync(join(OUT, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
const pages = new Map(
  walk(OUT).map((file) => {
    const rel = file.slice(OUT.length).replace(/index\.html$/, "").replace(/\\/g, "/");
    return [rel || "/", inspect(file)];
  }),
);
const isStub = (path) => Boolean(pages.get(path)?.refresh);
const noindex = (page) => /\bnoindex\b/i.test(page.robots);

// sitemap.xml → real, consistent pages
for (const url of sitemap) {
  if (!url.startsWith(`${BASE}/`)) { fail(url, "sitemap URL is not on the canonical host"); continue; }
  const path = url.slice(BASE.length);
  const page = pages.get(path);
  if (!page) { fail(url, "listed in sitemap.xml but not exported"); continue; }
  if (page.refresh) fail(url, "listed in sitemap.xml but is a redirect stub");
  if (noindex(page)) fail(url, "listed in sitemap.xml but noindex");
  if (page.canonicals.length !== 1 || page.canonicals[0] !== url) fail(url, `canonical is ${JSON.stringify(page.canonicals)}, expected self`);
  if (page.ogUrls.length !== 1 || page.ogUrls[0] !== url) fail(url, `og:url is ${JSON.stringify(page.ogUrls)}, expected the canonical`);
  if (page.titles.length !== 1 || !page.titles[0].trim()) fail(url, `${page.titles.length} <title> elements`);
  if (page.descriptions.length !== 1 || !page.descriptions[0].trim()) fail(url, `${page.descriptions.length} meta descriptions`);
  if (page.h1 !== 1) fail(url, `${page.h1} <h1> elements`);
  if (page.badJsonLd) fail(url, `${page.badJsonLd} JSON-LD block(s) do not parse`);
  if (page.descriptions[0] && page.descriptions[0].length > MAX_DESCRIPTION) {
    fail(url, `meta description is ${page.descriptions[0].length} characters (max ${MAX_DESCRIPTION})`);
  }
  for (const claim of CLAIMS) {
    if (claim.marketing && path.startsWith("/docs/")) continue;
    const hit = claim.re.exec(page.text);
    if (hit) fail(url, `says "${hit[0]}" — claim matrix row "${claim.row}"`);
  }
}

// llms.txt is written for answer engines; it gets the same claim check.
const llmsFile = join(OUT, "llms.txt");
if (existsSync(llmsFile)) {
  const llms = readFileSync(llmsFile, "utf8");
  for (const claim of CLAIMS) {
    const hit = claim.re.exec(llms);
    if (hit) fail("/llms.txt", `says "${hit[0]}" — claim matrix row "${claim.row}"`);
  }
}

// every other exported page: either listed, a stub, an error page, or explicitly noindex
for (const [path, page] of pages) {
  const url = `${BASE}${path}`;
  if (sitemap.has(url) || ERROR_PAGES.has(path)) continue;
  if (!page.refresh) {
    if (!noindex(page)) fail(url, "indexable page missing from sitemap.xml");
    continue;
  }
  // redirect stub
  const m = /^0;\s*url=(\/[^\s]*)$/i.exec(page.refresh);
  if (!m) { fail(url, `meta refresh "${page.refresh}" is not an instant redirect to a site path`); continue; }
  const target = `${BASE}${m[1].split("#")[0]}`;
  const targetPath = target.slice(BASE.length);
  if (!sitemap.has(target)) fail(url, `redirect target ${target} is not a listed page`);
  if (isStub(targetPath)) fail(url, `redirect target ${target} is itself a stub (chain)`);
  if (noindex(page)) fail(url, "redirect stub is noindex; rel=canonical + instant refresh only (RedirectStub.tsx)");
  if (page.canonicals.length !== 1 || page.canonicals[0] !== target) fail(url, `stub canonical is ${JSON.stringify(page.canonicals)}, expected ${target}`);
  if (page.ogUrls.length !== 1 || page.ogUrls[0] !== target) fail(url, `stub og:url is ${JSON.stringify(page.ogUrls)}, expected ${target}`);
}

// robots.txt
const robotsFile = join(OUT, "robots.txt");
if (!existsSync(robotsFile)) {
  fail("/robots.txt", "missing");
} else {
  const robots = readFileSync(robotsFile, "utf8");
  if (!robots.includes(`Sitemap: ${BASE}/sitemap.xml`)) fail("/robots.txt", "no Sitemap line for the sitemap");
  // Split into groups: consecutive User-agent lines, then their rules.
  let agents = [], inRules = false;
  for (const raw of robots.split("\n")) {
    const line = raw.replace(/#.*/, "").trim();
    if (!line) continue;
    const [key, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    if (/^user-agent$/i.test(key)) {
      if (inRules) { agents = []; inRules = false; }
      agents.push(value.toLowerCase());
    } else {
      inRules = true;
      if (/^disallow$/i.test(key) && value === "/" && agents.some((a) => ["*", "googlebot", "bingbot"].includes(a))) {
        fail("/robots.txt", `"Disallow: /" for ${agents.join(", ")}`);
      }
    }
  }
}

const stubs = [...pages.values()].filter((p) => p.refresh).length;
console.log(`checked ${sitemap.size} sitemap URLs, ${pages.size} exported pages (${stubs} redirect stubs), robots.txt`);
if (problems.length) {
  console.error(`\n${problems.length} SEO invariant violation(s):\n`);
  for (const p of problems) console.error(`  ${p.url}\n    -> ${p.why}`);
  process.exit(1);
}
console.log("no SEO invariant violations");
