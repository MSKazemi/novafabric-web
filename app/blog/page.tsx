import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/ui";
import { getPosts } from "@/lib/blog";
import type { PostCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Blog — NovaFabric Engineering Notes",
  description:
    "Technical notes, deep-dives, and release announcements from NovaFabric.",
  alternates: { canonical: "https://novafabric.ai/blog/" },
  openGraph: {
    title: "Blog — NovaFabric",
    description: "Technical notes, deep-dives, and release announcements from NovaFabric.",
    url: "https://novafabric.ai/blog/",
    images: [{ url: "https://novafabric.ai/og.png", width: 1200, height: 630 }],
  },
};

const CATEGORY_LABELS: Record<PostCategory, string> = {
  "lab-update": "Project update",
  technical: "Technical",
  release: "Release",
};

const CATEGORY_COLORS: Record<PostCategory, string> = {
  "lab-update": "var(--color-amber)",
  technical: "var(--color-jade)",
  release: "var(--color-muted)",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  // Already newest-first, with a stable tiebreak, from the loader.
  const sorted = await getPosts();

  return (
    <>
      <Nav />
      <BreadcrumbJsonLd trail={[{ name: "Blog", path: "/blog/" }]} />

      <PageHero
        section="blog"
        title="Blog"
        subtitle="Technical notes, deep-dives, and release announcements."
        status="experimental"
      />

      <main className="page-max-w py-16">
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          {sorted.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{ textDecoration: "none" }}
            >
              <article
                style={{
                  padding: "28px 0",
                  borderBottom: "1px solid var(--color-edge)",
                  display: "grid",
                  gridTemplateColumns: "140px 1fr",
                  gap: "32px",
                  transition: "opacity 0.15s",
                }}
                className="blog-row"
              >
                {/* Left: date + category */}
                <div style={{ paddingTop: "3px" }}>
                  <p
                    className="font-code"
                    style={{ fontSize: "11px", color: "var(--color-faint)", marginBottom: "8px" }}
                  >
                    {formatDate(post.date)}
                  </p>
                  <span
                    className="font-code"
                    style={{
                      fontSize: "10px",
                      color: CATEGORY_COLORS[post.category],
                      border: `1px solid ${CATEGORY_COLORS[post.category]}40`,
                      borderRadius: "3px",
                      padding: "2px 7px",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {CATEGORY_LABELS[post.category]}
                  </span>
                </div>

                {/* Right: title + excerpt + tags */}
                <div>
                  <h2
                    className="font-display"
                    style={{
                      fontSize: "22px",
                      color: "var(--color-ink)",
                      marginBottom: "10px",
                      lineHeight: 1.25,
                    }}
                  >
                    {post.title}
                  </h2>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--color-muted)",
                      lineHeight: "1.7",
                      marginBottom: "14px",
                    }}
                  >
                    {post.excerpt}
                  </p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
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
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>

      <Footer />

      <style>{`
        .blog-row:hover { opacity: 0.75; }
        @media (max-width: 640px) {
          .blog-row { grid-template-columns: 1fr !important; gap: 12px !important; }
        }
      `}</style>
    </>
  );
}
