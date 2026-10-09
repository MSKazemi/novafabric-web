/**
 * Product facts that appear across the site (hero badge, page tags, footer,
 * structured data, install blocks). The version and Python requirement are read
 * from the product's pyproject.toml by next.config.ts. The fallbacks below are
 * used only by a local build that cannot find the product source; CI refuses to
 * build without it.
 */
export const VERSION = process.env.NOVAFABRIC_VERSION ?? "0.104.0";
export const VERSION_TAG = `v${VERSION}`;
export const REQUIRES_PYTHON = process.env.NOVAFABRIC_PYTHON ?? "3.12+";
export const INSTALL_COMMAND = "pip install novafabric";
