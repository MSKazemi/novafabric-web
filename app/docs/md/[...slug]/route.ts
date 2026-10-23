/**
 * The Markdown twin of every docs page, at /docs/md/<slug>.md. Each HTML page
 * links its twin with <link rel="alternate" type="text/markdown">, which is how
 * answer-engine crawlers and coding agents find it (see markdownPathFor).
 *
 * A static export renders each param to a file named exactly like the URL, so the
 * last segment carries the `.md` that GitHub Pages serves as text/markdown.
 *
 * lib/docs is imported lazily, inside the handlers: its renderer (shiki) makes it
 * an async module, and a route module that imports it statically becomes async
 * too. Next reads a route handler's exports synchronously when it collects
 * segments, so it then sees no generateStaticParams and fails the export.
 */

type Params = { slug: string[] };

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams(): Promise<Params[]> {
  const { docPages, markdownPathFor } = await import("@/lib/docs");
  return (await docPages()).map((page) => ({
    slug: markdownPathFor(page).slice("/docs/md/".length).split("/"),
  }));
}

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const { docPages, markdownFor, markdownPathFor } = await import("@/lib/docs");
  const path = `/docs/md/${(await params).slug.join("/")}`;
  const page = (await docPages()).find((candidate) => markdownPathFor(candidate) === path);
  if (!page) return new Response("Not found\n", { status: 404 });
  return new Response(markdownFor(page), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
