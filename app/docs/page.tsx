import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import JsonLd from "@/components/JsonLd";
import { PageHero } from "@/components/ui";
import { docPages, titleFor, descriptionFor } from "@/lib/docs";

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

// Grouped by top-level directory so the index reads as a table of contents
// rather than a flat dump of filenames.
const GROUP_LABELS: Record<string, string> = {
  "": "Start here",
  ops: "Operations",
  tutorials: "Tutorials",
  integrations: "Integrations",
  governance: "Governance",
  lineage: "Lineage",
  rfcs: "RFCs",
};

const ORDER = ["", "tutorials", "integrations", "ops", "lineage", "governance", "rfcs"];

export default async function DocsIndexPage() {
  // Pages split out of one long document (the CLI reference) are listed on
  // that document's own index page, not here.
  const pages = (await docPages()).filter((page) => !page.parent);

  const grouped = new Map<string, typeof pages>();
  for (const page of pages) {
    const parts = page.slug.split("/");
    const group = parts.length > 1 ? parts[0] : "";
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group)!.push(page);
  }

  const groups = [...grouped.entries()].sort(
    ([a], [b]) =>
      (ORDER.indexOf(a) === -1 ? 99 : ORDER.indexOf(a)) -
      (ORDER.indexOf(b) === -1 ? 99 : ORDER.indexOf(b)),
  );

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
          {groups.map(([group, groupPages]) => (
            <section key={group || "root"}>
              <h2 className="font-display text-3xl text-ink">
                {GROUP_LABELS[group] ?? group.replace(/-/g, " ")}
              </h2>
              <ul className="mt-4 space-y-3">
                {groupPages.map((page) => (
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
