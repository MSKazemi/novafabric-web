/**
 * The build gates must fail on the defects they exist for. Each test writes a tiny
 * exported site into a temp directory, breaks exactly one thing, and runs the real
 * gate script on it. Nothing here touches out/ or production content.
 *
 *   npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPTS = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://novafabric.ai";

function run(script, args, env = {}) {
  const r = spawnSync(process.execPath, ["--no-warnings", join(SCRIPTS, script), ...args], {
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}

function page({ path, title = "A page", description = "A short description.", canonical, ogUrl, robots, body = "<p>Text.</p>" }) {
  const url = `${BASE}${path}`;
  return `<!DOCTYPE html><html><head><title>${title}</title>
<meta name="description" content="${description}"/>
${robots ? `<meta name="robots" content="${robots}"/>` : ""}
<link rel="canonical" href="${canonical ?? url}"/>
<meta property="og:url" content="${ogUrl ?? canonical ?? url}"/>
</head><body><h1 id="top-heading">${title}</h1>${body}
<script type="application/ld+json">{"@type":"WebPage"}</script></body></html>`;
}

const stub = (target) => `<!DOCTYPE html><html><head><title>Moved</title>
<meta http-equiv="refresh" content="0; url=${target}"/>
<link rel="canonical" href="${BASE}${target}"/>
<meta property="og:url" content="${BASE}${target}"/>
</head><body><a href="${target}">moved</a></body></html>`;

/** A valid two-page site with one redirect stub; `mutate` breaks it. */
function site(mutate = () => {}) {
  const dir = mkdtempSync(join(tmpdir(), "nf-gates-"));
  const files = {
    "index.html": page({ path: "/", body: '<p><a href="/a/">a</a> <a href="/a/#section">section</a></p>' }),
    "a/index.html": page({ path: "/a/", body: '<h2 id="section">Section</h2><img src="/img.svg" alt=""/>' }),
    "old/index.html": stub("/a/"),
    "img.svg": "<svg xmlns='http://www.w3.org/2000/svg'/>",
    "robots.txt": `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`,
    "sitemap.xml": `<urlset><url><loc>${BASE}/</loc></url><url><loc>${BASE}/a/</loc></url></urlset>`,
    "llms.txt": "# Site\n",
  };
  mutate(files);
  for (const [name, content] of Object.entries(files)) {
    if (content === null) continue;
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), content);
  }
  return dir;
}

