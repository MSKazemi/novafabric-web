import RedirectStub, { redirectMetadata } from "@/components/RedirectStub";

// Retired route (issue #20, PR A): its content now lives at /demo/registry/.
export const metadata = redirectMetadata("/demo/registry/", "Moved: asset registry demo");

export default function ShowcaseRegistryRedirect() {
  return <RedirectStub to="/demo/registry/" label="the asset registry demo" />;
}
