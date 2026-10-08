/**
 * Loads the NovaFabric repository's `docs/` markdown tree for publication at
 * /docs/.
 *
 * Ported from the Astro implementation that previously lived in the main
 * repository at `web/src/lib/docs.ts`. That build produced 48 doc pages which
 * never reached a domain, because novafabric.ai is served from *this* repo. The
 * string-level behaviour below — slugging, link rewriting, title and description
 * extraction — is deliberately kept identical to that implementation so the URLs
 * it generated remain the URLs this site serves.
 *
 * `scripts/sync-docs.mjs` puts the markdown in place before the build; this
 * module only reads it. Everything here runs at build time under `output:
 * "export"`, so there is no runtime filesystem access.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, relative } from "node:path";
import { renderMarkdown } from "./markdown";

const DOCS_DIR = process.env.NOVAFABRIC_DOCS
  ? resolve(process.env.NOVAFABRIC_DOCS)
  : resolve(process.cwd(), ".docs-src", "docs");

/**
 * Files that are not user-facing documentation and should not be published.
 * `_template` files are scaffolding for contributors (the RFC template rendered as
 * an indexable page titled "RFC-NNNN — <Title>" with placeholder text).
 */
const EXCLUDE = [/^releases\//, /^whitepaper\//, /(^|\/)_template\.md$/];

const GITHUB_BLOB = "https://github.com/MSKazemi/novafabric/blob/main";
const GITHUB_TREE = "https://github.com/MSKazemi/novafabric/tree/main";

export interface DocPage {
  /** Path relative to docs/, e.g. "ops/monitoring.md". */
  file: string;
  /** URL slug, e.g. "ops/monitoring". */
  slug: string;
  html: string;
  raw: string;
}

function toSlug(file: string): string {
  return file.replace(/\.md$/, "").replace(/(^|\/)README$/, "$1index").replace(/\/index$/, "");
}

/**
 * Resolves a relative link against a file's directory, `..` and all.
 *
 * Returns the cleaned path plus how many segments escaped the top of the tree,
 * because escaping `docs/` is what decides whether a path is repo-root-relative
 * or docs-relative — and those need different GitHub URLs.
 */
function resolveRelative(dir: string, target: string): { path: string; escapes: number } {
  const resolved: string[] = [];
  let escapes = 0;
  for (const segment of (dir ? `${dir}/${target}` : target).split("/")) {
    if (segment === "." || segment === "") continue;
    if (segment === "..") {
      if (resolved.length) resolved.pop();
      else escapes += 1;
      continue;
    }
    resolved.push(segment);
  }
  return { path: resolved.join("/"), escapes };
}

/**
 * Rewrites the relative links the repository uses into URLs that work on the web.
 *
 * A markdown link like `concepts.md` is correct in a git checkout and dead on a
 * site whose routes are `/docs/concepts/`. The rule is decided by whether the
 * target is a page this site actually builds, not by its file extension:
 *
 *   - resolves to a published doc slug  ->  /docs/<slug>/
 *   - anything else                     ->  the source on GitHub
 *
 * That second branch is the one that matters. It covers links to files that are
 * not markdown (`../CITATION.cff`, `../schemas/*.json`, `assets/*.svg`), links to
 * directories (`releases/`, `../deploy/hpc/`), and links to markdown that EXCLUDE
 * keeps out of the build (`releases/v0.10.0.md`). Every one of those used to reach
 * the reader as a 404: the non-markdown ones were passed through untouched and
 * resolved against `/docs/<slug>/`, and the excluded ones were handed a `/docs/`
 * URL for a page that is never generated. Search Console reported the result as
 * "Not found (404)" against novafabric.ai.
 */
function rewriteLinks(html: string, file: string, published: ReadonlySet<string>): string {
  const dir = file.includes("/") ? file.slice(0, file.lastIndexOf("/")) : "";

  return html.replace(/href="([^"]+)"/g, (whole, href: string) => {
    // Absolute URLs, site-root paths and pure anchors are already correct.
    if (/^(?:[a-z]+:|\/|#)/i.test(href)) return whole;

    const [target, anchor = ""] = href.split("#");
    if (!target) return whole;

    const { path, escapes } = resolveRelative(dir, target);
    const suffix = anchor ? `#${anchor}` : "";

    // A link to a directory that resolves away to nothing — `.` from a file at the
    // top of docs/, say — points at the tree's own root.
    if (!path) return escapes > 0 ? `href="${GITHUB_TREE}${suffix}"` : `href="/docs/${suffix}"`;

    // A markdown file inside docs/ that this site actually builds.
    if (escapes === 0 && target.endsWith(".md")) {
      const slug = toSlug(path);
      if (slug === "" || slug === "index") return `href="/docs/${suffix}"`;
      if (published.has(slug)) return `href="/docs/${slug}/${suffix}"`;
    }

    // Everything else has no route on this site. Send the reader to the source
    // rather than to a 404 — `tree` for a directory, `blob` for a file.
    const base = target.endsWith("/") ? GITHUB_TREE : GITHUB_BLOB;
    const prefix = escapes > 0 ? "" : "docs/";
    return `href="${base}/${prefix}${path}${suffix}"`;
  });
}