function gate(script, mutate) {
  const dir = site(mutate);
  try {
    return run(script, [dir]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("the valid fixture passes both gates", () => {
  for (const script of ["check-seo.mjs", "check-links.mjs"]) {
    const r = gate(script);
    assert.equal(r.code, 0, `${script}:\n${r.out}`);
  }
});

const seoFailures = {
  "wrong canonical": ["expected self", (f) => { f["a/index.html"] = page({ path: "/a/", canonical: `${BASE}/` }); }],
  "unintended noindex": ["listed in sitemap.xml but noindex", (f) => { f["a/index.html"] = page({ path: "/a/", robots: "noindex, follow" }); }],
  "sitemap lists a page that was not exported": ["not exported", (f) => {
    f["sitemap.xml"] = f["sitemap.xml"].replace("</urlset>", `<url><loc>${BASE}/missing/</loc></url></urlset>`);
  }],
  "indexable page left out of the sitemap": ["missing from sitemap.xml", (f) => { f["b/index.html"] = page({ path: "/b/" }); }],
  "legacy stub points at an unlisted destination": ["is not a listed page", (f) => { f["old/index.html"] = stub("/nowhere/"); }],
  "legacy stub chains to another stub": ["itself a stub (chain)", (f) => { f["old2/index.html"] = stub("/old/"); }],
  "noindex on a legacy stub": ["redirect stub is noindex", (f) => { f["old/index.html"] = f["old/index.html"].replace("</head>", '<meta name="robots" content="noindex"/></head>'); }],
  "robots.txt blocks the site": ["Disallow: /", (f) => { f["robots.txt"] = `User-agent: *\nDisallow: /\nSitemap: ${BASE}/sitemap.xml\n`; }],
  "two h1 elements": ["2 <h1> elements", (f) => { f["a/index.html"] = f["a/index.html"].replace("</body>", "<h1>again</h1></body>"); }],
  "meta description over 160 characters": ["161 characters", (f) => { f["a/index.html"] = page({ path: "/a/", description: "x".repeat(161) }); }],
  "page claims four replay modes": ["Replay: five modes", (f) => { f["a/index.html"] = page({ path: "/a/", body: "<p>4 replay modes</p>" }); }],
  "llms.txt claims tamper-proof": ["/llms.txt", (f) => { f["llms.txt"] += "NovaFabric is tamper-proof.\n"; }],
  "marketing page claims multi-tenant": ["not multi-tenant", (f) => { f["a/index.html"] = page({ path: "/a/", body: "<p>A multi-tenant server.</p>" }); }],
  "page claims signed capsules": ["not signed by default", (f) => { f["a/index.html"] = page({ path: "/a/", body: "<p>Record runs as signed, replayable Run Capsules.</p>" }); }],
  "page calls the redaction proof proof of absence": ["not proof of absence", (f) => { f["a/index.html"] = page({ path: "/a/", body: "<p>redaction-proof.json: proof no secrets leaked</p>" }); }],
  "llms.txt uses the flight-simulator metaphor": ["/llms.txt", (f) => { f["llms.txt"] += "NovaFabric is a flight simulator - it re-flies the route.\n"; }],
  "llms.txt calls capsules secret-redacted": ["not secret-redacted", (f) => { f["llms.txt"] += "Portable, secret-redacted Run Capsules.\n"; }],
};
for (const [name, [message, mutate]] of Object.entries(seoFailures)) {
  test(`check-seo fails: ${name}`, () => {
    const r = gate("check-seo.mjs", mutate);
    assert.equal(r.code, 1, r.out);
    assert.ok(r.out.includes(message), `expected "${message}" in:\n${r.out}`);
  });
}

test("check-seo allows technical 'multi-tenant' under /docs/", () => {
  const r = gate("check-seo.mjs", (f) => {
    f["docs/x/index.html"] = page({ path: "/docs/x/", body: "<p>The multi-tenant nova server API.</p>" });
    f["sitemap.xml"] = f["sitemap.xml"].replace("</urlset>", `<url><loc>${BASE}/docs/x/</loc></url></urlset>`);
  });
  assert.equal(r.code, 0, r.out);
});

const linkFailures = {
  "broken internal link": ["no such page or asset", (f) => { f["index.html"] = f["index.html"].replace('href="/a/"', 'href="/nope/"'); }],
  "broken anchor on another page": ["target page has no element with that id", (f) => { f["index.html"] = f["index.html"].replace("/a/#section", "/a/#gone"); }],
  "broken same-page anchor": ["no element with that id on this page", (f) => { f["a/index.html"] = f["a/index.html"].replace("</body>", '<a href="#gone">x</a></body>'); }],
  "broken same-host absolute link": ["https://novafabric.ai/nope/", (f) => { f["index.html"] = f["index.html"].replace('href="/a/"', `href="${BASE}/nope/"`); }],
  "relative image source": ["relative src", (f) => { f["a/index.html"] = f["a/index.html"].replace('src="/img.svg"', 'src="../img.svg"'); }],
  "missing image file": ["src: no such page or asset", (f) => { f["img.svg"] = null; }],
  "broken link to the www/http spelling of the site": ["http://www.novafabric.ai/nope/", (f) => { f["index.html"] = f["index.html"].replace('href="/a/"', 'href="http://www.novafabric.ai/nope/"'); }],
  "fragment naming a <meta name>, not an anchor": ["target page has no element with that id", (f) => { f["index.html"] = f["index.html"].replace("/a/#section", "/a/#description"); }],
};
for (const [name, [message, mutate]] of Object.entries(linkFailures)) {
  test(`check-links fails: ${name}`, () => {
    const r = gate("check-links.mjs", mutate);
    assert.equal(r.code, 1, r.out);
    assert.ok(r.out.includes(message), `expected "${message}" in:\n${r.out}`);
  });
}

test("check-links ignores text fragments (#:~:text=…)", () => {
  const r = gate("check-links.mjs", (f) => { f["index.html"] = f["index.html"].replace("/a/#section", "/a/#:~:text=Section"); });
  assert.equal(r.code, 0, r.out);
});

// ---- CLI reference split -------------------------------------------------

const SOURCE = "# CLI reference\n\nIntro.\n\n## Setup\n\n### nova init\n\n## Replay commands\n\n### nova replay\n\n```\n## not a heading\n```\n";
const GROUPS = 'const GROUPS = [\n  { slug: "setup" },\n  { slug: "replay" },\n];\n';
const forwarder = (map) =>
  `<script>(function(){var d=${JSON.stringify(map)};var h=location.hash.slice(1);})();</script>`;

function cliSite({ index, setup, replay, groups = GROUPS, source = SOURCE } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "nf-cli-"));
  const ref = join(dir, "out", "docs", "cli-reference");
  const write = (p, c) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, c); };
  const map = { b: "/docs/", s: ["cli-reference/setup", "cli-reference/replay"], i: { setup: 0, "nova-init": 0, "replay-commands": 1, "nova-replay": 1 } };
  write(join(ref, "index.html"), index ?? `<h1 id="cli-reference">CLI reference</h1>${forwarder(map)}`);
  write(join(ref, "setup", "index.html"), setup ?? '<h1 id="setup-commands">Setup</h1><h2 id="setup">Setup</h2><h3 id="nova-init">nova init</h3>');
  write(join(ref, "replay", "index.html"), replay ?? '<h1 id="replay">Replay</h1><h2 id="replay-commands">Replay commands</h2><h3 id="nova-replay">nova replay</h3>');
  write(join(dir, "cli-reference.md"), source);
  write(join(dir, "groups.ts"), groups);
  return dir;
}

