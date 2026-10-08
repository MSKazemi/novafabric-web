import type { Metadata } from "next";
import Link from "next/link";

/**
 * Retired URLs. GitHub Pages cannot send a 301, so a moved page becomes this
 * stub: an immediate meta refresh, a rel=canonical pointing at the new page, and
 * noindex so the stub itself never competes with its target in search. The
 * visible link covers clients that ignore meta refresh.
 *
 * Stubs are deliberately absent from sitemap.xml (app/sitemap.ts) and from
 * merge-sites.mjs's sitemap folding.
 */
const BASE = "https://novafabric.ai";

export function redirectMetadata(to: string, title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: true },
    alternates: { canonical: `${BASE}${to.split("#")[0]}` },
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
