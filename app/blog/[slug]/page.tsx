import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getPosts, getPost } from "@/lib/blog";
import type { PostCategory } from "@/lib/types";
import JsonLd from "@/components/JsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — NovaFabric Lab`,
    description: post.excerpt,
    alternates: { canonical: `https://novafabric.ai/blog/${post.slug}/` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://novafabric.ai/blog/${post.slug}/`,
      images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
    },
  };
}

const CATEGORY_LABELS: Record<PostCategory, string> = {
  "lab-update": "Lab update",
  technical: "Technical",
  release: "Release",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post!.title,
    description: post!.excerpt,
    url: `https://novafabric.ai/blog/${post!.slug}/`,
    datePublished: post!.date,
    dateModified: post!.date,
    image: "https://novafabric.ai/og.png",
    author: { "@type": "Person", name: "Mohsen Seyedkazemi Ardebili" },
    publisher: {
      "@type": "Organization",
      name: "NovaFabric Lab",
      logo: { "@type": "ImageObject", url: "https://novafabric.ai/favicon.svg" },
    },
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Blog", path: "/blog/" },
          { name: post!.title, path: `/blog/${post!.slug}/` },
        ]}
      />
      <Nav />

      <div style={{ paddingTop: "5rem" }}>
        <div className="page-max-w" style={{ paddingTop: "60px", paddingBottom: "80px" }}>
          {/* Breadcrumb */}
          <div
            className="font-code"
            style={{
              fontSize: "11px",
              color: "var(--color-faint)",
              marginBottom: "40px",
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <Link href="/blog" style={{ color: "var(--color-faint)", textDecoration: "none" }}>
              blog
            </Link>
            <span>/</span>
            <span style={{ color: "var(--color-muted)" }}>{post.slug}</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: "48px", maxWidth: "680px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
              <span
                className="font-code"
                style={{
                  fontSize: "10px",
                  color: "var(--color-amber)",
                  border: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
                  borderRadius: "3px",
                  padding: "2px 7px",
                  letterSpacing: "0.06em",
                }}
              >
                {CATEGORY_LABELS[post.category]}
              </span>
              <span
                className="font-code"
                style={{ fontSize: "11px", color: "var(--color-faint)" }}
              >
                {formatDate(post.date)}
              </span>
            </div>

            <h1
              className="font-display"
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontStyle: "italic",
                letterSpacing: "-0.02em",
                color: "var(--color-ink)",
                lineHeight: 1.1,
                marginBottom: "20px",
              }}
            >
              {post.title}
            </h1>

            <p style={{ fontSize: "18px", color: "var(--color-muted)", lineHeight: "1.65" }}>
              {post.excerpt}
            </p>
          </div>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid var(--color-edge)",
              marginBottom: "48px",
              maxWidth: "680px",
            }}
          />

          {/* Body — rendered from content/blog/<slug>.md at build time. */}
          <div
            className="docs-prose"
            style={{ maxWidth: "680px" }}
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          {/* Tags */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "48px", maxWidth: "680px" }}>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="font-code"
                style={{
                  fontSize: "10px",
                  color: "var(--color-faint)",
                  border: "1px solid var(--color-edge)",
                  borderRadius: "3px",
                  padding: "2px 7px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Back link */}
          <div style={{ marginTop: "60px" }}>
            <Link
              href="/blog"
              className="font-code"
              style={{
                fontSize: "12px",
                color: "var(--color-amber)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              ← all posts
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