/** Recursively collect `*.md` paths under `dir`, relative to it. */
function walk(dir: string, base = dir): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full, base));
    else if (entry.isFile() && entry.name.endsWith(".md")) found.push(relative(base, full));
  }
  return found;
}

let cache: DocPage[] | null = null;

export async function docPages(): Promise<DocPage[]> {
  if (cache) return cache;

  if (!existsSync(DOCS_DIR)) {
    throw new Error(
      `Documentation source not found at ${DOCS_DIR}. Run "npm run sync-docs" first, ` +
        `or set NOVAFABRIC_DOCS to a local checkout's docs/ directory.`,
    );
  }

  const candidates = walk(DOCS_DIR)
    .filter((file) => !EXCLUDE.some((pattern) => pattern.test(file)))
    .filter((file) => {
      const slug = toSlug(file);
      // The docs index itself is rendered by app/docs/page.tsx, and an empty
      // slug would collide with it.
      return slug !== "" && slug !== "index";
    });

  // `x.md` and `x/README.md` both map to the slug `x`. Two pages on one URL emit a
  // duplicate sitemap entry and one document silently disappears, so pick one
  // deterministically (the folder README, which is the parent of x/*) and say so.
  const bySlug = new Map<string, string[]>();
  for (const file of candidates) {
    const slug = toSlug(file);
    bySlug.set(slug, [...(bySlug.get(slug) ?? []), file]);
  }
  const files: string[] = [];
  for (const [slug, group] of bySlug) {
    const winner = group.find((file) => /(^|\/)README\.md$/.test(file)) ?? group[0];
    files.push(winner);
    for (const lost of group.filter((file) => file !== winner)) {
      console.warn(`docs: ${lost} shares the URL /docs/${slug}/ with ${winner}; ${lost} is not published.`);
    }
  }

  if (files.length === 0) {
    throw new Error(`No documentation markdown found under ${DOCS_DIR}.`);
  }

  // The slug set has to exist before any page is rendered: rewriteLinks decides
  // between a /docs/ URL and a GitHub URL by asking whether the target is a page
  // this build actually produces, and it cannot ask that mid-render.
  const published = new Set(files.map(toSlug));

  const pages = await Promise.all(
    files.map(async (file) => {
      const raw = readFileSync(join(DOCS_DIR, file), "utf8");
      const html = rewriteLinks(await renderMarkdown(raw), file, published);
      return { file, slug: toSlug(file), html, raw };
    }),
  );

  cache = pages.sort((a, b) => a.slug.localeCompare(b.slug));
  return cache;
}

/**
 * Last-commit date per docs file, from the git history of whichever checkout
 * the markdown was read from (`.docs-src/` or $NOVAFABRIC_DOCS).
 *
 * One `git log` walk for the whole tree, newest-first: the first time a path
 * appears is its last modification. Paths in `--name-only` output are
 * repo-root-relative (`docs/faq.md`), so the `docs/` prefix is stripped to
 * match `DocPage.file`.
 *
 * If history is unavailable (shallow checkout, not a git repo), the map is
 * empty and callers omit the date — an absent date is honest, a clone-time
 * date is fabricated freshness.
 */
let dateCache: Map<string, string> | null = null;

