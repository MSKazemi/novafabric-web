/**
 * The one list of site pages that the top nav, the footer and the command
 * palette all read. Three hand-kept copies is how the old Astro pages (/concepts,
 * /why, /install, /spec, /showcase, /dashboard) ended up unreachable from the
 * Next.js pages: add a page here and it appears everywhere.
 *
 * Since issue #20 (PR A) every public page is a Next.js route; the retired Astro
 * paths are redirect stubs and are deliberately not listed. `astro: true` remains
 * for a page served by another build under the same domain: such a page is not a
 * Next route, so it must be opened with a plain link (a full page load), never
 * next/link or router.push. Nothing uses it today.
 */
export interface SiteLink {
  label: string;
  href: string;
  astro?: boolean;
}

export const PRIMARY_LINKS: SiteLink[] = [
  { label: "product", href: "/novafabric/" },
  { label: "docs", href: "/docs/" },
  { label: "demo", href: "/demo/" },
  { label: "blog", href: "/blog/" },
];

export const MORE_GROUPS: { title: string; links: SiteLink[] }[] = [
  {
    title: "project",
    links: [
      { label: "research", href: "/research/" },
      { label: "primitives", href: "/primitives/" },
      { label: "architecture", href: "/architecture/" },
      { label: "changelog", href: "/changelog/" },
      { label: "capsules", href: "/capsules/" },
    ],
  },
  {
    title: "learn",
    links: [
      { label: "install", href: "/install/" },
      { label: "concepts", href: "/docs/concepts/" },
      { label: "spec", href: "/spec/" },
      { label: "interactive demos", href: "/demo/#interactive-demos" },
      { label: "compare", href: "/docs/comparison/" },
    ],
  },
];
