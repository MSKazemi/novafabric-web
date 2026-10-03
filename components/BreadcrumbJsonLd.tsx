import JsonLd from "@/components/JsonLd";

/**
 * BreadcrumbList structured data for inner pages — helps search + AI answer
 * engines understand site hierarchy and can produce breadcrumb rich results.
 * Pass the trail *excluding* Home (added automatically).
 *
 *   <BreadcrumbJsonLd trail={[{ name: "novafabric", path: "/novafabric/" }]} />
 */
const BASE = "https://novafabric.ai";

export default function BreadcrumbJsonLd({
  trail,
}: {
  trail: { name: string; path: string }[];
}) {
  const items = [{ name: "Home", path: "/" }, ...trail];
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE}${item.path}`,
    })),
  };
  return <JsonLd data={data} />;
}
