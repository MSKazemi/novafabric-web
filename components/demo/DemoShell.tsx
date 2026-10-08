import type { ReactNode } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { PageHero, TerminalFrame } from "@/components/ui";
import { DEMOS } from "@/lib/data/demos";

export { DEMOS };

export function DemoShell({
  path,
  name,
  title,
  subtitle,
  cli,
  children,
}: {
  /** e.g. "/demo/replay/" */
  path: string;
  /** breadcrumb label */
  name: string;
  title: string;
  subtitle: string;
  /** the same thing on your own machine, one command per line */
  cli: string[];
  children: ReactNode;
}) {
  return (
    <>
      <Nav />
      <BreadcrumbJsonLd trail={[{ name: "Demo", path: "/demo/" }, { name, path }]} />
      <PageHero section="demo" title={title} subtitle={subtitle} tag="interactive" />
      <main className="page-max-w py-16">
        <p className="text-muted text-[14px] leading-relaxed max-w-2xl mb-10">
          Runs in your browser on a fixture from the NovaFabric repository. It reads files; it does
          not talk to a running server. The real interface is the{" "}
          <Link href="/docs/cli-reference/" className="text-amber">
            CLI
          </Link>
          .
        </p>

        <div className="nf-demo">{children}</div>

        <section className="mt-16 max-w-3xl">
          <h2 className="font-display text-[26px] text-ink mb-4">On your machine</h2>
          <TerminalFrame>
            <div style={{ whiteSpace: "pre-wrap" }}>
              {cli.map((line) => (
                <div key={line}>
                  {line.startsWith("#") ? (
                    <span className="text-faint">{line}</span>
                  ) : (
                    <>
                      <span className="text-jade">$</span> {line}
                    </>
                  )}
                </div>
              ))}
            </div>
          </TerminalFrame>
        </section>

        <nav aria-label="Other demos" className="mt-16 pt-10 border-t border-edge">
          <p className="font-code text-[11px] text-faint uppercase tracking-widest mb-4">more demos</p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DEMOS.filter((d) => d.href !== path).map((d) => (
              <li key={d.href}>
                <Link
                  href={d.href}
                  className="block h-full rounded-lg border border-edge bg-surface p-4 hover:border-edge-2 transition-colors"
                >
                  <span className="block text-ink text-[14px] font-medium mb-1">{d.title} →</span>
                  <span className="block text-muted text-[13px] leading-relaxed">{d.blurb}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/demo/"
                className="block h-full rounded-lg border border-edge bg-surface p-4 hover:border-edge-2 transition-colors"
              >
                <span className="block text-ink text-[14px] font-medium mb-1">The guided tour →</span>
                <span className="block text-muted text-[13px] leading-relaxed">
                  Capture, validate, replay, diff and export, in order, on one page.
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </main>
      <Footer />
    </>
  );
}

/** Per-page metadata for a demo sub-route. */
export function demoMetadata(path: string, title: string, description: string) {
  const url = `https://novafabric.ai${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
    },
  };
}
