import RedirectStub, { redirectMetadata } from "@/components/RedirectStub";

// Retired route (issue #20, PR A): its content now lives at /demo/lineage/.
export const metadata = redirectMetadata("/demo/lineage/", "Moved: lineage graph demo");

export default function ShowcaseLineageRedirect() {
  return <RedirectStub to="/demo/lineage/" label="the lineage graph demo" />;
}
