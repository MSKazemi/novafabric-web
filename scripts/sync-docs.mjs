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
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHECKOUT = join(ROOT, ".docs-src");
const REPO = "https://github.com/MSKazemi/novafabric.git";

/** Where lib/docs.ts will look. Kept in one place so the two cannot disagree. */
export const DOCS_DIR = join(CHECKOUT, "docs");

function git(args, cwd) {
  return execFileSync("git", args, { cwd, stdio: ["ignore", "pipe", "pipe"] })
    .toString()
    .trim();
}

function main() {
  const override = process.env.NOVAFABRIC_DOCS;
  if (override) {
    const dir = resolve(override);
    if (!existsSync(dir)) {
      throw new Error(`NOVAFABRIC_DOCS is set to ${dir}, which does not exist.`);
    }
    console.log(`▸ docs source: ${dir} (NOVAFABRIC_DOCS)`);
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
      // An offline build against the existing checkout is better than no build.
      console.warn(`  ! refresh failed, using the existing checkout: ${error.message}`);
    }
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
  }

  if (!existsSync(DOCS_DIR)) {
    throw new Error(`Expected ${DOCS_DIR} after sync, but it is missing.`);
  }
  console.log(`  ✓ ${git(["rev-parse", "--short", "HEAD"], CHECKOUT)}`);
}

main();