function cli(opts) {
  const dir = cliSite(opts);
  try {
    return run("check-cli-reference.mjs", [join(dir, "out"), join(dir, "cli-reference.md")], { CLI_GROUPS_FILE: join(dir, "groups.ts") });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("the valid CLI split fixture passes", () => {
  const r = cli();
  assert.equal(r.code, 0, r.out);
});

const cliFailures = {
  "a source section is lost": ["section lost in the split", { replay: '<h1 id="replay">Replay</h1><h2 id="replay-commands">Replay commands</h2>' }],
  "a heading id repeats on one page": ["appears more than once", { setup: '<h1 id="setup">Setup</h1><h2 id="setup">Setup</h2><h3 id="nova-init">nova init</h3>' }],
  "two groups share a slug": ["used by more than one group", { groups: 'const GROUPS = [\n  { slug: "setup" },\n  { slug: "setup" },\n];\n' }],
  "no forwarding map for old bookmarks": ["no forwarding map", { index: '<h1 id="cli-reference">CLI reference</h1>' }],
  "an old bookmark forwards to the wrong page": ["which has no such heading", {
    index: `<h1 id="cli-reference">CLI reference</h1>${forwarder({ b: "/docs/", s: ["cli-reference/setup", "cli-reference/replay"], i: { setup: 0, "nova-init": 0, "replay-commands": 1, "nova-replay": 0 } })}`,
  }],
};
for (const [name, [message, opts]] of Object.entries(cliFailures)) {
  test(`check-cli-reference fails: ${name}`, () => {
    const r = cli(opts);
    assert.equal(r.code, 1, r.out);
    assert.ok(r.out.includes(message), `expected "${message}" in:\n${r.out}`);
  });
}
