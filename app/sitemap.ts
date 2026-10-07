import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { docPages, lastUpdatedFor } from "@/lib/docs";

export const dynamic = "force-static";

const BASE = "https://novafabric.ai";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts: MetadataRoute.Sitemap = (await getPosts()).map((post) => ({
    url: `${BASE}/blog/${post.slug}/`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // The docs tree is the site's largest citable surface; leaving it out of the
  // sitemap is most of the reason to publish it in the first place.
  //
  // lastModified is each file's real last-commit date, or omitted when history
  // is unavailable. It is never stamped with the build time: 60 identical
  // timestamps teach crawlers to distrust the field entirely.
  const docs: MetadataRoute.Sitemap = (await docPages()).map((page) => {
    const updated = lastUpdatedFor(page);
    return {
      url: `${BASE}/docs/${page.slug}/`,
      ...(updated && { lastModified: new Date(updated) }),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  // Static pages carry no lastModified: stamping them with the build time would give
  // a dozen identical, meaningless timestamps (see the note above on docs).
  return [
    { url: `${BASE}/`,               changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/novafabric/`,    changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/research/`,      changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/primitives/`,    changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/architecture/`,  changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/changelog/`,     changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/capsules/`,      changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE}/blog/`,          changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/contact/`,       changeFrequency: "yearly",  priority: 0.5 },
    { url: `${BASE}/demo/`,          changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/docs/`,          changeFrequency: "weekly",  priority: 0.9 },
    ...docs,
    ...blogPosts,
  ];
}
