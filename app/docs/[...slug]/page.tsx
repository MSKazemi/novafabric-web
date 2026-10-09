import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import JsonLd from "@/components/JsonLd";
import {
  docPages,
  faqEntries,
  lastUpdatedFor,
  titleFor,
  seoTitleFor,
  descriptionFor,
  type DocPage,
} from "@/lib/docs";

/**
 * Publishes the repository's docs/ tree at https://novafabric.ai/docs/.
 *
 * The markdown is read from the NovaFabric repository at build time rather than
 * duplicated here, so the site cannot drift from the docs maintainers edit.
 */

type Params = { slug: string[] };

export async function generateStaticParams(): Promise<Params[]> {
  return (await docPages()).map((page) => ({ slug: page.slug.split("/") }));
}

async function findPage(slug: string[]): Promise<DocPage | undefined> {
  const target = slug.join("/");
  return (await docPages()).find((page) => page.slug === target);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const page = await findPage((await params).slug);
  if (!page) return {};

  const description = descriptionFor(page);
  const url = `https://novafabric.ai/docs/${page.slug}/`;

  return {
    title: seoTitleFor(page),
    description,
    alternates: { canonical: url },
    openGraph: {
      title: seoTitleFor(page),
      description,
      url,
      type: "article",
      images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
    },
  };
}

export default async function DocPageRoute({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const page = await findPage(slug);
  if (!page) notFound();

  const title = titleFor(page);
  const description = descriptionFor(page);
  const updated = lastUpdatedFor(page);
  // The FAQ page carries FAQPage/Question/AcceptedAnswer instead of
  // TechArticle — the Q&A structure mirrors the visible ### sections exactly,
  // which is what answer engines lift. Every other page stays TechArticle.
  const faq = page.slug === "faq" ? faqEntries(page) : undefined;

  const articleSchema = faq
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        headline: title,
        url: `https://novafabric.ai/docs/${page.slug}/`,
        ...(updated && { dateModified: updated }),
        mainEntity: faq.map((entry) => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: { "@type": "Answer", text: entry.answer },
        })),
      }
    : {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: title,
        description,
        url: `https://novafabric.ai/docs/${page.slug}/`,
        ...(updated && { dateModified: updated }),
        // Reference by @id: the full Person node (ORCID) is declared once in
        // the root layout's entity graph and present on every page.
        author: { "@id": "https://orcid.org/0000-0002-1166-6559" },
        isPartOf: {
          "@type": "SoftwareSourceCode",
          name: "NovaFabric",
          codeRepository: "https://github.com/MSKazemi/novafabric",
          programmingLanguage: "Python",
          license: "https://www.apache.org/licenses/LICENSE-2.0",
        },
        publisher: { "@type": "Organization", name: "NovaFabric" },
      };

  return (
    <>
      <JsonLd data={articleSchema} />
      <Nav />
      <BreadcrumbJsonLd
        trail={[
          { name: "Docs", path: "/docs/" },
          ...(page.parent ? [{ name: page.parent.title, path: `/docs/${page.parent.slug}/` }] : []),
          { name: title, path: `/docs/${page.slug}/` },
        ]}
      />

      <article className="page-max-w py-16 md:py-24">
        <nav className="text-sm text-muted" aria-label="Breadcrumb">
          <Link className="hover:underline" href="/">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <Link className="hover:underline" href="/docs/">
            Docs
          </Link>
          <span aria-hidden="true"> / </span>
          {page.parent && (
            <>
              <Link className="hover:underline" href={`/docs/${page.parent.slug}/`}>
                {page.parent.title}
              </Link>
              <span aria-hidden="true"> / </span>
            </>
          )}
          <span>{title}</span>
        </nav>

        <div
          className="docs-prose mt-8 text-muted leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
        {page.movedAnchors && <MovedAnchors base="/docs/" map={page.movedAnchors} />}

        <footer className="mt-16 border-t border-edge pt-6 text-sm text-muted">
          {updated && (
            <p className="mb-2">
              {/* Same value as the schema's dateModified — visible content and
                  structured data must agree. */}
              Last updated <time dateTime={updated}>{updated}</time>.
            </p>
          )}
          <p>
            Found a mistake in this page?{" "}
            <a
              className="underline"
              href={`https://github.com/MSKazemi/novafabric/blob/main/docs/${page.file}`}
            >
              Edit it on GitHub
            </a>{" "}
            or{" "}
            <a
              className="underline"
              href="https://github.com/MSKazemi/novafabric/issues/new?template=documentation.yml"
            >
              open a documentation issue
            </a>
            . Documentation bugs are real bugs.
          </p>
        </footer>
      </article>

      <Footer />
    </>
  );
}

/**
 * Forwards a pre-split bookmark such as /docs/cli-reference/#nova-replay-capsule to
 * the child page that now holds that heading. A static host cannot redirect on a
 * fragment (browsers never send it), so this is an inline script that runs while
 * the page parses, and only when the fragment names no element on this page.
 * Slugs are stored once and referenced by position to keep the payload small.
 */
function MovedAnchors({ base, map }: { base: string; map: Record<string, string> }) {
  const slugs = [...new Set(Object.values(map))];
  const ids = Object.fromEntries(Object.entries(map).map(([id, slug]) => [id, slugs.indexOf(slug)]));
  const data = JSON.stringify({ b: base, s: slugs, i: ids }).replace(/</g, "\\u003c");
  const code =
    `(function(){var d=${data};var h=location.hash.slice(1);try{h=decodeURIComponent(h)}catch(e){}` +
    `if(!h||document.getElementById(h)||!Object.prototype.hasOwnProperty.call(d.i,h))return;` +
    `location.replace(d.b+d.s[d.i[h]]+"/#"+encodeURIComponent(h))})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
