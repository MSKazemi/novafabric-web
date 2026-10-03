/**
 * The one list of site pages that the top nav, the footer and the command
 * palette all read. Three hand-kept copies is how the Astro pages (/concepts,
 * /why, /install, /spec, /showcase, /dashboard) ended up unreachable from the
 * Next.js pages: add a page here and it appears everywhere.
 *
 * `astro: true` marks pages served by the separate Astro build under the same
 * domain. They are not Next routes, so they must be opened with a plain link
 * (a full page load), never next/link or router.push.
 */
export interface SiteLink {
  label: string;
  href: string;
  astro?: boolean;
}

export const PRIMARY_LINKS: SiteLink[] = [
  { label: "product", href: "/novafabric" },
  { label: "docs", href: "/docs" },
  { label: "demo", href: "/demo" },
  { label: "blog", href: "/blog" },
];

export const MORE_GROUPS: { title: string; links: SiteLink[] }[] = [
  {
    title: "lab",
    links: [
      { label: "research", href: "/research" },
      { label: "primitives", href: "/primitives" },
      { label: "architecture", href: "/architecture" },
      { label: "changelog", href: "/changelog" },
      { label: "capsules", href: "/capsules" },
    ],
  },
  {
    title: "learn",
    links: [
      { label: "concepts", href: "/concepts/", astro: true },
      { label: "why now", href: "/why/", astro: true },
      { label: "install", href: "/install/", astro: true },
      { label: "spec", href: "/spec/", astro: true },
      { label: "showcase", href: "/showcase/", astro: true },
      { label: "dashboard", href: "/dashboard/", astro: true },
      { label: "compare", href: "/docs/comparison/" },
    ],
  },
];
