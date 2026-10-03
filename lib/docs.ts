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

/** Files that are not user-facing documentation and should not be published. */
const EXCLUDE = [/^releases\//, /^whitepaper\//];

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

  const files = walk(DOCS_DIR)
    .filter((file) => !EXCLUDE.some((pattern) => pattern.test(file)))
    .filter((file) => {
      const slug = toSlug(file);
      // The docs index itself is rendered by app/docs/page.tsx, and an empty
      // slug would collide with it.
      return slug !== "" && slug !== "index";
    });

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

/** First `# heading`, falling back to a humanised slug. */
export function titleFor(page: DocPage): string {
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
  const body = page.raw
    .replace(/^#\s+.+$/m, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\s*[>|].*$/gm, "")
    .replace(/^\s*\[!\[.*$/gm, "");

  const paragraph = body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block.length > 40 && !block.startsWith("#") && !block.startsWith("|"));

  if (!paragraph) return `${titleFor(page)} — NovaFabric documentation.`;

  const flat = paragraph
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return flat.length > 155 ? `${flat.slice(0, 152).trimEnd()}…` : flat;
}
