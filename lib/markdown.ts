/**
 * Shared build-time markdown renderer.
 *
 * Used by both the documentation tree (`lib/docs.ts`) and the blog
 * (`lib/blog.ts`) so the two cannot drift into rendering the same markdown
 * differently — different heading anchors or a different code theme between
 * /docs/ and /blog/ would be a small thing that looks like carelessness.
 *
 * Everything here runs at build time under `output: "export"`.
 */
import { Marked } from "marked";
import { createHighlighter, type Highlighter } from "shiki";

/** Languages worth loading. Anything else renders unhighlighted rather than failing. */
const LANGS = [
  "bash", "console", "shell", "python", "json", "yaml", "toml", "sql",
  "typescript", "javascript", "tsx", "jsx", "dockerfile", "ini", "diff",
  "xml", "html", "css", "markdown", "text",
];

let highlighterPromise: Promise<Highlighter> | null = null;
function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({ themes: ["github-dark"], langs: LANGS });
  return highlighterPromise;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * GitHub-compatible heading slug.
 *
 * `marked` does not add heading `id`s. Without them every in-page `#anchor`
 * link — and every hand-written table of contents — lands at the top of the
 * page instead of the section.
 */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    // Inline HTML arrives entity-escaped ("nova capture &lt;cmd&gt;"). GitHub slugs
    // the visible text, so drop the entity: "#nova-capture-cmd", not "-ltcmdgt".
    .replace(/&(?:[a-z]+|#\d+|#x[0-9a-f]+);/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    // One hyphen per space, never collapsed: GitHub turns "a — b" into "a--b",
    // and the docs' hand-written anchors were written against GitHub.
    .replace(/\s/g, "-");
}

/** Render a markdown string to HTML, with GFM and syntax-highlighted code. */
export async function renderMarkdown(markdown: string): Promise<string> {
  const highlighter = await getHighlighter();
  const marked = new Marked({ gfm: true, breaks: false });

  marked.use({
    renderer: {
      code({ text, lang }) {
        const language = (lang ?? "").split(/\s+/)[0].toLowerCase();
        // GitHub draws ```mermaid blocks; this site has no Mermaid renderer, so they
        // used to appear as raw flowchart syntax under the illustrated SVG of the
        // same diagram (every docs page with a Mermaid block also embeds one). The
        // source stays on the page, collapsed and labelled, as the diagram's text form.
        if (language === "mermaid") {
          return `<details class="diagram-source"><summary>Diagram source (Mermaid)</summary><pre><code>${escapeHtml(text)}</code></pre></details>`;
        }
        if (language && LANGS.includes(language)) {
          // github-dark renders comments in #6A737D: 3.05:1 on its #24292e
          // background, under WCAG AA's 4.5:1 (Lighthouse flagged 48 nodes on one
          // CLI page). #959DA5 is 5.34:1 and keeps comments visibly muted.
          return highlighter
            .codeToHtml(text, { lang: language, theme: "github-dark" })
            .replace(/color:#6A737D/gi, "color:#959DA5");
        }
        return `<pre><code>${escapeHtml(text)}</code></pre>`;
      },
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        return `<h${depth} id="${headingId(text)}">${text}</h${depth}>\n`;
      },
    },
  });

  return marked.parse(markdown) as string;
}

/**
 * Minimal front-matter parser for the `---` block at the top of a file.
 *
 * Deliberately not a YAML dependency. The blog needs six scalar keys and one
 * inline list; pulling in a full YAML parser to read `title:` would be a
 * runtime dependency added for no reason, and this project treats dependencies
 * as a commitment rather than a convenience.
 *
 * Supported: `key: value`, quoted values, and `key: [a, b, c]` inline lists.
 */
export function parseFrontMatter(source: string): {
  data: Record<string, string | string[]>;
  content: string;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) return { data: {}, content: source };

  const data: Record<string, string | string[]> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    const [, key] = kv;
    let raw = kv[2].trim();

    if (raw.startsWith("[") && raw.endsWith("]")) {
      data[key] = raw
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      continue;
    }
    raw = raw.replace(/^["']|["']$/g, "");
    data[key] = raw;
  }

  return { data, content: source.slice(match[0].length) };
}
