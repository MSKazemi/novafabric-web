/**
 * The one place the current NovaFabric release number lives. Everything on the
 * site that shows a version (hero badge, page tags, footer, structured data)
 * reads it from here, so the visible text and the JSON-LD cannot drift apart.
 * Bump it with each release.
 */
export const VERSION = "0.102.1";
export const VERSION_TAG = `v${VERSION}`;
