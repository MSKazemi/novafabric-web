/**
 * Loads blog posts from `content/blog/*.md`.
 *
 * Posts used to be a TypeScript array of typed content blocks
 * (`{ type: "p", text: "…" }`). That shape could express four things —
 * paragraph, h3, code, bullet list — with no tables, no inline links, and no
 * emphasis, and writing a post meant editing a source file and escaping quotes.
 * The blog had three posts in as many months, which is roughly what that
 * friction predicts.
 *
 * A post is now a markdown file with front matter. Writing one is: create the
 * file, commit, deploy. See `content/blog/README.md`.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { renderMarkdown, parseFrontMatter } from "./markdown";
import type { PostCategory } from "./types";

const BLOG_DIR = resolve(process.cwd(), "content", "blog");

const PUBLIC_DIR = resolve(process.cwd(), "public");

const CATEGORIES: PostCategory[] = ["lab-update", "technical", "release"];

export interface Post {
  slug: string;
  title: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  category: PostCategory;
  tags: string[];
  excerpt: string;
  /** Optional 16:9 header image, a site path under `public/` (e.g. `/blog/x/hero.webp`). */
  image?: string;
  /** Alt text for `image`. Required whenever `image` is set. */
  imageAlt?: string;
  /** Optional caption shown under `image`. */
  imageCaption?: string;
  /** Optional 1200x630 link-preview image; falls back to `image`, then the site card. */
  ogImage?: string;
  /** Rendered HTML of the post body. */
  html: string;
  /** Rough reading time in minutes, for the post header. */
  readingMinutes: number;
}

function asString(value: string | string[] | undefined, fallback = ""): string {
  if (Array.isArray(value)) return value.join(", ");
  return value ?? fallback;
}

function asList(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

let cache: Post[] | null = null;

export async function getPosts(): Promise<Post[]> {
  if (cache) return cache;

  if (!existsSync(BLOG_DIR)) {
    throw new Error(`Blog directory not found at ${BLOG_DIR}.`);
  }

  const files = readdirSync(BLOG_DIR).filter(
    (name) => name.endsWith(".md") && name !== "README.md",
  );

  const posts = await Promise.all(
    files.map(async (file) => {
      const { data, content } = parseFrontMatter(readFileSync(join(BLOG_DIR, file), "utf8"));
      const slug = asString(data.slug) || file.replace(/\.md$/, "");

      // Fail the build rather than publish a post with a broken header. A post
      // that silently renders with an "Invalid Date" or an empty category is
      // worse than a build error, because nobody notices until it is live.
      const title = asString(data.title);
      if (!title) throw new Error(`content/blog/${file}: missing "title" in front matter.`);

      const date = asString(data.date);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error(`content/blog/${file}: "date" must be YYYY-MM-DD, got "${date}".`);
      }

      const category = asString(data.category) as PostCategory;
      if (!CATEGORIES.includes(category)) {
        throw new Error(
          `content/blog/${file}: "category" must be one of ${CATEGORIES.join(", ")}, got "${category}".`,
        );
      }

      const excerpt = asString(data.excerpt);
      if (!excerpt) throw new Error(`content/blog/${file}: missing "excerpt" in front matter.`);

      // Optional header/preview images. A path that does not exist, or a hero
      // without alt text, fails the build for the same reason a bad date does:
      // it would otherwise ship as a broken image or an unlabelled one.
      const image = asString(data.image) || undefined;
      const ogImage = asString(data.ogImage) || undefined;
      for (const [key, value] of [["image", image], ["ogImage", ogImage]] as const) {
        if (value && (!value.startsWith("/") || !existsSync(join(PUBLIC_DIR, value)))) {
          throw new Error(
            `content/blog/${file}: "${key}" must be a path under public/ that exists, got "${value}".`,
          );
        }
      }
      const imageAlt = asString(data.imageAlt) || undefined;
      if (image && !imageAlt) {
        throw new Error(`content/blog/${file}: "image" needs "imageAlt" (alt text) in front matter.`);
      }

      const words = content.split(/\s+/).filter(Boolean).length;

      return {
        slug,
        title,
        date,
        category,
        tags: asList(data.tags),
        excerpt,
        image,
        imageAlt,
        imageCaption: asString(data.imageCaption) || undefined,
        ogImage,
        html: await renderMarkdown(content),
        readingMinutes: Math.max(1, Math.round(words / 220)),
      };
    }),
  );

  // Newest first, and a stable tiebreak so two posts on one day do not reorder
  // between builds.
  cache = posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  return cache;
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await getPosts()).find((post) => post.slug === slug);
}
