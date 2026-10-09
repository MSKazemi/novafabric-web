import type { Metadata } from "next";
import Link from "next/link";

/**
 * Retired URLs. GitHub Pages cannot send a 301, so a moved page becomes this
 * stub: an immediate meta refresh and a rel=canonical, both pointing at the new
 * page. The visible link covers clients that ignore meta refresh.
 *
 * No noindex. Google treats an instant (0 s) meta refresh as a permanent
 * redirect, a strong signal that the target is canonical; rel=canonical adds to
 * it. Google advises against noindex where the goal is canonical consolidation,
 * because noindex drops the page from Search instead of folding it into its
 * target. Sources (checked 2026-10-08): developers.google.com/search/docs/crawling-indexing/
 * 301-redirects and .../consolidate-duplicate-urls.
 *
 * og:url and the share card also point at the target. Otherwise the layout's
 * home-page Open Graph block is inherited and a shared old link previews as the
 * home page.
 *
 * Stubs are deliberately absent from sitemap.xml (app/sitemap.ts), and
 * scripts/check-seo.mjs fails the build if one is listed or loses these tags.
 */
const BASE = "https://novafabric.ai";

export function redirectMetadata(to: string, title: string): Metadata {
  const target = `${BASE}${to.split("#")[0]}`;
  return {
    title,
    alternates: { canonical: target },
    openGraph: {
      title,
      url: target,
      images: [{ url: `${BASE}/og.png`, width: 1200, height: 630 }],
    },
  };
}

export default function RedirectStub({ to, label }: { to: string; label: string }) {
  return (
    <>
      {/* React 19 hoists <meta> into <head>. */}
      <meta httpEquiv="refresh" content={`0; url=${to}`} />
      <main
        className="page-max-w"
        style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}
      >
        <p className="text-muted text-[15px]">
          This page has moved to{" "}
          <Link href={to} className="text-amber">
            {label}
          </Link>
          .
        </p>
      </main>
    </>
  );
}
