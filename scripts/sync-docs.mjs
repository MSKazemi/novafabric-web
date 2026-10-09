#!/usr/bin/env node
/**
 * Makes the NovaFabric repository's `docs/` tree available to the build.
 *
 * The docs pages on this site are rendered from the markdown that maintainers
 * actually edit in the `MSKazemi/novafabric` repository — nothing is copied into
 * this repo by hand. That is deliberate: a duplicated copy drifts, and docs that
 * silently contradict the repository are worse than no docs page at all.
 *
 * Resolution order:
 *   1. $NOVAFABRIC_DOCS — an existing local checkout's `docs/` directory. Use
 *      this when working on docs and the site together; the build then reflects
 *      your working tree with no network round-trip.
 *   2. A shallow clone of the public repository into `.docs-src/` (gitignored),
 *      refreshed with `git fetch --depth=1` if it is already present.
 *
 * The build fails loudly if neither is available. A site that quietly ships zero
 * doc pages looks identical to a successful build until someone visits /docs/.
 *
 * Pinning: CI checks the product out twice — once at .source/ (version metadata,
 * shallow) and once here (docs, with history for page dates). Both used to follow
 * `main` independently, so a product push between the two steps would have built
 * the version of one commit with the docs of another. When .source/ is present,
 * this checkout is reset to exactly its commit; NOVAFABRIC_DOCS_REF pins it
 * explicitly. The commit used is printed either way.
 */
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHECKOUT = join(ROOT, ".docs-src");
const REPO = "https://github.com/MSKazemi/novafabric.git";

/** Where lib/docs.ts will look. Kept in one place so the two cannot disagree. */
export const DOCS_DIR = join(CHECKOUT, "docs");

/**
 * Where docs/assets/ is published. The markdown embeds its diagrams as
 * `../assets/architecture/*.svg`; lib/docs.ts rewrites those to /docs/assets/…,
 * so the files have to be served there. public/ is copied into out/ by the
 * export, and works under `next dev` too. Generated — gitignored, never edited.
 */
const ASSETS_OUT = join(ROOT, "public", "docs", "assets");

function publishAssets(docsDir) {
  const source = join(docsDir, "assets");
  rmSync(ASSETS_OUT, { recursive: true, force: true });
  if (!existsSync(source)) {
    console.warn(`  ! no ${source}; docs pages that embed images will fail check-links`);
    return;
  }
  mkdirSync(dirname(ASSETS_OUT), { recursive: true });
  cpSync(source, ASSETS_OUT, { recursive: true });
  console.log(`  ✓ docs/assets → public/docs/assets/`);
}

function git(args, cwd) {
  return execFileSync("git", args, { cwd, stdio: ["ignore", "pipe", "pipe"] })
    .toString()
    .trim();
}

/** The product commit this build must use, or null to follow main. */
function pinnedRef() {
  if (process.env.NOVAFABRIC_DOCS_REF) return process.env.NOVAFABRIC_DOCS_REF;
  const source = join(ROOT, ".source");
  if (existsSync(join(source, ".git"))) return git(["rev-parse", "HEAD"], source);
  return null;
}

/**
 * Moves the checkout to the pinned commit. A pin that cannot be honoured is fatal:
 * building other docs than the ones asked for is exactly what pinning prevents.
 */
function applyPin() {
  const ref = pinnedRef();
  if (!ref) return;
  try {
    // The ref may be a tag or a commit not reachable from main; fetch it by name.
    try { git(["fetch", "origin", ref], CHECKOUT); } catch { /* already present, or a local-only ref */ }
    git(["reset", "--hard", ref], CHECKOUT);
  } catch (error) {
    throw new Error(`Could not pin .docs-src to ${ref}: ${error.message}`);
  }
}

function main() {
  const override = process.env.NOVAFABRIC_DOCS;
  if (override) {
    const dir = resolve(override);
    if (!existsSync(dir)) {
      throw new Error(`NOVAFABRIC_DOCS is set to ${dir}, which does not exist.`);
    }
    console.log(`▸ docs source: ${dir} (NOVAFABRIC_DOCS)`);
    publishAssets(dir);
    return;
  }

  if (existsSync(join(CHECKOUT, ".git"))) {
    console.log("▸ docs source: refreshing .docs-src/");
    try {
      // Older checkouts were cloned --depth=1; per-file dates need history.
      if (existsSync(join(CHECKOUT, ".git", "shallow"))) {
        git(["fetch", "--unshallow", "--filter=blob:none", "origin", "main"], CHECKOUT);
      } else {
        git(["fetch", "origin", "main"], CHECKOUT);
      }
      git(["reset", "--hard", "origin/main"], CHECKOUT);
    } catch (error) {
      // An offline build against the existing checkout is better than no build —
      // unless a pin was asked for, which is checked (and enforced) below.
      console.warn(`  ! refresh failed, using the existing checkout: ${error.message}`);
    }
    applyPin();
  } else {
    console.log(`▸ docs source: cloning ${REPO} → .docs-src/`);
    rmSync(CHECKOUT, { recursive: true, force: true });
    mkdirSync(CHECKOUT, { recursive: true });
    // A blobless partial clone keeps this to a few MB while still giving the
    // build a real working tree to read `docs/**/*.md` from. Full history (no
    // --depth=1) on purpose: each doc page's "Last updated" date and its
    // TechArticle dateModified come from `git log` on this checkout — a
    // shallow clone would stamp every page with the clone date, which is
    // exactly the auto-stamp pathology the sitemap was flagged for.
    git(["clone", "--filter=blob:none", "--branch=main", REPO, CHECKOUT], ROOT);
    applyPin();
  }

  if (!existsSync(DOCS_DIR)) {
    throw new Error(`Expected ${DOCS_DIR} after sync, but it is missing.`);
  }
  console.log(`  ✓ ${git(["rev-parse", "--short", "HEAD"], CHECKOUT)}`);
  publishAssets(DOCS_DIR);
}

main();
