import { readFileSync } from "node:fs";
import { join } from "node:path";
import { llmsDocsIndex } from "@/lib/docs";
import { VERSION_TAG } from "@/lib/version";

/**
 * /llms.txt — the curated, hand-written map in content/llms.md followed by a
 * generated index of every docs page. Hand-written, the docs list covered 13 of 91
 * pages and named a release two versions old; the generated half cannot fall behind
 * docs/, and {{VERSION}} in the head is the release this build describes.
 *
 * scripts/check-seo.mjs runs the claim-matrix check on the exported file.
 */

export const dynamic = "force-static";

export async function GET() {
  const head = readFileSync(join(process.cwd(), "content", "llms.md"), "utf8").replaceAll(
    "{{VERSION}}",
    VERSION_TAG,
  );
  return new Response(`${head.trim()}\n\n${await llmsDocsIndex()}`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
