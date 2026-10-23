import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import JsonLd from "@/components/JsonLd";
import { PageHero } from "@/components/ui";
import { docGroups, docPages, titleFor, descriptionFor } from "@/lib/docs";

const DESCRIPTION =
  "NovaFabric docs: getting started, concepts, CLI and Python API reference, architecture and operations for capturing, replaying and verifying AI-agent runs.";

export const metadata: Metadata = {
  title: "Documentation — NovaFabric",
  description: DESCRIPTION,
  alternates: { canonical: "https://novafabric.ai/docs/" },
  openGraph: {
    title: "Documentation — NovaFabric",
    description: DESCRIPTION,
    url: "https://novafabric.ai/docs/",
    images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
  },
};

export default async function DocsIndexPage() {
  // Grouped by top-level directory so the index reads as a table of contents
  // rather than a flat dump of filenames. Pages split out of one long document
  // (the CLI reference) are listed on that document's own index page, not here.
  const groups = docGroups(await docPages());
  const pages = groups.flatMap((group) => group.pages);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "NovaFabric documentation",
    url: "https://novafabric.ai/docs/",
    description: DESCRIPTION,
    hasPart: pages.map((page) => ({
      "@type": "TechArticle",
      headline: titleFor(page),
      url: `https://novafabric.ai/docs/${page.slug}/`,
    })),
  };

  return (
    <>
      <JsonLd data={collectionSchema} />
      <Nav />
      <BreadcrumbJsonLd trail={[{ name: "Docs", path: "/docs/" }]} />

      <PageHero
        section="docs"
        title="Documentation"
        subtitle="Everything from a first capture to running NovaFabric at cluster scale."
      />

      <main className="page-max-w py-16">
        <p className="text-muted max-w-2xl leading-relaxed">
          New here? Start with{" "}
          <Link className="underline" href="/docs/getting-started/">
            Getting started
          </Link>
          , then{" "}
          <Link className="underline" href="/docs/concepts/">
            Concepts
          </Link>
          .
        </p>

        <div className="mt-16 space-y-12">
          {groups.map((group) => (
            <section key={group.key || "root"}>
              <h2 className="font-display text-3xl text-ink">{group.label}</h2>
              <ul className="mt-4 space-y-3">
                {group.pages.map((page) => (
                  <li key={page.slug}>
                    <a className="font-medium underline" href={`/docs/${page.slug}/`}>
                      {titleFor(page)}
                    </a>
                    <p className="text-sm text-muted">{descriptionFor(page)}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="mt-16 border-t border-edge pt-6 text-sm text-muted">
          <p>
            These pages are generated from{" "}
            <a
              className="underline"
              href="https://github.com/MSKazemi/novafabric/tree/main/docs"
            >
              the docs/ directory
            </a>{" "}
            in the repository, so they can never drift from what maintainers actually edit.
            Corrections are welcome as pull requests.
          </p>
        </footer>
      </main>

      <Footer />
    </>
  );
}
