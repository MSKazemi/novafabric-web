import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

/**
 * The product's pyproject.toml is the one source for the release number and the
 * Python requirement shown on the site. Both used to be typed into pages by hand
 * (and the Astro half of the site once said "Python 3.11+" while the package
 * needs 3.12), so they are read from the product repo at build time.
 *
 * In CI the product source is checked out at .source/. Locally the public clone
 * that scripts/sync-docs.mjs maintains (.docs-src/) comes next, so a local build
 * shows what the public build would. A sibling checkout of the product is only the
 * last resort: it may be the private tree, with an unreleased version number.
 * NOVAFABRIC_PYPROJECT overrides all of them. CI fails if none is found, so a
 * deploy can never publish a number that was not read from the product.
 */
function productFacts(): { version: string; python: string } | null {
  const candidates = [
    process.env.NOVAFABRIC_PYPROJECT,
    // Docs taken from a local checkout: read the version from that same checkout.
    process.env.NOVAFABRIC_DOCS && join(process.env.NOVAFABRIC_DOCS, "..", "pyproject.toml"),
    join(process.cwd(), ".source", "pyproject.toml"),
    join(process.cwd(), ".docs-src", "pyproject.toml"),
    join(process.cwd(), "..", "..", "novafabric", "pyproject.toml"),
  ].filter((p): p is string => Boolean(p));
  const file = candidates.find((p) => existsSync(p));
  if (!file) {
    if (process.env.CI) {
      throw new Error("CI build needs the product source at .source/pyproject.toml (version and Python requirement come from it).");
    }
    return null;
  }
  const section = readFileSync(file, "utf8").split(/^\[/m).find((s) => s.startsWith("project]")) ?? "";
  const version = section.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
  const requires = section.match(/^requires-python\s*=\s*">=\s*(\d+\.\d+)[^"]*"/m)?.[1];
  if (!version || !requires) throw new Error(`Could not read version / requires-python from [project] in ${file}.`);
  return { version, python: `${requires}+` };
}

const facts = productFacts();

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Inlined at build time, so client components can use them without touching the filesystem.
  env: facts ? { NOVAFABRIC_VERSION: facts.version, NOVAFABRIC_PYTHON: facts.python } : {},
};

export default nextConfig;