function docDates(): Map<string, string> {
  if (dateCache) return dateCache;
  const map = new Map<string, string>();
  try {
    const out = execFileSync(
      "git",
      ["-C", DOCS_DIR, "log", "--format=%x01%cI", "--name-only", "--", "."],
      { maxBuffer: 64 * 1024 * 1024 },
    ).toString();
    let current = "";
    for (const line of out.split("\n")) {
      if (line.startsWith("\x01")) current = line.slice(1).trim();
      else if (line.trim() && current) {
        const rel = line.trim().replace(/^docs\//, "");
        if (!map.has(rel)) map.set(rel, current);
      }
    }
  } catch {
    // No history available — emit no dates rather than wrong ones.
  }
  dateCache = map;
  return map;
}

/** ISO `YYYY-MM-DD` of the page's last real commit, or undefined. */
export function lastUpdatedFor(page: DocPage): string | undefined {
  return docDates().get(page.file)?.slice(0, 10);
}

/** A question/answer pair extracted from the FAQ page's markdown. */
export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * Parses `### Question?` sections out of a FAQ-style page so the route can
 * emit `FAQPage` structured data that mirrors the visible content exactly.
 * Returns undefined unless at least three real Q&A pairs are found — a
 * two-question FAQPage is markup theater.
 */
export function faqEntries(page: DocPage): FaqEntry[] | undefined {
  const entries: FaqEntry[] = [];
  const sections = page.raw.split(/^###\s+/m).slice(1);
  for (const section of sections) {
    const newline = section.indexOf("\n");
    if (newline === -1) continue;
    const question = section.slice(0, newline).trim();
    if (!question.endsWith("?")) continue;
    const answer = section
      .slice(newline)
      .split(/^#{1,3}\s/m)[0]
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*_`>]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (answer.length > 40) entries.push({ question, answer });
  }
  return entries.length >= 3 ? entries : undefined;
}

/**
 * Search-facing title/description for the few pages where the text-derived ones
 * are weak. Keep these to what the page itself says; everything else is derived
 * from the document (first heading, first prose paragraph).
 */
const SEO_OVERRIDES: Record<string, { title?: string; description?: string }> = {
  comparison: {
    title: "NovaFabric vs Langfuse and LangSmith",
    description:
      "An honest comparison of NovaFabric with Langfuse, LangSmith, MLflow, Weights & Biases and OpenTelemetry, including where NovaFabric is the wrong choice.",
  },
  // Titles below lead with the phrase a person searches for rather than the project's
  // internal vocabulary ("Replay modes" / "Run Capsule anatomy" match nothing anyone
  // types). The descriptions restate what each page itself says, within the claim
  // matrix: the derived ones on these pages opened with source paths
  // ("(cli/replay.py:replay_cmd) … There are fiv…") or "This page is…".
  "tutorials/prove-a-run-to-an-auditor": {
    title: "Verify a sealed AI agent run for an auditor, offline",
    description:
      "Seal a recorded AI agent run and export a signed Evidence Bundle that a third party can verify on their own machine, offline, months later.",
  },
  "architecture/replay-modes": {
    title: "Replay modes for AI agent runs",
    description:
      "The five NovaFabric replay modes (forensic, mocked, semantic, exact and experimental intervention): what each reuses from the capsule and what runs live.",
  },
  "architecture/run-capsule": {
    title: "What is a run capsule? Anatomy of an AI agent run record",
    description:
      "What a NovaFabric Run Capsule holds: the files written for one run, the schema they validate against, and how to copy, archive and verify the directory.",
  },
  "tutorials/how-capture-works": {
    title: "How NovaFabric captures an AI agent run",
    description:
      "How nova capture records an agent's LLM calls at the HTTP layer without code changes, and what a captured call looks like in OpenTelemetry GenAI format.",
  },
  "getting-started": {
    description:
      "Install NovaFabric, capture a command into a Run Capsule without code changes, then validate, replay, diff and export it. Local-first, no account needed.",
  },
  concepts: {
    description:
      "NovaFabric concepts: Run Capsules, zero-code capture, the five replay modes, structural diff, lineage, the Asset Registry and how signed evidence is made.",
  },
  "tutorials/why-novafabric": {
    description:
      "A plain-English guide to why AI agent runs need replayable evidence, the five NovaFabric primitives, and five things you can do with the nova CLI.",
  },
  "tutorials/novafabric-vs-langfuse": {
    description:
      "Where NovaFabric and Langfuse overlap and differ: monitoring how a system performs now versus Run Capsules you can replay, compare and verify later.",
  },
  "ops/air-gapped-install": {
    description:
      "Install and run NovaFabric with no internet access: offline installation, no telemetry or phone-home, and which opt-in features need a network endpoint.",
  },
  "architecture/sealing-and-verification": {
    description:
      "How a NovaFabric capsule becomes tamper-evident: the opt-in NovaSeal seal, signed Evidence Bundles, and the checks nova verify runs offline.",
  },
  "cli-reference": {
    title: "NovaFabric CLI reference",
    description:
      "Command reference for the nova CLI: capture, validate, replay, diff, lineage, trust and compliance. nova and novafabric are the same binary.",
  },
};

/**
 * `<title>` for a docs page: the document title plus the longest brand suffix that
 * still fits in 60 characters, else the bare title. Search engines cut longer titles
 * and rewrite them on their own, usually dropping the part that carries the meaning.
 * Never truncates the title itself.
 */
export function seoTitleFor(page: DocPage, maxLength = 60): string {
  const title = titleFor(page);
  const fits = [`${title} — NovaFabric docs`, `${title} — NovaFabric`].find(
    (candidate) => candidate.length <= maxLength,
  );
  return fits ?? title;
}

/** First `# heading`, falling back to a humanised slug. */
export function titleFor(page: DocPage): string {
  const override = SEO_OVERRIDES[page.slug]?.title;
  if (override) return override;
  const heading = page.raw.match(/^#\s+(.+?)\s*$/m);
  if (heading) return heading[1].replace(/`/g, "");
  const last = page.slug.split("/").pop() ?? page.slug;
  return last.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
}

/**
 * First real prose paragraph, trimmed to a meta-description length.
 *
 * Skips the heading, blockquote callouts, badges, and code fences — a
 * description built from a badge row is worse than no description at all.
 */
export function descriptionFor(page: DocPage): string {
  const override = SEO_OVERRIDES[page.slug]?.description;
  if (override) return override;
  const body = page.raw
    .replace(/<!--[\s\S]*?-->/g, "") // generated-file banners and other HTML comments
    .replace(/^#\s+.+$/m, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\s*[>|].*$/gm, "")
    .replace(/^\s*\[!\[.*$/gm, "");

  // Not every opening block is prose: "**Status:** Works today …" banners and
  // "[Section](README.md) › Page" breadcrumbs sit above the first real paragraph
  // on a dozen pages and made their meta descriptions useless ("Architecture, as
  // built › Pipeline"). Skip them, and prefer a block long enough to be a snippet.
  const isBanner = (block: string) =>
    /^\**(status|audience|last updated|version|owner)\b[^\n]{0,40}:/i.test(block) ||
    /^\[[^\]]+\]\([^)]*\)\s*›/.test(block);
  const blocks = body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 40 && !block.startsWith("#") && !block.startsWith("|") && !isBanner(block))
    // A block that opens with a command, or cites source locations ("cli/replay.py:
    // replay_cmd"), reads as noise in a search snippet; keep it only as a last resort.
    .sort((a, b) => Number(isCodeLed(a)) - Number(isCodeLed(b)));
  const paragraph = blocks.find((block) => block.length >= 90) ?? blocks[0];

  if (!paragraph) return `${titleFor(page)} — NovaFabric documentation.`;

  const flat = paragraph
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "") // leading list marker
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // Strip emphasis markers but keep identifiers: a blanket `_` removal turned
    // `replay_cmd` into "replaycmd" in meta descriptions.
    .replace(/[*`]/g, "")
    .replace(/(^|[\s(])_+|_+(?=[\s).,;:]|$)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  return clipDescription(flat);
}

const isCodeLed = (block: string) => block.startsWith("`") || /\b[\w/]+\.py:\w/.test(block);

/**
 * Fits a description into 155 characters by whole sentences. A hard cut at 152
 * characters left ~60 descriptions ending mid-word ("There are fiv…"). Only when
 * the first sentence alone is too long does it fall back to a word boundary.
 */
export function clipDescription(text: string, max = 155): string {
  if (text.length <= max) return text;
  // Split only where sentence punctuation is followed by whitespace, so the result
  // is always a prefix of the text ("capsule.yaml" or "v0.104.0" never split it).
  let out = "";
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    const next = out ? `${out} ${sentence}` : sentence;
    if (next.length > max) break;
    out = next;
  }
  if (out.length >= 70) return out;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:—–-]+$/, "")}…`;
}
