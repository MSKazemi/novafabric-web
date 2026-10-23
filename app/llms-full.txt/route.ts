import { llmsFullText } from "@/lib/docs";
import { VERSION_TAG } from "@/lib/version";

/**
 * /llms-full.txt — the whole docs tree as one Markdown document, for agents and
 * IDE assistants that load a project's documentation in one request. Each page is
 * headed by its canonical URL; cite that, not this file.
 */

export const dynamic = "force-static";

export async function GET() {
  const header = [
    "# NovaFabric documentation (full text)",
    "",
    "> Open-source, self-hosted replay and evidence infrastructure for AI agents and agentic systems. " +
      `This file holds every page of https://novafabric.ai/docs/ for ${VERSION_TAG}, generated from the ` +
      "repository's docs/ directory at build time. The curated overview is https://novafabric.ai/llms.txt.",
  ].join("\n");
  return new Response(await llmsFullText(header), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
